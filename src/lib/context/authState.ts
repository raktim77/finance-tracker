// src/context/authState.ts
import React from "react";

/**
 * Shared types for auth state & actions
 */

export type Profile = {
  avatar_url: string;
  vio: string;
}

export type User = {
  id: string;
  email: string;
  name?: string;
  profile?: Profile;
} | null;

export type AuthState = {
  user: User;
  accessToken: string | null;
  loading: boolean;
};

export type LoginResult = { ok: true } | { ok: false; error?: string };

export type AuthActions = {
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

/**
 * Two separate contexts: state & actions.
 * These live in this file (no components exported here).
 */
export const AuthStateContext = React.createContext<AuthState | undefined>(
  undefined
);
export const AuthActionsContext = React.createContext<AuthActions | undefined>(
  undefined
);
