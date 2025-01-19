// components/Modal.tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open
  
  let modalSize

  if(size === 'small') {
    modalSize = 'w-1/5 h-1/4'
  } else if(size === 'medium') {
    modalSize = 'w-1/2 h-1/2'
  } else {
    modalSize = 'w-full h-3/4'
  }

  return (
    <div
      className="bg-black w-screen fixed inset-0 bg-opacity-50 flex justify-center items-center z-10 p-4"
      onClick={onClose} // Close modal when clicking outside of it
    >
      <div
        className={`bg-cursedBlack  p-6 rounded-lg shadow-lg ${modalSize} overflow-auto`}
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <button
          className="absolute top-4 right-4 text-gray-500"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;