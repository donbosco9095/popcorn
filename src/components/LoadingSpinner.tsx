import React from 'react';
import { Film } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'medium', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Cinema reel animation */}
        <div className={`${sizeClasses[size]} animate-cinema-reel`}>
          <Film className="w-full h-full text-yellow-400" />
        </div>
        
        {/* Inner spinning element */}
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-spin`}>
          <div className="w-full h-full border-4 border-transparent border-t-yellow-400 rounded-full"></div>
        </div>
      </div>
      
      {text && (
        <p className={`mt-4 text-gray-300 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}