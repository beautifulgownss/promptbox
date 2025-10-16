"use client";

import { useState, useEffect } from 'react';
import FormatConverter from './FormatConverter';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string, tags: string[]) => void;
  initialContent?: string;
}

export default function CreatePromptModal({ isOpen, onClose, onSave, initialContent = '' }: CreatePromptModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState('');
  const [showFormatConverter, setShowFormatConverter] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags('');
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    onSave(title, content, tagsArray);
    resetForm();
    onClose();
  };

  const handleFormatConvert = (convertedContent: string) => {
    setContent(convertedContent);
    setShowFormatConverter(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create New Prompt</h2>
            <p className="text-slate-600 mt-1">Build and optimize your AI prompts</p>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Prompt Title
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Marketing Email Generator, Content Summarizer..."
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-400"
              />
            </div>

            {/* Content Input with Format Tools */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-slate-900">
                  Prompt Content
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFormatConverter(true)}
                    className="text-sm bg-slate-600 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Convert Format
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your prompt content here. Use {variable} for dynamic parts..."
                className="w-full h-48 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-400 resize-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                Use {'{variable}'} syntax for dynamic parts. Example: "Write a {topic} for {audience}"
              </p>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., marketing, email, blog (comma separated)"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-8 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-slate-700 border border-slate-300 rounded-xl hover:bg-white transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Create Prompt
          </button>
        </div>
      </div>

      {/* Format Converter Modal */}
      {showFormatConverter && (
        <FormatConverter
          initialContent={content}
          onFormatConvert={handleFormatConvert}
        />
      )}
    </div>
  );
}
