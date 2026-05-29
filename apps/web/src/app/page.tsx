'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-green-800 mb-4">Make Your Meme</h1>
        <p className="text-xl text-green-700 mb-8">
          The ultimate multiplayer meme game! Create, share, and vote on memes with friends.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/create-lobby')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Create Lobby
          </button>
          <button
            onClick={() => router.push('/join-lobby')}
            className="px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Join Lobby
          </button>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-green-600 mb-2">1. Create or Join</h3>
              <p className="text-gray-600">Create a lobby or join an existing one with friends.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-green-600 mb-2">2. Make Memes</h3>
              <p className="text-gray-600">Receive a meme template and create the funniest caption.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-green-600 mb-2">3. Vote & Win</h3>
              <p className="text-gray-600">Vote for the best memes and earn points!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
