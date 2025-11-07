import React, { useState } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
  title: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, title }) => {
  const [copyText, setCopyText] = useState('复制');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyText('已复制!');
      setTimeout(() => setCopyText('复制'), 2000);
    });
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800/60 border-b border-gray-700">
        <div className="flex items-center">
            <h4 className="font-semibold text-cyan-400 mr-2">{title}</h4>
            <span className="text-xs font-mono bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold py-1 px-3 rounded-md transition-colors"
        >
          {copyText}
        </button>
      </div>
      <pre className="p-4 text-xs text-gray-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;