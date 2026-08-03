import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from "react";
import userService, { type User } from "@/services/user.service";

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  logout: () => Promise<void>;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    localStorage.removeItem("user");

    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        const { data } = await userService.me();
        if (!cancelled) {
          setUser(data.data);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    try {
      await userService.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
