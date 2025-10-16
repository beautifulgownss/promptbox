"use client";

import { useEffect, useState } from 'react';
import VersionHistory from './VersionHistory';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
}

export default function PromptList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        console.log('Fetching prompts from backend...');
        const response = await fetch('http://localhost:8000/prompts/');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Prompts received:', data);
        setPrompts(data);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load prompts. Make sure the backend server is running on port 8000.');
        // Set mock data for development
        setPrompts([
          {
            id: 'mock-1',
            title: 'Sample Blog Generator',
            content: 'Write a blog post about {topic} for {audience}',
            tags: ['blog', 'content'],
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const startEditing = (prompt: Prompt) => {
    setEditingPromptId(prompt.id);
    setEditedContent(prompt.content);
  };

  const cancelEditing = () => {
    setEditingPromptId(null);
    setEditedContent('');
  };

  const saveChanges = async (promptId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent
        }),
      });

      if (response.ok) {
        // Refresh the prompts list
        const updatedPrompts = await fetch('http://localhost:8000/prompts/').then(r => r.json());
        setPrompts(updatedPrompts);
        setEditingPromptId(null);
        setEditedContent('');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Error saving prompt. Check console for details.');
    }
  };

  const handleVersionSelect = (content: string) => {
    setEditedContent(content);
  };

  const handleNewVersion = (content: string, note: string) => {
    console.log('New version saved:', { content, note });
    // Refresh prompts
    fetch('http://localhost:8000/prompts/')
      .then(response => response.json())
      .then(data => setPrompts(data))
      .catch(err => console.error('Error refreshing prompts:', err));
  };

  if (loading) {
    return <div className="text-center py-8">Loading prompts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <div className="text-sm text-gray-600">
          Using demo data. Backend connection failed.
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        <p>No prompts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="border rounded-lg hover:shadow-md transition-shadow">
          {/* Prompt Header */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{prompt.title}</h3>
                <div className="flex gap-2 mt-2">
                  {prompt.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => startEditing(prompt)}
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Edit
              </button>
            </div>
          </div>
          
          {/* Prompt Content */}
          <div className="p-4">
            {editingPromptId === prompt.id ? (
              <div className="space-y-4">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your prompt content..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveChanges(prompt.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>

                {/* Version History */}
                <VersionHistory
                  promptId={prompt.id}
                  currentContent={editedContent}
                  onVersionSelect={handleVersionSelect}
                  onNewVersion={handleNewVersion}
                />
              </div>
            ) : (
              <div>
                <p className="text-gray-700 whitespace-pre-wrap">{prompt.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(prompt.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
