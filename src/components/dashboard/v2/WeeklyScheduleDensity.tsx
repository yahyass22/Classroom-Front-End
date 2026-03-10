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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Search, Clock, User, Calendar as CalendarIcon, RotateCcw } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const START_HOUR = 8;
const END_HOUR = 17;
const SLOT_BASE_HEIGHT_COMFORTABLE = 52;
const SLOT_BASE_HEIGHT_COMPACT = 42;
const SLOT_GRID_COLUMNS = 4;
const SLOT_ROW_HEIGHT = 30;
const SLOT_ROW_GAP = 3;
const SLOT_VERTICAL_PADDING = 6;

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
  "CS": "bg-sky-400 text-white border-sky-500 dark:bg-sky-500",
  "MATHEMATICS": "bg-indigo-400 text-white border-indigo-500 dark:bg-indigo-500",
  "MATH": "bg-indigo-400 text-white border-indigo-500 dark:bg-indigo-500",
  "PHYSICS": "bg-purple-400 text-white border-purple-500 dark:bg-purple-500",
  "PHYS": "bg-purple-400 text-white border-purple-500 dark:bg-purple-500",
  "CHEMISTRY": "bg-pink-400 text-white border-pink-500 dark:bg-pink-500",
  "CHEM": "bg-pink-400 text-white border-pink-500 dark:bg-pink-500",
  "BIOLOGY": "bg-green-400 text-white border-green-500 dark:bg-green-500",
  "BIO": "bg-green-400 text-white border-green-500 dark:bg-green-500",
  "ENGLISH": "bg-rose-400 text-white border-rose-500 dark:bg-rose-500",
  "ENG": "bg-rose-400 text-white border-rose-500 dark:bg-rose-500",
  "HISTORY": "bg-orange-400 text-white border-orange-500 dark:bg-orange-500",
  "HIST": "bg-orange-400 text-white border-orange-500 dark:bg-orange-500",
  "GEOGRAPHY": "bg-teal-400 text-white border-teal-500 dark:bg-teal-500",
  "GEOG": "bg-teal-400 text-white border-teal-500 dark:bg-teal-500",
  "ECONOMICS": "bg-yellow-400 text-yellow-950 border-yellow-500 dark:bg-yellow-500 dark:text-yellow-50",
  "ECON": "bg-yellow-400 text-yellow-950 border-yellow-500 dark:bg-yellow-500 dark:text-yellow-50",
  "BUSINESS ADMINISTRATION": "bg-slate-400 text-white border-slate-500 dark:bg-slate-500",
  "BUSINESS ADMIN": "bg-slate-400 text-white border-slate-500 dark:bg-slate-500",
  "ENGINEERING": "bg-blue-400 text-white border-blue-500 dark:bg-blue-500",
  "ENGR": "bg-blue-400 text-white border-blue-500 dark:bg-blue-500",
  "PSYCHOLOGY": "bg-violet-400 text-white border-violet-500 dark:bg-violet-500",
  "PSY": "bg-violet-400 text-white border-violet-500 dark:bg-violet-500",
  "SOCIOLOGY": "bg-fuchsia-400 text-white border-fuchsia-500 dark:bg-fuchsia-500",
  "SOC": "bg-fuchsia-400 text-white border-fuchsia-500 dark:bg-fuchsia-500",
  "POLITICAL SCIENCE": "bg-red-400 text-white border-red-500 dark:bg-red-500",
  "POLS": "bg-red-400 text-white border-red-500 dark:bg-red-500",
  "PHILOSOPHY": "bg-lime-400 text-lime-950 border-lime-500 dark:bg-lime-500 dark:text-lime-50",
  "PHIL": "bg-lime-400 text-lime-950 border-lime-500 dark:bg-lime-500 dark:text-lime-50",
  "EDUCATION": "bg-cyan-400 text-cyan-950 border-cyan-500 dark:bg-cyan-500 dark:text-cyan-50",
  "EDUC": "bg-cyan-400 text-cyan-950 border-cyan-500 dark:bg-cyan-500 dark:text-cyan-50",
  "FINE ARTS": "bg-red-300 text-red-950 border-red-400 dark:bg-red-400 dark:text-red-50",
  "ART": "bg-red-300 text-red-950 border-red-400 dark:bg-red-400 dark:text-red-50",
  "MUSIC": "bg-rose-300 text-rose-950 border-rose-400 dark:bg-rose-400 dark:text-rose-50",
  "MUS": "bg-rose-300 text-rose-950 border-rose-400 dark:bg-rose-400 dark:text-rose-50",
  "PHYSICAL EDUCATION": "bg-amber-400 text-amber-950 border-amber-500 dark:bg-amber-500 dark:text-amber-50",
  "PE": "bg-amber-400 text-amber-950 border-amber-500 dark:bg-amber-500 dark:text-amber-50",
  "LAW": "bg-white text-slate-950 border-slate-200 dark:bg-slate-100 dark:text-slate-950",
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
  const name = (departmentName || "").toUpperCase().trim();
  const code = (departmentCode || "").toUpperCase().trim();
  const fallback = (subjectCode || "").replace(/[0-9]/g, "").toUpperCase().trim();

  const themeClasses = DEPT_MAP[name] || DEPT_MAP[code] || DEPT_MAP[fallback];

  if (themeClasses) {
    return cn("shadow-sm hover:brightness-110 transition-all duration-200", themeClasses);
  }

  return "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
};

