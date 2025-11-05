
import React, { useState, useCallback } from 'react';
import type { AppStep, FileMap, FileChange, ChangeAction } from './types';
import FileUpload from './components/FileUpload';
import SystemPrompt from './components/SystemPrompt';
import XMLInput from './components/XMLInput';
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
      const isTextFile = (path: string) => textFileExtensions.some(ext => path.endsWith(ext));

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
      setError('Failed to process ZIP file. Please ensure it is a valid ZIP archive.');
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

  const handleXMLSubmit = useCallback((xmlString: string) => {
    setError(null);
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error(`XML Parsing Error: ${parserError.textContent}`);
      }
      
      const parsedChanges: FileChange[] = [];
      // Fix: Handle different XML structures by reassigning fileNodes if the primary query is empty.
      let fileNodes = xmlDoc.querySelectorAll('changes > change > file');
      if (fileNodes.length === 0) { // Fallback for a slightly different structure
          fileNodes = xmlDoc.querySelectorAll('changes > file');
      }


      fileNodes.forEach(node => {
        const action = node.getAttribute('action') as ChangeAction;
        const path = node.getAttribute('path');
        const description = node.querySelector('description')?.textContent?.trim() || null;
        const code = node.querySelector('code')?.textContent || null;
        
        if (!action || !path) {
          console.warn('Skipping file node with missing action or path', node);
          return;
        }

        parsedChanges.push({ action, path, reason: description, code });
      });

      // Validation
      for (const change of parsedChanges) {
        if (change.action === 'add' && originalFiles.has(change.path)) {
          throw new Error(`Validation Error: Cannot 'add' existing file: ${change.path}`);
        }
        if ((change.action === 'rewrite' || change.action === 'delete') && !originalFiles.has(change.path)) {
          throw new Error(`Validation Error: Cannot '${change.action}' non-existent file: ${change.path}`);
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
      setError(e.message || 'An unexpected error occurred while processing the XML.');
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
            Offline Coding Assistant
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            A privacy-first tool to apply AI-generated code changes locally.
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
          <XMLInput 
            isActive={currentStep === 'xml'} 
            onXMLSubmit={handleXMLSubmit}
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
            <p>&copy; {new Date().getFullYear()} Offline Coding Assistant. All processing is done in your browser.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;