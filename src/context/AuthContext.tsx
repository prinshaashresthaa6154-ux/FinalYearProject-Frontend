/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_SESSION_UPDATED_EVENT,
  setAuthSession,
} from "../api/axios";
import { authService, getAuthUser } from "../services/authService";

export type User = {
  id: number;
  username?: string;
  email: string;
  role: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string | null;
  emailVerified?: boolean;
  accountStatus?: string;
  verificationStatus?: string;
  approvalStatus?: string;
  guideApprovalStatus?: string;
  userStatus?: string;
  roleVerified?: boolean;
  rejectionReason?: string;
  resubmissionAllowed?: boolean;
};

type AuthContextType = {
  token: string | null;
  userDTO: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (jwtToken: string, userData: User, refreshToken?: string) => void;
  updateUser: (userData: User) => void;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readStoredUser = (): User | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState<User | null>(() => {
    return readStoredUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(Boolean(token));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setIsAuthenticated(false);
    }
  }, [token, user]);

  useEffect(() => {
    const syncRefreshedSession = () => {
      const refreshedToken = localStorage.getItem("token");
      const refreshedUser = localStorage.getItem("user");

      setToken(refreshedToken);
      if (!refreshedUser) {
        setUser(null);
      } else {
        try {
          setUser(JSON.parse(refreshedUser) as User);
        } catch {
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsAuthenticated(Boolean(refreshedToken));
      setIsAuthLoading(Boolean(refreshedToken));
    };

    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, syncRefreshedSession);
    return () => {
      window.removeEventListener(
        AUTH_SESSION_UPDATED_EVENT,
        syncRefreshedSession,
      );
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    let cancelled = false;
    setIsAuthLoading(true);
    authService
      .getCurrentUser(token)
      .then((response) => {
        if (cancelled) return;
        const currentUser = getAuthUser(response.data);
        if (!currentUser) {
          localStorage.removeItem("user");
          setUser(null);
          return;
        }
        const restoredUser = { ...user, ...currentUser };
        localStorage.setItem("user", JSON.stringify(restoredUser));
        setUser(restoredUser);
      })
      .catch(() => {
        // Expired sessions are handled by the axios interceptor.
        if (!cancelled) {
          localStorage.removeItem("user");
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = (
    jwtToken: string,
    userData: User,
    refreshToken?: string,
  ) => {
    setAuthSession(jwtToken, refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    setIsAuthenticated(true);
    setIsAuthLoading(false);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Local session removal must still succeed when the token is expired.
      }
    }

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAuthLoading(false);

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userDTO: user,
        isAuthenticated,
        isAuthLoading,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
