/**
 * AuthContext - Global Authentication State
 * 
 * Manages:
 * - Current logged-in user
 * - Login/logout functionality
 * - Registration
 * - Session persistence
 * 
 * This context is wrapped around the entire app so auth state is available everywhere
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import { DirectoryMember, User } from '../types';
import { getData, setData, removeData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  register: (
    name: string,
    email: string,
    password: string,
    country: string,
    program: string,
    securityQuestion: string,
    securityAnswer: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  recoverAccount: (details: {
    name: string;
    country: string;
    program: string;
    securityQuestion: string;
    securityAnswer: string;
    newPassword: string;
  }) => Promise<{ email: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getData<User>(STORAGE_KEYS.CURRENT_USER);
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Listen for user profile updates from ProfilePage
  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = getData<User>(STORAGE_KEYS.CURRENT_USER);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    };

    window.addEventListener('authUserUpdated', handleUserUpdate);
    return () => window.removeEventListener('authUserUpdated', handleUserUpdate);
  }, []);

  // Register new user
  const register = async (
    name: string,
    email: string,
    password: string,
    country: string,
    program: string,
    securityQuestion: string,
    securityAnswer: string
  ): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const safeName = name.trim();
    if (!safeName) throw new Error('Name is required');
    if (!normalizedEmail || !normalizedEmail.includes('@')) throw new Error('Valid email is required');
    if (password.trim().length < 6) throw new Error('Password must be at least 6 characters');
    if (!securityQuestion.trim() || securityAnswer.trim().length < 2) {
      throw new Error('Security question and answer are required');
    }

    const allUsers = getData<User[]>(STORAGE_KEYS.USERS, []) ?? [];
    if (allUsers.some((u) => u.email === normalizedEmail)) {
      throw new Error('Email already registered');
    }

    const now = Date.now();
    // First registered account becomes super-admin; all others start as members
    const hasSuperAdmin = allUsers.some((u) => u.role === 'super-admin');
    const role = hasSuperAdmin ? 'member' : 'super-admin';
    const newUser: User = {
      id: createId('user'),
      name: safeName,
      email: normalizedEmail,
      password,
      country,
      program,
      securityQuestion: securityQuestion.trim(),
      securityAnswer: securityAnswer.trim().toLowerCase(),
      role,
      createdAt: now,
      updatedAt: now,
    };

    setData(STORAGE_KEYS.USERS, [...allUsers, newUser]);
    setData(STORAGE_KEYS.CURRENT_USER, newUser);
    setCurrentUser(newUser);

    const directoryMembers = getData<DirectoryMember[]>(STORAGE_KEYS.DIRECTORY_MEMBERS, []) ?? [];
    const exists = directoryMembers.some((member) => member.userId === newUser.id);
    if (!exists) {
      const newMember: DirectoryMember = {
        id: createId('member'),
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        country: newUser.country,
        program: newUser.program,
        joinedAt: now,
        feePaid: false,
        lastActive: now,
        interests: [],
        verificationStatus: 'pending',
        membershipStatus: 'active',
        updatedAt: now,
      };
      setData(STORAGE_KEYS.DIRECTORY_MEMBERS, [newMember, ...directoryMembers]);
    }
  };

  // Login existing user
  const login = async (email: string, password: string): Promise<void> => {
    const allUsers = getData<User[]>(STORAGE_KEYS.USERS, []) ?? [];
    const normalizedEmail = email.trim().toLowerCase();
    const user = allUsers.find((u) => u.email === normalizedEmail && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const userWithLogin: User = { ...user, lastLoginAt: Date.now(), updatedAt: Date.now() };
    setData(
      STORAGE_KEYS.USERS,
      allUsers.map((entry) => (entry.id === user.id ? userWithLogin : entry))
    );
    setData(STORAGE_KEYS.CURRENT_USER, userWithLogin);
    setCurrentUser(userWithLogin);
  };

  // Recover account details and reset password using profile verification.
  const recoverAccount = async ({
    name,
    country,
    program,
    securityQuestion,
    securityAnswer,
    newPassword,
  }: {
    name: string;
    country: string;
    program: string;
    securityQuestion: string;
    securityAnswer: string;
    newPassword: string;
  }): Promise<{ email: string }> => {
    const safeName = name.trim().toLowerCase();
    const safeCountry = country.trim().toLowerCase();
    const safeProgram = program.trim().toLowerCase();
    const safeQuestion = securityQuestion.trim().toLowerCase();
    const safeAnswer = securityAnswer.trim().toLowerCase();

    if (!safeName || !safeCountry || !safeProgram || !safeQuestion || !safeAnswer || newPassword.trim().length < 6) {
      throw new Error('Please fill all recovery fields. New password must be at least 6 characters.');
    }

    const allUsers = getData<User[]>(STORAGE_KEYS.USERS, []) ?? [];
    const matchedUser = allUsers.find(
      (user) =>
        user.name.trim().toLowerCase() === safeName &&
        user.country.trim().toLowerCase() === safeCountry &&
        user.program.trim().toLowerCase() === safeProgram &&
        (user.securityQuestion ?? '').trim().toLowerCase() === safeQuestion &&
        (user.securityAnswer ?? '').trim().toLowerCase() === safeAnswer
    );

    if (!matchedUser) {
      throw new Error('No account matched your recovery details. Please verify all fields.');
    }

    const updatedUsers = allUsers.map((user) =>
      user.id === matchedUser.id
        ? { ...user, password: newPassword, updatedAt: Date.now() }
        : user
    );

    setData(STORAGE_KEYS.USERS, updatedUsers);
    return { email: matchedUser.email };
  };

  // Logout current user
  const logout = (): void => {
    removeData(STORAGE_KEYS.CURRENT_USER);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        register,
        login,
        recoverAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
