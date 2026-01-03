/**
 * API Client for The Mambo Inn Backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  detail: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If response is not JSON, use status text
          const text = await response.text();
          if (text) {
            errorMessage = text.substring(0, 200);
          }
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (!text) {
          return {} as T;
        }
        return JSON.parse(text);
      }
      
      return {} as T;
    } catch (error) {
      // Network errors, CORS errors, etc.
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Failed to connect to server. Please check if the backend is running."
        );
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    current_level_tag: string;
  }) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    this.setToken(response.access_token);
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      "/api/auth/token",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(response.access_token);
    return response;
  }

  async getProfile() {
    return this.request<{
      id: string;
      first_name: string;
      last_name: string;
      xp: number;
      level: number;
      streak_count: number;
      tier: string;
      role: string;
      avatar_url: string | null;
    }>("/api/auth/me");
  }

  // Course endpoints
  async getWorlds() {
    return this.request<
      Array<{
        id: string;
        title: string;
        description: string | null;
        image_url: string | null;
        difficulty: string;
        progress_percentage: number;
        is_locked: boolean;
      }>
    >("/api/courses/worlds");
  }

  async getWorldLessons(worldId: string) {
    return this.request<
      Array<{
        id: string;
        title: string;
        description: string | null;
        video_url: string;
        xp_value: number;
        is_completed: boolean;
        is_locked: boolean;
        is_boss_battle: boolean;
        order_index: number;
      }>
    >(`/api/courses/worlds/${worldId}/lessons`);
  }

  async getLesson(lessonId: string) {
    return this.request<{
      id: string;
      title: string;
      description: string | null;
      video_url: string;
      xp_value: number;
      next_lesson_id: string | null;
      prev_lesson_id: string | null;
      comments: Array<any>;
    }>(`/api/courses/lessons/${lessonId}`);
  }

  // Progress endpoints
  async completeLesson(lessonId: string) {
    return this.request<{
      xp_gained: number;
      new_total_xp: number;
      leveled_up: boolean;
      new_level: number;
    }>(`/api/progress/lessons/${lessonId}/complete`, {
      method: "POST",
    });
  }

  // Submission endpoints
  async submitBossBattle(lessonId: string, videoUrl: string) {
    return this.request<{
      id: string;
      status: string;
      feedback: string | null;
      submitted_at: string;
    }>("/api/submissions/submit", {
      method: "POST",
      body: JSON.stringify({ lesson_id: lessonId, video_url: videoUrl }),
    });
  }

  async getMySubmissions() {
    return this.request<
      Array<{
        id: string;
        status: string;
        feedback: string | null;
        submitted_at: string;
      }>
    >("/api/submissions/my-submissions");
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request<{
      total_users: number;
      total_submissions: number;
      pending_submissions: number;
    }>("/api/admin/stats");
  }

  async getPendingSubmissions() {
    return this.request<
      Array<{
        id: string;
        status: string;
        feedback: string | null;
        submitted_at: string;
      }>
    >("/api/admin/submissions");
  }

  async gradeSubmission(submissionId: string, data: {
    status: string;
    feedback_text?: string;
    feedback_video_url?: string;
  }) {
    return this.request<{ message: string }>(
      `/api/admin/submissions/${submissionId}/grade`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // Admin course management endpoints
  async getAdminCourses() {
    return this.request<Array<{
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      difficulty: string;
      progress_percentage: number;
      is_locked: boolean;
    }>>("/api/admin/courses");
  }

  async getCourseFullDetails(courseId: string) {
    return this.request<{
      id: string;
      title: string;
      description: string | null;
      slug: string;
      order_index: number;
      is_free: boolean;
      image_url: string | null;
      difficulty: string;
      is_published: boolean;
      levels: Array<{
        id: string;
        title: string;
        order_index: number;
        lessons: Array<{
          id: string;
          title: string;
          description: string | null;
          video_url: string;
          xp_value: number;
          order_index: number;
          is_boss_battle: boolean;
          duration_minutes: number | null;
        }>;
      }>;
    }>(`/api/admin/courses/${courseId}/full`);
  }

  async createCourse(data: {
    title: string;
    description?: string;
    slug: string;
    order_index: number;
    is_free?: boolean;
    image_url?: string;
    difficulty: string;
    is_published?: boolean;
  }) {
    return this.request<{
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      difficulty: string;
      progress_percentage: number;
      is_locked: boolean;
    }>("/api/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCourse(courseId: string, data: {
    title?: string;
    description?: string;
    slug?: string;
    order_index?: number;
    is_free?: boolean;
    image_url?: string;
    difficulty?: string;
    is_published?: boolean;
  }) {
    return this.request<{
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      difficulty: string;
      progress_percentage: number;
      is_locked: boolean;
    }>(`/api/admin/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(courseId: string) {
    return this.request<{ message: string }>(`/api/admin/courses/${courseId}`, {
      method: "DELETE",
    });
  }

  async createLevel(courseId: string, data: {
    title: string;
    order_index: number;
  }) {
    return this.request<{
      id: string;
      title: string;
      order_index: number;
    }>(`/api/admin/courses/${courseId}/levels`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createLesson(levelId: string, data: {
    title: string;
    description?: string;
    video_url: string;
    xp_value?: number;
    order_index: number;
    is_boss_battle?: boolean;
    duration_minutes?: number;
  }) {
    return this.request<{
      id: string;
      title: string;
      order_index: number;
      xp_value: number;
      is_boss_battle: boolean;
    }>(`/api/admin/levels/${levelId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLesson(lessonId: string, data: {
    title?: string;
    description?: string;
    video_url?: string;
    xp_value?: number;
    order_index?: number;
    is_boss_battle?: boolean;
    duration_minutes?: number;
  }) {
    return this.request<{
      id: string;
      title: string;
      order_index: number;
    }>(`/api/admin/lessons/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteLesson(lessonId: string) {
    return this.request<{ message: string }>(`/api/admin/lessons/${lessonId}`, {
      method: "DELETE",
    });
  }

}

export const apiClient = new ApiClient(API_BASE_URL);

