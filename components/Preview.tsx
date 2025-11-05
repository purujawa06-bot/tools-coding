
import React from 'react';
import Card from './Card';
import type { FileChange, ChangeAction } from '../types';
import { DownloadIcon, RefreshIcon, BackIcon } from './Icons';

interface PreviewProps {
  isActive: boolean;
  changes: FileChange[];
  onDownloadZip: () => void;
  onStartOver: () => void;
  onBack: () => void;
}

const actionStyles: Record<ChangeAction, { bg: string, text: string, border: string }> = {
  add: { bg: 'bg-green-900', text: 'text-green-300', border: 'border-green-700' },
  rewrite: { bg: 'bg-yellow-900', text: 'text-yellow-300', border: 'border-yellow-700' },
  delete: { bg: 'bg-red-900', text: 'text-red-300', border: 'border-red-700' },
  same: { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700' },
};


const Preview: React.FC<PreviewProps> = ({ isActive, changes, onDownloadZip, onStartOver, onBack }) => {
  return (
    <Card step={4} title="Preview & Download" isActive={isActive}>
      <p className="text-gray-400 mb-4">
        Review the changes proposed by the AI. If they look correct, download the updated project ZIP.
      </p>

      <div className="max-h-80 overflow-y-auto bg-gray-900 rounded-lg border border-gray-700 p-2 space-y-2 mb-4">
        {changes.map((change, index) => {
          const styles = actionStyles[change.action];
          return (
            <div key={index} className={`p-3 rounded-md border ${styles.border} ${styles.bg}`}>
              <div className="flex justify-between items-center">
                <span className={`font-mono text-sm ${styles.text}`}>{change.path}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles.bg} ${styles.text}`}>{change.action.toUpperCase()}</span>
              </div>
              {change.reason && (
                <p className="text-gray-400 text-xs mt-1 italic pl-1">"{change.reason}"</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onBack}
          className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center space-x-2"
        >
          <BackIcon />
          <span>Back</span>
        </button>
        <button
          onClick={onStartOver}
          className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center space-x-2"
        >
          <RefreshIcon />
          <span>Start Over</span>
        </button>
        <button
          onClick={onDownloadZip}
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center space-x-2"
        >
          <DownloadIcon />
          <span>Download Updated ZIP</span>
        </button>
      </div>
    </Card>
  );
};

export default Preview;