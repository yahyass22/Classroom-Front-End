import { StatsCards } from "@/components/dashboard/StatsCards";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { StudentPerformanceTable } from "@/components/dashboard/StudentPerformanceTable";
import { useSession } from "@/lib/auth-client";

const Dashboard = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name ?? "User"}!
            {userRole && (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts and Tables */}
      <div className="grid gap-6">
        {/* Enrollment Chart */}
        <EnrollmentChart />

        {/* Student Performance Table */}
        <StudentPerformanceTable />
      </div>
    </div>
  );
};

export default Dashboard;
