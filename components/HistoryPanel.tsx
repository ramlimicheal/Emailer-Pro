import React from 'react';
import type { HistoryItem } from '../types';
import SlideOver from './SlideOver';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoadHistory }) => {
  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="History">
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No history yet.</p>
        ) : (
          history.map(item => (
            <div 
              key={item.id} 
              className="card p-4 text-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-500"
              onClick={() => onLoadHistory(item)}
            >
              <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{item.strategy.replace(/_/g, ' ')}</div>
              <p className="text-gray-700 dark:text-gray-300 truncate mb-2">{item.response}</p>
              <div className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </SlideOver>
  );
};

export default HistoryPanel;
