import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useScheduleHeatmap } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Realistic class hours: 7 AM to 9 PM
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBREVS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 7;
const END_HOUR = 21;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function WeeklyScheduleDensity() {
  const { data, isLoading, error } = useScheduleHeatmap();

  const slotMap = React.useMemo(() => {
    if (!data) return new Map<string, any>();
    const map = new Map<string, any>();
    data.forEach((slot: any) => {
      const key = `${slot.day}-${slot.hour}`;
      map.set(key, slot);
    });
    return map;
  }, [data]);

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count === 1) return "bg-primary/20";
    if (count === 2) return "bg-primary/40";
    if (count === 3) return "bg-primary/60";
    return "bg-primary";
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Schedule Density</CardTitle>
          <CardDescription>Weekly class distribution</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          No schedule data available
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d: any) => d.count));

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Schedule Density</CardTitle>
        <CardDescription>Weekly class distribution across time slots</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[650px]">
            {/* Day Headers */}
            <div className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-border/50">
              <div className="py-2 px-2" />
              {DAYS.map((day, idx) => (
                <div 
                  key={day} 
                  className="text-[10px] font-medium text-center text-muted-foreground uppercase tracking-wide py-2 border-l border-border/30 first:border-l-0"
                >
                  {DAY_ABBREVS[idx]}
                </div>
              ))}
            </div>

            {/* Hour Rows */}
            <div className="divide-y divide-border/30">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-[40px_repeat(7,1fr)]">
                  {/* Time Label */}
                  <div className="text-[9px] text-muted-foreground font-medium flex items-center justify-center pr-1 border-r border-border/30">
                    {hour < 12 ? `${hour} AM` : hour === 12 ? `12 PM` : `${hour - 12} PM`}
                  </div>
                  
                  {/* Day Cells */}
                  {DAYS.map((day) => {
                    const key = `${day}-${hour}`;
                    const slot = slotMap.get(key);
                    const count = slot?.count || 0;
                    
                    return (
                      <TooltipProvider key={key}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div
                              className={`
                                h-6 m-0.5 rounded transition-colors
                                ${getIntensity(count)}
                                ${count > 0 ? 'cursor-default' : ''}
                              `}
                            />
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top"
                            className="text-xs bg-popover text-popover-foreground border-border"
                          >
                            {count > 0 ? (
                              <div className="space-y-1">
                                <div className="font-semibold">{day}, {hour}:00</div>
                                <div className="text-muted-foreground">
                                  {count} {count === 1 ? 'class' : 'classes'}
                                </div>
                                {slot?.subjects?.length > 0 && (
                                  <div className="flex flex-wrap gap-0.5 mt-1">
                                    {slot.subjects.map((sub: string) => (
                                      <span 
                                        key={sub} 
                                        className="bg-primary/10 text-primary px-1 rounded text-[9px]"
                                      >
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                {day}, {hour}:00 - No classes
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
