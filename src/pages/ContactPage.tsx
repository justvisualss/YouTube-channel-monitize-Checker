import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [responseStatus, setResponseStatus] = useState<{
    status: 'delivered' | 'received_unconfigured' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setResponseStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit message.');
      }

      setResponseStatus({
        status: data.status,
        message: data.message,
      });

      if (data.status === 'delivered') {
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err: any) {
      setResponseStatus({
        status: 'error',
        message: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#282846] pb-6 space-y-2">
        <span className="text-xs uppercase font-semibold tracking-wider text-[#ff7e5f]">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">
          Contact ChannelScope Analytics
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Inquiries regarding platform metrics, methodology disclosures, bug reports, or feature requests.
        </p>
      </div>

      <div className="card-surface rounded-2xl p-6 sm:p-8 border border-[#282846] shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Your Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="contactName"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Morgan"
                className="w-full bg-[#101026] border border-[#282846] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc]"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                id="contactEmail"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@example.com"
                className="w-full bg-[#101026] border border-[#282846] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contactSubject" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Subject
            </label>
            <input
              id="contactSubject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Question about RPM estimation methodology"
              className="w-full bg-[#101026] border border-[#282846] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc]"
            />
          </div>

          <div>
            <label htmlFor="contactMessage" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Message <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="contactMessage"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Describe your inquiry, suggestion, or feedback in detail..."
              className="w-full bg-[#101026] border border-[#282846] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc]"
            />
          </div>

          {/* Submission Response State */}
          {responseStatus && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                responseStatus.status === 'delivered'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : responseStatus.status === 'received_unconfigured'
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {responseStatus.status === 'delivered' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : responseStatus.status === 'received_unconfigured' ? (
                  <Info className="w-5 h-5 text-amber-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                <p>{responseStatus.message}</p>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ffcc]" />
              Spam-protected server validation
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#ff7e5f] hover:bg-[#ff6844] disabled:bg-gray-700 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
