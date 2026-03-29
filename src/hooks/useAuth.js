import { useState, useEffect, useCallback } from 'react';

const USERS_KEY = 'nexus_users';
const SESSION_KEY = 'nexus_session';

/**
 * Simple hash function for password storage in localStorage.
 * NOT for production use — this is local-only auth.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function useAuth() {
  const [user, setUser] = useState(() => getSession());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify session on mount
    const session = getSession();
    if (session) {
      const users = getUsers();
      const found = users.find(u => u.id === session.id);
      if (found) {
        setUser(session);
      } else {
        saveSession(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const signup = useCallback((fullName, email, password) => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    if (users.find(u => u.email === normalizedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Validate
    if (!fullName.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const session = { id: newUser.id, fullName: newUser.fullName, email: newUser.email };
    saveSession(session);
    setUser(session);

    return { success: true };
  }, []);

  const login = useCallback((email, password) => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const found = users.find(u => u.email === normalizedEmail);
    if (!found) {
      return { success: false, error: 'No account found with this email.' };
    }

    if (found.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const session = { id: found.id, fullName: found.fullName, email: found.email };
    saveSession(session);
    setUser(session);

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  return { user, isLoading, signup, login, logout };
}
