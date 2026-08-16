import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  AuthContextType,
  SignUpRequest,
  SignInRequest,
  User,
} from "../types/auth";

import {
  authAPI,
  AuthAPIError,
} from "../services/authApi";

const STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);
    console.log(error) // To test

  // =========================================================
  // Token helpers
  // =========================================================

  const getToken = useCallback(
    (): string | null => {
      return localStorage.getItem(
        STORAGE_KEY
      );
    },
    []
  );

  const setToken = useCallback(
    (token: string): void => {
      localStorage.setItem(
        STORAGE_KEY,
        token
      );
    },
    []
  );

  const clearToken = useCallback(
    (): void => {
      localStorage.removeItem(
        STORAGE_KEY
      );

      localStorage.removeItem(
        USER_STORAGE_KEY
      );
    },
    []
  );

  // =========================================================
  // Initialize authentication
  // =========================================================

  useEffect(() => {
    const initializeAuth =
      async () => {
        const token = getToken();

        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          /*
           * Don't trust the user object in localStorage.
           *
           * We have a token, so ask the backend
           * who the authenticated user is.
           */
          const currentUser =
            await authAPI.getMe(token);

          setUser(currentUser);

          localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(currentUser)
          );
        } catch (err) {
          console.error(
            "Failed to restore authentication:",
            err
          );

          /*
           * Token is invalid/expired or user
           * no longer exists.
           */
          clearToken();

          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };

    initializeAuth();
  }, [getToken, clearToken]);

  // =========================================================
  // Sign up
  // =========================================================

  const signUp = useCallback(
    async (
      request: SignUpRequest
    ): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await authAPI.signUp(request);

        /*
         * Signup currently returns:
         *
         * {
         *   user: {...}
         * }
         *
         * It does NOT return an access token.
         *
         * Therefore we only store the user here.
         */
        if (response.user) {
          setUser(response.user);

          localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(response.user)
          );
        }
      } catch (err) {
        if (err instanceof AuthAPIError) {
          setError(err.detail);
          throw err;
        }

        const errorMsg =
          err instanceof Error
            ? err.message
            : "Sign up failed";

        setError(errorMsg);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // =========================================================
  // Sign in
  // =========================================================

  const signIn = useCallback(
    async (
      request: SignInRequest
    ): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        /*
         * Step 1:
         * Login and receive JWT.
         */
        const response =
          await authAPI.signIn(request);

        console.log(
          "LOGIN RESPONSE:",
          response
        );

        /*
         * Step 2:
         * Store JWT.
         */
        setToken(
          response.access_token
        );

        /*
         * Step 3:
         * Use JWT to get the actual
         * authenticated user.
         */
        const currentUser =
          await authAPI.getMe(
            response.access_token
          );

        console.log(
          "CURRENT USER:",
          currentUser
        );

        /*
         * Step 4:
         * Update React auth state.
         *
         * This causes:
         *
         * isAuthenticated
         *     ↓
         * true
         *
         * and RootContent changes:
         *
         * AuthPage → App
         */
        setUser(currentUser);

        /*
         * Step 5:
         * Persist user information.
         */
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(currentUser)
        );
      } catch (err) {
        /*
         * If login succeeded but /me failed,
         * don't leave an invalid/partial auth
         * state behind.
         */
        clearToken();
        setUser(null);

        if (err instanceof AuthAPIError) {
          setError(err.detail);
          throw err;
        }

        const errorMsg =
          err instanceof Error
            ? err.message
            : "Sign in failed";

        setError(errorMsg);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setToken, clearToken]
  );

  // =========================================================
  // Sign out
  // =========================================================

  const signOut = useCallback(
    (): void => {
      clearToken();

      setUser(null);

      setError(null);
    },
    [clearToken]
  );

  // =========================================================
  // Context value
  // =========================================================

  const value: AuthContextType = {
    user,

    isAuthenticated:
      user !== null,

    isLoading,

    signUp,

    signIn,

    signOut,

    getToken,

    setToken,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================================================
// useAuth
// =========================================================

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}