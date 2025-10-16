"use client";

import { useState } from 'react';

interface TestResult {
  variation_name: string;
  prompt_content: string;
  llm_response: string;
  model: string;
  latency: number;
}

interface PromptTesterProps {
  promptContent: string;
}

export default function PromptTester({ promptContent }: PromptTesterProps) {
  const [variations, setVariations] = useState([
    { name: 'Version A', content: promptContent },
    { name: 'Version B', content: promptContent + " Use a creative and engaging tone." }
  ]);
  const [testInput, setTestInput] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

  const addVariation = () => {
    setVariations([
      ...variations,
      { name: `Version ${String.fromCharCode(65 + variations.length)}`, content: promptContent }
    ]);
  };

  const updateVariation = (index: number, content: string) => {
    const newVariations = [...variations];
    newVariations[index].content = content;
    setVariations(newVariations);
  };

  const removeVariation = (index: number) => {
    if (variations.length > 2) {
      setVariations(variations.filter((_, i) => i !== index));
    }
  };

  const runTest = async () => {
    if (!testInput.trim()) {
      alert('Please enter a test input');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('http://localhost:8001/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variations: variations.filter(v => v.content.trim()),
          test_input: testInput
        }),
      });
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error running test:', error);
      // Mock data for demonstration
      setResults(variations.map((variation, index) => ({
        variation_name: variation.name,
        prompt_content: variation.content,
        llm_response: `This is a mock response for "${testInput}" using ${variation.name}. In a real implementation, this would come from the AI API.`,
        model: 'gemini-pro',
        latency: 0.5 + (index * 0.1)
      })));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Input Section */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold mb-3 text-blue-900">Test Input</h3>
        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Enter the input you want to test with all prompt variations... (e.g., 'climate change for teenagers')"
          className="w-full h-20 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Variations Section */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Prompt Variations</h3>
          <button
            onClick={addVariation}
            className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Version
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {variations.map((variation, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  {variation.name}
                </label>
                {variations.length > 2 && (
                  <button
                    onClick={() => removeVariation(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={variation.content}
                onChange={(e) => updateVariation(index, e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Modify this prompt variation..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Run Test Button */}
      <button
        onClick={runTest}
        disabled={isTesting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold transition-colors"
      >
        {isTesting ? '🧪 Running A/B Test...' : '🚀 Run A/B Test'}
      </button>

      {/* Results Comparison */}
      {results.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-gray-900">Test Results Comparison</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedVariation === index 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => setSelectedVariation(index)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg text-gray-900">{result.variation_name}</h4>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{result.model}</div>
                    <div className="text-xs text-gray-400">{result.latency.toFixed(2)}s</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Prompt used:</strong>
                  </div>
                  <div className="text-sm bg-gray-100 p-2 rounded text-gray-700">
                    {result.prompt_content}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>AI Response:</strong>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                      {result.llm_response}
                    </p>
                  </div>
                </div>

                {selectedVariation === index && (
                  <div className="mt-3 text-center">
                    <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ✅ Selected as Best
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedVariation !== null && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎉 You selected {results[selectedVariation]?.variation_name} as the best version!</h4>
              <p className="text-blue-700 text-sm">
                This variation performed better for your test case. Consider saving it as your main prompt.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
