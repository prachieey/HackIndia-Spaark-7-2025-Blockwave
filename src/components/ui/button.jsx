import React from 'react';
import { Slot } from '@radix-ui/react-slot';

const Button = React.forwardRef(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'hover:bg-gray-100',
      link: 'text-blue-600 hover:underline',
    };

    const sizes = {
      default: 'h-10 py-2 px-4 text-sm',
      sm: 'h-9 px-3 text-xs rounded-md',
      lg: 'h-11 px-8 text-base rounded-md',
      icon: 'h-10 w-10',
    };

    const Comp = asChild ? Slot : 'button';
    const classes = `${baseStyles} ${variants[variant] || variants.default} ${
      sizes[size] || sizes.default
    } ${className}`;

    return (
      <Comp
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };
