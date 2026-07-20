import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const studentSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  matric_number: z.string().trim().min(2).max(40).regex(/^[a-zA-Z0-9/-]+$/, "Only letters, numbers, / and -"),
  department: z.string().trim().min(2).max(80),
  level: z.string().trim().min(1).max(20),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function SignupPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [tab, setTab] = useState<"student" | "admin">("student");

  // student form
  const [s, setS] = useState({ full_name: "", matric_number: "", department: "", level: "", email: "", password: "" });
  // admin form
  const [a, setA] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submitStudent = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = studentSchema.safeParse(s);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const data = await api.register({
        fullName: s.full_name,
        matricNumber: s.matric_number,
        department: s.department,
        level: s.level,
        email: s.email,
        password: s.password,
        role: "student",
      });
      localStorage.setItem("token", data.token);
      await refresh();
      toast.success("Account created and signed in.");
      navigate(data.user.role === "admin" ? "/admin" : "/student");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const submitAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (a.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const data = await api.register({
        fullName: a.full_name,
        email: a.email,
        password: a.password,
        role: "admin",
      });
      localStorage.setItem("token", data.token);
      await refresh();
      toast.success("Admin account created and signed in.");
      navigate(data.user.role === "admin" ? "/admin" : "/student");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
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
          <h2 className="text-3xl font-bold leading-tight">Your barcode is generated the moment you sign up.</h2>
          <p className="mt-3 text-primary-foreground/80">Students get a unique CODE-128 barcode. Admins get a scanner and a live dashboard.</p>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} AttendScan</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Choose whether you're joining as a student or administrator.</p>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "student" | "admin")} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-6">
              <form onSubmit={submitStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" required value={s.full_name} onChange={(e) => setS({ ...s, full_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="matric">Matric / Student ID</Label>
                    <Input id="matric" required value={s.matric_number} onChange={(e) => setS({ ...s, matric_number: e.target.value })} placeholder="CSC/19/1234" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="level">Level / Year</Label>
                    <Input id="level" required value={s.level} onChange={(e) => setS({ ...s, level: e.target.value })} placeholder="300" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" required value={s.department} onChange={(e) => setS({ ...s, department: e.target.value })} placeholder="Computer Science" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s_email">Email</Label>
                  <Input id="s_email" type="email" required value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s_password">Password</Label>
                  <Input id="s_password" type="password" required value={s.password} onChange={(e) => setS({ ...s, password: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <form onSubmit={submitAdmin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="a_name">Full name</Label>
                  <Input id="a_name" required value={a.full_name} onChange={(e) => setA({ ...a, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a_email">Email</Label>
                  <Input id="a_email" type="email" required value={a.email} onChange={(e) => setA({ ...a, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a_password">Password</Label>
                  <Input id="a_password" type="password" required value={a.password} onChange={(e) => setA({ ...a, password: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
