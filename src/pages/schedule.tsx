import { WeeklyScheduleDensity } from "@/components/dashboard/v2/WeeklyScheduleDensity";
import { CalendarDays } from "lucide-react";

const SchedulePage = () => {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Timeline</h1>
          <p className="text-sm text-muted-foreground">High-density departmental operational view</p>
        </div>
      </div>

      <WeeklyScheduleDensity />
    </div>
  );
};

export default SchedulePage;
