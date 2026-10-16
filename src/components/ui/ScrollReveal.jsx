import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  fade: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  },
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  },
  slideDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  },
  slideRight: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  },
  blurIn: {
    hidden: { opacity: 0, filter: 'blur(10px)', y: 20 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }
};

const ScrollReveal = ({ 
  children, 
  variant = 'slideUp', 
  className = '', 
  delay = 0,
  once = true,
  amount = 0,
  style = {}
}) => {
  const selectedVariant = variants[variant] || variants.slideUp;
  
  const customVisible = {
    ...selectedVariant.visible,
    transition: {
      ...selectedVariant.visible.transition,
      delay: delay
    }
  };
  
  const customVariant = {
    hidden: selectedVariant.hidden,
    visible: customVisible
  };

  return (
    <motion.div
      variants={customVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px", amount: amount || 0 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
