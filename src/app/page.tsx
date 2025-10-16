"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import PromptList from '@/components/PromptList';
import CreatePromptModal from '@/components/CreatePromptModal';
import TemplateSelector from '@/components/TemplateSelector';
import FormatConverter from '@/components/FormatConverter';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledContent, setPrefilledContent] = useState('');

  const handleCreatePrompt = async (title: string, content: string, tags: string[]) => {
    try {
      const response = await fetch('http://localhost:8000/prompts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          tags
        }),
      });
      
      if (response.ok) {
        console.log('Prompt created successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleTemplateSelect = (content: string) => {
    setPrefilledContent(content);
    setIsModalOpen(true);
  };

  const handleFormatConvert = (content: string) => {
    setPrefilledContent(content);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPrefilledContent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl px-6 py-3 mb-6 shadow-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">AI Prompt Manager</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-4">
            Prompt Library
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Streamline your AI workflow with professional prompt management, testing, and optimization tools.
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your Prompts</h2>
                  <p className="text-slate-600">Manage and optimize your AI prompts</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <TemplateSelector onTemplateSelect={handleTemplateSelect} />
                  <FormatConverter 
                    initialContent={prefilledContent}
                    onFormatConvert={handleFormatConvert}
                  />
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-semibold mb-4">Workspace</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Active Prompts</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Templates</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Tests Run</span>
                <span className="font-semibold">47</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8">
            <PromptList />
          </div>
        </div>
      </main>

      <CreatePromptModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleCreatePrompt}
        initialContent={prefilledContent}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-slate-900">PromptBox</span>
            </div>
            <div className="text-sm text-slate-600">
              Professional AI Prompt Management System
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
