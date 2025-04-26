import React from 'react';
import Link from 'next/link';

// Define types for Button props
type ButtonVariant = 'primary' | 'secondary' | 'outline-light';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: ButtonType; // Keep type optional for links
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ href, children, variant = 'primary', type = 'button', className = '', ...props }) => {
  // Base styles matching original CSS .btn but using Tailwind classes where possible
  const baseStyles = "inline-block py-[0.8rem] px-[1.8rem] font-poppins font-medium text-[0.9rem] text-center rounded-[2px] cursor-pointer border border-transparent uppercase tracking-[1px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-std ease-in-out hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]";

  // Variant styles mapping to Tailwind colors defined in config
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand-gold text-white border-brand-gold hover:bg-[#9a7d4a] hover:border-[#9a7d4a]", // Using specific hover color from original CSS
    secondary: "bg-transparent text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-white",
    'outline-light': "bg-transparent text-white border-white/80 hover:bg-white hover:text-brand-black hover:border-white",
  };
  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    const linkProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={combinedClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={combinedClassName} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button; // Export the component
