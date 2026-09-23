import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface RallyCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  isInteractive?: boolean;
}

export const RallyCard: React.FC<RallyCardProps> = ({
  children,
  className,
  isInteractive = true,
  ...props
}) => {
  return (
    <motion.div
      whileHover={isInteractive ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'bg-[#0f172a] rounded-lg border border-[rgba(255,255,255,0.08)] p-6 shadow-rally-card transition-colors duration-200',
        isInteractive && 'hover:border-[rgba(215,237,104,0.3)] hover:shadow-rally-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default RallyCard;
