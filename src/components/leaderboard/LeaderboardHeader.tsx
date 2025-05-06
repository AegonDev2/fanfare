
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardHeaderProps {
  month: string;
  year: number;
}

const LeaderboardHeader = ({ month, year }: LeaderboardHeaderProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
          Fan of the Month
        </CardTitle>
        <CardDescription className="text-center text-lg">
          {month} {year}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pb-6">
        <p>
          Recognizing our most dedicated fans who send the most gifts to their favorite influencers!
        </p>
      </CardContent>
    </Card>
  );
};

export default LeaderboardHeader;
