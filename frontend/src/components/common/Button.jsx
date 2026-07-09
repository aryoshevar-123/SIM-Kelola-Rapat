import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',         
  onClick, 
  disabled = false,
  className = ''       
}) => {

  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/50 disabled:opacity-50 disabled:pointer-events-none font-sans';

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover shadow-sm',
    secondary: 'border border-brand text-brand hover:bg-brand/5',
    danger: 'bg-danger text-white hover:bg-danger-hover shadow-sm',
    dangerOutline: 'border border-danger text-danger hover:bg-danger/5',
    success: 'bg-success text-white hover:bg-success-hover shadow-sm',
    successOutline: 'border border-success text-success hover:bg-success/5',
  };

  const sizes = {
    sm: 'button-sm',
    md: 'button-md',
    lg: 'button-lg',
  };

  const buttonClass = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;