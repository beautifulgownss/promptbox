'use client';

import { FormEvent, useEffect, useState } from 'react';

type AbTestMetrics = {
  latencyA: number;
  latencyB: number;
  winner: string;
};

type AbTestResult = {
  responseA: string;
  responseB: string;
  metrics: AbTestMetrics;
};

const PROMPT_OPTIONS = [
  { id: 'prompt-creative', label: 'Creative Brainstorm' },
  { id: 'prompt-precise', label: 'Precise Answer' },
  { id: 'prompt-friendly', label: 'Friendly Assistant' },
  { id: 'prompt-analyst', label: 'Analytical Summary' },
];

export default function AbTestPage() {
  const [inputText, setInputText] = useState('');
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AbTestResult | null>(null);

  useEffect(() => {
    if (!variantA && PROMPT_OPTIONS.length > 0) {
      setVariantA(PROMPT_OPTIONS[0].id);
    }
    if (!variantB && PROMPT_OPTIONS.length > 0) {
      const fallbackIndex = PROMPT_OPTIONS.length > 1 ? 1 : 0;
      setVariantB(PROMPT_OPTIONS[fallbackIndex].id);
    }
  }, [variantA, variantB]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputText.trim()) {
      setError('Enter input text to run the test.');
      return;
    }

    if (!variantA || !variantB) {
      setError('Select both Prompt A and Prompt B.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/abtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputText,
          variantA_id: variantA,
          variantB_id: variantB,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: AbTestResult = await response.json();
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to run A/B test right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12 lg:px-12">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-indigo-400">PromptBox Labs</p>
          <h1 className="text-4xl font-semibold text-slate-50 md:text-5xl">Prompt A/B Testing</h1>
          <p className="max-w-3xl text-slate-400">
            Compare two prompts side-by-side with the same input to see which variant performs
            better. Configure your prompts, run the test, and review metrics instantly.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/20 backdrop-blur">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="test-input">
                  Test Input
                </label>
                <textarea
                  id="test-input"
                  name="test-input"
                  className="h-36 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Paste or type the text you want to test against both prompts..."
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  spellCheck={false}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="variant-a">
                    Prompt A
                  </label>
                  <select
                    id="variant-a"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    value={variantA}
                    onChange={(event) => setVariantA(event.target.value)}
                  >
                    {PROMPT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="variant-b">
                    Prompt B
                  </label>
                  <select
                    id="variant-b"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    value={variantB}
                    onChange={(event) => setVariantB(event.target.value)}
                  >
                    {PROMPT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:bg-indigo-500/40"
                disabled={isLoading}
              >
                {isLoading ? 'Running test...' : 'Run A/B Test'}
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/20 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-100">Responses</h2>
              <p className="text-sm text-slate-500">Review the generated outputs from each prompt variant.</p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                      Variant A
                    </span>
                    {result?.metrics.winner === 'A' ? (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-300">
                        Winner
                      </span>
                    ) : null}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-slate-200">
                    {result ? result.responseA : 'Run the test to see Prompt A response.'}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                      Variant B
                    </span>
                    {result?.metrics.winner === 'B' ? (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                        Winner
                      </span>
                    ) : null}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-slate-200">
                    {result ? result.responseB : 'Run the test to see Prompt B response.'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/20 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-100">Metrics</h2>
              <p className="text-sm text-slate-500">
                Track latency for each variant and identify which prompt is currently winning.
              </p>

              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <dt className="text-xs uppercase tracking-widest text-slate-500">Latency A</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">
                    {result ? `${result.metrics.latencyA}ms` : '—'}
                  </dd>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <dt className="text-xs uppercase tracking-widest text-slate-500">Latency B</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">
                    {result ? `${result.metrics.latencyB}ms` : '—'}
                  </dd>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <dt className="text-xs uppercase tracking-widest text-slate-500">Winner</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">
                    {result ? result.metrics.winner : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
