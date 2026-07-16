'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight } from '@/components/icons/ArrowUpRight';
import styles from './DeveloperContactModal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  /** E.164 phone (e.g. +6281234567890). If absent the CTA is disabled. */
  developerPhone?: string;
  propertyTitle: string;
  /** Property slug — recorded with the captured lead. */
  propertySlug: string;
}

/** Strip non-digits + leading '+' for wa.me URL. */
function waNumber(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

export function DeveloperContactModal({ open, onClose, developerPhone, propertyTitle, propertySlug }: Props) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset form when reopened
  useEffect(() => {
    if (open) { setName(''); setEmail(''); setPhone(''); setError(null); }
  }, [open]);

  const canSubmit = !!developerPhone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developerPhone) {
      setError('Developer contact not available for this property.');
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }

    // Capture the lead server-side (best-effort — never block the WhatsApp
    // hand-off if the request fails). Recorded as a DEVELOPER submission.
    try {
      await fetch('/api/developer-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          propertySlug,
          propertyTitle,
        }),
      });
    } catch (err) {
      console.error('[DeveloperContactModal] lead capture failed', err);
    }

    const message = `Hi, I'm ${name.trim()} (email: ${email.trim()}, phone: ${phone.trim()}). I'm interested in ${propertyTitle} — could you share more details?`;
    const url = `https://wa.me/${waNumber(developerPhone)}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-contact-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <span className={styles.eyebrow}>Contact the developer</span>
        <h2 id="dev-contact-title" className={styles.title}>{propertyTitle}</h2>
        <p className={styles.subtitle}>
          Leave your details and we&apos;ll continue the conversation on WhatsApp with the project developer.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="dev-name">Name</label>
            <input
              id="dev-name"
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dev-email">Email</label>
            <input
              id="dev-email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dev-phone">Phone</label>
            <input
              id="dev-phone"
              className={styles.input}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={!canSubmit}>
            {canSubmit ? <>Continue on WhatsApp<ArrowUpRight /></> : 'Developer contact unavailable'}
          </button>
        </form>
      </div>
    </div>
  );
}
