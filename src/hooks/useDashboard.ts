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
