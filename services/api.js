import api from '@/lib/axios';

export const productService = {
  getCategories: () => api.get('/products/meta/categories'),
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id, params) => api.get(`/products/${id}`, { params }),
  getMyProducts: () => api.get('/products/my/listings'),
  createProduct: (formData) =>
    api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  markAsSold: (id) => api.patch(`/products/${id}/sold`),
  reportProduct: (id, data) => api.post(`/products/${id}/report`, data),
};

export const userService = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateLocation: (data) => api.put('/users/profile/location', data),
  changePassword: (data) => api.put('/users/profile/password', data),
  updateProfileImage: (formData) =>
    api.put('/users/profile/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  check: (productId) => api.get(`/wishlist/check/${productId}`),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getSellerReviews: (sellerId) => api.get(`/reviews/seller/${sellerId}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  createConversation: (data) => api.post('/chat/conversations', data),
  getMessages: (id) => api.get(`/chat/conversations/${id}/messages`),
  sendMessage: (id, data) => api.post(`/chat/conversations/${id}/messages`, data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getProducts: () => api.get('/admin/products'),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
};

export const aiService = {
  generateDescription: (data) => api.post('/ai/description', data),
  suggestPrice: (data) => api.post('/ai/price', data),
};
