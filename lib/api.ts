import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api');

console.log('[API] Using API URL:', API_URL);

export class ApiError extends Error {
  constructor(public code: number, message: string, public rawResponse?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${path}`;
  
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Read response as text first to check if it's JSON
    const responseText = await response.text();
    
    console.log(`[API] Response status: ${response.status}`, responseText.substring(0, 100));

    if (!response.ok) {
      // Try to parse as JSON error response
      try {
        const error = JSON.parse(responseText);
        throw new ApiError(response.status, error.error || response.statusText, responseText);
      } catch (parseError) {
        // If it's not JSON, it's likely HTML error page
        const errorMsg = responseText.includes('<') 
          ? `Server error: ${response.status} ${response.statusText}. Check if the API server is running.`
          : responseText;
        throw new ApiError(response.status, errorMsg, responseText);
      }
    }

    // Try to parse successful response as JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new ApiError(200, 'Invalid JSON response from server', responseText);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    const message = error instanceof Error 
      ? error.message 
      : 'Network error - unable to reach API';
    
    console.error(`[API] Error:`, message);
    throw new ApiError(0, message);
  }
}

export const api = {
  // Auth endpoints
  signup: (data: { username: string; password: string }) =>
    fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  
  signin: (data: { username: string; password: string }) =>
    fetchApi('/auth/signin', { method: 'POST', body: JSON.stringify(data) }),

  // User endpoints
  getUser: (userId: string) =>
    fetchApi(`/users/${userId}`),

  // Chat endpoints
  createChat: (data: { participantOneId: string; participantTwoId: string; itemId?: string }) =>
    fetchApi('/chats', { method: 'POST', body: JSON.stringify(data) }),
  
  getChat: (chatId: string) =>
    fetchApi(`/chats/${chatId}`),
  
  getChatMessages: (chatId: string) =>
    fetchApi(`/chats/${chatId}/messages`),

  // Message endpoints
  sendMessage: (data: { chatId: string; senderId: string; content: string }) =>
    fetchApi('/messages', { method: 'POST', body: JSON.stringify(data) }),
  
  markMessageAsRead: (messageId: string) =>
    fetchApi(`/messages/${messageId}/read`, { method: 'PATCH' }),

  // Report endpoints
  createReport: (data: { reporterId: string; reportedUserId: string; reason: string; details?: string }) =>
    fetchApi('/reports', { method: 'POST', body: JSON.stringify(data) }),

  // Moment endpoints
  addMomentComment: (momentId: string, data: { userId: string; content: string }) =>
    fetchApi(`/moments/${momentId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  
  deleteMomentComment: (momentId: string, commentId: string) =>
    fetchApi(`/moments/${momentId}/comments/${commentId}`, { method: 'DELETE' }),
  
  appreciateMoment: (momentId: string, data: { userId: string }) =>
    fetchApi(`/moments/${momentId}/appreciate`, { method: 'POST', body: JSON.stringify(data) }),
  
  removeAppreciation: (momentId: string, userId: string) =>
    fetchApi(`/moments/${momentId}/appreciate/${userId}`, { method: 'DELETE' }),

  // Health check
  health: () =>
    fetchApi('/health'),
};
