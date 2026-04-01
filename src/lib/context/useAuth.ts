// src/context/useAuth.ts
import { useContext } from "react";
import { AuthStateContext, AuthActionsContext } from "./authState";

/**
 * Hook: useAuth
 * - Returns combined state + actions for consumers.
 * - Throws if used outside the provider.
 */
export function useAuth() {
  const state = useContext(AuthStateContext);
  const actions = useContext(AuthActionsContext);

  if (!state || !actions) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return {
    user: state.user,
    accessToken: state.accessToken,
    loading: state.loading,
    login: actions.login,
    signup: actions.signup,
    logout: actions.logout,
    state
  };
}
