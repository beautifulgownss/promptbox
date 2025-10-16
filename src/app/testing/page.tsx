"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import PromptTester from '@/components/PromptTester';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
}

export default function TestingPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/prompts/')
      .then(response => response.json())
      .then(data => {
        setPrompts(data);
        if (data.length > 0) {
          setSelectedPrompt(data[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching prompts:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="text-center py-8">Loading prompts...</div>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="text-center py-8">
            <p className="text-gray-500">No prompts found.</p>
            <Link 
              href="/" 
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Prompt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt Testing</h1>
          <p className="text-gray-600">A/B test your prompt variations with different inputs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prompt Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Select a Prompt</h2>
              <div className="space-y-3">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedPrompt?.id === prompt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-semibold">{prompt.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">{prompt.content}</p>
                    <div className="flex gap-1 mt-2">
                      {prompt.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Testing Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {selectedPrompt ? (
                <>
                  <h2 className="text-xl font-semibold mb-2">Testing: {selectedPrompt.title}</h2>
                  <p className="text-gray-600 mb-6">{selectedPrompt.content}</p>
                  <PromptTester 
                    promptContent={selectedPrompt.content}
                  />
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a prompt to start testing
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
