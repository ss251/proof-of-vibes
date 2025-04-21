"use client";

import dynamic from "next/dynamic";
import { Header } from "~/components/ui/Header";

// Note: dynamic import is required for components that use the Frame SDK
const FarcasterFeed = dynamic(() => import("~/components/FarcasterFeed"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-900 rounded-lg p-4 md:p-6 flex items-center justify-center" style={{ minHeight: "400px" }}>
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#B69BC7] border-r-transparent"></div>
    </div>
  ),
});

export default function App() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <section className="mb-10">
          
          <p className="text-xl text-gray-400 mb-8">
            First vibes to earn platform powered by the world&apos;s best tastemakers
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <FarcasterFeed />
            </div>
            
            
          </div>
        </section>
      </div>
    </main>
  );
}
