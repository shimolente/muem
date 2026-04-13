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

/* ── Props — multi-select ───────────────────────────────────────────────────── */
interface FilterDropdownProps {
  label:    string;
  allValue: string;     /* placeholder text when nothing selected */
  options:  DropdownOption[];
  values:   string[];   /* currently selected values (empty = "All") */
  onChange: (v: string[]) => void;
  compact?: boolean;    /* pill variant — used for compact Location / Year filters */
  filled?:  boolean;    /* filled block variant — used for the 3 category filters */
}

/* ── Trigger display label ─────────────────────────────────────────────────── */
function resolveDisplay(
  values:   string[],
  allValue: string,
  options:  DropdownOption[],
): string {
  if (values.length === 0) return allValue;
  if (values.length === 1) {
    const v = values[0];
    for (const opt of options) {
      if (opt.type === 'group') {
        if (opt.value === v) return opt.label;
        const child = opt.children.find(c => c.value === v);
        if (child) return child.label;
      } else {
        if (opt.value === v) return opt.label;
      }
    }
    return v;
  }
  return `${values.length} selected`;
}

/* ── Checkbox icon ─────────────────────────────────────────────────────────── */
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}
      aria-hidden="true"
    >
      {checked && (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path
            d="M1.5 4.5l2 2 4-4"
            stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export function FilterDropdown({
  label, allValue, options, values, onChange, compact = false, filled = false,
}: FilterDropdownProps) {
  const [open, setOpen]  = useState(false);
  const containerRef     = useRef<HTMLDivElement>(null);
  const display          = resolveDisplay(values, allValue, options);
  const isFiltered       = values.length > 0;

  const close    = ()  => setOpen(false);
  const toggle   = (v: string) => {
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  };
  const clearAll = () => onChange([]);

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
      className={`${compact ? styles.triggerCompact : filled ? styles.triggerFilled : styles.trigger} ${open ? styles.triggerOpen : ''} ${isFiltered ? styles.triggerFiltered : ''}`}
      onClick={() => setOpen(v => !v)}
      role="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={`${label} filter`}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v); }
      }}
    >
      {/* Trigger text */}
      {!compact && <span className={styles.triggerLabel}>{label}</span>}
      <span className={styles.triggerValue}>
        {compact ? `${label}: ${display}` : display}
      </span>
      <span className={styles.chevron} aria-hidden="true" />

      {/* Panel — click inside does not close */}
      {open && (
        <div
          className={styles.panel}
          role="listbox"
          aria-multiselectable="true"
          onClick={e => e.stopPropagation()}
        >

          {/* "All …" — checked when nothing is selected; clears on click */}
          <button
            type="button"
            role="option"
            aria-selected={values.length === 0}
            className={`${styles.row} ${values.length === 0 ? styles.rowActive : ''}`}
            onClick={clearAll}
          >
            <Checkbox checked={values.length === 0} />
            <span className={styles.rowLabel}>{allValue}</span>
          </button>

          <div className={styles.separator} />

          {options.map((opt, i) => {
            if (opt.type === 'group') {
              const checked = values.includes(opt.value);
              return (
                <div key={i}>
                  {/* Group heading — toggles the region value */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    className={`${styles.row} ${styles.rowGroup} ${checked ? styles.rowActive : ''}`}
                    onClick={() => toggle(opt.value)}
                  >
                    <Checkbox checked={checked} />
                    <span className={styles.rowLabel}>{opt.label}</span>
                  </button>

                  {/* Indented children */}
                  {opt.children.map(child => {
                    const childChecked = values.includes(child.value);
                    return (
                      <button
                        key={child.value}
                        type="button"
                        role="option"
                        aria-selected={childChecked}
                        className={`${styles.row} ${styles.rowChild} ${childChecked ? styles.rowActive : ''}`}
                        onClick={() => toggle(child.value)}
                      >
                        <Checkbox checked={childChecked} />
                        <span className={styles.rowLabel}>{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            }

            const checked = values.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={checked}
                className={`${styles.row} ${checked ? styles.rowActive : ''}`}
                onClick={() => toggle(opt.value)}
              >
                <Checkbox checked={checked} />
                <span className={styles.rowLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
