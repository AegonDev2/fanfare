
import { useEffect, useState } from "react";
import LeaderboardHeader from "@/components/leaderboard/LeaderboardHeader";
import LeaderboardShowcase from "@/components/leaderboard/LeaderboardShowcase";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import FloatingHeader from '@/components/ui/floating-header';
import Navbar from '@/components/navigation/Navbar';

const Leaderboard = () => {
  const [navOpen, setNavOpen] = useState(false);
  const {
    leaderboard,
    isLoading,
    currentMonth,
    currentYear
  } = useLeaderboard();

  useEffect(() => {
    document.title = `Fan of the Month | FanFare`;
  }, []);

  const handleMonthYearChange = (month: string, year: number) => {
    // The new hook will automatically refetch when we create a new instance with different params
    // For now, we'll keep the same pattern but create a new hook instance
    window.location.reload(); // Temporary solution - in production you'd handle this better
  };

  return (
    <>
      <FloatingHeader setNavOpen={setNavOpen} />
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} />
      <div className="min-h-screen w-full bg-gradient-to-br from-funky-purple via-funky-pink to-funky-blue pt-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-funky-yellow rounded-full animate-bounce-subtle"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-funky-green rounded-full animate-float"></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-funky-orange rounded-full animate-pulse-glow"></div>
          <div className="absolute bottom-20 right-10 w-28 h-28 bg-funky-pink rounded-full animate-rotate-slow"></div>
        </div>

        <div className="container mx-auto py-6 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <LeaderboardHeader month={currentMonth} year={currentYear} />
            
            <LeaderboardShowcase 
              leaderboard={leaderboard} 
              isLoading={isLoading} 
              currentMonth={currentMonth} 
              currentYear={currentYear} 
              onMonthYearChange={handleMonthYearChange} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
