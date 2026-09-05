import type { LoginResponseEntity } from "@/entities/auth";
import type { School } from "@/entities/school/scholl.entity";
import type { UserPayload } from "@/entities/user/user.entity";
import { AuthService } from "@/services/auth/auth.service";
import { SchoolService } from "@/services/schollService/school.service";
import { AuthStorage } from "@/storages";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: UserPayload | null;
  school: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponseEntity) => void;
  logout: () => void;
  refreshSchool: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    if (AuthStorage.has()) {
      AuthService.logout().catch(() => {
        // best-effort: mesmo se a revogação no servidor falhar, o usuário sai localmente
      });
    }
    AuthStorage.remove();
    setUser(null);
    setSchool(null);
    navigate("/login");
  }, [navigate]);

  const refreshSchool = useCallback(async () => {
    try {
      const schoolData = await SchoolService.get();
      setSchool(schoolData);
    } catch {
      setSchool(null);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!AuthStorage.has()) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await AuthService.me();
      setUser(userData);

      try {
        const schoolData = await SchoolService.get();
        setSchool(schoolData);
      } catch {
        setSchool(null);
      }
    } catch {
      console.error("Failed to fetch user data:");
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchUser();
  }, []);

  const login = useCallback(
    async (data: LoginResponseEntity) => {
      AuthStorage.set(data.accessToken, data.expiresIn, data.refreshToken);

      try {
        const userData = await AuthService.me();
        setUser(userData);

        try {
          const schoolData = await SchoolService.get();
          setSchool(schoolData);
        } catch {
          setSchool(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data after login:", error);
        logout();
        throw error;
      }
    },
    [logout]
  );

  return (
    <AuthContext.Provider
      value={{
        user, 
        school,
        isAuthenticated: AuthStorage.has(),
        isLoading,
        login,
        logout,
        refreshSchool,
      }}
    >
      {!isLoading && children}
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
