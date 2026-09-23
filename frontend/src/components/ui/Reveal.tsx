import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface RevealGroupProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

export const RevealGroup: React.FC<RevealGroupProps> = ({
  children,
  staggerDelay = 0.12,
  className,
  once = true,
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface RevealItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
}

export const RevealItem: React.FC<RevealItemProps> = ({
  children,
  className,
  yOffset = 20,
  ...props
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Reveal = {
  Group: RevealGroup,
  Item: RevealItem,
};

export default Reveal;
