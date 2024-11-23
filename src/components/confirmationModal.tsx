import React from 'react';
import Button from './button';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  isOkOnly?: boolean;
  onConfirm: () => void;
  onCancel: () => void | undefined;
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
      <Button type='button' onClick={onConfirm}      >
        Confirm
      </Button>
    </div>
  } else {
    buttons = <div className="flex justify-end space-x-4">
      <Button onClick={onCancel} type='button' textColor='text-red'>
        Cancel
      </Button>
      <Button onClick={onConfirm} type={'button'}      >
        Confirm
      </Button>
    </div>
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-cursedBlack  p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">{message}</h2>
        {buttons}
      </div>
    </div>
  );
};

export default ConfirmationModal;