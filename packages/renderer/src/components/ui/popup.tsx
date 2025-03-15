import React from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Popup({ isOpen, onClose, children }: PopupProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-background/50 flex items-center justify-center z-1000"
      onClick={handleOverlayClick}
    >
      <div className="bg-card rounded-lg shadow-lg shadow-black/80 p-4 max-w-md z-1001">
        {children}
      </div>
    </div>
  );
}

export default Popup;
