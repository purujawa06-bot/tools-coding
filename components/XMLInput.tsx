
import React, { useState } from 'react';
import Card from './Card';
import { CodeIcon, BackIcon } from './Icons';

interface XMLInputProps {
  isActive: boolean;
  onXMLSubmit: (xml: string) => void;
  onBack: () => void;
}

const XMLInput: React.FC<XMLInputProps> = ({ isActive, onXMLSubmit, onBack }) => {
  const [xmlContent, setXmlContent] = useState('');

  const handleSubmit = () => {
    if (xmlContent.trim()) {
      onXMLSubmit(xmlContent);
    }
  };

  return (
    <Card step={3} title="Input AI Response" isActive={isActive}>
      <p className="text-gray-400 mb-4">
        After the AI generates the response, paste the entire XML content into the text area below.
      </p>

      <textarea
        value={xmlContent}
        onChange={(e) => setXmlContent(e.target.value)}
        placeholder="<changes>...</changes>"
        className="w-full h-64 p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
      />
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
        <button
            onClick={onBack}
            className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center space-x-2"
        >
            <BackIcon />
            <span>Back</span>
        </button>
        <button
            onClick={handleSubmit}
            disabled={!xmlContent.trim()}
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
            <CodeIcon />
            <span>Apply Changes</span>
        </button>
      </div>
    </Card>
  );
};

export default XMLInput;