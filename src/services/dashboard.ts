import { BASE_URL } from "@/constants";

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  totalSubjects: number;
  totalEnrollments: number;
}

export interface EnrollmentTrend {
  month: string;
  count: number;
}

export interface RecentClass {
  id: number;
  name: string;
  status: "active" | "inactive" | "archived";
  capacity: number;
  bannerUrl: string | null;
  subject: {
    name: string;
    code: string;
  };
  teacher: {
    name: string;
    email: string;
  };
  enrolledStudents: number;
}

export interface DepartmentStat {
  name: string;
  code: string;
  teacherCount: number;
  subjectCount: number;
  classCount: number;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  class: {
    name: string;
  };
  subject: {
    name: string;
    code: string;
  };
  department: string;
  enrolledAt: Date | null;
}

export interface StudentPerformanceResponse {
  data: StudentPerformance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    // BASE_URL already includes /api, so we just append the endpoint
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },
};

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>("/dashboard/stats"),
  getEnrollmentTrends: () => apiClient.get<EnrollmentTrend[]>("/dashboard/enrollment-trends"),
  getRecentClasses: () => apiClient.get<RecentClass[]>("/dashboard/recent-classes"),
  getDepartmentStats: () => apiClient.get<DepartmentStat[]>("/dashboard/department-stats"),
  getStudentPerformance: (page: number, limit: number, department?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(department && { department }),
    });
    return apiClient.get<StudentPerformanceResponse>(`/dashboard/student-performance?${params}`);
  },
};
