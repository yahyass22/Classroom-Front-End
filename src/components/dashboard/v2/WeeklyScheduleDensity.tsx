import * as React from "react";
import { useScheduleHeatmap } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Search, Clock, User, RotateCcw } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const START_HOUR = 8;
const END_HOUR = 17;
const SLOT_BASE_HEIGHT_COMFORTABLE = 80;
const SLOT_BASE_HEIGHT_COMPACT = 42;
const SLOT_GRID_COLUMNS = 4;
const SLOT_ROW_HEIGHT = 30;
const SLOT_ROW_GAP = 3;
const SLOT_VERTICAL_PADDING = 6;

// Comfortable mode specific constants
const COMFORTABLE_SLOT_HEIGHT = 120;
const COMFORTABLE_SLOT_GAP = 12;
const COMFORTABLE_VERTICAL_PADDING = 16;

interface RoutineItem {
  classId: number;
  className: string;
  subjectName: string;
  subjectCode: string;
  departmentCode: string | null;
  departmentName: string | null;
  teacherName: string;
  teacherImage: string | null;
  day: string;
  startTime: string;
  endTime: string;
}

interface DepartmentGroup {
  departmentCode: string;
  departmentName: string;
  items: RoutineItem[];
  codes: string[];
}

const DEPT_MAP: Record<string, string> = {
  "COMPUTER SCIENCE": "bg-sky-400 text-white border-sky-500 dark:bg-sky-500",
  "MATHEMATICS": "bg-indigo-400 text-white border-indigo-500 dark:bg-indigo-500",
  "PHYSICS": "bg-purple-400 text-white border-purple-500 dark:bg-purple-500",
  "CHEMISTRY": "bg-pink-400 text-white border-pink-500 dark:bg-pink-500",
  "BIOLOGY": "bg-green-400 text-white border-green-500 dark:bg-green-500",
  "ENGLISH": "bg-rose-400 text-white border-rose-500 dark:bg-rose-500",
  "HISTORY": "bg-orange-400 text-white border-orange-500 dark:bg-orange-500",
  "GEOGRAPHY": "bg-teal-400 text-white border-teal-500 dark:bg-teal-500",
  "ECONOMICS": "bg-yellow-400 text-yellow-950 border-yellow-500 dark:bg-yellow-500 dark:text-yellow-50",
  "BUSINESS": "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600",
  "ENGINEERING": "bg-blue-500 text-white border-blue-600 dark:bg-blue-600",
  "PSYCHOLOGY": "bg-violet-400 text-white border-violet-500 dark:bg-violet-500",
  "SOCIOLOGY": "bg-fuchsia-400 text-white border-fuchsia-500 dark:bg-fuchsia-500",
  "POLITICAL SCIENCE": "bg-red-400 text-white border-red-500 dark:bg-red-500",
  "PHILOSOPHY": "bg-lime-400 text-lime-950 border-lime-500 dark:bg-lime-500 dark:text-lime-50",
  "EDUCATION": "bg-cyan-400 text-cyan-950 border-cyan-500 dark:bg-cyan-500 dark:text-cyan-50",
  "FINE ARTS": "bg-red-300 text-red-950 border-red-400 dark:bg-red-400 dark:text-red-50",
  "MUSIC": "bg-rose-300 text-rose-950 border-rose-400 dark:bg-rose-400 dark:text-rose-50",
  "PHYSICAL EDUCATION": "bg-amber-400 text-amber-950 border-amber-500 dark:bg-amber-500 dark:text-amber-50",
  "LAW": "bg-white text-slate-950 border-slate-200 dark:bg-slate-100 dark:text-slate-950",
};

