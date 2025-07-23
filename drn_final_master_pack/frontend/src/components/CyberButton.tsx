import React, { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'red';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  external?: boolean;
  className?: string;
  showLock?: boolean;
}

const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  to,
  external = false,
  className = '',
  showLock = false,
  ...props
}) => {
  const baseClasses = 'cyber-button flex items-center justify-center space-x-2 text-sm font-medium tracking-wider uppercase transition-all duration-300';
  const variantClasses = variant === 'red' ? 'cyber-button-red' : '';
  const sizeClasses = size === 'sm' ? 'py-1 px-3 text-xs' : size === 'lg' ? 'py-3 px-6 text-base' : 'py-2 px-4 text-sm';
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  const content = (
    <>
      {children}
      {showLock && <Lock className="w-4 h-4 ml-2" />}
    </>
  );

  if (to && external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={combinedClasses}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
};

export default CyberButton;