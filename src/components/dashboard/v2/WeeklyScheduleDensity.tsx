import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useScheduleHeatmap } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Clock, Calendar, MapPin, MoreHorizontal, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBREVS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface RoutineItem {
  classId: number;
  className: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  teacherImage: string | null;
  day: string;
  startTime: string; 
  endTime: string;   
}

/**
 * Modern Theme Palette
 * Automatically adapts to Light/Dark modes
 */
const DEPT_THEMES: Record<string, { primary: string, bg: string, border: string, badge: string }> = {
  CS: { 
    primary: "text-blue-600 dark:text-blue-400", 
    bg: "bg-blue-50/50 dark:bg-blue-900/10", 
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
  },
  MATH: { 
    primary: "text-purple-600 dark:text-purple-400", 
    bg: "bg-purple-50/50 dark:bg-purple-900/10", 
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
  },
  PHYS: { 
    primary: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-50/50 dark:bg-amber-900/10", 
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  },
  CHEM: { 
    primary: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-emerald-50/50 dark:bg-emerald-900/10", 
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
  },
  ENG: { 
    primary: "text-rose-600 dark:text-rose-400", 
    bg: "bg-rose-50/50 dark:bg-rose-900/10", 
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
  },
  BIO: { 
    primary: "text-green-600 dark:text-green-400", 
    bg: "bg-green-50/50 dark:bg-green-900/10", 
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
  },
  DEFAULT: { 
    primary: "text-slate-600 dark:text-slate-400", 
    bg: "bg-slate-50/50 dark:bg-slate-900/10", 
    border: "border-slate-200 dark:border-slate-800",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
  },
};

const getTheme = (code: string) => {
  const prefix = code.replace(/[0-9]/g, '');
  return DEPT_THEMES[prefix] || DEPT_THEMES.DEFAULT;
};

export function WeeklyScheduleDensity() {
  const { data, isLoading } = useScheduleHeatmap();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDepts, setSelectedDepts] = React.useState<string[]>([]);
  
  const routineData = React.useMemo(() => (Array.isArray(data) ? (data as RoutineItem[]) : []), [data]);

  // Extract unique departments for filter
  const allDepartments = React.useMemo(() => {
    const depts = new Set<string>();
    routineData.forEach(cls => depts.add(cls.subjectCode.replace(/[0-9]/g, '')));
    return Array.from(depts);
  }, [routineData]);

  // Filter Logic
  const filteredData = React.useMemo(() => {
    return routineData.filter(cls => {
      const matchesSearch = cls.className.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            cls.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cls.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const dept = cls.subjectCode.replace(/[0-9]/g, '');
      const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(dept);

      return matchesSearch && matchesDept;
    });
  }, [routineData, searchQuery, selectedDepts]);

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  if (isLoading) return <Skeleton className="h-[800px] w-full rounded-[3rem]" />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 w-full">
      
      {/* --- CONTROL BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between px-2">
        <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Weekly Board
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">
                {routineData.length} total sessions • {filteredData.length} visible
            </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Filter classes..." 
                    className="pl-9 bg-card/50 border-border/50 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 rounded-xl border-dashed">
                        <Filter className="h-4 w-4" />
                        Department
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    {allDepartments.map(dept => (
                        <DropdownMenuCheckboxItem 
                            key={dept}
                            checked={selectedDepts.includes(dept)}
                            onCheckedChange={() => toggleDept(dept)}
                        >
                            {dept}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* --- KANBAN BOARD CONTAINER --- */}
      <ScrollArea className="w-full whitespace-nowrap rounded-[2.5rem] border border-border/40 bg-card/10 backdrop-blur-xl shadow-2xl">
        <div className="flex w-max space-x-6 p-8">
            {DAYS.map((day, idx) => {
                const dayClasses = filteredData
                    .filter(item => item.day === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));
                
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

                return (
                    <div key={day} className="w-[320px] flex-none flex flex-col gap-4">
                        
                        {/* Day Header */}
                        <div className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                            isToday 
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                                : "bg-card/40 border-border/50 text-foreground"
                        )}>
                            <div>
                                <span className="text-sm font-black uppercase tracking-wider block">{DAY_ABBREVS[idx]}</span>
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", isToday ? "text-primary-foreground" : "text-muted-foreground")}>
                                    {dayClasses.length} Sessions
                                </span>
                            </div>
                            {isToday && <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                        </div>

                        {/* Class Cards Stack */}
                        <div className="flex flex-col gap-3 min-h-[400px]">
                            {dayClasses.map((cls) => {
                                const theme = getTheme(cls.subjectCode);
                                return (
                                    <div 
                                        key={cls.classId}
                                        className={cn(
                                            "group relative flex flex-col gap-3 p-5 rounded-[1.5rem] border bg-card/80 hover:bg-card hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer whitespace-normal",
                                            theme.border
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className={cn("rounded-lg px-2 py-0.5 text-[10px] font-black tracking-tighter", theme.badge)}>
                                                {cls.subjectCode}
                                            </Badge>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted -mr-2">
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold leading-tight text-foreground/90 line-clamp-2">
                                                {cls.className}
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground font-medium mt-1 line-clamp-1">
                                                {cls.subjectName}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                                            <Avatar className="h-8 w-8 border border-background shadow-sm">
                                                <AvatarImage src={cls.teacherImage || undefined} />
                                                <AvatarFallback className="text-[10px] font-black bg-muted">{cls.teacherName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-foreground leading-none">{cls.teacherName}</span>
                                                <span className="text-[9px] text-muted-foreground">Instructor</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-1 bg-muted/20 p-2 rounded-xl">
                                            <div className={cn("flex items-center gap-1.5 text-[10px] font-black", theme.primary)}>
                                                <Clock className="h-3 w-3" />
                                                {cls.startTime} - {cls.endTime}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                                <MapPin className="h-3 w-3" />
                                                402
                                            </div>
                                        </div>

                                        {/* Colored Accent Line */}
                                        <div className={cn("absolute left-0 top-6 bottom-6 w-1 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity", theme.bg.split(' ')[0].replace('/50', ''))} />
                                    </div>
                                );
                            })}

                            {dayClasses.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/30 rounded-[1.5rem] opacity-50">
                                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Free Day</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>
    </div>
  );
}
