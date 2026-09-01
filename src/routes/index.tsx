import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Boxes, FileSearch, Layers, Lock, Repeat2, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, homeForRoles } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockFlow Africa — Central Stores. Departmental Stores. Complete Control." },
      {
        name: "description",
        content:
          "Enterprise inventory and stores management for schools, farms, hotels, NGOs and institutions across Africa. Every stock movement traced end to end.",
      },
      { property: "og:title", content: "StockFlow Africa — Inventory & Stores Management" },
      {
        property: "og:description",
        content: "Central stores, departmental stores, stock ledger, valuation and complete audit trails.",
      },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Layers,
    title: "Immutable stock ledger",
    body: "Every receipt, issue, transfer, breakage and loss is written once and never edited. Corrections are posted as reversals.",
  },
  {
    icon: Store,
    title: "Central & departmental stores",
    body: "Model a central store alongside kitchen, poultry, tuckshop, fuel and maintenance stores, each with its own balances.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based control",
    body: "Seven roles from platform owner to auditor, backed by a permission catalogue rather than hard-coded role checks.",
  },
  {
    icon: Lock,
    title: "True multi-tenancy",
    body: "Organization isolation is enforced in the database with row level security, not by frontend filtering.",
  },
  {
    icon: Repeat2,
    title: "Built to extend",
    body: "Requisitions, goods receiving, stocktakes, valuation, fuel and barcode modules drop onto this core without rework.",
  },
  {
    icon: FileSearch,
    title: "Complete audit trail",
    body: "Who, what, when, where, how much, at what cost, why — recorded for every meaningful action in the system.",
  },
];

function Landing() {
  const { loading, session, roles } = useAuth();
  const destination = session ? homeForRoles(roles) : "/auth";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="size-4.5" aria-hidden />
            </span>
            <span className="font-semibold tracking-tight">StockFlow Africa</span>
          </div>
          <Button asChild size="sm" disabled={loading}>
            <Link to={destination}>{session ? "Open dashboard" : "Sign in"}</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BadgeCheck className="size-3.5 text-primary" aria-hidden /> Build 01 — core inventory platform
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Central Stores. Departmental Stores. Complete Control.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            StockFlow Africa is an enterprise inventory and stores management platform for schools, colleges, NGOs,
            farms, hotels, warehouses and government institutions. No stock moves without a trace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={destination}>{session ? "Open dashboard" : "Get started"}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Sign in to your organization</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-card/60">
          <div className="mx-auto grid w-full max-w-6xl gap-px overflow-hidden px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className="p-5">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/8 text-primary">
                  <pillar.icon className="size-4.5" aria-hidden />
                </span>
                <h2 className="mt-4 text-base font-semibold text-foreground">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto w-full max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          StockFlow Africa — Central Stores. Departmental Stores. Complete Control.
        </div>
      </footer>
    </div>
  );
}
