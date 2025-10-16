"use client";

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    console.log("Fetching prompts from backend...");
    fetch('http://localhost:8000/prompts/')
      .then(response => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then(data => {
        console.log("Prompts received:", data);
        setPrompts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading prompts...</div>;
  }

  if (prompts.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        <p>No prompts yet</p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Create Your First Prompt
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg">{prompt.title}</h3>
          <p className="text-gray-600 mt-2">{prompt.content}</p>
          <div className="flex gap-2 mt-3">
            {prompt.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
