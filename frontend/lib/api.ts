/**
 * API Client for The Mambo Inn Backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  detail?: string | object;
  message?: string;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string; // Made required based on typical profile needs
  xp: number;
  level: number;
  streak_count: number;
  tier: string;
  role: string;
  avatar_url: string | null;
  reputation: number;
  current_claves: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    tier: string;
    icon_url: string | null;
    category: string;
    requirement_type: string;
    requirement_value: number;
    is_earned: boolean;
    earned_at: string | null;
  }>;
  stats: {
    reactions_given: number;
    reactions_received: number;
    solutions_accepted: number;
  } | null;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds cache

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // For backwards compatibility, check localStorage for token
    // New auth uses httpOnly cookies (more secure)
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  private getCacheKey(endpoint: string, options: RequestInit): string {
    // Create cache key from endpoint and method
    const method = options.method || "GET";
    return `${method}:${endpoint}`;
  }

  private getCached<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data as T;
  }

  private setCache<T>(cacheKey: string, data: T): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    // Clear cache when token changes (user logged in/out)
    this.clearCache();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { signal?: AbortSignal; forceRefresh?: boolean } = {}
  ): Promise<T> {
    // Always check localStorage for token (in case it was updated in another tab)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken !== this.token) {
        this.token = storedToken;
      }
    }

    // Skip cache for non-GET requests or if cache is disabled or if forceRefresh is true
    const method = options.method || "GET";
    const headersObj = options.headers as Record<string, string> | undefined;
    const shouldCache = method === "GET" && !headersObj?.["X-No-Cache"] && !options.forceRefresh;

    if (shouldCache) {
      const cacheKey = this.getCacheKey(endpoint, options);
      const cached = this.getCached<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      let response: Response;
      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        // Merge signals: if both provided, abort if either aborts
        let finalSignal: AbortSignal;
        if (options.signal) {
          const mergedController = new AbortController();
          options.signal.addEventListener('abort', () => mergedController.abort());
          controller.signal.addEventListener('abort', () => mergedController.abort());
          finalSignal = mergedController.signal;
        } else {
          finalSignal = controller.signal;
        }

        try {
          response = await fetch(url, {
            ...options,
            headers,
            signal: finalSignal,
            credentials: 'include', // Send cookies with requests for httpOnly auth
          });
          clearTimeout(timeoutId);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (fetchError: any) {
        // Handle network errors (connection refused, CORS, timeout, etc.)
        if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
          throw new Error("Request timed out. Please check if the backend is running.");
        }
        if (fetchError instanceof TypeError || (fetchError.message && (fetchError.message.includes('fetch') || fetchError.message.includes('network') || fetchError.message.includes('Failed') || fetchError.message.includes('CORS')))) {
          throw new Error("Failed to connect to server. Please check if the backend is running.");
        }
        throw fetchError;
      }

      if (!response.ok) {
        // If unauthorized (401), clear token as it's invalid/expired
        if (response.status === 401) {
          this.setToken(null);
          // Only redirect to login if we're not already on the login page
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            // Don't redirect automatically, let the app handle it through AuthContext
          }
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData: ApiError = await response.json();
          // Handle case where detail might be an object or string
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (typeof errorData.detail === 'object') {
              // Try to extract a meaningful message from the object
              const detailObj = errorData.detail as any;
              if (detailObj.message) {
                errorMessage = detailObj.message;
              } else if (detailObj.msg) {
                errorMessage = detailObj.msg;
              } else if (Array.isArray(detailObj)) {
                // Handle Pydantic validation errors array
                errorMessage = detailObj.map((e: any) => {
                  if (typeof e === 'string') return e;
                  const loc = e.loc ? e.loc.join('.') : '';
                  const msg = e.msg || e.message || JSON.stringify(e);
                  return loc ? `${loc}: ${msg}` : msg;
                }).join(', ');
              } else {
                errorMessage = JSON.stringify(errorData.detail);
              }
            } else {
              errorMessage = String(errorData.detail);
            }
          } else if (errorData.message) {
            errorMessage = typeof errorData.message === 'string' ? errorData.message : String(errorData.message);
          }
        } catch (parseError) {
          // If response is not JSON, use status text
          try {
            const text = await response.text();
            if (text) {
              errorMessage = text.substring(0, 200);
            }
          } catch {
            // If we can't read the text either, use the default message
          }
        }
        
        // For 401 errors, use a more user-friendly message
        if (response.status === 401) {
          errorMessage = "Authentication required. Please log in.";
        }
        
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      let data: T;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (!text || !text.trim()) {
          data = {} as T;
        } else {
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse JSON response:", text);
            throw new Error("Invalid JSON response from server");
          }
        }
      } else {
        data = {} as T;
      }

      // Cache successful GET responses
      if (shouldCache) {
        const cacheKey = this.getCacheKey(endpoint, options);
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error: any) {
      // Network errors, CORS errors, etc.
      // If we already set a custom error message, re-throw it
      if (error instanceof Error && error.message.includes("Failed to connect to server")) {
        throw error;
      }

      // Handle network/fetch errors
      if (error instanceof TypeError || (error.message && (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Failed")))) {
        throw new Error("Failed to connect to server. Please check if the backend is running.");
      }

      // Re-throw other errors (including our custom Error from above)
      // Re-throw other errors (including our custom Error from above)
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    username: string;
    password: string;
    confirm_password: string;
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
    // Token is also set via httpOnly cookie, but we keep localStorage for backwards compatibility
    this.setToken(response.access_token);
    return response;
  }

  async refreshToken() {
    try {
      const response = await this.request<{ access_token: string; token_type: string }>(
        "/api/auth/refresh",
        { method: "POST" }
      );
      this.setToken(response.access_token);
      return response;
    } catch (error) {
      // If refresh fails, clear auth state
      this.setToken(null);
      throw error;
    }
  }

  async logout() {
    try {
      await this.request<{ message: string }>("/api/auth/logout", { method: "POST" });
    } finally {
      // Always clear local state even if server request fails
      this.setToken(null);
    }
  }

  async waitlistRegister(email: string, username: string, referrer_code?: string) {
    return this.request<{ referral_code: string; position: number }>("/api/auth/waitlist", {
      method: "POST",
      body: JSON.stringify({ email, username, referrer_code }),
    });
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
      reputation: number;
      current_claves: number;
      badges: Array<{
        id: string;
        name: string;
        description: string;
        tier: string;
        icon_url: string | null;
        category: string;
        requirement_type: string;
        requirement_value: number;
        is_earned: boolean;
        earned_at: string | null;
      }>;
      stats: {
        reactions_given: number;
        reactions_received: number;
        solutions_accepted: number;
      } | null;
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
        week_number: number | null;
        day_number: number | null;
        content_json: any | null;
        mux_playback_id: string | null;
        mux_asset_id: string | null;
        duration_minutes: number | null;
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
      week_number: number | null;
      day_number: number | null;
      content_json: any | null;
      mux_playback_id: string | null;
      mux_asset_id: string | null;
      lesson_type?: string;
      level_id?: string | null;
      level_title?: string | null;
    }>(`/api/courses/lessons/${lessonId}`);
  }

  async getLevelLessons(levelId: string) {
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
        week_number: number | null;
        day_number: number | null;
        content_json: any | null;
        mux_playback_id: string | null;
        mux_asset_id: string | null;
        duration_minutes: number | null;
      }>
    >(`/api/courses/levels/${levelId}/lessons`);
  }

  async createMuxUploadUrl(lessonId?: string, filename?: string, courseId?: string, postId?: string, levelId?: string) {
    return this.request<{
      upload_id: string;
      upload_url: string;
      status: string;
    }>("/api/mux/upload-url", {
      method: "POST",
      body: JSON.stringify({ lesson_id: lessonId, filename, course_id: courseId, post_id: postId, level_id: levelId }),
    });
  }

  async checkMuxUploadStatus(lessonId?: string, courseId?: string, postId?: string, levelId?: string) {
    const params = new URLSearchParams();
    if (lessonId) params.append("lesson_id", lessonId);
    if (courseId) params.append("course_id", courseId);
    if (postId) params.append("post_id", postId);
    if (levelId) params.append("level_id", levelId);

    return this.request<{
      status: "ready" | "processing" | "error";
      playback_id?: string;
      asset_id?: string;
      message: string;
    }>(`/api/mux/check-upload-status?${params.toString()}`, {
      method: "POST",
    });
  }

  async deleteMuxAsset(assetId: string) {
    return this.request<{
      status: "success" | "error";
      message: string;
    }>(`/api/mux/asset/${assetId}`, {
      method: "DELETE",
    });
  }

  async getDownloadUrl(playbackId: string, resolution: "high" | "medium" = "high") {
    return this.request<{
      download_url: string;
      resolution: string;
    }>(`/api/mux/download-url/${playbackId}?resolution=${resolution}`);
  }

  async checkDownloadAvailable(playbackId: string, resolution: "high" | "medium" = "high") {
    return this.request<{
      available: boolean;
      download_url: string | null;
      resolution: string | null;
      message: string | null;
    }>(`/api/mux/download-available/${playbackId}?resolution=${resolution}`);
  }

  // Image upload endpoints (R2 presigned URLs)
  async getPresignedUploadUrl(fileType: string, folder: "avatars" | "thumbnails") {
    return this.request<{
      upload_url: string;
      public_url: string;
    }>("/api/uploads/presigned-url", {
      method: "POST",
      body: JSON.stringify({ file_type: fileType, folder }),
    });
  }

  async updateProfile(data: { avatar_url?: string; username?: string }) {
    return this.request<{
      id: string;
      first_name: string;
      last_name: string;
      username?: string;
      xp: number;
      level: number;
      streak_count: number;
      tier: string;
      role: string;
      avatar_url: string | null;
    }>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async checkMuxAssetExists(assetId: string) {
    return this.request<{
      exists: boolean;
      asset_id: string;
    }>(`/api/mux/asset/${assetId}/exists`);
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

  async getStudents(search?: string, skip: number = 0, limit: number = 100) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    return this.request<Array<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      xp: number;
      level: number;
      streak_count: number;
      created_at: string;
      role: string;
    }>>(`/api/admin/students?${params.toString()}`);
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
      thumbnail_url?: string | null;
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
          thumbnail_url?: string | null;
          lesson_type?: string;
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
    thumbnail_url?: string;
    difficulty: string;
    course_type?: string;
    is_published?: boolean;
  }) {
    return this.request<{
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      difficulty: string;
      course_type: string;
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
    thumbnail_url?: string;
    difficulty?: string;
    course_type?: string;
    is_published?: boolean;
  }) {
    return this.request<{
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      difficulty: string;
      course_type: string;
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
      body: JSON.stringify({
        ...data,
        world_id: courseId,
      }),
    });
  }

  async updateLevel(levelId: string, data: {
    title?: string;
    description?: string;
    thumbnail_url?: string | null;
    mux_preview_playback_id?: string | null;
    mux_preview_asset_id?: string | null;
    outcome?: string | null;
    duration_minutes?: number;
    total_xp?: number;
    status?: string;
  }) {
    return this.request<{
      id: string;
      title: string;
      description?: string;
      thumbnail_url?: string | null;
      mux_preview_playback_id?: string | null;
      mux_preview_asset_id?: string | null;
      outcome?: string | null;
      duration_minutes?: number;
      total_xp?: number;
      status?: string;
    }>(`/api/admin/levels/${levelId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteLevel(levelId: string) {
    return this.request<{ success: boolean }>(`/api/admin/levels/${levelId}`, {
      method: "DELETE",
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
    week_number?: number | null;
    day_number?: number | null;
    content_json?: any | null;
    mux_playback_id?: string | null;
    mux_asset_id?: string | null;
    lesson_type?: string;
  }) {
    return this.request<{
      id: string;
      title: string;
      order_index: number;
      xp_value: number;
      is_boss_battle: boolean;
    }>(`/api/admin/levels/${levelId}/lessons`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        level_id: levelId,
      }),
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
    week_number?: number | null;
    day_number?: number | null;
    content_json?: any | null;
    delete_video?: boolean; // Flag to explicitly delete video (clears Mux IDs)
    thumbnail_url?: string | null;
    lesson_type?: string;
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

  // Payment endpoints
  async createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string) {
    return this.request<{
      session_id: string;
      url: string;
    }>("/api/payments/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });
  }

  async updateSubscription(newPriceId: string) {
    return this.request<{
      success: boolean;
      message: string;
      tier?: string;
    }>("/api/payments/update-subscription", {
      method: "POST",
      body: JSON.stringify({
        new_price_id: newPriceId,
      }),
    });
  }

  async cancelSubscription() {
    return this.request<{
      success: boolean;
      message: string;
      tier?: string;
    }>("/api/payments/cancel-subscription", {
      method: "POST",
    });
  }

  // ============================================
  // Clave Economy Endpoints (v4.0)
  // ============================================

  async getWallet() {
    return this.request<{
      current_claves: number;
      is_pro: boolean;
      recent_transactions: Array<{
        id: string;
        amount: number;
        reason: string;
        reference_id: string | null;
        created_at: string;
      }>;
      video_slots_used: number;
      video_slots_limit: number;
    }>("/api/claves/wallet");
  }

  async claimDailyClaves() {
    return this.request<{
      success: boolean;
      amount: number;
      new_balance: number;
      streak_bonus: number | null;
      message: string;
    }>("/api/claves/daily-claim", {
      method: "POST",
    });
  }

  async checkBalance(amount: number) {
    return this.request<{
      can_afford: boolean;
      current_balance: number;
      required_amount: number;
      shortfall: number;
    }>(`/api/claves/balance-check/${amount}`);
  }

  async getSlotStatus() {
    return this.request<{
      allowed: boolean;
      current_slots: number;
      max_slots: number;
      message: string;
    }>("/api/claves/slot-status");
  }

  // ============================================
  // Community Endpoints (v4.0)
  // ============================================

  async getCommunityStats() {
    // This endpoint is public (no auth required)
    return this.request<{
      member_count: number;
      active_now: number;
      leaderboard: Array<{
        id: string;
        first_name: string;
        avatar_url: string | null;
        score: number;
        rank: number;
      }>;
    }>("/api/community/stats");
  }

  async getCommunityFeed(options?: {
    post_type?: 'stage' | 'lab';
    tag?: string;
    skip?: number;
    limit?: number;
    forceRefresh?: boolean;
  }) {
    const params = new URLSearchParams();
    if (options?.post_type) params.append("post_type", options.post_type);
    if (options?.tag) params.append("tag", options.tag);
    if (options?.skip !== undefined) params.append("skip", String(options.skip));
    if (options?.limit !== undefined) params.append("limit", String(options.limit));

    const query = params.toString();
    return this.request<Array<{
      id: string;
      user: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_pro: boolean;
        is_guild_master?: boolean;
        level: number;
      };
      post_type: string;
      title: string;
      body: string | null;
      mux_playback_id: string | null;
      video_duration_seconds: number | null;
      tags: string[];
      is_wip: boolean;
      feedback_type: string;
      is_solved: boolean;
      reaction_count: number;
      reply_count: number;
      user_reaction: string | null;
      created_at: string;
      updated_at: string;
    }>>(`/api/community/feed${query ? `?${query}` : ""}`, {
      forceRefresh: options?.forceRefresh
    });
  }

  async getPost(postId: string, requestOptions?: { signal?: AbortSignal; forceRefresh?: boolean }) {
    return this.request<{
      id: string;
      user: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_pro: boolean;
        is_guild_master?: boolean;
        level: number;
      };
      post_type: string;
      title: string;
      body: string | null;
      mux_playback_id: string | null;
      tags: string[];
      is_wip: boolean;
      feedback_type: string;
      is_solved: boolean;
      reaction_count: number;
      reply_count: number;
      user_reaction: string | null;
      created_at: string;
      replies: Array<{
        id: string;
        user: {
          id: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          is_pro: boolean;
          is_guild_master?: boolean;
          level: number;
        };
        content: string;
        mux_playback_id: string | null;
        is_accepted_answer: boolean;
        created_at: string;
      }>;
    }>(`/api/community/posts/${postId}`, {
      signal: requestOptions?.signal,
      forceRefresh: requestOptions?.forceRefresh
    });
  }

  async createPost(data: {
    post_type: 'stage' | 'lab';
    title: string;
    body?: string;
    tags: string[];
    is_wip?: boolean;
    feedback_type?: 'hype' | 'coach';
    mux_asset_id?: string;
    mux_playback_id?: string;
    video_duration_seconds?: number;
  }) {
    return this.request<{
      success: boolean;
      post?: any;
      message: string;
    }>("/api/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async addReaction(postId: string, reactionType: 'fire' | 'ruler' | 'clap') {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/community/posts/${postId}/react`, {
      method: "POST",
      body: JSON.stringify({ reaction_type: reactionType }),
    });
  }

  async removeReaction(postId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/community/posts/${postId}/react`, {
      method: "DELETE",
    });
  }

  async addReply(postId: string, content: string, muxAssetId?: string, muxPlaybackId?: string) {
    return this.request<{
      success: boolean;
      reply?: any;
      message: string;
    }>(`/api/community/posts/${postId}/replies`, {
      method: "POST",
      body: JSON.stringify({
        content,
        mux_asset_id: muxAssetId,
        mux_playback_id: muxPlaybackId,
      }),
    });
  }

  async markSolution(postId: string, replyId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/community/posts/${postId}/replies/${replyId}/accept`, {
      method: "POST",
    });
  }

  async updatePost(postId: string, data: {
    title?: string;
    body?: string;
    tags?: string[];
    is_wip?: boolean;
    feedback_type?: 'hype' | 'coach';
  }) {
    return this.request<{
      success: boolean;
      post?: any;
      message: string;
    }>(`/api/community/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/community/posts/${postId}`, {
      method: "DELETE",
    });
  }

  async getCommunityTags() {
    return this.request<Array<{
      slug: string;
      name: string;
      category: string | null;
      usage_count: number;
    }>>("/api/community/tags");
  }

  async searchPosts(query: string, options?: {
    post_type?: 'stage' | 'lab';
    skip?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams({ q: query });
    if (options?.post_type) params.append("post_type", options.post_type);
    if (options?.skip !== undefined) params.append("skip", String(options.skip));
    if (options?.limit !== undefined) params.append("limit", String(options.limit));

    return this.request<Array<any>>(`/api/community/search?${params.toString()}`);
  }

  // ============================================
  // Badge Endpoints (v4.0)
  // ============================================

  async getBadges() {
    return this.request<Array<{
      id: string;
      name: string;
      description: string;
      icon_url: string | null;
      category: string;
      requirement_type: string;
      requirement_value: number;
      is_earned: boolean;
      earned_at: string | null;
      display_order: number;
    }>>("/api/badges/");
  }

  async getUserBadges(userId: string) {
    return this.request<Array<{
      id: string;
      name: string;
      description: string;
      icon_url: string | null;
      category: string;
      earned_at: string | null;
    }>>(`/api/badges/user/${userId}`);
  }

  async getUserStats(userId: string) {
    return this.request<{
      questions_solved: number;
      fires_received: number;
      current_streak: number;
    }>(`/api/badges/stats/${userId}`);
  }

  async checkMyBadges() {
    return this.request<{
      success: boolean;
      message: string;
      badges: Array<any>;
    }>("/api/badges/check", {
      method: "POST",
    });
  }

  async updateBadgeOrder(badgeIds: string[]) {
    return this.request<{ status: string }>("/api/users/me/badges/reorder", {
      method: "PUT",
      body: JSON.stringify({ badge_ids: badgeIds }),
    });
  }

  async getPublicProfile(username: string) {
    return this.request<UserProfile>(`/api/users/public/${username}`);
  }

  // ============================================
  // Secure Downloads API
  // ============================================

  async getDownloadStatus() {
    return this.request<{
      downloads_used: number;
      downloads_remaining: number;
      downloads_limit: number;
    }>("/api/downloads/status");
  }

  async getLessonDownloadUrl(lessonId: string) {
    return this.request<{
      download_url: string;
      expires_in_seconds: number;
      downloads_remaining: number;
      warning: string;
    }>(`/api/downloads/lesson/${lessonId}`, {
      method: "POST",
    });
  }

  async getCommunityVideoDownloadUrl(postId: string) {
    return this.request<{
      download_url: string;
      expires_in_seconds: number;
      downloads_remaining: number;
      warning: string;
    }>(`/api/downloads/community/${postId}`, {
      method: "POST",
    });
  }

  // ============================================
  // Streak Freezes API
  // ============================================

  async getFreezeStatus() {
    return this.request<{
      weekly_freebie_available: boolean;
      inventory_freezes: number;
      claves_balance: number;
      can_afford_freeze: boolean;
      freeze_cost: number;
      next_weekly_reset: string | null;
      streak_count: number;
    }>("/api/claves/freeze-status");
  }

  async buyStreakFreeze() {
    return this.request<{
      success: boolean;
      message: string;
      inventory_freezes: number;
      claves_balance: number | null;
    }>("/api/claves/buy-freeze", {
      method: "POST",
    });
  }

  async repairStreakWithClaves() {
    return this.request<{
      saved: boolean;
      method: string | null;
      message: string;
      streak_count: number;
    }>("/api/claves/repair-streak", {
      method: "POST",
    });
  }

  // ============================================
  // Premium (Guild Master) API
  // ============================================

  // Live Calls (The Roundtable)
  async getLiveCallStatus() {
    return this.request<{
      state: "no_upcoming" | "upcoming" | "live";
      call: {
        id: string;
        title: string;
        description: string | null;
        scheduled_at: string;
        duration_minutes: number;
        zoom_link: string | null;
      } | null;
      countdown_seconds: number | null;
      message: string;
    }>("/api/premium/live/status");
  }

  async getPastRecordings() {
    return this.request<Array<{
      id: string;
      title: string;
      description: string | null;
      recorded_at: string;
      duration_minutes: number;
      mux_playback_id: string;
      thumbnail_url: string | null;
    }>>("/api/premium/live/recordings");
  }

  // Weekly Archives (Cloudflare R2)
  async getWeeklyArchives() {
    return this.request<Array<{
      id: string;
      title: string;
      description: string | null;
      recorded_at: string;
      duration_minutes: number | null;
      topics: string[];
      thumbnail_url: string | null;
    }>>("/api/premium/archives");
  }

  async getArchiveSignedUrl(archiveId: string) {
    return this.request<{
      url: string;
      expires_in: number;
    }>(`/api/premium/archives/${archiveId}/signed-url`);
  }

  // Coaching (1-on-1 Feedback)
  async getCoachingStatus() {
    return this.request<{
      can_submit: boolean;
      current_submission: {
        id: string;
        status: string;
        video_mux_playback_id: string;
        specific_question: string | null;
        submitted_at: string;
        feedback_video_mux_playback_id: string | null;
        coach_notes: string | null;
      } | null;
      next_credit_date: string | null;
      message: string;
    }>("/api/premium/coaching/status");
  }

  async submitCoachingVideo(data: {
    video_mux_playback_id: string;
    video_mux_asset_id: string;
    video_duration_seconds?: number;
    specific_question?: string;
    allow_social_share?: boolean;
  }) {
    return this.request<{
      id: string;
      status: string;
      submitted_at: string;
    }>("/api/premium/coaching/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyCoachingSubmissions() {
    return this.request<Array<{
      id: string;
      status: string;
      video_mux_playback_id: string;
      specific_question: string | null;
      submitted_at: string;
      feedback_video_url: string | null;
      feedback_notes: string | null;
    }>>("/api/premium/coaching/my-submissions");
  }

  // DJ Booth
  async getDJBoothTracks() {
    return this.request<Array<{
      id: string;
      title: string;
      artist: string;
      album: string | null;
      year: number | null;
      duration_seconds: number;
      bpm: number | null;
      cover_image_url: string | null;
      full_mix_url: string;
      percussion_url: string;
      piano_bass_url: string;
      vocals_brass_url: string;
    }>>("/api/premium/dj-booth/tracks");
  }

  async getDJBoothPreview() {
    return this.request<Array<{
      id: string;
      title: string;
      artist: string;
      album: string | null;
      duration_seconds: number;
      bpm: number | null;
      cover_image_url: string | null;
      is_locked: boolean;
    }>>("/api/premium/dj-booth/preview");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

