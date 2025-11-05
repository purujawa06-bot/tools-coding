
import React, { useRef, useState } from 'react';
import Card from './Card';
import { UploadIcon, CheckIcon } from './Icons';

interface FileUploadProps {
  isActive: boolean;
  onZipUpload: (file: File) => void;
  projectText: string;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ isActive, onZipUpload, projectText, isProcessing }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onZipUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/zip') {
      setFileName(file.name);
      onZipUpload(file);
    }
  };

  return (
    <Card step={1} title="Unggah ZIP Proyek" isActive={isActive}>
      <p className="text-gray-400 mb-4">
        Pilih file ZIP yang berisi kode sumber proyek Anda. Alat ini akan mengekstrak semua file berbasis teks.
      </p>
      
      <input
        type="file"
        ref={fileInputRef}
        accept=".zip,application/zip"
        onChange={handleFileChange}
        className="hidden"
        id="zip-upload"
      />

      <label
        htmlFor="zip-upload"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex justify-center items-center w-full h-32 px-4 transition bg-gray-900 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-500 focus:outline-none"
      >
        <span className="flex items-center space-x-2">
          <UploadIcon />
          <span className="font-medium text-gray-400">
            {isProcessing ? 'Memproses...' : (fileName ? fileName : 'Letakkan file di sini, atau cari')}
          </span>
        </span>
      </label>

      {projectText && !isProcessing && (
        <div className="mt-6">
           <p className="text-green-400 mb-2 flex items-center justify-center space-x-2">
            <CheckIcon />
            <span>Proyek berhasil diproses!</span>
          </p>
        </div>
      )}
    </Card>
  );
};

export default FileUpload;