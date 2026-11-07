import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, LoaderCircle, MessageCircle, Send, X } from 'lucide-react';
import { UserAccount } from '../types';
import { ChatMessage, sendChatMessage, subscribeToChatMessages } from '../lib/chatService';

interface OrganizationChatProps {
  currentUser: UserAccount;
}

export default function OrganizationChat({ currentUser }: OrganizationChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToChatMessages(
    (nextMessages) => {
      setMessages(nextMessages);
      setIsLoading(false);
      setError(null);
    },
    (subscriptionError) => {
      setIsLoading(false);
      setError(`Unable to load chat messages: ${subscriptionError.message}`);
    }
  ), []);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      await sendChatMessage({
        senderEmail: currentUser.email,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text
      });
      setDraft('');
    } catch (sendError) {
      const details = sendError instanceof Error ? sendError.message : 'Unknown error';
      setError(`Unable to send message: ${details}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] font-sans">
      {isOpen && (
        <section
          aria-label="Organization chat"
          className="mb-3 flex h-[min(34rem,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0B0F19] shadow-2xl shadow-black/50"
        >
          <header className="flex items-center justify-between border-b border-slate-800 bg-[#111827] px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Organization Chat</h2>
              <p className="text-[11px] text-slate-400">Messages shared with dashboard users</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close organization chat"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading messages...
              </div>
            )}
            {!isLoading && messages.length === 0 && !error && (
              <p className="py-8 text-center text-xs text-slate-500">
                No messages yet. Start the conversation.
              </p>
            )}
            {messages.map((message) => {
              const isOwnMessage = message.senderEmail === currentUser.email;
              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <article className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    isOwnMessage
                      ? 'rounded-br-sm bg-indigo-600/90 text-white'
                      : 'rounded-bl-sm border border-slate-700 bg-slate-800/80 text-slate-100'
                  }`}>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-[11px] font-semibold">
                        {isOwnMessage ? 'You' : message.senderName}
                      </span>
                      {!isOwnMessage && (
                        <span className="text-[9px] text-slate-400">{message.senderRole}</span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                    <time className="mt-1 block text-right text-[9px] opacity-70">
                      {message.createdAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </time>
                  </article>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div role="alert" className="mx-3 mb-2 flex gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-800 p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={2000}
              rows={2}
              aria-label="Write a chat message"
              placeholder="Write a message..."
              className="max-h-28 min-h-10 flex-1 resize-y rounded-xl border border-slate-700 bg-[#080B12] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending
                ? <LoaderCircle className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close organization chat' : 'Open organization chat'}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 transition hover:scale-105 hover:bg-cyan-400"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
