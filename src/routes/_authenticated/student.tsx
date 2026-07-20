import { useNavigate } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Calendar, GraduationCap, IdCard, Building2, ScanLine, Sparkles, History } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Barcode } from "@/components/Barcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentDashboard() {
  const { user, role, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  // Barcode generator dialog state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [generated, setGenerated] = useState<{ name: string; matric: string } | null>(null);

  useEffect(() => {
    if (!loading && role && role !== "student") navigate("/admin");
  }, [loading, role, navigate]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Prefill form once profile loads
  useEffect(() => {
    if (profile) {
      setName((n) => n || profile.fullName);
      setMatric((m) => m || profile.matricNumber);
    }
  }, [profile]);

  const { data: attendance = [] } = useQuery({
    queryKey: ["student-attendance", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const data = await api.getMyAttendance();
      return data ?? [];
    },
  });

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !matric.trim()) return;
    setGenerated({ name: name.trim(), matric: matric.trim() });
    setOpen(false);
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">Loading your profile…</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      {/* Hero / welcome */}
      <section className="overflow-hidden rounded-2xl text-primary-foreground shadow-[var(--shadow-elegant)]" style={{ background: "var(--gradient-hero)" }}>
        <div className="grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
          <div>
            <p className="text-sm text-primary-foreground/70">{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Welcome back, {profile.fullName.split(" ")[0]} 👋</h1>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              This is your attendance home. Generate your barcode whenever your lecturer is ready to mark attendance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" onClick={() => setOpen(true)} className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate barcode
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                onClick={() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" })}
              >
                <History className="mr-1 h-4 w-4" /> View history
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-center">
            <Stat label="Sessions attended" value={attendance.length.toString()} />
            <Stat label="Level" value={profile.level || "—"} />
            <Stat label="Department" value={profile.department || "—"} className="col-span-2" />
          </div>
        </div>
      </section>

      {/* Quick actions + profile */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your attendance barcode</CardTitle>
          </CardHeader>
          <CardContent>
            {generated ? (
              <div className="rounded-xl border bg-white p-6">
                <div className="flex flex-col items-center">
                  <Barcode value={generated.matric} />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">Generated for</p>
                    <p className="font-semibold">{generated.name}</p>
                    <p className="text-sm font-mono text-muted-foreground">{generated.matric}</p>
                  </div>
                </div>
                <div className="mt-5 flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Regenerate</Button>
                  <Button size="sm" onClick={() => setGenerated(null)}>Hide</Button>
                </div>
              </div>
            ) : (
              <div className="grid place-items-center rounded-xl border border-dashed bg-muted/30 px-6 py-14 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <ScanLine className="h-6 w-6" />
                </div>
                <p className="mt-4 font-medium">No barcode generated yet</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Click the button below, enter your name and matric number, and your barcode will appear here for your lecturer to scan.
                </p>
                <Button className="mt-5 gap-2" onClick={() => setOpen(true)}>
                  <Sparkles className="h-4 w-4" /> Generate barcode
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={IdCard} label="Full name" value={profile.fullName} />
            <Row icon={GraduationCap} label="Matric number" value={profile.matricNumber} />
            <Row icon={Building2} label="Department" value={profile.department} />
            <Row icon={Calendar} label="Level" value={profile.level} />
          </CardContent>
        </Card>
      </section>

      {/* Attendance history */}
      <section id="history" className="mt-10 scroll-mt-20">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Attendance history</h2>
            <p className="text-sm text-muted-foreground">Sessions where you were marked present.</p>
          </div>
          <Badge variant="secondary">{attendance.length} total</Badge>
        </div>

        {attendance.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No attendance recorded yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {attendance.map((r: any) => (
              <Card key={r.id} className="transition hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{r.session?.title ?? "Session"}</p>
                      {r.session?.description && <p className="text-xs text-muted-foreground">{r.session.description}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Generate dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate your barcode</DialogTitle>
            <DialogDescription>Confirm your name and matric number. Your barcode will be created instantly.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="gen-name">Full name</Label>
              <Input id="gen-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen-matric">Matric number</Label>
              <Input id="gen-matric" value={matric} onChange={(e) => setMatric(e.target.value)} maxLength={50} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Generate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur ${className}`}>
      <p className="text-xs uppercase tracking-wide text-primary-foreground/70">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}
