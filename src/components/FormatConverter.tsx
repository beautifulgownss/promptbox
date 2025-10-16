"use client";

import { useState } from 'react';

interface FormatConverterProps {
  initialContent: string;
  onFormatConvert: (content: string) => void;
}

type FormatType = 'xml' | 'json' | 'markdown' | 'none';

interface StructuredData {
  [key: string]: string;
}

export default function FormatConverter({ initialContent, onFormatConvert }: FormatConverterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('none');
  const [convertedContent, setConvertedContent] = useState('');

  const convertToXML = (content: string): string => {
    const lines = content.split('\n').filter(line => line.trim());
    let xml = '<prompt>\n';
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed) {
        if (trimmed.includes(':')) {
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts.join(':').trim();
          xml += `  <${key.trim().toLowerCase().replace(/\s+/g, '_')}>${value}</${key.trim().toLowerCase().replace(/\s+/g, '_')}>\n`;
        } else if (trimmed.startsWith('#') || trimmed.startsWith('##')) {
          const level = trimmed.match(/^#+/)?.[0].length || 1;
          const text = trimmed.replace(/^#+\s*/, '');
          xml += `  <header level="${level}">${text}</header>\n`;
        } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const text = trimmed.replace(/^[-*]\s*/, '');
          xml += `  <list_item>${text}</list_item>\n`;
        } else {
          xml += `  <text>${trimmed}</text>\n`;
        }
      }
    });
    
    xml += '</prompt>';
    return xml;
  };

  const convertToJSON = (content: string): string => {
    const lines = content.split('\n').filter(line => line.trim());
    const structuredData: StructuredData = {};

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        structuredData[key.trim()] = value;
      }
    });

    const result = {
      prompt: content,
      structured_data: structuredData
    };

    return JSON.stringify(result, null, 2);
  };

  const convertToMarkdown = (content: string): string => {
    const lines = content.split('\n');
    let markdown = '';
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        if (inList) {
          markdown += '\n';
          inList = false;
        }
        markdown += '\n';
        return;
      }

      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        markdown += `**${key.trim()}:** ${value}\n\n`;
        inList = false;
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        if (!inList) {
          markdown += '\n';
          inList = true;
        }
        const text = trimmed.replace(/^[-*]\s*/, '');
        markdown += `- ${text}\n`;
      } else if (trimmed.length > 50) {
        markdown += `${trimmed}\n\n`;
        inList = false;
      } else {
        markdown += `### ${trimmed}\n\n`;
        inList = false;
      }
    });

    return markdown.trim();
  };

  const handleConvert = () => {
    if (!initialContent.trim() || selectedFormat === 'none') return;

    let converted = '';
    switch (selectedFormat) {
      case 'xml':
        converted = convertToXML(initialContent);
        break;
      case 'json':
        converted = convertToJSON(initialContent);
        break;
      case 'markdown':
        converted = convertToMarkdown(initialContent);
        break;
      default:
        converted = '';
    }

    setConvertedContent(converted);
  };

  const handleUseConverted = () => {
    onFormatConvert(convertedContent);
    setIsOpen(false);
    setSelectedFormat('none');
    setConvertedContent('');
  };

  const formatExamples = {
    xml: `<!-- Input -->
Create a marketing email for a new product launch

<!-- Output -->
<prompt>
  <task>Create a marketing email</task>
  <topic>new product launch</topic>
</prompt>`,

    json: `<!-- Input -->
Create a marketing email for a new product launch

<!-- Output -->
{
  "prompt": "Create a marketing email for a new product launch",
  "structured_data": {
    "task": "Create a marketing email",
    "topic": "new product launch"
  }
}`,

    markdown: `<!-- Input -->
Create a marketing email for a new product launch

<!-- Output -->
**Task:** Create a marketing email  
**Topic:** new product launch

## Requirements
- Engaging subject line
- Clear call-to-action
- Product benefits highlighting`
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl font-medium"
      >
        <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-lg">
          🔄
        </div>
        Convert Format
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Convert Prompt Format</h2>
            <p className="text-gray-600 mt-1">Transform your prompt for better AI understanding</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Target Format</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['xml', 'json', 'markdown'] as FormatType[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedFormat === format
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                      selectedFormat === format ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {format === 'xml' && '📄'}
                      {format === 'json' && '🔷'}
                      {format === 'markdown' && '📝'}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {format.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {format === 'xml' && 'Structured data with tags'}
                    {format === 'json' && 'Key-value pairs for APIs'}
                    {format === 'markdown' && 'Rich text with formatting'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Original Prompt</h4>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-48 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {initialContent || 'No content to convert...'}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Converted Output
                {selectedFormat !== 'none' && (
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full ml-2">
                    {selectedFormat.toUpperCase()}
                  </span>
                )}
              </h4>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700 h-48 overflow-y-auto">
                <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono">
                  {convertedContent || 'Select a format and convert to see output...'}
                </pre>
              </div>
            </div>
          </div>

          {selectedFormat !== 'none' && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Format Example</h4>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
                  {formatExamples[selectedFormat]}
                </pre>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedFormat('none');
                setConvertedContent('');
              }}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConvert}
              disabled={!initialContent.trim() || selectedFormat === 'none'}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Convert
            </button>
            <button
              onClick={handleUseConverted}
              disabled={!convertedContent}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Use Converted
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
