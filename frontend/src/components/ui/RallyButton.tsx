import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface RallyButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  isLoading?: boolean;
}

export const RallyButton: React.FC<RallyButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return 'bg-rally-accent hover:bg-rally-accent-hover text-rally-dark-bg font-extrabold shadow-rally-glow';
      case 'outline':
        return 'bg-transparent border border-rally-border-subtle hover:border-rally-accent hover:text-rally-accent text-rally-text-secondary';
      case 'ghost':
        return 'bg-transparent hover:bg-white/5 text-rally-text-secondary hover:text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-md';
      case 'primary':
      default:
        return 'bg-rally-primary hover:bg-rally-primary-light text-white font-bold shadow-rally-green';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs rounded-sm gap-1.5';
      case 'lg':
        return 'h-12 px-6 text-base rounded-md gap-2.5';
      case 'md':
      default:
        return 'h-10 px-4 text-sm rounded gap-2';
    }
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-sans select-none transition-colors duration-150',
        getVariantStyles(),
        getSizeStyles(),
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default RallyButton;
