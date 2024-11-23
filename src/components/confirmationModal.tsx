import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  isOkOnly?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  isOkOnly
}) => {
  if (!isOpen) return null;

  let buttons

  if (isOkOnly) {
    buttons = <div className="flex justify-end space-x-4">
      <button
        onClick={onConfirm}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Confirm
      </button>
    </div>
  } else {
    buttons = <div className="flex justify-end space-x-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Confirm
      </button>
    </div>
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-black p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">{message}</h2>
        {buttons}
      </div>
    </div>
  );
};

export default ConfirmationModal;