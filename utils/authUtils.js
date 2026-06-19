// Utility functions for authentication and API calls

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  // Accepts various phone formats
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10;
};

/**
 * Validates name (non-empty, reasonable length)
 * @param {string} name - Name to validate
 * @returns {boolean}
 */
export const validateName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 100;
};

/**
 * Gets error message for API error responses
 * @param {object} error - Axios error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Formats form validation errors
 * @param {object} errors - Validation errors object
 * @returns {string[]} Array of error messages
 */
export const formatValidationErrors = (errors) => {
  return Object.entries(errors)
    .filter(([_, error]) => error)
    .map(([field, error]) => `${field}: ${error}`);
};

/**
 * Checks if user is authenticated
 * @returns {boolean}
 */
export const isUserAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

/**
 * Gets stored user from localStorage
 * @returns {object|null} User object or null
 */
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Gets stored token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Clears authentication data from localStorage
 */
export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Stores authentication data in localStorage
 * @param {string} token - JWT token
 * @param {object} user - User object
 */
export const storeAuthData = (token, user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Formats user data for display
 * @param {object} user - User object
 * @returns {object} Formatted user object
 */
export const formatUserData = (user) => {
  return {
    ...user,
    fullName: user.name || '',
    initials: (user.name || '')
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2),
    profileImage: user.profileImage || '/default-avatar.png',
  };
};

/**
 * Extracts coordinates from location string or object
 * @param {string|object} location - Location data
 * @returns {object} { lat, lng }
 */
export const parseLocation = (location) => {
  if (typeof location === 'string') {
    const coords = location.split(',').map((c) => parseFloat(c.trim()));
    return {
      lat: coords[0] || null,
      lng: coords[1] || null,
    };
  }
  return {
    lat: location?.lat || null,
    lng: location?.lng || null,
  };
};

/**
 * Checks if API error is authentication-related
 * @param {object} error - Axios error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

/**
 * Retry promise with exponential backoff
 * @param {function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise}
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
};

/**
 * Debounce function for preventing rapid API calls
 * @param {function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {function}
 */
export const debounce = (fn, delay = 500) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Validates registration form data
 * @param {object} formData - Form data object
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!validateName(formData.name)) {
    errors.name = 'Valid name is required';
  }

  if (!validateEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!validatePhone(formData.phone)) {
    errors.phone = 'Valid phone number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates login form data
 * @param {object} formData - Form data object
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!validateEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!formData.password || formData.password.length === 0) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
