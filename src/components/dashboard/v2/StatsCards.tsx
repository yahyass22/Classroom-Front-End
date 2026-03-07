import { GraduationCap, BookOpen, Users, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboard";

const statCards = [
  {
    title: "Total Students",
    icon: GraduationCap,
    dataKey: "totalStudents" as const,
    description: "Active students enrolled",
  },
  {
    title: "Total Classes",
    icon: BookOpen,
    dataKey: "totalClasses" as const,
    description: "Running classes",
  },
  {
    title: "Total Teachers",
    icon: Users,
    dataKey: "totalTeachers" as const,
    description: "Faculty members",
  },
  {
    title: "Total Enrollments",
    icon: ClipboardList,
    dataKey: "totalEnrollments" as const,
    description: "Course registrations",
  },
];

export const StatsCards = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const value = stats ? stats[stat.dataKey] : 0;

        return (
          <Card key={stat.title} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : error ? (
                <p className="text-sm text-destructive">Error</p>
              ) : (
                <>
                  <div className="text-3xl font-bold tracking-tight">
                    {value?.toLocaleString() ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
