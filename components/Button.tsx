import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // X Design: Pill shape, bold font, subtle interactions
  const baseStyles = "transition-transform active:scale-95 duration-200 rounded-full font-bold flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    // High emphasis: Solid White (e.g., "Post", "Follow")
    primary: "bg-[#eff3f4] text-[#0f1419] hover:bg-[#d7dbdc] border border-transparent",
    
    // Medium emphasis: Translucent Gray (e.g., Neutral actions on dark bg)
    secondary: "bg-[#eff3f4]/10 text-[#eff3f4] hover:bg-[#eff3f4]/20 border border-transparent",
    
    // Brand emphasis: Solid Blue
    accent: "bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] border border-transparent",
    
    // Destructive: Red Outline/Tint
    danger: "text-[#f4212e] border border-[#f4212e]/50 hover:bg-[#f4212e]/10 bg-transparent",
    
    // Low emphasis: Transparent with text
    ghost: "bg-transparent text-[#1d9bf0] hover:bg-[#1d9bf0]/10 border border-transparent",
    
    // Bordered: Transparent with Gray Border
    outline: "bg-transparent border border-[#536471] text-[#eff3f4] hover:bg-[#eff3f4]/10"
  };

  const sizes = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2.5 px-5 text-base",
    lg: "py-3 px-6 text-lg",
    xl: "py-4 px-8 text-xl",
    icon: "w-12 h-12 p-0 text-xl" // For circular icon buttons
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};