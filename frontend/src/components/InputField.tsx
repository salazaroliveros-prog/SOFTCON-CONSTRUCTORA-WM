import React from 'react';

export default function InputField({ name, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all mb-4"
    />
  );
}
// ...existing code...
parserOptions: {
  ecmaFeatures: { jsx: true },
  // ...existing code...
},
// ...existing code...