import { Suspense } from "react";
import { fetchGamesPage } from "@/lib/api";
import { GameExplorer } from "@/components/GameExplorer";
import { GameGridSkeleton } from "@/components/GameGridSkeleton";
import { HeroSection } from "@/components/HeroSection";

async function GamesSection() {
  const initialData = await fetchGamesPage(1);
  return <GameExplorer initialData={initialData} />;
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection />
        <Suspense fallback={<GameGridSkeleton />}>
          <GamesSection />
        </Suspense>
      </div>
    </main>
  );
}
