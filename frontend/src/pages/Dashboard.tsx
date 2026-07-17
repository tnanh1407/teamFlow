import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              <strong>{user.username}</strong> • <span className="uppercase text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.role}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        )}
      </div>
      <p className="text-muted-foreground">Welcome to your dashboard.</p>
    </div>
  );
}
