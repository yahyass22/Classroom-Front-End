import { StatsCards } from "@/components/dashboard/StatsCards";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { StudentPerformanceTable } from "@/components/dashboard/StudentPerformanceTable";
import { useSession } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isGuest = userRole === "guest" || localStorage.getItem('guest_mode') === 'true';

  const handleExitGuest = () => {
    localStorage.removeItem('guest_mode');
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6">
      {isGuest && (
        <Alert className="bg-amber-50 border-amber-200">
          <GraduationCap className="h-4 w-4 text-amber-600" />
          <AlertDescription className="ml-2 flex items-center justify-between">
            <span className="text-amber-800">
              <strong>Guest Mode:</strong> You have limited access. Some features may be restricted.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExitGuest}
              className="ml-4"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Exit Guest
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