const DEPT_CONSOLIDATION: Record<string, string> = {
  // Engineering Faculty
  "ENGINEERING": "ENGINEERING",
  "ENGR": "ENGINEERING",
  "CIVIL ENGINEERING": "ENGINEERING",
  "CE": "ENGINEERING",
  "ELECTRICAL ENGINEERING": "ENGINEERING",
  "EE": "ENGINEERING",
  "MECHANICAL ENGINEERING": "ENGINEERING",
  "ME": "ENGINEERING",
  
  // Business Faculty
  "BUSINESS": "BUSINESS",
  "BUS": "BUSINESS",
  "BUSINESS ADMINISTRATION": "BUSINESS",
  "BUSINESS ADMIN": "BUSINESS",
  
  // CS & Math
  "COMPUTER SCIENCE": "COMPUTER SCIENCE",
  "CS": "COMPUTER SCIENCE",
  "MATHEMATICS": "MATHEMATICS",
  "MATH": "MATHEMATICS",
  
  // Sciences
  "PHYSICS": "PHYSICS", "PHYS": "PHYSICS",
  "CHEMISTRY": "CHEMISTRY", "CHEM": "CHEMISTRY",
  "BIOLOGY": "BIOLOGY", "BIO": "BIOLOGY",
  
  // Humanities & Arts
  "ENGLISH": "ENGLISH", "ENG": "ENGLISH",
  "HISTORY": "HISTORY", "HIST": "HISTORY",
  "GEOGRAPHY": "GEOGRAPHY", "GEOG": "GEOGRAPHY",
  "ECONOMICS": "ECONOMICS", "ECON": "ECONOMICS",
  "PSYCHOLOGY": "PSYCHOLOGY", "PSY": "PSYCHOLOGY",
  "SOCIOLOGY": "SOCIOLOGY", "SOC": "SOCIOLOGY",
  "POLITICAL SCIENCE": "POLITICAL SCIENCE", "POLS": "POLITICAL SCIENCE",
  "PHILOSOPHY": "PHILOSOPHY", "PHIL": "PHILOSOPHY",
  "EDUCATION": "EDUCATION", "EDUC": "EDUCATION",
  "FINE ARTS": "FINE ARTS", "ART": "FINE ARTS",
  "MUSIC": "MUSIC", "MUS": "MUSIC",
  "PHYSICAL EDUCATION": "PHYSICAL EDUCATION", "PE": "PHYSICAL EDUCATION",
};

