
import React, { useState } from 'react';
import Card from './Card';
import { CodeIcon, BackIcon } from './Icons';

interface AIResponseInputProps {
  isActive: boolean;
  onResponseSubmit: (xml: string) => void;
  onBack: () => void;
}

const AIResponseInput: React.FC<AIResponseInputProps> = ({ isActive, onResponseSubmit, onBack }) => {
  const [responseText, setResponseText] = useState('');

  const handleSubmit = () => {
    if (responseText.trim()) {
      onResponseSubmit(responseText);
    }
  };

  return (
    <Card step={3} title="Masukkan Respons AI" isActive={isActive}>
      <p className="text-gray-400 mb-4">
        Setelah AI menghasilkan respons, tempelkan seluruh konten teks ke dalam area di bawah ini.
      </p>

      <textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder={`@file path/to/file.ext\n@desc Deskripsi perubahan...\n@action rewrite\n\n...kode...`}
        className="w-full h-64 p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
      />
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
        <button
            onClick={onBack}
            className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center space-x-2"
        >
            <BackIcon />
            <span>Kembali</span>
        </button>
        <button
            onClick={handleSubmit}
            disabled={!responseText.trim()}
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
            <CodeIcon />
            <span>Terapkan Perubahan</span>
        </button>
      </div>
    </Card>
  );
};

export default AIResponseInput;