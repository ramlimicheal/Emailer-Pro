import React from 'react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SlideOver: React.FC<SlideOverProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      <div 
        className={`overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />
      <div className={`slide-over ${isOpen ? 'open' : ''}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="btn-ghost rounded-full p-2">
              <i data-lucide="x" className="w-5 h-5"></i>
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default SlideOver;
