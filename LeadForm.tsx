import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, Loader2, ShoppingCart } from 'lucide-react';
import { useI18n } from '../i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string | null;
}

const LeadForm: React.FC<Props> = ({ open, onClose, sessionId }) => {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ name: '', address: '', email: '', phone: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang, session_id: sessionId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setForm({ name: '', address: '', email: '', phone: '', note: '' });
        onClose();
      }, 2200);
    } catch (err) {
      setError(t('lead.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      data-testid="lead-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[10] bg-coffee-cream/98 backdrop-blur-md flex flex-col"
    >
      <div className="px-5 py-4 bg-coffee-black text-white flex items-center justify-between border-b border-coffee-yellow/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-accent/20 border border-gold-accent flex items-center justify-center">
            <ShoppingCart size={16} className="text-gold-accent" />
          </div>
          <div className="font-display font-black text-[12px] uppercase tracking-[0.18em]">
            {t('lead.title')}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition"
          aria-label={t('lead.cancel')}
          data-testid="lead-cancel"
        >
          <X size={16} />
        </button>
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <CheckCircle2 size={48} className="text-green-500" />
          <p className="text-coffee-black font-medium leading-relaxed">{t('lead.success')}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
          <p className="text-[12px] text-zinc-600 leading-relaxed">{t('lead.subtitle')}</p>

          <Field testid="lead-name" label={t('lead.name')} required value={form.name} onChange={update('name')} />
          <Field testid="lead-phone" label={t('lead.phone')} required type="tel" value={form.phone} onChange={update('phone')} />
          <Field testid="lead-email" label={t('lead.email')} required type="email" value={form.email} onChange={update('email')} />
          <Field testid="lead-address" label={t('lead.address')} required value={form.address} onChange={update('address')} />

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t('lead.note')}</label>
            <textarea
              data-testid="lead-note"
              value={form.note}
              onChange={update('note')}
              rows={2}
              className="w-full bg-white border border-coffee-yellow/30 rounded-xl px-3 py-2 text-sm text-coffee-black focus:outline-none focus:border-gold-accent transition-colors resize-none"
            />
          </div>

          {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            data-testid="lead-submit"
            disabled={submitting}
            className={`w-full py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
              submitting
                ? 'bg-zinc-300 text-zinc-500'
                : 'bg-gold-accent text-coffee-black hover:scale-[1.02] shadow-lg shadow-gold-accent/30'
            }`}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {t('lead.submit')}
          </button>
        </form>
      )}
    </motion.div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  testid?: string;
}> = ({ label, value, onChange, type = 'text', required, testid }) => (
  <div className="space-y-1">
    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      data-testid={testid}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full bg-white border border-coffee-yellow/30 rounded-xl px-3 py-2 text-sm text-coffee-black focus:outline-none focus:border-gold-accent transition-colors"
    />
  </div>
);

export default LeadForm;
