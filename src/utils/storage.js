export const safeJsonParse = (value, fallback = null) => {
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const loadFromStorage = (key, fallback = null) => {
  try {
    return safeJsonParse(localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
