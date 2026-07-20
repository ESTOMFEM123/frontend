import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refresh, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem("token", data.token);
      await refresh();
      toast.success("Welcome back");
      const target = data.user.role === "admin" ? "/admin" : "/student";
      setTimeout(() => {
        navigate(target);
      }, 50);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 backdrop-blur">
            <ScanLine className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">AttendScan</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">A modern attendance system that just works.</h2>
          <p className="mt-3 text-primary-foreground/80">Sign in to view your barcode or manage today's sessions.</p>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} AttendScan</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ScanLine className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">AttendScan</span>
          </Link>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Enter your credentials to access your dashboard.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
