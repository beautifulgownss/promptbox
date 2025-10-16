"use client";

import { useState, useEffect, useCallback } from 'react';

interface PromptVersion {
  id: string;
  version_number: number;
  content: string;
  created_at: string;
  note?: string;
}

interface VersionHistoryProps {
  promptId: string;
  currentContent: string;
  onVersionSelect: (content: string) => void;
  onNewVersion: (content: string, note: string) => void;
}

export default function VersionHistory({ 
  promptId, 
  currentContent, 
  onVersionSelect,
  onNewVersion 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newVersionNote, setNewVersionNote] = useState('');

  const fetchVersions = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8001/prompts/${promptId}/versions`);
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  }, [promptId]);

  useEffect(() => {
    if (isOpen && promptId) {
      fetchVersions();
    }
  }, [isOpen, promptId, fetchVersions]);

  const handleSaveVersion = async () => {
    if (!newVersionNote.trim()) {
      alert('Please add a note about what changed');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/prompts/${promptId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentContent,
          note: newVersionNote
        }),
      });

      if (response.ok) {
        setNewVersionNote('');
        fetchVersions();
        onNewVersion(currentContent, newVersionNote);
      }
    } catch (error) {
      console.error('Error saving version:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Version History</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          {isOpen ? 'Hide' : 'Show'} History
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Save New Version */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Save Current Changes as New Version</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVersionNote}
                onChange={(e) => setNewVersionNote(e.target.value)}
                placeholder="What did you change? (e.g., 'Made tone more professional')"
                className="flex-1 px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleSaveVersion}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Save Version
              </button>
            </div>
          </div>

          {/* Versions List */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-medium text-gray-700">Previous Versions</h4>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {versions.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No previous versions yet
                </div>
              ) : (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="border-b last:border-b-0 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onVersionSelect(version.content)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-medium">
                          v{version.version_number}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(version.created_at)}
                        </span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Restore
                      </button>
                    </div>
                    {version.note && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Note:</strong> {version.note}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {version.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
