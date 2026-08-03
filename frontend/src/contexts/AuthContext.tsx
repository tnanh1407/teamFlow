import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import accountService, { type Account } from "@/services/account.service";

interface AuthContextType {
  user: Account | null;
  setUser: (user: Account | null) => void;
  logout: () => Promise<void>;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    localStorage.removeItem("user");

    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        const { data } = await accountService.me();
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
      await accountService.logout();
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
