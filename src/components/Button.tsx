import React from 'react'; // Import React
import Link from 'next/link';

// Define types for Button props
type ButtonVariant = 'primary' | 'secondary' | 'outline-light'; // Keep existing variants or adjust as needed
type ButtonType = 'button' | 'submit' | 'reset';

// Define props for the Button component - simplified based on user feedback
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: ButtonType; // Keep type optional for links
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ href, children, variant = 'primary', type = 'button', className = '', ...props }) => {
  // Base styles matching original CSS .btn but using Tailwind classes where possible
  // Adjusted based on user feedback's example structure
  const baseStyles = "inline-block py-[0.8rem] px-[1.8rem] font-poppins font-medium text-[0.9rem] text-center rounded-[2px] cursor-pointer border border-transparent uppercase tracking-[1px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-std ease-in-out hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]";

  // Variant styles mapping to Tailwind colors defined in config - kept from previous state
  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-brand-gold text-black border-brand-gold hover:bg-[#9a7d4a] hover:border-[#9a7d4a]", // Adjusted hover based on user feedback example
    secondary: "bg-white/10 text-white border border-white/20 rounded hover:bg-white/15", // Adjusted based on user feedback example
    'outline-light': "bg-transparent text-white border-white/80 hover:bg-white hover:text-brand-black hover:border-white", // Kept from previous state
  };

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;

  // If href is provided, render as Link (Modern API)
  if (href) {
    // Filter out props meant only for button elements
    const { type: buttonType, ...linkProps } = props as React.AnchorHTMLAttributes<HTMLAnchorElement> & { type?: ButtonType };
    return (
      <Link href={href} className={buttonClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  // Otherwise render as button
  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={buttonClasses} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button; // Export the component
