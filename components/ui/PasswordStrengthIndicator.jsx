"use client";

import { Check, X } from "lucide-react";

export function checkPasswordCriteria(password = "") {
  return [
    { label: "Minimal 8 karakter", valid: password.length >= 8 },
    { label: "Huruf besar (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Huruf kecil (a-z)", valid: /[a-z]/.test(password) },
    { label: "Angka (0-9)", valid: /[0-9]/.test(password) },
    { label: "Karakter khusus / simbol (!@#$%...)", valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password) },
  ];
}

export function isPasswordStrong(password = "") {
  const criteria = checkPasswordCriteria(password);
  return criteria.every((c) => c.valid);
}

export default function PasswordStrengthIndicator({ password = "" }) {
  if (!password) return null;

  const criteria = checkPasswordCriteria(password);
  const metCount = criteria.filter((c) => c.valid).length;

  let strengthColor = "bg-red-500";
  let strengthText = "Lemah";
  if (metCount >= 5) {
    strengthColor = "bg-emerald-500";
    strengthText = "Sangat Kuat";
  } else if (metCount >= 3) {
    strengthColor = "bg-amber-500";
    strengthText = "Sedang";
  }

  return (
    <div className="space-y-2 mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
      <div className="flex items-center justify-between font-semibold">
        <span className="text-slate-600 dark:text-slate-400">Kekuatan Kata Sandi:</span>
        <span className={metCount === 5 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400"}>
          {strengthText} ({metCount}/5)
        </span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${(metCount / 5) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              c.valid
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {c.valid ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-slate-300 dark:text-slate-600" />}
            <span className="text-[11px]">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
