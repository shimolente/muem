'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './LocaleToggle.module.css';

export function LocaleToggle() {
  const router = useRouter();
  const locale = useLocale();

  const setLocale = (next: 'en' | 'es') => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

  return (
    <div className={styles.toggle} role="group" aria-label="Language">
      <button
        type="button"
        className={`${styles.btn} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <span aria-hidden="true" className={styles.sep}>/</span>
      <button
        type="button"
        className={`${styles.btn} ${locale === 'es' ? styles.active : ''}`}
        onClick={() => setLocale('es')}
        aria-pressed={locale === 'es'}
      >
        ES
      </button>
    </div>
  );
}
