import PromptList from '@/components/PromptList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">PromptBox</h1>
        <p className="text-gray-600 mb-8">Organize, test, and improve your AI prompts</p>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Your Prompt Library</h2>
          <PromptList />
        </div>
      </div>
    </div>
  );
}
