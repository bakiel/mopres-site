import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';

interface ButtonBaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButtonProps extends ButtonBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

interface ButtonAsLinkProps extends ButtonBaseProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = clsx(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
      // Primary (blue/gold)
      'bg-brand-gold text-white hover:bg-[#9a7d4a] focus:ring-brand-gold':
        variant === 'primary',
      // Secondary
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300':
        variant === 'secondary',
      // Outline
      'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-brand-gold':
        variant === 'outline',
      // Danger
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
        variant === 'danger',
      // Sizes
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },
    // Apply any additional classes
    className
  );

  if ('href' in props) {
    return (
      <Link href={props.href} className={buttonClasses} {...(props as ButtonAsLinkProps)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...(props as ButtonAsButtonProps)}>
      {children}
    </button>
  );
}
