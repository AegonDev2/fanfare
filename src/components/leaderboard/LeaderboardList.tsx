import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FanOfMonthCard from "./FanOfMonthCard";
import { LeaderboardEntry } from "@/hooks/useLeaderboard";
interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  currentMonth: string;
  currentYear: number;
  onMonthYearChange: (month: string, year: number) => void;
}
const LeaderboardList = ({
  leaderboard,
  isLoading,
  currentMonth,
  currentYear,
  onMonthYearChange
}: LeaderboardListProps) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({
    length: 5
  }, (_, i) => (new Date().getFullYear() - i).toString());
  const handleFilterChange = () => {
    onMonthYearChange(selectedMonth, parseInt(selectedYear));
  };
  return <div className="space-y-6">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Filter Leaderboard</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Button onClick={handleFilterChange} className="sm:ml-auto">
            Apply Filter
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="top" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="top">Top Fans</TabsTrigger>
          <TabsTrigger value="history">Leaderboard History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="top" className="mt-6">
          {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>)}
            </div> : leaderboard.length === 0 ? <div className="text-center py-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg border">
              <h3 className="text-xl font-medium mb-2">No Fans Yet</h3>
              <p className="text-slate-50">
                No fans have sent gifts during {currentMonth} {currentYear}.
              </p>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboard.map((fan, index) => <FanOfMonthCard key={fan.fan_id} fan={fan} rank={index + 1} />)}
            </div>}
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg border p-6">
            <h3 className="text-xl font-medium mb-4">Leaderboard History</h3>
            <p>Coming soon! We'll be featuring past fans of the month here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default LeaderboardList;