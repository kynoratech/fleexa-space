"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PasswordInput({ value, onChange, placeholder = "••••••••••••", required = false }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type={showPassword ? "text" : "password"}
        className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 
                   text-sm !text-black focus:bg-white focus:border-indigo-600 
                   focus:ring-4 focus:ring-indigo-600/5 outline-none"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{ color: 'black' }}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}