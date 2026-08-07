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

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

type AuthContextType = {
  token: string | null;
  userDTO: User | null;
  isAuthenticated: boolean;
  login: (jwtToken: string, userData: User, refreshToken?: string) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

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
      setUser(refreshedUser ? JSON.parse(refreshedUser) : null);
    };

    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, syncRefreshedSession);
    return () => {
      window.removeEventListener(
        AUTH_SESSION_UPDATED_EVENT,
        syncRefreshedSession,
      );
    };
  }, []);

  const login = (
    jwtToken: string,
    userData: User,
    refreshToken?: string,
  ) => {
    setAuthSession(jwtToken, refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userDTO: user,
        isAuthenticated,
        login,
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
