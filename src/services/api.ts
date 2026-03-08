import { BASE_URL } from "@/constants";

// BASE_URL might already include /api, so check and use accordingly
const API_BASE = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

/**
 * Generic API client for making HTTP requests
 */
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log('🌐 API GET:', url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log('📡 API Response Status:', response.status);
    
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      console.error('❌ API Error Status:', response.status);
      const message = data?.error || data?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data as T;
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log('🌐 API POST:', url, data);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    let responseData: any;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = null;
    }

    if (!response.ok) {
      console.error('❌ API Error Status:', response.status);
      const message = responseData?.error || responseData?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return responseData as T;
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log('🌐 API PUT:', url, data);
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    let responseData: any;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = null;
    }
    
    if (!response.ok) {
      console.error('❌ API Error Status:', response.status);
      const message = responseData?.error || responseData?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return responseData as T;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log('🌐 API DELETE:', url);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    let responseData: any;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = null;
    }

    if (!response.ok) {
      console.error('❌ API Error Status:', response.status);
      const message = responseData?.error || responseData?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return responseData as T;
  },
};
