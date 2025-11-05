
import React, { useState } from 'react';
import Card from './Card';
import { CopyIcon, PlayIcon, CheckIcon, DownloadIcon, BackIcon } from './Icons';

const SYSTEM_PROMPT = `Anda adalah seorang senior software engineer kelas dunia. Anda akan menerima kode sumber proyek yang digabung menjadi satu blok teks. Setiap konten file diapit oleh '---START OF [path/to/file]---' dan '---END OF [path/to/file]---'.

Tugas Anda adalah menganalisis permintaan pengguna dan memberikan perubahan kode yang diperlukan.

RESPONS ANDA HARUS DALAM FORMAT BERIKUT. JANGAN TAMBAHKAN TEKS, PENJELASAN, ATAU MARKDOWN LAINNYA.

Setiap file harus direpresentasikan dalam format ini, diulang untuk setiap file dalam proyek:

@file path/lengkap/ke/file.ext
@desc Penjelasan singkat satu kalimat tentang perubahan pada file ini.
@action add|rewrite|delete|same

// Konten kode baru untuk action 'add' atau 'rewrite' diletakkan di sini.
// Biarkan kosong setelah baris @action untuk 'delete' atau 'same'.

ACTIONS:
- add: Membuat file baru. 'path' harus baru.
- rewrite: Mengubah file yang sudah ada. Seluruh konten baru file harus disediakan.
- delete: Menghapus file yang sudah ada.
- same: File tidak berubah.

ATURAN:
- Anda harus menyertakan blok (dimulai dengan @file) untuk SETIAP file dari input asli.
- Atribut 'path' harus sama persis dengan path dari input.
- Untuk 'rewrite', sediakan SELURUH konten file, bukan hanya bagian yang berubah.
`;

interface SystemPromptProps {
  isActive: boolean;
  onContinue: () => void;
  onBack: () => void;
  projectText: string;
  onDownloadProjectTxt: () => void;
}

const SystemPrompt: React.FC<SystemPromptProps> = ({ isActive, onContinue, onBack, projectText, onDownloadProjectTxt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card step={2} title="Berikan Konteks pada AI" isActive={isActive}>
      <p className="text-gray-400 mb-4">
        1. Unduh kode proyek Anda, yang telah diformat untuk AI.
        <br/>
        2. Salin "system prompt" di bawah dan tempelkan ke dalam obrolan AI Anda.
        <br/>
        3. Unggah file <strong>project.txt</strong> yang telah diunduh ke AI.
        <br/>
        4. Tambahkan permintaan perubahan spesifik Anda (misalnya, "tambahkan tombol mode gelap").
      </p>

      {projectText && (
        <button
          onClick={onDownloadProjectTxt}
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center space-x-2 mb-4"
        >
          <DownloadIcon />
          <span>Unduh project.txt</span>
        </button>
      )}

      <div className="bg-gray-900 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
          {SYSTEM_PROMPT}
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onBack}
          className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center space-x-2"
        >
          <BackIcon />
          <span>Kembali</span>
        </button>
        <button
          onClick={handleCopy}
          className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center space-x-2"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Tersalin!' : 'Salin System Prompt'}</span>
        </button>
        <button
          onClick={onContinue}
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center space-x-2"
        >
          <PlayIcon />
          <span>Lanjut ke Langkah Berikutnya</span>
        </button>
      </div>
    </Card>
  );
};

export default SystemPrompt;