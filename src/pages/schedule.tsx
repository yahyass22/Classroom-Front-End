import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { CalendarDays } from "lucide-react";

const SchedulePage = () => {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          <p className="text-sm text-muted-foreground">Weekly timetable for all classes</p>
        </div>
      </div>

      <ScheduleTable />
    </div>
  );
};

export default SchedulePage;
