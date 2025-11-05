
import React, { useState, useCallback } from 'react';
import type { AppStep, FileMap, FileChange, ChangeAction } from './types';
import FileUpload from './components/FileUpload';
import SystemPrompt from './components/SystemPrompt';
import AIResponseInput from './components/AIResponseInput';
import Preview from './components/Preview';

// Allow TypeScript to recognize the JSZip and FileSaver from the CDN
declare var JSZip: any;
declare var saveAs: any;

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [originalFiles, setOriginalFiles] = useState<FileMap>(new Map());
  const [projectText, setProjectText] = useState<string>('');
  const [changes, setChanges] = useState<FileChange[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileMap>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setCurrentStep('upload');
    setOriginalFiles(new Map());
    setProjectText('');
    setChanges([]);
    setProcessedFiles(new Map());
    setError(null);
    setIsProcessing(false);
  };
  
  const handleZipUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const zip = await JSZip.loadAsync(file);
      const filesMap: FileMap = new Map();
      let textOutput = '';
      
      const textFileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.txt', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.php', '.rb', '.yml', '.yaml', '.toml', '.xml', 'Dockerfile', '.env'];
      const isTextFile = (path: string) => textFileExtensions.some(ext => path.endsWith(ext) || path.includes('.'));

      for (const path in zip.files) {
        if (!zip.files[path].dir && isTextFile(path)) {
          const content = await zip.files[path].async('string');
          filesMap.set(path, content);
          textOutput += `---START OF ${path}---\n${content}\n---END OF ${path}---\n\n`;
        }
      }
      setOriginalFiles(filesMap);
      setProjectText(textOutput);
      setCurrentStep('prompt');
    } catch (e) {
      setError('Gagal memproses file ZIP. Pastikan file tersebut adalah arsip ZIP yang valid.');
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownloadProjectTxt = useCallback(() => {
    if (!projectText) return;
    const blob = new Blob([projectText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'project.txt');
  }, [projectText]);

  const handleAIResponseSubmit = useCallback((responseText: string) => {
    setError(null);
    try {
      const parsedChanges: FileChange[] = [];
      const fileBlocks = responseText.trim().split('@file').filter(block => block.trim() !== '');

      for (const block of fileBlocks) {
        const lines = block.trim().split('\n');
        const path = lines.shift()?.trim();
        if (!path) continue;

        let action: ChangeAction | undefined;
        let reason: string | null = null;
        let codeLines: string[] = [];
        
        let foundAction = false;
        for(const line of lines) {
            if (line.startsWith('@desc')) {
                reason = line.substring('@desc'.length).trim();
            } else if (line.startsWith('@action')) {
                action = line.substring('@action'.length).trim() as ChangeAction;
                foundAction = true;
            } else if (foundAction) {
                codeLines.push(line);
            }
        }
        
        if (!action) {
          console.warn('Melewatkan blok tanpa @action untuk file:', path);
          continue;
        }

        const code = (action === 'add' || action === 'rewrite') ? codeLines.join('\n') : null;
        parsedChanges.push({ action, path, reason, code });
      }

      // Validation
      for (const change of parsedChanges) {
        if (change.action === 'add' && originalFiles.has(change.path)) {
          throw new Error(`Kesalahan Validasi: Tidak dapat 'menambah' file yang sudah ada: ${change.path}`);
        }
        if ((change.action === 'rewrite' || change.action === 'delete') && !originalFiles.has(change.path)) {
          throw new Error(`Kesalahan Validasi: Tidak dapat '${change.action}' file yang tidak ada: ${change.path}`);
        }
      }
      
      setChanges(parsedChanges);
      
      // Apply changes
      const newFiles: FileMap = new Map(originalFiles);
      parsedChanges.forEach(change => {
        switch (change.action) {
          case 'add':
          case 'rewrite':
            if (change.code !== null) {
              newFiles.set(change.path, change.code);
            }
            break;
          case 'delete':
            newFiles.delete(change.path);
            break;
          case 'same':
            // No action needed
            break;
        }
      });
      setProcessedFiles(newFiles);
      setCurrentStep('preview');

    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan tak terduga saat memproses respons.');
      console.error(e);
    }
  }, [originalFiles]);

  const handleDownloadZip = useCallback(() => {
    const zip = new JSZip();
    for (const [path, content] of processedFiles.entries()) {
      zip.file(path, content);
    }
    zip.generateAsync({ type: 'blob' }).then((blob: any) => {
      saveAs(blob, 'project_updated.zip');
    });
  }, [processedFiles]);
  
  return (
    <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Asisten Coding Offline
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Alat yang mengutamakan privasi untuk menerapkan perubahan kode dari AI secara lokal.
          </p>
        </header>
        
        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <span className="text-2xl">&times;</span>
                </button>
            </div>
        )}

        <main className="space-y-8">
          <FileUpload 
            isActive={currentStep === 'upload'} 
            onZipUpload={handleZipUpload}
            projectText={projectText}
            isProcessing={isProcessing}
          />
          <SystemPrompt 
            isActive={currentStep === 'prompt'} 
            onContinue={() => setCurrentStep('xml')}
            onBack={() => setCurrentStep('upload')}
            projectText={projectText}
            onDownloadProjectTxt={handleDownloadProjectTxt}
          />
          <AIResponseInput 
            isActive={currentStep === 'xml'} 
            onResponseSubmit={handleAIResponseSubmit}
            onBack={() => setCurrentStep('prompt')}
          />
          <Preview 
            isActive={currentStep === 'preview'} 
            changes={changes}
            onDownloadZip={handleDownloadZip}
            onStartOver={resetState}
            onBack={() => setCurrentStep('xml')}
          />
        </main>
        <footer className="text-center mt-12 text-gray-500">
            <p>&copy; {new Date().getFullYear()} Asisten Coding Offline. Semua pemrosesan dilakukan di browser Anda.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;