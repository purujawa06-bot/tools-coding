
# Blueprint & Pseudocode: Website React Offline Coding Assistant

## Blueprint

### Struktur Aplikasi
```
App/
├── components/
│   ├── FileUpload/
│   ├── SystemPrompt/
│   ├── XMLInput/
│   └── Preview/
├── utils/
│   ├── zipProcessor.js
│   ├── xmlParser.js
│   └── fileGenerator.js
└── hooks/
    ├── useFileProcessing.js
    └── useXMLProcessing.js
```

### Flow Aplikasi
1. **Upload ZIP** → Ekstrak & konversi ke format text
2. **Download project.txt** → User upload ke AI
3. **Input XML** → Parse perubahan dari AI
4. **Preview & Download** → Generate ZIP baru

## Pseudocode

### 1. Komponen Utama (App.js)
```javascript
function App() {
  state: {
    currentStep: 'upload' | 'prompt' | 'xml' | 'preview',
    originalFiles: Map<path, content>,
    xmlContent: string,
    changes: Array<FileChange>,
    processedFiles: Map<path, content>
  }

  render() {
    switch currentStep:
      case 'upload': return <FileUpload onUpload={handleZipUpload} />
      case 'prompt': return <SystemPrompt onContinue={goToXMLStep} />
      case 'xml': return <XMLInput onXMLSubmit={handleXMLSubmit} />
      case 'preview': return <Preview changes={changes} onDownload={handleDownload} />
  }
}
```

### 2. Processing ZIP → Text
```pseudocode
FUNCTION processZipToText(zipFile):
  filesMap = new Map()
  textOutput = ""
  
  FOR EACH file IN zipFile:
    IF file.isTextFile():
      content = readFileContent(file)
      filesMap.set(file.path, content)
      textOutput += formatFileSection(file.path, content)
  
  RETURN { filesMap, textOutput }

FUNCTION formatFileSection(filePath, content):
  RETURN `
---START OF ${filePath}---
${content}
---END OF ${filePath}---
  `
```

### 3. System Prompt Template
```pseudocode
SYSTEM_PROMPT = `
Anda akan menerima kode proyek dalam format:
---START OF path/file---
[content]
---END OF path/file---

RESPONS ANDA HARUS DALAM FORMAT XML:

<changes>
  <file action="add|rewrite|delete|same" path="path/to/file">
    <code>
      <!-- Konten baru (jika action add/rewrite) -->
    </code>
    <reason>
      <!-- Alasan perubahan -->
    </reason>
  </file>
  <!-- File lainnya -->
</changes>

ACTION:
- add: Tambah file baru
- rewrite: Ubah file existing
- delete: Hapus file
- same: Tidak ada perubahan
`
```

### 4. Processing XML → Changes
```pseudocode
FUNCTION parseXMLChanges(xmlString, originalFiles):
  changes = []
  xmlDoc = parseXML(xmlString)
  
  FOR EACH fileNode IN xmlDoc.querySelectorAll('file'):
    action = fileNode.getAttribute('action')
    path = fileNode.getAttribute('path')
    code = fileNode.querySelector('code')?.textContent
    
    changes.push({
      action,
      path,
      code,
      reason: fileNode.querySelector('reason')?.textContent
    })
  
  RETURN validateChanges(changes, originalFiles)

FUNCTION validateChanges(changes, originalFiles):
  validated = []
  
  FOR EACH change IN changes:
    IF change.action == 'add' AND originalFiles.has(change.path):
      ERROR "Cannot add existing file"
    ELSE IF change.action == 'rewrite' AND !originalFiles.has(change.path):
      ERROR "Cannot rewrite non-existent file"
    ELSE IF change.action == 'delete' AND !originalFiles.has(change.path):
      ERROR "Cannot delete non-existent file"
    ELSE:
      validated.push(change)
  
  RETURN validated
```

### 5. Generate Preview & ZIP
```pseudocode
FUNCTION applyChanges(originalFiles, changes):
  newFiles = new Map(originalFiles)
  
  FOR EACH change IN changes:
    SWITCH change.action:
      CASE 'add':
      CASE 'rewrite':
        newFiles.set(change.path, change.code)
      CASE 'delete':
        newFiles.delete(change.path)
      CASE 'same':
        // No action
  
  RETURN newFiles

FUNCTION generateZipFromFiles(filesMap):
  zip = new JSZip()
  
  FOR EACH [path, content] IN filesMap:
    zip.file(path, content)
  
  RETURN zip.generateAsync({type: 'blob'})
```

## Teknologi yang Dibutuhkan
- **React** (UI Framework)
- **JSZip** (Processing file ZIP)
- **FileSaver.js** (Download files)
- **DOMParser** (Parse XML)
