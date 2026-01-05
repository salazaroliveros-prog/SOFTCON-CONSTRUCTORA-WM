import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[]; // Para selects
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  placeholder,
  required = false,
  value,
  onChange,
  options
}) => {
  const commonClasses = "block mb-1 text-white !text-shadow-md font-bold text-xs uppercase tracking-wider";
  const inputClasses = "w-full p-3 rounded-xl bg-black/75 border border-white/20 text-white focus:outline-none focus:border-[var(--primary-color)] focus:shadow-glow-main transition-all duration-300";

  return (
    <div>
      <label htmlFor={name} className={commonClasses}>
        {label}
      </label>
      {type === 'select' && options ? (
        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={inputClasses}
        >
          <option value="" disabled selected hidden>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          className={inputClasses}
        />
      )}
    </div>
  );
};

export default InputField;
