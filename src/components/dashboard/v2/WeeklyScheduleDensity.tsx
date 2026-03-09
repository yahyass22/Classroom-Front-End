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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBREVS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 80;

interface RoutineItem {
  classId: number;
  className: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  teacherImage: string | null;
  day: string;
  startTime: string; // "08:00"
  endTime: string;   // "09:30"
}

interface DepartmentGroup {
  departmentName: string;
  departmentCode: string;
  color: string;
  classes: RoutineItem[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  startMins: number;
  endMins: number;
  classes: RoutineItem[];
}

/**
 * Groups classes by department for better organization
 */
function groupClassesByDepartment(events: RoutineItem[]): DepartmentGroup[] {
  const getDepartmentFromCode = (code: string): { name: string; code: string; color: string } => {
    const prefix = code.replace(/[0-9]/g, '');
    const deptMap: Record<string, { name: string; code: string; color: string }> = {
      CS: { name: 'Computer Science', code: 'CS', color: 'blue' },
      MATH: { name: 'Mathematics', code: 'MATH', color: 'purple' },
      PHYS: { name: 'Physics', code: 'PHYS', color: 'amber' },
      CHEM: { name: 'Chemistry', code: 'CHEM', color: 'emerald' },
      ENG: { name: 'English', code: 'ENG', color: 'rose' },
      BIO: { name: 'Biology', code: 'BIO', color: 'green' },
      HIST: { name: 'History', code: 'HIST', color: 'orange' },
      PSY: { name: 'Psychology', code: 'PSY', color: 'pink' },
      ECON: { name: 'Economics', code: 'ECON', color: 'teal' },
      BUS: { name: 'Business', code: 'BUS', color: 'indigo' },
    };
    return deptMap[prefix] || { name: prefix, code: prefix, color: 'slate' };
  };

  if (events.length === 0) return [];

  // Group by department
  const deptMap = new Map<string, DepartmentGroup>();

  events.forEach((event) => {
    const dept = getDepartmentFromCode(event.subjectCode);
    const key = dept.code;

    if (!deptMap.has(key)) {
      deptMap.set(key, {
        departmentName: dept.name,
        departmentCode: dept.code,
        color: dept.color,
        classes: [],
      });
    }

    deptMap.get(key)!.classes.push(event);
  });

  // Convert to array and sort by department name
  const groups = Array.from(deptMap.values());
  groups.sort((a, b) => a.departmentName.localeCompare(b.departmentName));

  // Sort classes within each department by start time
  groups.forEach((group) => {
    group.classes.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number).reduce((acc, val) => acc * 60 + val, 0);
      const timeB = b.startTime.split(':').map(Number).reduce((acc, val) => acc * 60 + val, 0);
      return timeA - timeB;
    });
  });

  return groups;
}

