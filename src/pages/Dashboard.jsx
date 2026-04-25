import { useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BookOpen, Target, Flame, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import MasteryChart from "@/components/dashboard/MasteryChart";
import RecentWords from "@/components/dashboard/RecentWords";
import DailyGoal from "@/components/dashboard/DailyGoal";
import PullToRefreshWrapper from "@/components/common/PullToRefreshWrapper";
import WelcomeNameDialog from "@/components/common/WelcomeNameDialog";
import { useGreetingName } from "@/hooks/useGreetingName";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: words = [], isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Vocabulary.filter({ created_by: user.email }, "-created_date", 500);
    },
  });
  const { greetingName, isLoading: nameLoading, saveName } = useGreetingName();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] });

  const totalWords = words.length;
  const mastered = words.filter(w => (w.mastery || 0) >= 80).length;
  const practiced = words.filter(w => (w.times_practiced || 0) > 0).length;
  const avgMastery = totalWords > 0 ? Math.round(words.reduce((s, w) => s + (w.mastery || 0), 0) / totalWords) : 0;

  if (isLoading || nameLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
    <WelcomeNameDialog open={!nameLoading && !greetingName} onSave={saveName} />
    <PullToRefreshWrapper onRefresh={handleRefresh}>
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-20 md:pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {greetingName ? `${greeting}, ${greetingName}! 🙏` : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track your Hindi learning journey</p>
        </div>
        <Link to="/practice">
          <Button className="gap-2 shadow-md">
            <Flame className="w-4 h-4" /> Start Practice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Words" value={totalWords} icon={BookOpen} color="bg-primary/10 text-primary" />
        <StatCard title="Mastered" value={mastered} subtitle={totalWords > 0 ? `${Math.round(mastered / totalWords * 100)}%` : "—"} icon={Target} color="bg-accent/10 text-accent" />
        <StatCard title="Practiced" value={practiced} icon={Flame} color="bg-chart-5/10 text-chart-5" />
        <StatCard title="Avg Mastery" value={`${avgMastery}%`} icon={TrendingUp} color="bg-chart-4/10 text-chart-4" />
      </div>

      <div className="mb-6">
        <DailyGoal words={words} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <MasteryChart words={words} />
        <RecentWords words={words} />
      </div>
    </div>
    </PullToRefreshWrapper>
    </>
  );
}