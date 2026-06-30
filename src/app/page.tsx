import WordleGame from '@/components/WordleGame';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <WordleGame />
      </div>
    </main>
  );
}