export function WeeklyScheduleDensity() {
  const { data, isLoading, error } = useScheduleHeatmap();

  const routineData = Array.isArray(data) ? (data as RoutineItem[]) : [];

  const subjectColors: Record<string, string> = {
    CS: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
    MATH: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
    PHYS: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
    CHEM: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
    ENG: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800",
    BIO: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
    HIST: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800",
    PSY: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800",
    ECON: "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800",
    BUS: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800",
    DEFAULT: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800",
  };

  const getSubjectStyle = (code: string) => {
    const prefix = code.replace(/[0-9]/g, '');
    return subjectColors[prefix] || subjectColors.DEFAULT;
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-xl bg-card/30 backdrop-blur-md">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-card/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full" />
            Weekly Schedule
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium mt-1">
            {routineData.length} scheduled session{routineData.length !== 1 ? 's' : ''} across the week
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {DAY_ABBREVS.map(d => (
            <div key={d} className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="relative overflow-x-auto rounded-3xl border border-primary/10 bg-background/40">
          <div className="min-w-[1000px] flex">
            {/* Time Axis */}
            <div className="w-20 shrink-0 border-r border-primary/20 bg-muted/10">
              <div className="h-12 border-b border-primary/20" />
              {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start justify-center pt-2 text-[10px] font-black text-muted-foreground/60 uppercase border-b border-primary/10"
                  style={{ height: HOUR_HEIGHT }}
                >
                  {START_HOUR + i}:00
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1 grid grid-cols-7">
              {DAYS.map((day, dayIdx) => {
                // Group classes by department for this day
                const dayEvents = routineData.filter((item) => item.day === day);
                const deptGroups = groupClassesByDepartment(dayEvents);

                return (
                  <div key={day} className="relative border-r border-primary/20 last:border-r-0">
                    <div className="h-12 flex items-center justify-center border-b border-primary/20 bg-primary/[0.02]">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70">
                        {DAY_ABBREVS[dayIdx]}
                      </span>
                    </div>

                    {/* Hour grid lines */}
                    {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-full border-b border-primary/10"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {/* Department Sections */}
                    <div className="relative space-y-2 p-2">
                      {deptGroups.map((dept, deptIdx) => (
                        <div key={deptIdx} className="space-y-1">
                          {/* Department Header */}
                          <div className={cn(
                            "px-2 py-1 rounded-md mb-1.5",
                            dept.color === 'blue' && "bg-blue-500/10 border-blue-200/30",
                            dept.color === 'purple' && "bg-purple-500/10 border-purple-200/30",
                            dept.color === 'amber' && "bg-amber-500/10 border-amber-200/30",
                            dept.color === 'emerald' && "bg-emerald-500/10 border-emerald-200/30",
                            dept.color === 'rose' && "bg-rose-500/10 border-rose-200/30",
                            dept.color === 'green' && "bg-green-500/10 border-green-200/30",
                            dept.color === 'orange' && "bg-orange-500/10 border-orange-200/30",
                            dept.color === 'pink' && "bg-pink-500/10 border-pink-200/30",
                            dept.color === 'teal' && "bg-teal-500/10 border-teal-200/30",
                            dept.color === 'indigo' && "bg-indigo-500/10 border-indigo-200/30",
                            dept.color === 'slate' && "bg-slate-500/10 border-slate-200/30",
                            "border"
                          )}>
                            <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">
                              {dept.departmentCode}
                            </span>
                          </div>

                          {/* Class Cards for this department */}
                          <div className="space-y-1.5">
                            {dept.classes.map((cls, clsIdx) => {
                              const startMins = parseInt(cls.startTime.split(':')[0]) * 60 + parseInt(cls.startTime.split(':')[1]);
                              const endMins = parseInt(cls.endTime.split(':')[0]) * 60 + parseInt(cls.endTime.split(':')[1]);
                              const topPosition = ((startMins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                              const duration = ((endMins - startMins) / 60) * HOUR_HEIGHT;

                              return (
                                <div
                                  key={clsIdx}
                                  className="relative group/card cursor-pointer"
                                  style={{
                                    marginTop: clsIdx === 0 ? 0 : 4,
                                  }}
                                >
                                  {/* Class Card */}
                                  <div
                                    className={cn(
                                      "relative p-2 rounded-lg border-2 transition-all duration-300",
                                      "hover:shadow-lg hover:scale-[1.02] hover:z-20",
                                      getSubjectStyle(cls.subjectCode)
                                    )}
                                  >
                                    {/* Subject Code */}
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[8px] font-black uppercase tracking-wider opacity-70">
                                        {cls.subjectCode}
                                      </span>
                                    </div>

                                    {/* Class Name */}
                                    <p className="text-[9px] font-bold leading-tight line-clamp-2">
                                      {cls.className}
                                    </p>

                                    {/* Time Badge */}
                                    <div className="flex items-center gap-1 mt-1.5">
                                      <Clock className="h-2.5 w-2.5 opacity-50" />
                                      <span className="text-[7px] font-bold text-muted-foreground">
                                        {cls.startTime}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Popup Details Card */}
                                  <div className={cn(
                                    "absolute left-full top-0 ml-2 z-50",
                                    "w-64 rounded-2xl shadow-2xl border border-border/50",
                                    "bg-card/98 backdrop-blur-xl",
                                    "opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible",
                                    "transition-all duration-300 ease-out",
                                    "translate-x-2 group-hover/card:translate-x-0"
                                  )}>
                                    {/* Arrow */}
                                    <div className="absolute -left-2 top-6 w-4 h-4 bg-card/98 backdrop-blur-xl border-t border-l border-border/50 rotate-45" />
                                    
                                    {/* Popup Content */}
                                    <div className="relative p-4 space-y-3">
                                      {/* Header with Time */}
                                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-primary" />
                                          <span className="text-[9px] font-bold text-muted-foreground">
                                            {cls.startTime} - {cls.endTime}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Subject Badge */}
                                      <span className={cn(
                                        "inline-flex items-center px-2.5 py-1 rounded-lg font-black uppercase tracking-wider text-[9px] shadow-sm",
                                        getSubjectStyle(cls.subjectCode)
                                      )}>
                                        {cls.subjectCode}
                                      </span>
                                      
                                      {/* Class Name */}
                                      <p className="text-[12px] font-bold text-foreground leading-snug">
                                        {cls.className}
                                      </p>
                                      
                                      {/* Teacher */}
                                      <div className="flex items-center gap-2.5 pt-1">
                                        <Avatar className="h-6 w-6 border-2 border-border/50 shadow-sm">
                                          <AvatarImage src={cls.teacherImage || undefined} />
                                          <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                                            {cls.teacherName?.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[10px] font-medium text-foreground truncate">
                                            {cls.teacherName}
                                          </p>
                                          <p className="text-[8px] text-muted-foreground">
                                            Instructor
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Empty State */}
                      {deptGroups.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-center">
                          <p className="text-[9px] font-bold text-muted-foreground">No classes scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
