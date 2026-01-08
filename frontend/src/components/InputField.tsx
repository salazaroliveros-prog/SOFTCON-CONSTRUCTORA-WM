import React from 'react';

export default function InputField({ name, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field"
    />
  );
}
// ...existing code...
parserOptions: {
  ecmaFeatures: { jsx: true },
  // ...existing code...
},
// ...existing code...