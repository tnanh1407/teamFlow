import { LoginForm } from "@/components/login-form";

export default function Login() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 bg-linear-to-b from-background via-muted/20 to-background">
      <div className="w-full max-w-md p-8 border border-border bg-card text-card-foreground rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
        <LoginForm />
      </div>
    </div>
  );
}

