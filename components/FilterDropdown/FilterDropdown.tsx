'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './FilterDropdown.module.css';

/* ── Option types ──────────────────────────────────────────────────────────── */
export type DropdownItem  = { label: string; value: string };
export type DropdownGroup = {
  type:     'group';
  label:    string;
  value:    string;    /* selecting the group header sets this value */
  children: DropdownItem[];
};
export type DropdownOption = ({ type?: 'item' } & DropdownItem) | DropdownGroup;

/* ── Props ─────────────────────────────────────────────────────────────────── */
interface FilterDropdownProps {
  label:    string;
  value:    string;     /* currently selected value */
  allValue: string;     /* reset option, e.g. 'All Topologies' */
  options:  DropdownOption[];
  onChange: (v: string) => void;
}

/* ── Resolve short display label for the trigger ───────────────────────────── */
function resolveDisplay(
  value:    string,
  allValue: string,
  options:  DropdownOption[],
): string {
  if (value === allValue) return allValue;
  for (const opt of options) {
    if (opt.type === 'group') {
      if (opt.value === value) return opt.label;
      const child = opt.children.find(c => c.value === value);
      if (child) return child.label;
    } else {
      if (opt.value === value) return opt.label;
    }
  }
  return value;
}

/* ── Check icon ────────────────────────────────────────────────────────────── */
function Check() {
  return (
    <svg
      className={styles.checkIcon}
      width="12" height="12" viewBox="0 0 12 12"
      fill="none" aria-hidden="true"
    >
      <path
        d="M2 6.5l2.8 2.8 5-5.6"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export function FilterDropdown({
  label, value, allValue, options, onChange,
}: FilterDropdownProps) {
  const [open, setOpen]  = useState(false);
  const containerRef     = useRef<HTMLDivElement>(null);
  const display          = resolveDisplay(value, allValue, options);
  const isFiltered       = value !== allValue;

  const close  = ()  => setOpen(false);
  const select = (v: string) => { onChange(v); close(); };

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`${styles.trigger} ${open ? styles.triggerOpen : ''} ${isFiltered ? styles.triggerFiltered : ''}`}
      onClick={() => setOpen(v => !v)}
      role="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v); } }}
    >
      {/* Trigger text */}
      <span className={styles.triggerLabel}>{label}</span>
      <span className={styles.triggerValue}>{display}</span>
      <span className={styles.chevron} aria-hidden="true" />

      {/* Panel */}
      {open && (
        <div
          className={styles.panel}
          role="listbox"
          onClick={e => e.stopPropagation()}
        >
          {/* "All …" reset row */}
          <button
            type="button"
            role="option"
            aria-selected={value === allValue}
            className={`${styles.row} ${value === allValue ? styles.rowActive : ''}`}
            onClick={() => select(allValue)}
          >
            <span className={styles.rowLabel}>{allValue}</span>
            {value === allValue && <Check />}
          </button>

          <div className={styles.separator} />

          {options.map((opt, i) => {
            if (opt.type === 'group') {
              const groupActive = value === opt.value;
              return (
                <div key={i}>
                  {/* Group heading — clicking selects all in region */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={groupActive}
                    className={`${styles.row} ${styles.rowGroup} ${groupActive ? styles.rowActive : ''}`}
                    onClick={() => select(opt.value)}
                  >
                    <span className={styles.rowLabel}>{opt.label}</span>
                    {groupActive && <Check />}
                  </button>

                  {/* Indented children */}
                  {opt.children.map(child => {
                    const active = value === child.value;
                    return (
                      <button
                        key={child.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`${styles.row} ${styles.rowChild} ${active ? styles.rowActive : ''}`}
                        onClick={() => select(child.value)}
                      >
                        <span className={styles.rowLabel}>{child.label}</span>
                        {active && <Check />}
                      </button>
                    );
                  })}
                </div>
              );
            }

            const active = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                className={`${styles.row} ${active ? styles.rowActive : ''}`}
                onClick={() => select(opt.value)}
              >
                <span className={styles.rowLabel}>{opt.label}</span>
                {active && <Check />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