const getCanonicalDept = (code: string | null | undefined) => {
  if (!code) return "OTHER";
  const upper = code.toUpperCase().trim();
  return DEPT_CONSOLIDATION[upper] || upper;
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const getWeekStartMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const fmtDayNumber = (date: Date) => date.getDate().toString();
const fmtMonthShort = (date: Date) => date.toLocaleDateString("en-US", { month: "short" });
const fmtWeekday = (date: Date) => date.toLocaleDateString("en-US", { weekday: "long" });

const getWeekdayIndex = (date: Date) => {
  const day = date.getDay();
  if (day === 0) return 0;
  const idx = day - 1;
  return Math.max(0, Math.min(idx, DAYS.length - 1));
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getWeekOfMonth = (date: Date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const startDay = startOfMonth.getDay();
  return Math.ceil((date.getDate() + startDay) / 7);
};

const fmtDribbbleRange = (weekStart: Date) => {
  const weekEnd = addDays(weekStart, 4);
  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const weekNum = getWeekOfMonth(weekStart);
  
  return {
    range: `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`,
    label: `Week ${weekNum}, ${weekStart.getFullYear()}`
  };
};

const getTheme = (departmentName?: string | null, departmentCode?: string | null, subjectCode?: string) => {
  const canonicalName = getCanonicalDept(departmentName || departmentCode || (subjectCode || "").replace(/[0-9]/g, ""));
  const themeClasses = DEPT_MAP[canonicalName];

  if (themeClasses) {
    return themeClasses;
  }

  return "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
};

// Simplified helper to get only the background color class for specific use cases
const getBgColorOnly = (themeClasses: string) => {
  return themeClasses.split(" ").find(c => c.startsWith("bg-")) || "bg-slate-400";
};

// Helper to get text color class from theme string
const getTextColorOnly = (themeClasses: string) => {
  return themeClasses.split(" ").find(c => c.startsWith("text-")) || "text-white";
};

const getCapsuleColSpan = (codesCount: number) => {
  if (codesCount <= 1) return 1;
  if (codesCount <= 2) return 2;
  if (codesCount <= 4) return 3;
  return 4;
};

const estimateRowsForCapsules = (spans: number[]) => {
  if (spans.length === 0) return 1;

  let rows = 1;
  let used = 0;

  spans.forEach((rawSpan) => {
    const span = Math.max(1, Math.min(rawSpan, SLOT_GRID_COLUMNS));
    if (used + span > SLOT_GRID_COLUMNS) {
      rows += 1;
      used = span;
      return;
    }
    used += span;
  });

  return rows;
};

// Memoized helper to avoid re-calculating group logic inside loops
const getDayTimeGroups = (items: RoutineItem[]) => {
  const groups = new Map<string, DepartmentGroup>();

  items.forEach((item) => {
    const fallbackPrefix = item.subjectCode.replace(/[0-9]/g, "").toUpperCase();
    const departmentCode = (item.departmentCode || fallbackPrefix || "DEFAULT").toUpperCase();
    const departmentName = item.departmentName || departmentCode;
    
    // Consolidate sub-departments into canonical parent departments
    const canonicalId = getCanonicalDept(departmentCode);
    const canonicalName = getCanonicalDept(departmentName);

    if (!groups.has(canonicalId)) {
      groups.set(canonicalId, {
        departmentCode: canonicalId,
        departmentName: canonicalName,
        items: [],
        codes: [],
      });
    }

    const group = groups.get(canonicalId)!;
    group.items.push(item);
    if (!group.codes.includes(item.subjectCode)) {
      group.codes.push(item.subjectCode);
    }
  });

  return Array.from(groups.values()).sort((a, b) => {
    const spanDiff = getCapsuleColSpan(b.codes.length) - getCapsuleColSpan(a.codes.length);
    if (spanDiff !== 0) return spanDiff;
    return a.departmentCode.localeCompare(b.departmentCode);
  });
};

export const WeeklyScheduleDensity = React.memo(function WeeklyScheduleDensity() {
  const { data, isLoading } = useScheduleHeatmap();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [focusDept, setFocusDept] = React.useState<string>("all");
  const [density, setDensity] = React.useState<"comfortable" | "compact">("compact");
  const [weekStart, setWeekStart] = React.useState<Date>(() => getWeekStartMonday(new Date()));
  const [selectedDay, setSelectedDay] = React.useState<string>(() => DAYS[getWeekdayIndex(new Date())] || DAYS[0]);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    // Sync time every minute for the live pulse line
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleJumpToToday = () => {
    setWeekStart(getWeekStartMonday(new Date()));
    setSelectedDay(DAYS[getWeekdayIndex(new Date())] || DAYS[0]);
  };

  const weekInfo = React.useMemo(() => fmtDribbbleRange(weekStart), [weekStart]);

  const slotBaseHeight = density === "compact" ? SLOT_BASE_HEIGHT_COMPACT : SLOT_BASE_HEIGHT_COMFORTABLE;
  const capsuleMinHeight = density === "compact" ? 24 : 30;
  const rowGap = density === "compact" ? 4 : COMFORTABLE_SLOT_GAP;
  const slotVerticalPadding = density === "compact" ? 8 : COMFORTABLE_VERTICAL_PADDING;
  const capsuleTextClass = density === "compact" ? "text-[10px] font-bold" : "text-[11px] font-bold";
  const capsulePaddingClass = density === "compact" ? "px-2 py-0.5" : "px-3 py-1.5";

  // Comfortable mode specific classes
  const isComfortable = density === "comfortable";
  const comfortableCardClasses = isComfortable
    ? "rounded-2xl overflow-hidden shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1"
    : "rounded-xl";

  // Helper to get teacher initials
  const getTeacherInitials = (name?: string) => {
    if (!name) return "??";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const routineData = React.useMemo(() => {
    const source = Array.isArray(data) ? (data as RoutineItem[]) : [];
    const seen = new Set<string>();
    const unique: RoutineItem[] = [];

    source.forEach((item) => {
      const key = `${item.classId}-${item.day}-${item.startTime}-${item.endTime}-${item.subjectCode}`;
      if (seen.has(key)) return;

      const start = toMinutes(item.startTime);
      const end = toMinutes(item.endTime);
      const minStart = START_HOUR * 60;
      const maxEnd = END_HOUR * 60;
      if (start < minStart || end > maxEnd || !DAYS.includes(item.day)) return;

      seen.add(key);
      unique.push(item);
    });

    return unique;
  }, [data]);

  const allDepts = React.useMemo(() => {
    const depts = new Set<string>();
    routineData.forEach(item => {
      const code = (item.departmentCode || item.subjectCode.replace(/[0-9]/g, "")).toUpperCase();
      // Consolidate to parent department for the filter list
      const canonical = getCanonicalDept(code);
      if (canonical) depts.add(canonical);
    });
    return Array.from(depts).sort();
  }, [routineData]);

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return routineData;
    return routineData.filter((item) => {
      return (
        item.className.toLowerCase().includes(q) ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q)
      );
    });
  }, [routineData, searchQuery]);

  // Pre-calculate all grid data and groups to avoid logic in render loop
  const gridMatrix = React.useMemo(() => {
    const matrix = new Map<string, Map<string, DepartmentGroup[]>>();
    const timeKeySet = new Set<string>();
    
    DAYS.forEach((day) => matrix.set(day, new Map<string, DepartmentGroup[]>()));

    // 1. Group raw items by day and time
    const rawSlotsByDay = new Map<string, Map<string, RoutineItem[]>>();
    DAYS.forEach((day) => rawSlotsByDay.set(day, new Map<string, RoutineItem[]>()));

    filteredData.forEach((item) => {
      const key = `${item.startTime}-${item.endTime}`;
      timeKeySet.add(key);
      const dayMap = rawSlotsByDay.get(item.day);
      if (dayMap) {
        if (!dayMap.has(key)) dayMap.set(key, []);
        dayMap.get(key)!.push(item);
      }
    });

    const sortedTimeKeys = Array.from(timeKeySet).sort((a, b) => {
      const [aStart, aEnd] = a.split("-");
      const [bStart, bEnd] = b.split("-");
      const byStart = toMinutes(aStart) - toMinutes(bStart);
      return byStart !== 0 ? byStart : toMinutes(aEnd) - toMinutes(bEnd);
    });

    // 2. Process groups and calculate heights
    const heights: Record<string, number> = {};
    
    sortedTimeKeys.forEach((key) => {
      let maxRowsInRow = 1;
      
      DAYS.forEach((day) => {
        const items = rawSlotsByDay.get(day)?.get(key) || [];
        const groups = getDayTimeGroups(items);
        matrix.get(day)!.set(key, groups);

        const spans = groups.map((g) => getCapsuleColSpan(g.codes.length));
        maxRowsInRow = Math.max(maxRowsInRow, estimateRowsForCapsules(spans));
      });

      const effectiveRowHeight = density === "comfortable" 
        ? COMFORTABLE_SLOT_HEIGHT 
        : Math.max(SLOT_ROW_HEIGHT, capsuleMinHeight + 2);
      
      const dynamicHeight = density === "comfortable"
        ? maxRowsInRow * COMFORTABLE_SLOT_HEIGHT + Math.max(0, maxRowsInRow - 1) * COMFORTABLE_SLOT_GAP + COMFORTABLE_VERTICAL_PADDING
        : maxRowsInRow * effectiveRowHeight + Math.max(0, maxRowsInRow - 1) * rowGap + slotVerticalPadding;

      heights[key] = density === "comfortable" 
        ? Math.max(SLOT_BASE_HEIGHT_COMFORTABLE, dynamicHeight)
        : Math.max(slotBaseHeight, dynamicHeight);
    });

    return { matrix, sortedTimeKeys, heights };
  }, [filteredData, slotBaseHeight, capsuleMinHeight, rowGap, slotVerticalPadding, density]);

  const { matrix: slotsByDay, sortedTimeKeys: timeKeys, heights: rowHeights } = gridMatrix;

  const livePulsePosition = React.useMemo(() => {
    if (isComfortable) return null;
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    let accumulatedHeight = 16 * 4; // Header height

    for (const key of timeKeys) {
      const [start, end] = key.split("-").map(toMinutes);
      if (nowMinutes >= start && nowMinutes <= end) {
        const progress = (nowMinutes - start) / (end - start);
        return accumulatedHeight + progress * rowHeights[key];
      }
      accumulatedHeight += rowHeights[key];
    }
    return null;
  }, [currentTime, timeKeys, rowHeights, isComfortable]);

  const weekDates = React.useMemo(() => DAYS.map((_, index) => addDays(weekStart, index)), [weekStart]);
  const selectedDayIndex = Math.max(0, DAYS.indexOf(selectedDay));
  const selectedDate = weekDates[selectedDayIndex] || weekDates[0];
  const selectedDayLabel = fmtWeekday(selectedDate);
  const selectedMonth = fmtMonthShort(selectedDate);
  const isSelectedDayToday = isSameDay(selectedDate, new Date());

  const comfortableGrid = React.useMemo(() => {
    const dayItems = filteredData.filter((item) => item.day === selectedDay);
    const timeKeySet = new Set<string>();
    const rawSlots = new Map<string, RoutineItem[]>();

    dayItems.forEach((item) => {
      const key = `${item.startTime}-${item.endTime}`;
      timeKeySet.add(key);
      if (!rawSlots.has(key)) rawSlots.set(key, []);
      rawSlots.get(key)!.push(item);
    });

    const sortedTimeKeys = Array.from(timeKeySet).sort((a, b) => {
      const [aStart, aEnd] = a.split("-");
      const [bStart, bEnd] = b.split("-");
      const byStart = toMinutes(aStart) - toMinutes(bStart);
      return byStart !== 0 ? byStart : toMinutes(aEnd) - toMinutes(bEnd);
    });

    const slots = new Map<string, DepartmentGroup[]>();
    const heights: Record<string, number> = {};

    sortedTimeKeys.forEach((key) => {
      const groups = getDayTimeGroups(rawSlots.get(key) || []);
      slots.set(key, groups);

      const spans = groups.map((g) => getCapsuleColSpan(g.codes.length));
      const maxRowsInRow = estimateRowsForCapsules(spans);
      const dynamicHeight =
        maxRowsInRow * COMFORTABLE_SLOT_HEIGHT +
        Math.max(0, maxRowsInRow - 1) * COMFORTABLE_SLOT_GAP +
        COMFORTABLE_VERTICAL_PADDING;
      heights[key] = Math.max(SLOT_BASE_HEIGHT_COMFORTABLE, dynamicHeight);
    });

    return { slots, sortedTimeKeys, heights, total: dayItems.length };
  }, [filteredData, selectedDay]);

  if (isLoading) {
    return <Skeleton className="h-[720px] w-full rounded-3xl" />;
  }

  return (
    <TooltipProvider>
      <div className="bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-border/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Navigation & Controls Section */}
        <div className="p-4 md:p-6 pb-2 space-y-6">
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
            <div className="flex items-center gap-4 bg-background/50 p-1.5 rounded-2xl border border-border shadow-inner group">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-md transition-all active:scale-90"
                onClick={() => setWeekStart((prev) => addDays(prev, -7))}
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>

              <div className="px-4 text-center min-w-[160px]">
                <div className="flex items-center justify-center gap-2">
                   <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                   <h4 className="text-[13px] font-black tracking-tight text-foreground">{weekInfo.range}</h4>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{weekInfo.label}</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-md transition-all active:scale-90"
                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleJumpToToday}
                className="h-11 rounded-2xl border-border bg-background/50 hover:bg-background px-5 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Go to Today
              </Button>

              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 rounded-2xl border-border/80 bg-background/40 pl-11 text-xs font-bold placeholder:font-medium shadow-inner focus-visible:ring-primary/30 focus-visible:bg-background transition-all"
                  placeholder="Quick filter classes, teachers or codes..."
                />
              </div>

              <div className="flex bg-muted/60 p-1 rounded-2xl border border-border/50 shadow-inner h-11 items-center">
                <Button
                  variant={density === "compact" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 rounded-xl text-[10px] font-black uppercase px-5 transition-all",
                    density === "compact" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setDensity("compact")}
                >
                  Compact
                </Button>
                <Button
                  variant={density === "comfortable" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 rounded-xl text-[10px] font-black uppercase px-5 transition-all",
                    density === "comfortable" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setDensity("comfortable")}
                >
                  Comfortable
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/40">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Department Focus Mode</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant={focusDept === "all" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-10 rounded-xl text-[11px] font-black uppercase px-6 transition-all duration-300 border-2 shadow-sm",
                  focusDept === "all" 
                    ? "bg-foreground text-background border-foreground shadow-lg scale-105" 
                    : "bg-background/50 border-border text-muted-foreground hover:border-foreground hover:bg-background hover:text-foreground hover:-translate-y-0.5 active:scale-95"
                )}
                onClick={() => setFocusDept("all")}
              >
                Full Overview
              </Button>
              {allDepts.map(dept => {
                const themeClasses = getTheme(null, dept, null);
                const colorBase = themeClasses.split(" ").find(c => c.startsWith("bg-"))?.replace("bg-", "") || "slate-400";

                return (
                  <Button
                    key={dept}
                    variant={focusDept === dept ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-10 rounded-xl text-[11px] font-black uppercase px-4 transition-all duration-300 border-2",
                      focusDept === dept 
                        ? cn(themeClasses, "border-transparent shadow-xl scale-110 z-10 -translate-y-1") 
                        : cn(
                            "bg-background/40 border-border/80 text-muted-foreground/90",
                            `hover:border-${colorBase} hover:bg-${colorBase}/10 hover:text-foreground hover:-translate-y-1 hover:shadow-md active:scale-95`
                          )
                    )}
                    onClick={() => setFocusDept(dept)}
                  >
                    {dept}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Section with Relative Positioning for Live Pulse */}
        <div className="relative border-t border-border/60">
          {livePulsePosition && (
            <div
              className="absolute left-0 right-0 h-px bg-rose-500 z-30 pointer-events-none flex items-center"
              style={{ top: `${livePulsePosition}px` }}
            >
              <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] absolute left-0 md:left-20" />
            </div>
          )}

          {isComfortable ? (
            <div className="p-4 md:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                {/* Main Schedule Area */}
                <div className="rounded-[2.5rem] bg-background/20 p-1">
                  {/* Consolidated Header: [Monday, 9 MAR] + Pill Selector */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 border-b border-border/10 mb-2">
                    <div className="flex items-baseline gap-3 shrink-0">
                      <h3 className="text-2xl font-black tracking-tight text-foreground leading-none">{selectedDayLabel}</h3>
                      <div className="flex items-baseline gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20">
                        <span className="text-xl font-black tracking-tighter text-primary">{fmtDayNumber(selectedDate)}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{selectedMonth}</span>
                      </div>
                      <Badge variant="outline" className="ml-2 h-7 px-3 rounded-lg border-border/50 bg-background/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                        {comfortableGrid.total} Sessions
                      </Badge>
                    </div>

                    {/* Day Selector Pills */}
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-[1.5rem] border border-border/40 overflow-x-auto no-scrollbar">
                      {DAYS.map((day, idx) => {
                        const isActive = day === selectedDay;
                        const date = weekDates[idx];
                        const isToday = isSameDay(date, new Date());
                        
                        return (
                          <Button
                            key={day}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-14 min-w-[70px] flex-col rounded-[1.1rem] transition-all duration-300 relative px-4 gap-0.5",
                              isActive 
                                ? "bg-foreground text-background shadow-xl scale-105 z-10" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedDay(day)}
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">{day.substring(0, 3)}</span>
                            <span className="text-lg font-black leading-none">{fmtDayNumber(date)}</span>
                            {isToday && (
                              <span className={cn(
                                "absolute -top-1 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter",
                                isActive ? "bg-primary text-white" : "bg-primary/20 text-primary"
                              )}>
                                Today
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {comfortableGrid.sortedTimeKeys.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/20">
                        <Clock className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                      <p className="text-xl font-black text-foreground tracking-tight">Quiet day ahead</p>
                      <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto font-medium">No sessions scheduled for this day in your department.</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-8">
                      {comfortableGrid.sortedTimeKeys.map((key) => {
                        const [start, end] = key.split("-");
                        const groups = comfortableGrid.slots.get(key) || [];
                        const isLive =
                          isSelectedDayToday &&
                          (() => {
                            const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                            const [s, e] = key.split("-").map(toMinutes);
                            return nowMinutes >= s && nowMinutes <= e;
                          })();

                        return (
                          <div key={key} className="relative">
                            <div className="flex items-center gap-4 mb-5">
                              <div className={cn(
                                "flex items-center justify-center px-5 py-2 rounded-full border shadow-sm transition-all",
                                isLive 
                                  ? "bg-rose-500 border-rose-600 text-white shadow-rose-200 dark:shadow-rose-950/20" 
                                  : "bg-background border-border text-muted-foreground"
                              )}>
                                <span className="text-sm font-black tabular-nums tracking-tight">{start} — {end}</span>
                                {isLive && <span className="ml-2.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                              </div>
                              <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5">
                              {groups.map((group) => {
                                const themeClasses = getTheme(group.departmentName, group.departmentCode, group.codes[0]);
                                const bgColor = getBgColorOnly(themeClasses);
                                const textColor = getTextColorOnly(themeClasses);
                                const isFocused = focusDept === "all" || group.departmentCode === focusDept;
                                
                                const displayCodes = group.codes.slice(0, 2);
                                const remainingCodes = group.codes.length - displayCodes.length;
                                const teacherName = group.items[0]?.teacherName || "Unknown";
                                const displayItems = group.items.slice(0, 2);
                                const remainingItems = group.items.length - displayItems.length;

                                return (
                                  <Tooltip key={`${selectedDay}-${key}-${group.departmentCode}`}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "group relative h-full flex flex-col",
                                          comfortableCardClasses,
                                          !isFocused ? "opacity-20 grayscale blur-sm" : "hover:ring-4 hover:ring-primary/10"
                                        )}
                                      >
                                        {/* Dynamic Theme Background with subtle gradient overlay */}
                                        <div className={cn("absolute inset-0 transition-all duration-500", bgColor, "opacity-95 group-hover:opacity-100")} />
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                        
                                        <div className={cn("relative z-10 p-5 h-full flex flex-col", textColor)}>
                                          {/* Header: Department Identity - High Visibility */}
                                          <div className="flex items-center justify-between gap-2 mb-4">
                                            <div className="flex items-center gap-2">
                                              <div className="h-5 w-1 rounded-full bg-current opacity-50" />
                                              <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                                                {group.departmentName}
                                              </span>
                                            </div>
                                            <div className="px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/20 border border-current/20 text-[8px] font-black uppercase tracking-widest shrink-0 shadow-sm">
                                              {group.departmentCode}
                                            </div>
                                          </div>

                                          {/* Subject Codes - Full wrap visibility */}
                                          <div className="flex flex-wrap items-center gap-1.5 mb-5 pb-3 border-b border-current/10">
                                            {group.codes.map((code, idx) => (
                                              <span key={idx} className="text-[9px] font-black uppercase tracking-tighter opacity-70">
                                                {code}{idx < group.codes.length - 1 ? " ·" : ""}
                                              </span>
                                            ))}
                                          </div>

                                          {/* Body: ALL Sessions - No Truncation */}
                                          <div className="flex-1 space-y-4 pr-1 scrollbar-hide overflow-y-auto">
                                            {group.items.map((item, idx) => (
                                              <div key={idx} className="space-y-1.5 group/item">
                                                <div className="flex items-start gap-2">
                                                  <div className="h-1.5 w-1.5 rounded-full bg-current opacity-40 mt-1.5 shrink-0" />
                                                  <p className="text-[13px] font-extrabold leading-[1.3] tracking-tight group-hover:underline decoration-1 underline-offset-4 transition-all">
                                                    {item.className}
                                                  </p>
                                                </div>
                                                {item.subjectName && (
                                                  <p className="text-[10px] font-medium opacity-70 ml-3.5 italic tracking-tight line-clamp-1">
                                                    {item.subjectName}
                                                  </p>
                                                )}
                                              </div>
                                            ))}
                                          </div>

                                          {/* Footer: Professor Info */}
                                          <div className="mt-6 pt-4 border-t border-current/20 flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-[0.8rem] bg-current/10 backdrop-blur-xl border border-current/20 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110">
                                              <span className="text-[10px] font-black tracking-tighter">{getTeacherInitials(teacherName)}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-[11px] font-black truncate leading-none mb-1.5 tracking-tight">
                                                {teacherName}
                                              </p>
                                              <p className="text-[8px] font-bold uppercase tracking-tighter opacity-60 flex items-center gap-1.5">
                                                <span className="h-1 w-1 rounded-full bg-current animate-pulse" />
                                                {group.items.length} Total Sessions
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 rounded-[1.5rem] border border-border/50 bg-card p-5 shadow-2xl backdrop-blur-xl z-[100]">
                                      <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                          <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-[0.2em] px-3">
                                            {group.departmentCode}
                                          </Badge>
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-xs font-black tabular-nums">{key.replace("-", " - ")}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-base font-black tracking-tight text-foreground leading-tight">{group.departmentName}</p>
                                          <p className="text-[11px] font-bold text-muted-foreground mt-1">
                                            {group.items.length} sessions listed for this time block
                                          </p>
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-border/40">
                                          {group.items.map((item, idx) => (
                                            <div key={idx} className="group/item">
                                              <div className="flex items-start gap-3">
                                                <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-black border-primary/30 text-primary shrink-0 mt-0.5">{item.subjectCode}</Badge>
                                                <div className="min-w-0">
                                                  <p className="text-xs font-black text-foreground group-hover/item:text-primary transition-colors">{item.className}</p>
                                                  <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold">{item.teacherName}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex overflow-x-auto no-scrollbar">
            <div className="shrink-0 border-r border-border bg-muted/30 relative z-40 w-20">
              <div className="border-b border-border sticky top-0 bg-muted/40 backdrop-blur-md z-50 flex items-center justify-center h-16">
                 <Clock className="text-muted-foreground h-4 w-4" />
              </div>
              {timeKeys.map((key) => {
                const [start, end] = key.split("-");
                const isLive = livePulsePosition !== null && (() => {
                   const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                   const [s, e] = key.split("-").map(toMinutes);
                   return nowMinutes >= s && nowMinutes <= e;
                })();

                return (
                  <div key={key} className={cn(
                    "relative flex flex-col justify-center border-b border-border px-3 transition-colors",
                    isLive ? "bg-rose-500/10" : ""
                  )} style={{ height: rowHeights[key] }}>
                    <div className={cn("text-[11px] font-black tracking-tighter", isLive ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>{start}</div>
                    <div className="text-[9px] font-bold text-muted-foreground leading-none">{end}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex min-w-0 flex-1 relative">
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex flex-col border-r border-border last:border-r-0 min-w-[140px]">
                  <div className="flex flex-col items-center justify-center border-b border-border bg-muted/20 sticky top-0 z-30 backdrop-blur-md h-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{day.substring(0, 3)}</span>
                    <span className="font-black text-foreground text-base">{fmtDayNumber(weekDates[dayIndex])}</span>
                  </div>

                  {timeKeys.map((key) => {
                    const groups = slotsByDay.get(day)?.get(key) || [];
                    const itemsExist = groups.length > 0;

                    return (
                      <div
                        key={`${day}-${key}`}
                        className={cn(
                          "border-b border-border transition-colors relative p-1.5",
                          !itemsExist 
                            ? "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-40" 
                            : "hover:bg-muted/5"
                        )}
                        style={{ height: rowHeights[key] }}
                      >
                        {itemsExist ? (
                          <div
                            className="grid content-start h-full"
                            style={{
                              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                              gap: `${rowGap}px`,
                              gridAutoRows: `minmax(${capsuleMinHeight}px, auto)`,
                              gridAutoFlow: "dense",
                            }}
                          >
                            {groups.map((group) => {
                              const theme = getTheme(group.departmentName, group.departmentCode, group.codes[0]);
                              const bgColor = getBgColorOnly(theme);
                              const textColor = getTextColorOnly(theme);
                              const isFocused = focusDept === "all" || group.departmentCode === focusDept;
                              const adjustedSpan = getCapsuleColSpan(group.codes.length);

                              // Compact mode: Show perfectly flat capsule
                              return (
                                <Tooltip key={`${day}-${key}-${group.departmentCode}`}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        "inline-flex min-h-0 w-fit max-w-full cursor-pointer items-center justify-start rounded-md font-bold tracking-tight transition-all duration-200",
                                        capsulePaddingClass,
                                        capsuleTextClass,
                                        bgColor,
                                        textColor,
                                        !isFocused ? "opacity-10 grayscale blur-[2px]" : "hover:brightness-110"
                                      )}
                                      style={{ gridColumn: `span ${adjustedSpan} / span ${adjustedSpan}` }}
                                    >
                                      <div className="whitespace-nowrap overflow-hidden text-ellipsis leading-none">
                                        {group.codes.join(" · ")}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-64 rounded-xl border border-border/50 bg-card p-3 shadow-xl backdrop-blur-xl z-[100]">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                                          {group.departmentCode}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">{key.replace("-", " - ")}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs font-black tracking-tight text-foreground leading-tight">{group.departmentName}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                          {group.items.length} active session{group.items.length > 1 ? "s" : ""}
                                        </p>
                                      </div>

                                      <div className="pt-2 border-t border-border/50">
                                        {group.items.slice(0, 3).map((item, idx) => (
                                          <div key={idx} className="flex flex-col mb-2 last:mb-0">
                                            <div className="flex items-center gap-1.5">
                                               <span className="text-[10px] font-bold text-foreground">{item.subjectCode}</span>
                                               <span className="text-[10px] text-muted-foreground truncate opacity-80">{item.className}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                               <User className="h-2.5 w-2.5 text-muted-foreground" />
                                               <span className="text-[9px] font-medium text-muted-foreground">{item.teacherName}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
});
