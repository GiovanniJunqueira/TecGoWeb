import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthStorage } from "../../storages";
import type { User } from "@/entities/user/user.entity";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  validateSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateSession = useCallback((): boolean => {
    const hasToken = AuthStorage.has();

    if (!hasToken) return false;

    return true;
  }, []);

  const checkAuthentication = useCallback(() => {
    const isValid = validateSession();

    if (isValid) {
      const payload = AuthStorage.decode();

      if (payload?.user && Object.keys(payload.user).length > 0) {
        setUser(payload.user as User);
        setIsLoading(false);
        return;
      } else {
        logout();
        return;
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [validateSession]);

  const login = useCallback(
    (token: string) => {
      setIsLoading(true);
      AuthStorage.set(token);
      checkAuthentication();
    },
    [checkAuthentication]
  );

  const logout = useCallback(() => {
    setIsLoading(true);

    AuthStorage.remove();
    setUser(null);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 0);
  }, [navigate]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: AuthStorage.has(),
        isLoading,
        login,
        logout,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
