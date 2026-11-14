import React from 'react';

// PixelButton: A strictly controlled button plugin
// Demonstrates restricting user choices to specific variants

interface PixelButtonProps {
  label: string;
  variant: 'primary' | 'secondary' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({ 
  label = 'Click Me', 
  variant = 'primary', 
  size = 'md',
  fullWidth = false
}) => {
  
  // Internal Design System Mapping
  // The user selects "primary", the plugin decides what "primary" looks like.
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm ring-1 ring-inset ring-indigo-600',
    secondary: 'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
    destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-sm'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs rounded',
    md: 'px-3 py-2 text-sm rounded-md',
    lg: 'px-4 py-2.5 text-base rounded-md'
  };

  const widthClass = fullWidth ? 'w-full flex justify-center' : 'inline-flex';

  return (
    <button 
      type="button"
      className={`${widthClass} ${sizes[size]} ${variants[variant]} items-center gap-x-1.5 font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600`}
    >
      {label}
    </button>
  );
};

export default PixelButton;
