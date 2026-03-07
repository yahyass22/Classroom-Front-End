import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleHeatmap } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formatHour = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
};

const getColorClass = (count: number): string => {
  if (count === 0) return "bg-muted/30";
  if (count <= 2) return "bg-primary/20";
  if (count <= 4) return "bg-primary/40";
  if (count <= 6) return "bg-primary/60";
  if (count <= 8) return "bg-primary/80";
  return "bg-primary";
};

export const ClassScheduleHeatmap = () => {
  const { data: heatmapData, isLoading, error } = useScheduleHeatmap();

  // Create a map of day-hour to count
  const scheduleMap = new Map<string, number>();
  heatmapData?.forEach((d) => {
    const key = `${d.day}-${d.hour}`;
    scheduleMap.set(key, d.count);
  });

  const maxCount = Math.max(...(heatmapData?.map((d) => d.count) || [0]), 1);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Class Schedule Heatmap</CardTitle>
        <CardDescription>Busiest class times throughout the week</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-destructive">
            <p>Failed to load data</p>
          </div>
        ) : !heatmapData || heatmapData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No schedule data available. Add schedules to classes to see the heatmap.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex mb-2">
                <div className="w-24 flex-shrink-0" />
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="flex-1 text-xs text-muted-foreground text-center"
                  >
                    {formatHour(hour)}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              {DAYS.map((day) => (
                <div key={day} className="flex mb-1 items-center">
                  <div className="w-24 flex-shrink-0 text-xs font-medium text-muted-foreground truncate pr-2">
                    {day}
                  </div>
                  {HOURS.map((hour) => {
                    const key = `${day}-${hour}`;
                    const count = scheduleMap.get(key) || 0;
                    return (
                      <div
                        key={key}
                        className={`flex-1 h-8 mx-0.5 rounded ${getColorClass(count)} flex items-center justify-center group relative cursor-pointer transition-colors hover:opacity-80`}
                        title={count > 0 ? `${count} classes at ${formatHour(hour)} on ${day}` : `No classes`}
                      >
                        {count > 0 && (
                          <span className="text-xs font-medium text-primary-foreground">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-muted/30" />
                  <div className="w-4 h-4 rounded bg-primary/20" />
                  <div className="w-4 h-4 rounded bg-primary/40" />
                  <div className="w-4 h-4 rounded bg-primary/60" />
                  <div className="w-4 h-4 rounded bg-primary/80" />
                  <div className="w-4 h-4 rounded bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
