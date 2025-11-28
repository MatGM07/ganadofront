import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Componente de input reutilizable con validación
 */
export function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  maxLength,
  rows = 4,
  className = "",
  helpText,
  min,
  max,
  step
}) {
  const isTextarea = type === "textarea";
  const inputId = `input-${name}`;

  const baseClasses = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";
  const finalClasses = `${baseClasses} ${errorClasses} ${className}`;

  const handleChange = (e) => {
    // Soportar ambos formatos: onChange(e) u onChange(name, value)
    if (typeof onChange === 'function') {
      // Si onChange espera (name, value)
      if (onChange.length === 2) {
        onChange(name, e.target.value);
      } else {
        // Si onChange espera (e)
        onChange(e);
      }
    }
  };

  return (
    <div className="mb-6">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={finalClasses}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={finalClasses}
        />
      )}

      {maxLength && (
        <p className="text-xs text-gray-500 mt-1 text-right">
          {value?.length || 0} / {maxLength} caracteres
        </p>
      )}

      {helpText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}

      {error && (
        <div className="flex items-center space-x-1 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de select reutilizable con validación
 */
export function FormSelect({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  options = [],
  placeholder = "Selecciona una opción",
  className = "",
  helpText
}) {
  const inputId = `select-${name}`;

  const baseClasses = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed bg-white";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";
  const finalClasses = `${baseClasses} ${errorClasses} ${className}`;

  const handleChange = (e) => {
    // Soportar ambos formatos: onChange(e) u onChange(name, value)
    if (typeof onChange === 'function') {
      // Si onChange espera (name, value)
      if (onChange.length === 2) {
        onChange(name, e.target.value);
      } else {
        // Si onChange espera (e)
        onChange(e);
      }
    }
  };

  return (
    <div className="mb-6">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={inputId}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={finalClasses}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helpText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}

      {error && (
        <div className="flex items-center space-x-1 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}