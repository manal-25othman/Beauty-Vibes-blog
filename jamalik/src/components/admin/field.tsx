"use client";

import { useId } from "react";

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** عدّاد أحرف مع الحد الموصى به — مفيد في حقول السيو. */
  counter?: { value: number; max: number };
  className?: string;
};

type InputProps = BaseProps & {
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  autoComplete?: string;
};

export function TextField({
  label,
  name,
  error,
  hint,
  required,
  counter,
  className = "",
  type = "text",
  defaultValue,
  value,
  onChange,
  onBlur,
  placeholder,
  dir,
  autoComplete,
}: InputProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} counter={counter} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        dir={dir}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={inputClass(error)}
      />
      <FieldFooter hintId={hintId} hint={hint} errorId={errorId} error={error} />
    </div>
  );
}

type TextAreaProps = BaseProps & {
  rows?: number;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  mono?: boolean;
};

export function TextAreaField({
  label,
  name,
  error,
  hint,
  required,
  counter,
  className = "",
  rows = 4,
  defaultValue,
  value,
  onChange,
  placeholder,
  mono = false,
}: TextAreaProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} counter={counter} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={`${inputClass(error)} ${mono ? "font-mono text-sm leading-loose" : ""} resize-y`}
      />
      <FieldFooter hintId={hintId} hint={hint} errorId={errorId} error={error} />
    </div>
  );
}

type SelectProps = BaseProps & {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function SelectField({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  defaultValue,
  value,
  onChange,
  options,
  placeholder,
}: SelectProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={inputClass(error)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldFooter hintId={hintId} hint={hint} errorId={errorId} error={error} />
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  defaultChecked,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();

  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
        className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
      />
      <label htmlFor={id} className="text-sm text-ink">
        {label}
        {hint && <span className="block text-xs text-ink-faint">{hint}</span>}
      </label>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  label,
  required,
  counter,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  counter?: { value: number; max: number };
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {counter && (
        // dir="ltr" مقصود: "٠ / ٩٠" في سياق RTL يُعاد ترتيبه بصريًا فيُقرأ معكوسًا.
        <span
          dir="ltr"
          className={`text-xs tabular-nums ${
            counter.value > counter.max ? "text-danger" : "text-ink-faint"
          }`}
        >
          {counter.value} / {counter.max}
        </span>
      )}
    </div>
  );
}

function FieldFooter({
  hintId,
  hint,
  errorId,
  error,
}: {
  hintId?: string;
  hint?: string;
  errorId?: string;
  error?: string;
}) {
  if (!hint && !error) return null;

  return (
    <>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </>
  );
}

function inputClass(error?: string): string {
  return `w-full rounded-xl border bg-canvas px-4 py-2.5 text-ink placeholder:text-ink-faint focus:outline-none ${
    error ? "border-danger focus:border-danger" : "border-line focus:border-accent"
  }`;
}
