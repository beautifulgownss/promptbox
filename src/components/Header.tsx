"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PromptBox</h1>
            <p className="text-gray-600 text-sm">AI Prompt Engineering Platform</p>
          </div>
          <nav className="flex gap-6">
            <Link 
              href="/" 
              className={`font-medium ${
                pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Library
            </Link>
            <Link 
              href="/testing" 
              className={`font-medium ${
                pathname === '/testing' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Testing
            </Link>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Projects</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
