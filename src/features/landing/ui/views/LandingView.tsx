import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppButton } from '../../../../core/widgets';
import { useAppSelector } from '../../../../app/hooks';
import { Reveal } from '../widgets/Reveal';

const FEATURES = [
  {
    icon: '🎟️',
    title: 'Ticket management',
    body: 'Capture, triage and resolve requests on a board built for momentum — not busywork.',
  },
  {
    icon: '👥',
    title: 'Team collaboration',
    body: 'Sprints, epics and timelines keep everyone aligned without a single status meeting.',
  },
  {
    icon: '🔐',
    title: 'Role-based access',
    body: 'Granular permissions per team, label and workflow. You decide who sees what.',
  },
];

const STEPS = [
  { n: '01', title: 'Sign up', body: 'Create your workspace in seconds — you become its admin.' },
  {
    n: '02',
    title: 'Invite your team',
    body: 'Add members and assign roles tailored to how you work.',
  },
  {
    n: '03',
    title: 'Track everything',
    body: 'Tickets, sprints and progress, all in one calm place.',
  },
];

const STATS = [
  { value: '500+', label: 'teams onboarded' },
  { value: '10k', label: 'tickets resolved' },
  { value: '99.9%', label: 'uptime' },
  { value: '4.9/5', label: 'customer rating' },
];

export default function LandingView() {
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.auth.status);

  // Authenticated visitors skip the marketing page.
  useEffect(() => {
    if (status === 'authenticated') navigate('/app', { replace: true });
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-canvas text-content">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-surface-border/60 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="h-7 w-0.5 rounded-pill bg-accent" />
            <span className="text-lg font-bold tracking-tight">HelpDesk Lite</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/login">
              <AppButton variant="ghost" size="sm">
                Sign in
              </AppButton>
            </Link>
            <Link to="/signup">
              <AppButton variant="accent" size="sm">
                Get started
              </AppButton>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="hd-aurora pointer-events-none absolute -right-1/4 -top-1/4 h-[60rem] w-[60rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,106,0.35) 0%, rgba(20,33,61,0) 60%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-32">
          <div>
            <span className="hd-animate-fade-up inline-flex items-center gap-2 rounded-pill border border-primary-foreground/15 bg-primary-foreground/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-label text-accent">
              ✦ Support, refined
            </span>
            <h1
              className="hd-animate-fade-up mt-6 text-4xl font-bold leading-[1.05] tracking-tightest sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              The help desk your
              <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                {' '}
                team actually loves.
              </span>
            </h1>
            <p
              className="hd-animate-fade-up mt-6 max-w-md text-base leading-relaxed text-primary-foreground/70 sm:text-lg"
              style={{ animationDelay: '0.2s' }}
            >
              Spin up your own workspace, invite your team, and resolve what matters — without the
              noise. Built for teams that move fast.
            </p>
            <div
              className="hd-animate-fade-up mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '0.3s' }}
            >
              <Link to="/signup">
                <AppButton variant="accent" size="lg">
                  Get started free →
                </AppButton>
              </Link>
              <Link to="/login">
                <AppButton
                  variant="ghost"
                  size="lg"
                  className="border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Sign in
                </AppButton>
              </Link>
            </div>
            <p
              className="hd-animate-fade-up mt-5 text-xs text-primary-foreground/50"
              style={{ animationDelay: '0.4s' }}
            >
              No credit card · Free to start · Set up in under a minute
            </p>
          </div>

          {/* Floating mockup card */}
          <div className="relative hidden lg:block">
            <div className="hd-float rounded-card border border-primary-foreground/10 bg-primary-foreground/[0.06] p-5 shadow-elevated backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger/80" />
                <span className="h-3 w-3 rounded-full bg-warning/80" />
                <span className="h-3 w-3 rounded-full bg-success/80" />
                <span className="ml-auto text-xs text-primary-foreground/40">board</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { t: 'Fix login redirect', s: 'In progress', c: 'bg-status-inProgress' },
                  { t: 'Onboard new team', s: 'To do', c: 'bg-status-todo' },
                  { t: 'Ship landing page', s: 'Done', c: 'bg-status-done' },
                ].map((row) => (
                  <div
                    key={row.t}
                    className="flex items-center justify-between rounded-control bg-primary-foreground/5 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-primary-foreground/90">{row.t}</span>
                    <span className="flex items-center gap-2 text-xs text-primary-foreground/60">
                      <span className={`h-2 w-2 rounded-full ${row.c}`} />
                      {row.s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hd-float-slow absolute -bottom-8 -left-10 rounded-card border border-accent/30 bg-accent/10 px-5 py-4 shadow-elevated backdrop-blur-xl">
              <p className="text-2xl font-bold text-accent">+38%</p>
              <p className="text-xs text-primary-foreground/60">faster resolution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            One workspace. Zero chaos.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="h-full rounded-card border border-surface-border bg-surface p-7 shadow-card transition-transform duration-300 hover:-translate-y-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-control bg-accent-subtle text-2xl">
                  {f.icon}
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-surface-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Live in three steps.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <span className="text-5xl font-bold tracking-tightest text-accent/40">{s.n}</span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / social proof */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="overflow-hidden rounded-card border border-surface-border bg-gradient-to-br from-surface to-surface-muted p-10 shadow-card backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold tracking-tightest text-content sm:text-5xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-content-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="hd-aurora pointer-events-none absolute -left-1/4 top-0 h-[40rem] w-[40rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,106,0.3) 0%, rgba(20,33,61,0) 60%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to refine your support?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
              Create your workspace today. Your team will thank you.
            </p>
            <div className="mt-9 flex justify-center">
              <Link to="/signup">
                <AppButton variant="accent" size="lg">
                  Get started free →
                </AppButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="h-6 w-0.5 rounded-pill bg-accent" />
            <span className="font-bold tracking-tight">HelpDesk Lite</span>
          </div>
          <p className="text-xs text-content-subtle">
            © {new Date().getFullYear()} HelpDesk Lite. Support, refined.
          </p>
        </div>
      </footer>
    </div>
  );
}
