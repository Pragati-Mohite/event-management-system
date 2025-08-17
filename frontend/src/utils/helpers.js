import { format, parseISO, isAfter, isBefore, addHours } from 'date-fns';

// Format date
export const formatDate = (date, formatString = 'PPP') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

// Format time
export const formatTime = (time) => {
  if (!time) return '';
  return format(parseISO(`2000-01-01T${time}`), 'p');
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

// Check if event is upcoming
export const isUpcoming = (startDate) => {
  return isAfter(parseISO(startDate), new Date());
};

// Check if event is ongoing
export const isOngoing = (startDate, endDate) => {
  const now = new Date();
  return isAfter(now, parseISO(startDate)) && isBefore(now, parseISO(endDate));
};

// Check if event is past
export const isPast = (endDate) => {
  return isBefore(parseISO(endDate), new Date());
};

// Get event status
export const getEventStatus = (startDate, endDate) => {
  if (isUpcoming(startDate)) return 'upcoming';
  if (isOngoing(startDate, endDate)) return 'ongoing';
  if (isPast(endDate)) return 'past';
  return 'unknown';
};

// Get event status color
export const getEventStatusColor = (status) => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'ongoing':
      return 'bg-green-100 text-green-800';
    case 'past':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-event.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${imagePath}`;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Calculate time remaining
export const getTimeRemaining = (targetDate) => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  }

  return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.toUpperCase();
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Array helpers
export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};
