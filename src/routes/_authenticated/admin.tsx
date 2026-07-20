import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ScanLine, Users, CalendarDays, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarcodeScanner } from "@/components/BarcodeScanner";

export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && role && role !== "admin") navigate("/student");
  }, [loading, role, navigate]);

  // Sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const data = await api.getSessions();
      return data ?? [];
    },
  });

  // Students
  const { data: students = [] } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const data = await api.getProfiles();
      return data ?? [];
    },
  });

  // Attendance records (all)
  const { data: records = [] } = useQuery({
    queryKey: ["admin-records"],
    queryFn: async () => {
      const data = await api.getAttendanceRecords();
      return data ?? [];
    },
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      const firstActive = sessions.find((s: any) => s.isActive) ?? sessions[0];
      setActiveSessionId(firstActive.id);
    }
  }, [sessions, activeSessionId]);

  const presentCountForActive = useMemo(
    () => records.filter((r: any) => (r.session?.id ?? r.session) === activeSessionId).length,
    [records, activeSessionId],
  );


  // Mutations
  const createSession = useMutation({
    mutationFn: async (vals: { title: string; description: string }) => {
      if (!user) throw new Error("Not signed in");
      await api.createSession({ title: vals.title, description: vals.description || null });
    },
    onSuccess: () => {
      toast.success("Session created");
      qc.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleSession = useMutation({
    mutationFn: async (s: any) => {
      await api.toggleSession(s.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sessions"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      await api.deleteSession(id);
    },
    onSuccess: () => {
      toast.success("Session deleted");
      qc.invalidateQueries({ queryKey: ["admin-sessions"] });
      qc.invalidateQueries({ queryKey: ["admin-records"] });
    },
  });

  const markByMatric = async (matric: string) => {
    if (!activeSessionId) { toast.error("Select a session first"); return; }
    if (!user) return;
    const session = sessions.find((s: any) => s.id === activeSessionId);
    if (!session?.isActive) { toast.error("This session is closed"); return; }

    try {
      await api.markAttendance({ sessionId: activeSessionId, matricNumber: matric.trim() });
      toast.success(`✓ Marked attendance for ${matric.trim()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not mark attendance");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-records"] });
  };

  // Scanner dialog state
  const [scanOpen, setScanOpen] = useState(false);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [manualMatric, setManualMatric] = useState("");

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="text-muted-foreground">Create sessions, scan student barcodes, and review attendance.</p>
        </div>
        <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1.5 h-4 w-4" /> New session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create attendance session</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="t">Title</Label>
                <Input id="t" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="CSC 301 — Lecture 7" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d">Description (optional)</Label>
                <Textarea id="d" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewSessionOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!newTitle.trim()) return toast.error("Title required");
                await createSession.mutateAsync({ title: newTitle.trim(), description: newDesc.trim() });
                setNewTitle(""); setNewDesc(""); setNewSessionOpen(false);
              }} disabled={createSession.isPending}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard icon={CalendarDays} label="Total sessions" value={sessions.length} />
        <StatCard icon={ScanLine} label="Present in active session" value={presentCountForActive} />
      </div>

      {/* Scan + session control */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Mark attendance</CardTitle>
              <Badge variant={sessions.find((s:any) => s.id === activeSessionId)?.isActive ? "default" : "secondary"}>
              {sessions.find((s:any) => s.id === activeSessionId)?.isActive ? "Session open" : "Session closed"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Active session</Label>
              <Select value={activeSessionId ?? ""} onValueChange={setActiveSessionId}>
                <SelectTrigger><SelectValue placeholder="Select a session" /></SelectTrigger>
                <SelectContent>
                  {sessions.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} {s.isActive ? "" : "(closed)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Dialog open={scanOpen} onOpenChange={setScanOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!activeSessionId}><ScanLine className="mr-1.5 h-4 w-4" /> Open scanner</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Scan student barcode</DialogTitle></DialogHeader>
                  {scanOpen && (
                    <BarcodeScanner
                      onDetected={(val) => markByMatric(val)}
                      onError={(e) => toast.error(`Camera: ${e}`)}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">Point the camera at the student's barcode. The scanner keeps running so you can scan multiple students in a row.</p>
                </DialogContent>
              </Dialog>

              <form
                className="flex flex-1 min-w-[240px] items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!manualMatric.trim()) return;
                  markByMatric(manualMatric);
                  setManualMatric("");
                }}
              >
                <Input placeholder="Or enter matric manually" value={manualMatric} onChange={(e) => setManualMatric(e.target.value)} />
                <Button type="submit" variant="secondary">Mark</Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[360px] overflow-y-auto">
            {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
            {sessions.map((s: any) => (
              <div key={s.id} className={`flex items-center justify-between rounded-lg border p-3 ${activeSessionId === s.id ? "border-primary bg-primary/5" : "border-border"}`}>
                <button onClick={() => setActiveSessionId(s.id)} className="flex-1 text-left">
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                </button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleSession.mutate(s)} title={s.isActive ? "Close session" : "Reopen session"}>
                    <Power className={`h-4 w-4 ${s.isActive ? "text-[color:var(--color-success)]" : "text-muted-foreground"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this session and all its records?")) deleteSession.mutate(s.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>


      {/* Recent attendance */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent attendance records</h2>
            <p className="text-sm text-muted-foreground">Latest 200 entries across all sessions.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Matric</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead className="text-right">Marked at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No attendance records yet.</TableCell></TableRow>
                )}
                {records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.student?.fullName ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{r.student?.matricNumber ?? "—"}</TableCell>
                    <TableCell>{r.student?.department ?? "—"}</TableCell>
                    <TableCell>{r.session?.title ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>


    </main>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
