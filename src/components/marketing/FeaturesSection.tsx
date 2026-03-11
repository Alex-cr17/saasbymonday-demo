// src/components/marketing/FeaturesSection.tsx

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="text-xl font-semibold">Features</h2>

      <div className="mt-6 grid gap-6 text-sm md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Multi-tenant ready</h3>
          <p className="mt-2 text-muted-foreground">
            Shared-schema model with tenant_id on all business tables.
            Simple to reason about, easy to scale.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">AI-friendly docs</h3>
          <p className="mt-2 text-muted-foreground">
            PRD, data models, app structure and user flows designed to be used
            as high-quality context for LLMs.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Production-grade UI</h3>
          <p className="mt-2 text-muted-foreground">
            Tailwind + shadcn/ui, a ready dashboard shell and a complete
            Projects CRUD example as a pattern for new features.
          </p>
        </div>
      </div>
    </section>
  );
}