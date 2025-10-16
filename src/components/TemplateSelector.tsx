"use client";

import { useState } from 'react';

interface TemplateSelectorProps {
  onTemplateSelect: (content: string) => void;
}

export default function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  console.log('TemplateSelector rendered - isOpen:', isOpen);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl font-medium"
      >
        <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-lg">
          🎨
        </div>
        Use Template
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Template Selector - WORKING!</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <p>Template selector is working! Click the button below to insert a test template.</p>
          <button
            onClick={() => {
              onTemplateSelect("This is a test template content!");
              setIsOpen(false);
            }}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Insert Test Template
          </button>
        </div>
      </div>
    </div>
  );
}
