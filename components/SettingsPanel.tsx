import React from 'react';
import SlideOver from './SlideOver';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">API Configuration</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            The Gemini API key is configured securely via environment variables on the server. There is no need to enter a key here.
          </p>
        </div>
        <div>
          <label htmlFor="responseLengthSelect" className="block text-sm font-medium mb-2">Response Length (Coming Soon)</label>
          <select id="responseLengthSelect" className="input" disabled>
            <option value="short">Short (50-100 words)</option>
            <option value="medium" selected>Medium (100-200 words)</option>
            <option value="long">Long (200-300 words)</option>
          </select>
        </div>
        <div>
          <label htmlFor="toneSelect" className="block text-sm font-medium mb-2">Tone Preference (Coming Soon)</label>
          <select id="toneSelect" className="input" disabled>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>
      </div>
    </SlideOver>
  );
};

export default SettingsPanel;
