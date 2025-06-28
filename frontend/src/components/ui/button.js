// components/ui/button.js
import React from 'react';

export const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded text-white font-semibold transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
