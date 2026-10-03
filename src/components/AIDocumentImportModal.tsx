import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Sparkles, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Role, AppState } from '../types';
import { saveEntityToFirestore } from '../lib/firebaseService';
import { parseTabularDataProgrammatically } from '../lib/programmaticParser';

interface AIDocumentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  state: AppState;
  onDataImported: (entityType: string, records: any[]) => void;
  currentUserEmail: string;
}

export function AIDocumentImportModal({
  isOpen,
  onClose,
  currentRole,
  state: _state,
  onDataImported,
  currentUserEmail
}: AIDocumentImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractionMode, setExtractionMode] = useState<'programmatic' | 'ai'>('programmatic');
  const [extractedData, setExtractedData] = useState<{
    entityType: string;
    summary: string;
    confidence: string;
    records: any[];
  } | null>(null);
  const [targetEntityOverride, setTargetEntityOverride] = useState<string>('auto');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Map roles to their primary entities
  const getRoleEntityOptions = () => {
    switch (currentRole) {
      case 'Operations Head':
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'sites', label: 'Facility Sites & Manpower' },
          { value: 'complaints', label: 'Client Complaints' },
          { value: 'incidents', label: 'Incident Reports' }
        ];
      case 'HR Head':
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'employees', label: 'Employees & Guard Staff' },
          { value: 'attendance', label: 'Attendance Records' }
        ];
      case 'Finance Head':
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'invoices', label: 'Client Invoices & Receivables' },
          { value: 'expenses', label: 'Expense Heads & Budgets' }
        ];
      case 'BD Head':
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'leads', label: 'Leads & Tender Prospects' },
          { value: 'clients', label: 'Corporate Clients & Contracts' }
        ];
      case 'Procurement Head':
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'purchaseRequests', label: 'Purchase Requests (PRs)' },
          { value: 'vendors', label: 'Approved Vendors' }
        ];
      case 'Training Head':
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'trainings', label: 'Training Sessions & Scores' }
        ];
      case 'IT Head':
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'itApplications', label: 'IT Applications & Endpoints' },
          { value: 'itServerNodes', label: 'Hostinger VPS & Server Nodes' },
          { value: 'itTickets', label: 'IT Support & Hardware Tickets' }
        ];
      default:
        return [
          { value: 'auto', label: '⚡ Auto-Detect Entity' },
          { value: 'sites', label: 'Sites' },
          { value: 'employees', label: 'Employees' },
          { value: 'invoices', label: 'Invoices' },
          { value: 'expenses', label: 'Expenses' },
          { value: 'leads', label: 'Leads' },
          { value: 'purchaseRequests', label: 'Purchase Requests' },
          { value: 'trainings', label: 'Trainings' }
        ];
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setExtractedData(null);
    setSuccessCount(null);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setErrorMsg(null);
    setStatusMessage('Reading document content...');

    try {
      const fileName = selectedFile.name.toLowerCase();
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
      const isPdf = fileName.endsWith('.pdf');
      const isImage = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.webp');

      // -------------------------------------------------------------
      // 1. SPREADSHEET / EXCEL / CSV PROCESSING (100% Programmatic)
      // -------------------------------------------------------------
      if (isExcel) {
        setStatusMessage('Reading Excel sheets & header schema locally...');
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        let allRows: Record<string, any>[] = [];
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
          allRows = [...allRows, ...sheetJson];
        });

        // Use high-performance offline programmatic parser
        setStatusMessage('Applying smart column mapping & schema normalization...');
        const parsed = parseTabularDataProgrammatically(allRows, currentRole, targetEntityOverride);
        setExtractedData(parsed);
      } 
      // -------------------------------------------------------------
      // 2. IMAGE OR SCANNED DOCUMENT OCR (Tesseract / Offline)
      // -------------------------------------------------------------
      else if (isImage || isPdf) {
        setStatusMessage(isPdf ? 'Processing PDF document...' : 'Running on-device OCR...');

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const resultStr = reader.result as string;
            const base64Content = resultStr.split(',')[1];
            resolve(base64Content);
          };
          reader.onerror = error => reject(error);
          reader.readAsDataURL(selectedFile);
        });

        const base64Data = await base64Promise;
        const mimeType = selectedFile.type || (isPdf ? 'application/pdf' : 'image/png');

        if (extractionMode === 'ai') {
          // Attempt AI route if user explicitly selected AI
          setStatusMessage('Processing document with AI vision model...');
          const res = await fetch('/api/gemini/extract-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole,
              targetEntity: targetEntityOverride === 'auto' ? undefined : targetEntityOverride,
              fileType: isPdf ? 'pdf' : 'image',
              base64Data,
              mimeType,
              instructions: customInstructions
            })
          });

          const json = await res.json();
          if (json.success && json.data) {
            setExtractedData(json.data);
            return;
          }
        }

        // Programmatic / Local Tesseract OCR route (Zero API Key)
        setStatusMessage('Running local Tesseract OCR engine (No external API needed)...');
        const res = await fetch('/api/ocr/extract-programmatic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data,
            mimeType,
            targetRole: currentRole,
            targetEntity: targetEntityOverride
          })
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to extract text from document using OCR.');
        }

        // Map recognized rows programmatically
        const rows = json.data.parsedRows || [];
        const parsed = parseTabularDataProgrammatically(rows, currentRole, targetEntityOverride);
        parsed.summary = `${json.data.summary} ${parsed.summary}`;
        setExtractedData(parsed);
      } 
      // -------------------------------------------------------------
      // 3. TEXT / CSV CONTENT
      // -------------------------------------------------------------
      else {
        setStatusMessage('Reading text lines...');
        const textContent = await selectedFile.text();
        const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);
        const rows = lines.map(line => {
          const parts = line.split(/[,\t|;]/);
          return parts.reduce((acc, val, idx) => {
            acc[`col_${idx + 1}`] = val.trim();
            return acc;
          }, {} as Record<string, any>);
        });

        const parsed = parseTabularDataProgrammatically(rows, currentRole, targetEntityOverride);
        setExtractedData(parsed);
      }
    } catch (err: any) {
      console.error('Import processing error:', err);
      setErrorMsg(err?.message || 'Error occurred while processing file.');
    } finally {
      setProcessing(false);
      setStatusMessage('');
    }
  };

  const handleFieldChange = (recordIndex: number, field: string, value: any) => {
    if (!extractedData) return;
    const updatedRecords = [...extractedData.records];
    updatedRecords[recordIndex] = {
      ...updatedRecords[recordIndex],
      [field]: value
    };
    setExtractedData({
      ...extractedData,
      records: updatedRecords
    });
  };

  const handleDeleteRecord = (index: number) => {
    if (!extractedData) return;
    const updatedRecords = extractedData.records.filter((_, i) => i !== index);
    setExtractedData({
      ...extractedData,
      records: updatedRecords
    });
  };

  const handleConfirmImport = async () => {
    if (!extractedData || extractedData.records.length === 0) return;

    setProcessing(true);
    setStatusMessage(`Committing ${extractedData.records.length} records to company database...`);

    try {
      const entityType = extractedData.entityType || targetEntityOverride || 'sites';
      const recordsToImport = extractedData.records.map((r, index) => {
        const id = r.id || `${entityType.slice(0, 3).toUpperCase()}-${Date.now()}-${index}`;
        return {
          ...r,
          id
        };
      });

      // Save each entity to persistent DB (MongoDB on VPS, or Firestore in cloud)
      for (const rec of recordsToImport) {
        await saveEntityToFirestore(entityType as any, rec.id, rec);
      }

      // Log audit entry
      await saveEntityToFirestore('auditLogs' as any, `LOG-${Date.now()}`, {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: `Document Import: ${recordsToImport.length} ${entityType} records imported from ${selectedFile?.name || 'document'}`,
        user: currentUserEmail,
        department: currentRole
      });

      // Notify parent state handler
      onDataImported(entityType, recordsToImport);

      setSuccessCount(recordsToImport.length);
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1800);
    } catch (err: any) {
      console.error('Error importing records:', err);
      setErrorMsg(`Failed to save records: ${err?.message}`);
    } finally {
      setProcessing(false);
      setStatusMessage('');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setErrorMsg(null);
    setSuccessCount(null);
    setEditingRowIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Programmatic Document &amp; Spreadsheet OCR Importer
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-mono">
                  {currentRole}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">
                  Upload Excel (.xlsx, .csv), PDFs, or photos. 100% on-device local parsing.
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  <ShieldCheck className="w-3 h-3" /> Zero API Key Required
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {successCount !== null ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Import Completed Successfully!</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {successCount} records were accurately mapped and saved to the database. Dashboard KPIs have been updated.
              </p>
            </div>
          ) : !extractedData ? (
            <div className="space-y-6">
              {/* File Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-cyan-500 bg-cyan-500/5 scale-[0.99]' 
                    : selectedFile 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-border hover:border-cyan-500/50 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.txt"
                  className="hidden"
                  onChange={handleFileInput}
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                      {selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.csv') ? (
                        <FileSpreadsheet className="w-6 h-6" />
                      ) : selectedFile.name.endsWith('.pdf') ? (
                        <FileText className="w-6 h-6" />
                      ) : (
                        <ImageIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="text-base font-bold text-foreground">{selectedFile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to change file
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto border border-cyan-500/20">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-foreground">
                        Drop your Excel spreadsheet, PDF, or scanned photo here
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Supports Excel (.xlsx, .xls), CSV registers, PDF invoices, and photo documents (PNG, JPG)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extraction Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Target Vertical Entity
                  </label>
                  <select
                    value={targetEntityOverride}
                    onChange={(e) => setTargetEntityOverride(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-500"
                  >
                    {getRoleEntityOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Parser Engine
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExtractionMode('programmatic')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                        extractionMode === 'programmatic'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      ⚡ Programmatic (Local)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtractionMode('ai')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                        extractionMode === 'ai'
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      ✨ AI Model (If Key Set)
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            /* Review & Edit Extracted Records Table */
            <div className="space-y-4">
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500 text-black uppercase">
                      {extractedData.entityType}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {extractedData.records.length} records mapped • Engine: {extractionMode === 'programmatic' ? 'Local Programmatic' : 'AI'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-medium">{extractedData.summary}</p>
                </div>
                <button
                  onClick={() => setExtractedData(null)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Upload different file
                </button>
              </div>

              {/* Editable Preview Table */}
              <div className="border border-border rounded-2xl overflow-x-auto max-h-80 divide-y divide-border bg-background">
                {extractedData.records.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No records could be identified in the file. Please ensure the file has header columns or data rows.
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-mono sticky top-0 uppercase">
                      <tr>
                        <th className="p-3">#</th>
                        {Object.keys(extractedData.records[0] || {})
                          .filter(k => k !== 'id')
                          .slice(0, 6)
                          .map(k => (
                            <th key={k} className="p-3">{k.replace(/_/g, ' ')}</th>
                          ))}
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {extractedData.records.map((rec, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/20">
                          <td className="p-3 font-mono text-muted-foreground">{rIdx + 1}</td>
                          {Object.keys(rec)
                            .filter(k => k !== 'id')
                            .slice(0, 6)
                            .map(k => (
                              <td key={k} className="p-3">
                                {editingRowIndex === rIdx ? (
                                  <input
                                    type="text"
                                    value={rec[k] ?? ''}
                                    onChange={(e) => handleFieldChange(rIdx, k, e.target.value)}
                                    className="w-full bg-card border border-border px-2 py-1 rounded text-foreground"
                                  />
                                ) : (
                                  <span className="font-medium text-foreground">
                                    {typeof rec[k] === 'object' ? JSON.stringify(rec[k]) : String(rec[k] ?? '-')}
                                  </span>
                                )}
                              </td>
                            ))}
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => setEditingRowIndex(editingRowIndex === rIdx ? null : rIdx)}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                              title="Edit Row"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rIdx)}
                              className="p-1 hover:bg-rose-500/10 rounded text-rose-500"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {successCount === null && (
          <div className="p-6 border-t border-border flex items-center justify-between bg-muted/10">
            <div className="text-xs text-muted-foreground">
              {processing && (
                <div className="flex items-center gap-2 text-cyan-500 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {!extractedData ? (
                <button
                  type="button"
                  onClick={processFile}
                  disabled={!selectedFile || processing}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing Data...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      Process &amp; Extract Data
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={processing || extractedData.records.length === 0}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm &amp; Import {extractedData.records.length} Records
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
