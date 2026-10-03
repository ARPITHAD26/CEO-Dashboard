import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";
import { createWorker } from "tesseract.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsers with support for large file / document uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// MongoDB Configuration & Client
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/spoorthy_dss";
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;

async function initMongoDB(): Promise<Db | null> {
  if (mongoDb) return mongoDb;
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isMongoConnected = true;
    console.log(`[Database] Connected successfully to MongoDB at ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}`);
    return mongoDb;
  } catch (err: any) {
    isMongoConnected = false;
    console.log(`[Database] Local MongoDB not detected or offline (${err.message}). Using Firestore/In-Memory fallback.`);
    return null;
  }
}

// Attempt initial MongoDB connection in the background
initMongoDB().catch(() => {});

// Lazy-initialized Gemini client (Optional)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check & System Status endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: isMongoConnected ? "MongoDB" : "Firestore / Cloud",
    isMongoConnected,
    hasGeminiKey: !!getGeminiClient(),
    timestamp: new Date().toISOString(),
  });
});

// Database status endpoint
app.get("/api/db/status", async (_req, res) => {
  const dbInstance = await initMongoDB();
  res.json({
    connected: !!dbInstance && isMongoConnected,
    engine: isMongoConnected ? "MongoDB" : "Firestore / Direct Cloud Client",
    uri: isMongoConnected ? MONGODB_URI.replace(/\/\/.*@/, "//***@") : "Firestore",
  });
});

// -------------------------------------------------------------
// MongoDB REST Persistence Endpoints
// -------------------------------------------------------------

