// src/components/marketing/HowItWorksSection.tsx

export function HowItWorksSection() {
  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 md:flex-row">
        <div className="md:w-1/3">
          <h2 className="text-xl font-semibold">How it works</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Three steps from an idea to a working AI-friendly repository.
          </p>
        </div>

        <div className="grid flex-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 text-sm">
            <h3 className="font-medium">1. Describe your idea</h3>
            <p className="mt-2 text-muted-foreground">
              Turn a simple text description into PRD and user flows that AI
              can reliably follow.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 text-sm">
            <h3 className="font-medium">2. Get the starter</h3>
            <p className="mt-2 text-muted-foreground">
              Use the prebuilt Next.js + Supabase multi-tenant starter as the
              base of your product.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 text-sm">
            <h3 className="font-medium">3. Build with AI</h3>
            <p className="mt-2 text-muted-foreground">
              Work in Cursor using docs/ and .cursorrules so AI extends the
              product without breaking the architecture.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}