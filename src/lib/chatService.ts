import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

const CHAT_COLLECTION = 'organizationChatMessages';
const MAX_MESSAGES = 100;

export interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: Date;
}

export function subscribeToChatMessages(
  onMessages: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void
) {
  const messagesQuery = query(
    collection(db, CHAT_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(MAX_MESSAGES)
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((messageDoc) => {
      const data = messageDoc.data();
      const createdAt = data.createdAt;

      return {
        id: messageDoc.id,
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        senderRole: data.senderRole,
        text: data.text,
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date()
      };
    });

    onMessages(messages.reverse());
  }, (error) => {
    onError(error);
  });
}

export async function sendChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>) {
  await addDoc(collection(db, CHAT_COLLECTION), {
    ...message,
    createdAt: serverTimestamp()
  });
}

export async function clearChatMessages() {
  const snapshot = await getDocs(collection(db, CHAT_COLLECTION));
  const documents = snapshot.docs;

  for (let index = 0; index < documents.length; index += 500) {
    const batch = writeBatch(db);
    documents.slice(index, index + 500).forEach((messageDoc) => batch.delete(messageDoc.ref));
    await batch.commit();
  }

  return documents.length;
}
