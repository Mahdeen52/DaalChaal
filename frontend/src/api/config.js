// API Configuration - Clean Architecture
// All API endpoints and base URL configured here as external details

const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',

    // Auth endpoints
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/me',
        GOOGLE: '/api/auth/google'
    },

    // Items endpoints
    ITEMS: {
        LIST: '/api/items',
        GET: (id) => `/api/items/${id}`,
        CREATE: '/api/items',
        UPDATE: (id) => `/api/items/${id}`,
        DELETE: (id) => `/api/items/${id}`
    },

    // Decisions endpoints
    DECISIONS: {
        CREATE: '/api/decisions',
        LIST: '/api/decisions'
    },

    // Dashboard endpoints
    DASHBOARD: {
        STATS: '/api/dashboard/stats',
        HISTORY: '/api/dashboard/history'
    },

    // Upload endpoints
    UPLOAD: {
        IMAGE: '/api/upload/image'
    },

    // Overthinking endpoints
    OVERTHINKING: {
        COMMENT: (category) => `/api/overthinking/comment?category=${category}`
    }
};

export default API_CONFIG;
