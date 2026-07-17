import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to TeamFlow</h1>
      <p className="text-lg text-muted-foreground">
        Your team collaboration platform.
      </p>
      {user && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">
            Xin chào, <strong>{user.username}</strong> • <span className="uppercase text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.role}</span>
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      )}
    </div>
  );
}
