import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, ShoppingCart } from 'lucide-react';
import { useI18n } from '../i18n';
import LeadForm from './LeadForm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatWidget: React.FC = () => {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  // The welcome message is recomputed on every render so it follows the
  // currently selected language without needing extra state.
  const welcome: ChatMessage = { role: 'assistant', content: t('chat.welcome') };
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset the conversation if the user changes language so the bot greets
  // again in the new language and the assistant answers from a fresh session.
  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('chat.welcome') }]);
    setSessionId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const history = messages.slice(1); // drop welcome from history
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          history,
          lang,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.session_id && !sessionId) setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || '...' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('chat.error') }]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        data-testid="chat-fab"
        onClick={() => setOpen(o => !o)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[300] w-16 h-16 rounded-full bg-gold-accent text-coffee-black shadow-2xl shadow-gold-accent/40 flex items-center justify-center border-2 border-coffee-yellow/60"
        aria-label={open ? t('chat.close') : t('chat.open')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X size={26} strokeWidth={2.4} />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MessageCircle size={26} strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>

        {!open && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-coffee-cream rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-28 right-4 md:right-8 z-[300] w-[calc(100vw-2rem)] sm:w-[400px] max-w-[420px] h-[560px] max-h-[78vh] bg-coffee-cream rounded-3xl shadow-[0_24px_60px_-10px_rgba(0,0,0,0.35)] border border-coffee-yellow/30 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-coffee-black text-white flex items-center space-x-3 border-b border-coffee-yellow/30">
              <div className="w-10 h-10 rounded-full bg-gold-accent/20 border border-gold-accent flex items-center justify-center">
                <MessageCircle size={18} className="text-gold-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-sm uppercase tracking-[0.2em]">
                  {t('chat.title')}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-300 uppercase tracking-widest mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {t('chat.online')}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label={t('chat.close')}
                data-testid="chat-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              data-testid="chat-messages"
              className="flex-1 overflow-y-auto px-4 py-5 space-y-3 custom-scrollbar bg-gradient-to-b from-coffee-cream via-parchment to-coffee-cream"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                      m.role === 'user'
                        ? 'bg-gold-accent text-coffee-black rounded-br-md font-medium'
                        : 'bg-white text-coffee-black rounded-bl-md border border-coffee-yellow/15'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-white text-coffee-black rounded-2xl rounded-bl-md border border-coffee-yellow/15 px-4 py-3 shadow-sm flex items-center gap-2 text-sm">
                    <Loader2 size={14} className="animate-spin text-gold-accent" />
                    <span className="text-zinc-500">{t('chat.thinking')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-coffee-yellow/20 bg-white p-3">
              <div className="flex items-end gap-2 bg-coffee-cream rounded-2xl border border-coffee-yellow/30 px-3 py-2 focus-within:border-gold-accent transition-colors">
                <textarea
                  ref={inputRef}
                  data-testid="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={t('chat.placeholder')}
                  rows={1}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  className="flex-1 bg-transparent outline-none text-sm text-coffee-black placeholder:text-zinc-400 resize-none max-h-28 leading-snug py-1"
                />
                <button
                  data-testid="chat-send-btn"
                  onClick={send}
                  disabled={busy || !input.trim()}
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    busy || !input.trim()
                      ? 'bg-zinc-200 text-zinc-400'
                      : 'bg-gold-accent text-coffee-black hover:scale-105 shadow-md shadow-gold-accent/30'
                  }`}
                  aria-label="Send"
                >
                  <Send size={15} />
                </button>
              </div>

              {/* "I'm ready to buy" CTA — placed BELOW the input, full text, +2pt */}
              <button
                data-testid="chat-ready-btn"
                onClick={() => setShowLeadForm(true)}
                className="w-full mt-3 px-4 py-3 rounded-2xl bg-coffee-black text-gold-accent border border-gold-accent/40 hover:bg-coffee-yellow hover:text-coffee-black hover:border-coffee-yellow transition-all flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-[0.14em] leading-tight shadow-md whitespace-normal text-center"
              >
                <ShoppingCart size={15} className="shrink-0" />
                <span>{t('chat.ready_button')}</span>
              </button>

              <div className="text-[9px] text-zinc-400 text-center mt-2 uppercase tracking-widest">
                {t('chat.footer')}
              </div>
            </div>

            <AnimatePresence>
              <LeadForm
                open={showLeadForm}
                onClose={() => setShowLeadForm(false)}
                sessionId={sessionId}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
