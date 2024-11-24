import React from 'react';

interface LoadingSpinnerProps {
  size?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'w-16 h-16', color = 'border-blue-500' }) => {
  return (
    <div className="bg-[rgba(0,0,0,0.5)] left-0 right-0 top-0 bottom-0 fixed z-[200] w-full h-full flex justify-center items-center">
      <div
        className={`${size} border-4 border-t-4 ${color} border-solid rounded-full spinner`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;