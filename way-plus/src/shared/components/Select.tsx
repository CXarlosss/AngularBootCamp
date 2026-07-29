/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Select — Componente base nativo
 * Dropdown custom con glassmorphism, a11y y animaciones
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GLASS,
  A11Y,
  way,
} from '@/shared/lib/wayTheme';
import { hapticService } from '@/core/services/hapticService';

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

// ───────────────────────────────────────────────────────────────
// COMPONENT
// ───────────────────────────────────────────────────────────────
export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  error,
  helperText,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const hasError = !!error;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = options[highlightedIndex];
            if (!option.disabled) {
              hapticService.click();
              onChange(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex((prev) =>
              prev < options.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(options.length - 1);
          } else {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : options.length - 1
            );
          }
          break;
        case 'Home':
          e.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setHighlightedIndex(options.length - 1);
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, options, onChange]
  );

  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) {
      hapticService.error();
      return;
    }
    hapticService.click();
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={
          highlightedIndex >= 0 ? `option-${options[highlightedIndex]?.value}` : undefined
        }
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            hapticService.click();
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleKeyDown}
        className={way(
          'w-full flex items-center justify-between',
          'bg-white/80 backdrop-blur-sm',
          'border transition-all duration-200',
          'px-4 py-3 text-base min-h-[44px]',
          'rounded-2xl',
          'text-left',
          hasError
            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
          'focus-visible:ring-4 focus-visible:ring-indigo-500/50 focus-visible:outline-none',
          'forced-colors:border-2 forced-colors:border-[#1E1B4B]'
        )}
      >
        <span className={way('truncate', !selectedOption && 'text-slate-400')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronIcon
          className={way(
            'h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            ref={listboxRef}
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={way(
              'absolute z-50 mt-2 w-full max-w-xs',
              'bg-white/95 backdrop-blur-xl',
              'border border-white/30 shadow-2xl',
              'rounded-2xl overflow-hidden',
              'max-h-60 overflow-y-auto'
            )}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`option-${option.value}`}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={option.disabled}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={way(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer',
                  'transition-colors duration-150',
                  index === highlightedIndex && 'bg-indigo-50',
                  value === option.value && 'bg-indigo-100/50 font-semibold text-indigo-700',
                  option.disabled && 'opacity-40 cursor-not-allowed',
                  'focus-visible:outline-none focus-visible:bg-indigo-50'
                )}
              >
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <span className="flex-1 truncate">{option.label}</span>
                {value === option.value && (
                  <CheckIcon className="h-4 w-4 text-indigo-600 shrink-0" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Helper / Error */}
      {(helperText || error) && (
        <p
          className={way(
            'mt-1.5 text-xs',
            hasError ? 'font-medium text-rose-600' : 'text-slate-500'
          )}
          role={hasError ? 'alert' : undefined}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// ICONOS INLINE
// ───────────────────────────────────────────────────────────────
const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default Select;
