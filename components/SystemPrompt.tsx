
import React, { useState } from 'react';
import Card from './Card';
import { CopyIcon, PlayIcon, CheckIcon, DownloadIcon, BackIcon } from './Icons';

const SYSTEM_PROMPT = `You are a world-class senior software engineer. You will receive a project's source code concatenated into a single text block. Each file's content is enclosed by '---START OF [path/to/file]---' and '---END OF [path/to/file]---'.

Your task is to analyze the user's request and provide the necessary code changes.

YOUR RESPONSE MUST BE IN THE FOLLOWING XML FORMAT. DO NOT ADD ANY OTHER TEXT, EXPLANATION, OR MARKDOWN.

<changes>
  <change>
    <file path="path/to/file.ext" action="add|rewrite|delete|same">
      <description>A concise, one-sentence explanation of the change to this file.</description>
      <code><![CDATA[
<!-- New content for 'add' or 'rewrite'. Leave empty for 'delete' or 'same'. -->
<!-- ENSURE ALL CODE IS WRAPPED IN CDATA -->
      ]]></code>
    </file>
    <!-- Repeat for every file in the project -->
</changes>

ACTIONS:
- add: Create a new file. The 'path' must be new.
- rewrite: Modify an existing file. The full new content must be provided.
- delete: Remove an existing file.
- same: The file is unchanged.

RULES:
- You must include a <file> tag for EVERY file from the original input.
- The 'path' attribute must exactly match the path from the input.
- The <code> content MUST be wrapped in a <![CDATA[...]]> section.
- Be precise and follow the user's instructions carefully.
- For rewrites, provide the ENTIRE file content, not just the changed parts.
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
    <Card step={2} title="Provide Context to AI" isActive={isActive}>
      <p className="text-gray-400 mb-4">
        1. Download your project's code, which has been formatted for an AI.
        <br/>
        2. Copy the system prompt below and paste it into your AI chat.
        <br/>
        3. Upload the downloaded <strong>project.txt</strong> file to the AI.
        <br/>
        4. Add your specific change request (e.g., "add a dark mode toggle").
      </p>

      {projectText && (
        <button
          onClick={onDownloadProjectTxt}
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center space-x-2 mb-4"
        >
          <DownloadIcon />
          <span>Download project.txt</span>
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
          <span>Back</span>
        </button>
        <button
          onClick={handleCopy}
          className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center space-x-2"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy System Prompt'}</span>
        </button>
        <button
          onClick={onContinue}
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center space-x-2"
        >
          <PlayIcon />
          <span>Continue to Next Step</span>
        </button>
      </div>
    </Card>
  );
};

export default SystemPrompt;