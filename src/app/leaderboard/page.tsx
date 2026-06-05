import { getLeaderboard } from "@/app/actions/leaderboard";
import { LeaderboardHeader } from "@/components/leaderboard/LeaderboardHeader";
import { RankingList } from "@/components/leaderboard/RankingList";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const fromGame = from === "game";
  const { rankings } = await getLeaderboard();

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-950 px-4 py-6 text-white">
      <LeaderboardHeader fromGame={fromGame} />
      <RankingList rankings={rankings} />
    </div>
  );
}
