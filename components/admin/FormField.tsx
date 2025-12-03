'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FormFieldProps {
  label: string
  required?: boolean
  children?: React.ReactNode
  hint?: string
  error?: string
  className?: string
}

// Componente de Label padronizado
export function FormLabel({ 
  label, 
  required = false,
  htmlFor,
  className = ''
}: { 
  label: string
  required?: boolean
  htmlFor?: string
  className?: string
}) {
  return (
    <p className={`text-sm font-semibold text-black mb-1.5 ${className}`}>
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </p>
  )
}

// Componente de campo de formulário completo
export function FormField({ 
  label, 
  required = false, 
  children, 
  hint,
  error,
  className = ''
}: FormFieldProps) {
  return (
    <div className={className}>
      <FormLabel label={label} required={required} />
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

// Input com Label
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  hint?: string
  error?: string
  containerClassName?: string
}

export function FormInput({ 
  label, 
  required = false, 
  hint,
  error,
  containerClassName = '',
  className = '',
  ...props 
}: FormInputProps) {
  return (
    <div className={containerClassName}>
      <FormLabel label={label} required={required} />
      <Input 
        className={`mt-1 ${error ? 'border-red-500' : ''} ${className}`}
        {...props} 
      />
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

// Textarea com Label
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  hint?: string
  error?: string
  containerClassName?: string
}

export function FormTextarea({ 
  label, 
  required = false, 
  hint,
  error,
  containerClassName = '',
  className = '',
  ...props 
}: FormTextareaProps) {
  return (
    <div className={containerClassName}>
      <FormLabel label={label} required={required} />
      <Textarea 
        className={`mt-1 ${error ? 'border-red-500' : ''} ${className}`}
        {...props} 
      />
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

// Select com Label
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  hint?: string
  error?: string
  containerClassName?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function FormSelect({ 
  label, 
  required = false, 
  hint,
  error,
  containerClassName = '',
  className = '',
  options,
  placeholder = 'Selecione...',
  ...props 
}: FormSelectProps) {
  return (
    <div className={containerClassName}>
      <FormLabel label={label} required={required} />
      <select
        className={`w-full mt-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

// Checkbox com Label
interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
  containerClassName?: string
}

export function FormCheckbox({ 
  label, 
  description,
  containerClassName = '',
  className = '',
  ...props 
}: FormCheckboxProps) {
  return (
    <div className={containerClassName}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className={`w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className}`}
          {...props}
        />
        <div>
          <p className="text-sm font-medium text-black">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </label>
    </div>
  )
}

export default FormField
