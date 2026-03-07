import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/dashboard";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time feel
  });
};

export const useEnrollmentTrends = () => {
  return useQuery({
    queryKey: ["dashboard", "enrollment-trends"],
    queryFn: dashboardApi.getEnrollmentTrends,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentClasses = () => {
  return useQuery({
    queryKey: ["dashboard", "recent-classes"],
    queryFn: dashboardApi.getRecentClasses,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDepartmentStats = () => {
  return useQuery({
    queryKey: ["dashboard", "department-stats"],
    queryFn: dashboardApi.getDepartmentStats,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentPerformance = (page: number, limit: number, department?: string) => {
  return useQuery({
    queryKey: ["dashboard", "student-performance", page, limit, department],
    queryFn: () => dashboardApi.getStudentPerformance(page, limit, department),
    staleTime: 2 * 60 * 1000,
  });
};

// New hooks for additional charts
export const useClassStatusDistribution = () => {
  return useQuery({
    queryKey: ["dashboard", "class-status-distribution"],
    queryFn: dashboardApi.getClassStatusDistribution,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDepartmentDistribution = () => {
  return useQuery({
    queryKey: ["dashboard", "department-distribution"],
    queryFn: dashboardApi.getDepartmentDistribution,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEnrollmentByDepartment = () => {
  return useQuery({
    queryKey: ["dashboard", "enrollment-by-department"],
    queryFn: dashboardApi.getEnrollmentByDepartment,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentDepartmentDistribution = () => {
  return useQuery({
    queryKey: ["dashboard", "student-department-distribution"],
    queryFn: dashboardApi.getStudentDepartmentDistribution,
    staleTime: 5 * 60 * 1000,
  });
};

export const useScheduleHeatmap = () => {
  return useQuery({
    queryKey: ["dashboard", "schedule-heatmap"],
    queryFn: dashboardApi.getScheduleHeatmap,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopTeachers = () => {
  return useQuery({
    queryKey: ["dashboard", "top-teachers"],
    queryFn: dashboardApi.getTopTeachers,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserSignupTrends = () => {
  return useQuery({
    queryKey: ["dashboard", "user-signup-trends"],
    queryFn: dashboardApi.getUserSignupTrends,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAtRiskResources = () => {
  return useQuery({
    queryKey: ["dashboard", "at-risk"],
    queryFn: dashboardApi.getAtRiskResources,
    staleTime: 5 * 60 * 1000,
  });
};