// Fetch entire application state from MongoDB
app.get("/api/db/state", async (_req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }

    const collections = [
      "purchaseRequests", "vendors", "invoices", "expenses",
      "leads", "clients", "employees", "attendance", "leaves",
      "disciplinaryCases", "sites", "complaints", "incidents",
      "trainings", "tasks", "auditLogs", "notifications", "alerts",
      "itApplications", "itServerNodes", "itTickets", "itSecurityChecks"
    ];

    const state: Record<string, any[]> = {};
    for (const colName of collections) {
      const items = await dbInstance.collection(colName).find({}).toArray();
      // Remove mongo _id or normalize it to string id
      state[colName] = items.map((doc: any) => {
        const { _id, ...rest } = doc;
        return { ...rest, id: rest.id || String(_id) };
      });
    }

    return res.json({ success: true, data: state });
  } catch (err: any) {
    console.error("MongoDB fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Bulk save whole state to MongoDB
app.post("/api/db/state", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }

    const newState = req.body;
    for (const [colName, items] of Object.entries(newState)) {
      if (Array.isArray(items)) {
        const col = dbInstance.collection(colName);
        await col.deleteMany({});
        if (items.length > 0) {
          const cleanItems = items.map((item: any) => {
            const { _id, ...rest } = item;
            return rest;
          });
          await col.insertMany(cleanItems);
        }
      }
    }

    return res.json({ success: true, message: "State saved to MongoDB" });
  } catch (err: any) {
    console.error("MongoDB bulk save error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Save a single entity to MongoDB
app.post("/api/db/:collection/:id", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }

    const { collection, id } = req.params;
    const data = req.body;
    const col = dbInstance.collection(collection);

    await col.updateOne({ id }, { $set: data }, { upsert: true });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete a single entity from MongoDB
app.delete("/api/db/:collection/:id", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }

    const { collection, id } = req.params;
    const col = dbInstance.collection(collection);

    await col.deleteOne({ id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Role Mappings MongoDB endpoints
app.get("/api/db/role_mappings", async (_req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }
    const mappings = await dbInstance.collection("role_mappings").find({}).toArray();
    return res.json({ success: true, data: mappings.map(({ _id, ...rest }) => rest) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Sub-Roles Endpoints (MongoDB)
// -------------------------------------------------------------
app.get("/api/db/sub_roles", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }
    const subRoles = await dbInstance.collection("sub_roles").find({}).toArray();
    return res.json({ success: true, data: subRoles });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/db/sub_roles", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }
    const subRole = req.body;
    if (!subRole || !subRole.id) {
      return res.status(400).json({ error: "Missing sub-role ID" });
    }
    await dbInstance.collection("sub_roles").updateOne(
      { id: subRole.id },
      { $set: subRole },
      { upsert: true }
    );
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/db/sub_roles/:id", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }
    const { id } = req.params;
    await dbInstance.collection("sub_roles").deleteOne({ id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/db/role_mappings", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }
    const { email, name, role, subRoleId, subRoleName, allowedSubViews } = req.body;
    await dbInstance.collection("role_mappings").updateOne(
      { email: email.toLowerCase().trim() },
      { 
        $set: { 
          email: email.toLowerCase().trim(), 
          name, 
          role,
          ...(subRoleId ? { subRoleId } : {}),
          ...(subRoleName ? { subRoleName } : {}),
          ...(allowedSubViews ? { allowedSubViews } : {})
        } 
      },
      { upsert: true }
    );
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/db/role_mappings/:email", async (req, res) => {
  try {
    const dbInstance = await initMongoDB();
    if (!dbInstance) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }
    const { email } = req.params;
    await dbInstance.collection("role_mappings").deleteOne({ email: email.toLowerCase().trim() });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 100% Programmatic OCR & Document Processing (Zero API Key)
// -------------------------------------------------------------

// Local Tesseract OCR endpoint for image scanning without external APIs
app.post("/api/ocr/extract-programmatic", async (req, res) => {
  try {
    const { base64Data, mimeType, targetRole, targetEntity } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: "Missing image/document data" });
    }

    console.log(`[Local OCR] Processing ${mimeType || "image"} using on-device Tesseract engine...`);

    // Create a local Tesseract worker
    const worker = await createWorker("eng");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    console.log(`[Local OCR] Recognized raw text (${text.length} chars). Extracting structured records...`);

    // Parse the extracted text lines into rows using simple heuristic regex table parsing
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const parsedRows: Record<string, any>[] = [];

    // Analyze lines to extract potential table items
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match key-value or delimiter separated tokens
      const parts = line.split(/[\t,|;]+/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        parsedRows.push({
          col1: parts[0],
          col2: parts[1],
          col3: parts[2] || "",
          col4: parts[3] || "",
          col5: parts[4] || "",
          rawText: line,
        });
      } else {
        // Look for common patterns like numbers, names, amounts
        const matchAmount = line.match(/(?:Rs\.?|INR|\$)?\s*([\d,]+(?:\.\d{2})?)/);
        if (matchAmount) {
          parsedRows.push({
            name: line.replace(matchAmount[0], "").trim(),
            amount: matchAmount[1].replace(/,/g, ""),
            rawText: line,
          });
        }
      }
    }

    return res.json({
      success: true,
      data: {
        rawText: text,
        extractedLines: lines,
        parsedRows,
        entityType: targetEntity && targetEntity !== "auto" ? targetEntity : "sites",
        summary: `Extracted ${lines.length} lines of text using offline Tesseract OCR.`,
      },
    });
  } catch (err: any) {
    console.error("Local OCR Error:", err);
    return res.status(500).json({
      success: false,
      error: `Local OCR processing failed: ${err.message}`,
    });
  }
});

// Gemini-Enhanced OCR (Optional - falls back to programmatic if key is absent)
app.post("/api/gemini/extract-doc", async (req, res) => {
  try {
    const { targetRole, targetEntity, fileType, base64Data, mimeType, textContent, instructions } = req.body;
    const ai = getGeminiClient();

    // If Gemini key is not configured, inform the caller
    if (!ai) {
      return res.status(200).json({
        success: false,
        fallbackToProgrammatic: true,
        message: "Gemini API key is not configured. Use programmatic local parsing.",
      });
    }

    const systemPrompt = `You are an expert Document Processing and OCR AI engine specialized in Executive Facility Management & Security Operations (Spoorthy Integrated Solutions Pvt. Ltd.).
Your task is to analyze documents (invoices, salary sheets, employee rosters, site deployment records, client SLA logs, incident reports, purchase requests, quotations, training logs) and extract clean, structured JSON data matching the system schema.

Target Role / Vertical: ${targetRole || "General Operations"}
Target Entity Type: ${targetEntity || "auto-detect"}
User Notes/Context: ${instructions || "None"}

Return ONLY a valid JSON object in the following format:
{
  "entityType": "sites" | "complaints" | "incidents" | "employees" | "invoices" | "expenses" | "leads" | "clients" | "purchaseRequests" | "vendors" | "trainings",
  "summary": "Brief summary of what was extracted from the document",
  "confidence": "High" | "Medium",
  "extractedCount": number,
  "records": [ ... array of extracted entity objects ... ]
}
`;

    let contents: any;
    if (base64Data && mimeType) {
      contents = {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: `Extract all structured records into JSON matching the schema.` },
        ],
      };
    } else if (textContent) {
      contents = {
        parts: [{ text: `Parse this spreadsheet / document content into JSON:\n\n${textContent}` }],
      };
    } else {
      return res.status(400).json({ error: "Missing document content." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text || "{}";
    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(outputText);
    } catch {
      const cleanJson = outputText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleanJson);
    }

    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error("Gemini OCR error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to process document with Gemini OCR.",
    });
  }
});

// Vite integration for development vs production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Executive DSS Server running on port ${PORT}`);
  });
}

startServer();
