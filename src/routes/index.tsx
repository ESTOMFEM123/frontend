import { Link } from "react-router-dom";
import { ScanLine, ShieldCheck, BarChart3, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section
        className="relative overflow-hidden text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 25% 20%, white 1px, transparent 1px), radial-gradient(circle at 75% 70%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px, 80px 80px",
        }} />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Built for modern campuses
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              Attendance, captured in a single scan.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80 md:text-xl">
              Students generate a personal barcode the moment they sign in. Lecturers scan it. Attendance is recorded instantly — accurate, tamper-proof, and effortless.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/signup">
                  Create account <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything attendance should be</h2>
          <p className="mt-3 text-muted-foreground">
            Designed for both students and administrators with a workflow that takes seconds, not minutes.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: QrCode, title: "Personal barcode", desc: "Each student gets a unique CODE-128 barcode generated from their matric number." },
            { icon: ScanLine, title: "One-tap scanning", desc: "Admins use any device camera to mark attendance — no extra hardware required." },
            { icon: BarChart3, title: "Live records", desc: "Sessions and attendance counts update in real time on the admin dashboard." },
            { icon: ShieldCheck, title: "Role-based access", desc: "Strict separation between student and admin views, protected at the database level." },
            { icon: QrCode, title: "Self-service profile", desc: "Students enter their details once — name, matric, department, level — and the system handles the rest." },
            { icon: BarChart3, title: "Attendance history", desc: "Students see every session they attended; admins export complete logs." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elegant)]">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-primary p-10 text-center text-primary-foreground md:p-16" style={{ boxShadow: "var(--shadow-glow)" }}>
          <h2 className="text-3xl font-bold md:text-4xl">Ready to ditch the paper sheet?</h2>
          <p className="mt-3 text-primary-foreground/80">Sign up in under a minute and generate your barcode immediately.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/signup">Get started <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AttendScan. All rights reserved.
      </footer>
    </div>
  );
}