const groupByDepartment = (items: RoutineItem[]) => {
  const groups = new Map<string, DepartmentGroup>();

  items.forEach((item) => {
    const fallbackPrefix = item.subjectCode.replace(/[0-9]/g, "").toUpperCase();
    const departmentCode = (item.departmentCode || fallbackPrefix || "DEFAULT").toUpperCase();
    const departmentName = item.departmentName || departmentCode;

    if (!groups.has(departmentCode)) {
      groups.set(departmentCode, {
        departmentCode,
        departmentName,
        items: [],
        codes: [],
      });
    }

    const group = groups.get(departmentCode)!;
    group.items.push(item);
    if (!group.codes.includes(item.subjectCode)) {
      group.codes.push(item.subjectCode);
    }
  });

  return Array.from(groups.values()).sort((a, b) => a.departmentCode.localeCompare(b.departmentCode));
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

export function WeeklyScheduleDensity() {
  const { data, isLoading } = useScheduleHeatmap();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [focusDept, setFocusDept] = React.useState<string>("all");
  const [density, setDensity] = React.useState<"comfortable" | "compact">("compact");
  const [weekStart, setWeekStart] = React.useState<Date>(() => getWeekStartMonday(new Date()));
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleJumpToToday = () => {
    setWeekStart(getWeekStartMonday(new Date()));
  };

  const weekInfo = fmtDribbbleRange(weekStart);

  const slotBaseHeight = density === "compact" ? SLOT_BASE_HEIGHT_COMPACT : SLOT_BASE_HEIGHT_COMFORTABLE;
  const capsuleMinHeight = density === "compact" ? 24 : 30;
  const rowGap = density === "compact" ? 4 : 5;
  const slotVerticalPadding = density === "compact" ? 8 : 10;
  const capsuleTextClass = density === "compact" ? "text-[10px] font-bold" : "text-[11px] font-bold";
  const capsulePaddingClass = density === "compact" ? "px-2 py-0.5" : "px-2.5 py-1";

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
      if (code) depts.add(code);
    });
    return Array.from(depts).sort();
  }, [routineData]);

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase();
    return routineData.filter((item) => {
      if (!q) return true;
      return (
        item.className.toLowerCase().includes(q) ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q)
      );
    });
  }, [routineData, searchQuery]);

  const slotsByDay = React.useMemo(() => {
    const map = new Map<string, Map<string, RoutineItem[]>>();
    DAYS.forEach((day) => map.set(day, new Map<string, RoutineItem[]>()));

    filteredData.forEach((item) => {
      const key = `${item.startTime}-${item.endTime}`;
      const dayMap = map.get(item.day);
      if (!dayMap) return;
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(item);
    });

    return map;
  }, [filteredData]);

  const timeKeys = React.useMemo(() => {
    const set = new Set<string>();
    DAYS.forEach((day) => {
      const dayMap = slotsByDay.get(day);
      if (!dayMap) return;
      dayMap.forEach((_, key) => set.add(key));
    });

    return Array.from(set).sort((a, b) => {
      const [aStart, aEnd] = a.split("-");
      const [bStart, bEnd] = b.split("-");
      const byStart = toMinutes(aStart) - toMinutes(bStart);
      if (byStart !== 0) return byStart;
      return toMinutes(aEnd) - toMinutes(bEnd);
    });
  }, [slotsByDay]);

  const rowHeights = React.useMemo(() => {
    const heights: Record<string, number> = {};

    timeKeys.forEach((key) => {
      let maxRows = 1;

      DAYS.forEach((day) => {
        const items = slotsByDay.get(day)?.get(key) || [];
        const orderedGroups = groupByDepartment(items).sort((a, b) => {
          const spanDiff = getCapsuleColSpan(b.codes.length) - getCapsuleColSpan(a.codes.length);
          if (spanDiff !== 0) return spanDiff;
          return a.departmentCode.localeCompare(b.departmentCode);
        });

        const spans = orderedGroups.map((group) => getCapsuleColSpan(group.codes.length));
        const rows = estimateRowsForCapsules(spans);
        maxRows = Math.max(maxRows, rows || 1);
      });

      const effectiveRowHeight = Math.max(SLOT_ROW_HEIGHT, capsuleMinHeight + 2);
      const effectiveRowGap = Math.max(SLOT_ROW_GAP, rowGap);
      const dynamicHeight =
        maxRows * effectiveRowHeight +
        Math.max(0, maxRows - 1) * effectiveRowGap +
        Math.max(SLOT_VERTICAL_PADDING, slotVerticalPadding);

      heights[key] = Math.max(slotBaseHeight, dynamicHeight);
    });

    return heights;
  }, [timeKeys, slotsByDay, slotBaseHeight, capsuleMinHeight, rowGap, slotVerticalPadding]);

  const livePulsePosition = React.useMemo(() => {
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    let accumulatedHeight = 16 * 4;

    for (const key of timeKeys) {
      const [start, end] = key.split("-").map(toMinutes);
      if (nowMinutes >= start && nowMinutes <= end) {
        const progress = (nowMinutes - start) / (end - start);
        return accumulatedHeight + progress * rowHeights[key];
      }
      accumulatedHeight += rowHeights[key];
    }
    return null;
  }, [currentTime, timeKeys, rowHeights]);

  const weekDates = React.useMemo(() => DAYS.map((_, index) => addDays(weekStart, index)), [weekStart]);

  if (isLoading) {
    return <Skeleton className="h-[720px] w-full rounded-3xl" />;
  }

  return (
    <TooltipProvider>
      <section className="space-y-6">
        <div className="bg-card/40 backdrop-blur-xl p-5 rounded-[2rem] border border-border shadow-md space-y-6">
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
                const themeClasses = DEPT_MAP[dept] || "bg-slate-400 text-white";
                const colorBase = themeClasses.split(" ")[0].replace("bg-", "");

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

        <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden relative">
          {livePulsePosition && (
            <div 
              className="absolute left-0 right-0 h-px bg-rose-500 z-30 pointer-events-none flex items-center"
              style={{ top: `${livePulsePosition}px` }}
            >
              <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] absolute left-0 md:left-20" />
            </div>
          )}

          <div className="flex overflow-x-auto no-scrollbar">
            <div className="w-20 shrink-0 border-r border-border bg-muted/30 relative z-40">
              <div className="h-16 border-b border-border sticky top-0 bg-muted/40 backdrop-blur-md z-50 flex items-center justify-center">
                 <Clock className="h-4 w-4 text-muted-foreground" />
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
                <div key={day} className="flex min-w-[140px] flex-1 flex-col border-r border-border last:border-r-0">
                  <div className="flex h-16 flex-col items-center justify-center border-b border-border bg-muted/20 sticky top-0 z-30 backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{day.substring(0, 3)}</span>
                    <span className="text-base font-black text-foreground">{fmtDayNumber(weekDates[dayIndex])}</span>
                  </div>

                  {timeKeys.map((key) => {
                    const items = slotsByDay.get(day)?.get(key) || [];
                    const orderedGroups = groupByDepartment(items).sort((a, b) => {
                      const spanDiff = getCapsuleColSpan(b.codes.length) - getCapsuleColSpan(a.codes.length);
                      if (spanDiff !== 0) return spanDiff;
                      return a.departmentCode.localeCompare(b.departmentCode);
                    });

                    return (
                      <div 
                        key={`${day}-${key}`} 
                        className={cn(
                          "border-b border-border p-1.5 transition-colors relative",
                          items.length === 0 ? "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-40" : "hover:bg-muted/5"
                        )} 
                        style={{ height: rowHeights[key] }}
                      >
                        {items.length > 0 ? (
                          <div
                            className="grid content-start h-full"
                            style={{
                              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                              gap: `${rowGap}px`,
                              gridAutoRows: `minmax(${capsuleMinHeight}px, auto)`,
                              gridAutoFlow: "dense",
                            }}
                          >
                            {orderedGroups.map((group) => {
                              const theme = getTheme(group.departmentName, group.departmentCode, group.codes[0]);
                              const span = getCapsuleColSpan(group.codes.length);
                              const isFocused = focusDept === "all" || group.departmentCode === focusDept;

                              return (
                                <Tooltip key={`${day}-${key}-${group.departmentCode}`}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        "inline-flex min-h-0 w-fit max-w-full cursor-pointer items-center justify-start rounded-xl border-l-[5px] font-black tracking-tight shadow-md transition-all duration-300 border-r-2 border-t-2 border-b-2",
                                        capsulePaddingClass,
                                        capsuleTextClass,
                                        theme,
                                        !isFocused ? "opacity-15 grayscale-[0.9] scale-[0.95] blur-[1px] border-border" : "hover:scale-105 hover:shadow-xl hover:z-20 hover:-translate-y-0.5"
                                      )}
                                      style={{ gridColumn: `span ${span} / span ${span}` }}
                                    >
                                      <div className="whitespace-normal break-words leading-tight">{group.codes.join(" · ")}</div>
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
        </div>
      </section>
    </TooltipProvider>
  );
}
