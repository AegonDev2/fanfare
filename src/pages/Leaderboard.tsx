
import { useEffect } from "react";
import Header from "@/components/landing/Header";
import LeaderboardHeader from "@/components/leaderboard/LeaderboardHeader";
import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Separator } from "@/components/ui/separator";

const Leaderboard = () => {
  const {
    leaderboard,
    isLoading,
    fetchLeaderboard,
    currentMonth,
    currentYear
  } = useLeaderboard();

  useEffect(() => {
    document.title = `Fan of the Month | FanFare`;
  }, []);

  const handleMonthYearChange = (month: string, year: number) => {
    fetchLeaderboard(month, year);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <Header />
      <div className="container mx-auto pt-28 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <LeaderboardHeader month={currentMonth} year={currentYear} />
          
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-3 text-center sm:text-left">
                Top Fans Leaderboard
              </h2>
              <Separator className="mb-6" />
              <LeaderboardList
                leaderboard={leaderboard}
                isLoading={isLoading}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onMonthYearChange={handleMonthYearChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
