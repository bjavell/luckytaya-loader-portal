// components/Modal.tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div
      className="overflow-auto w-full fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} // Close modal when clicking outside of it
    >
      <div
        className=" bg-cursedBlack  p-6 rounded-lg shadow-lg w-full max-w-lg"
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