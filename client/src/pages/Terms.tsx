export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold font-display text-foreground">
          Terms & Conditions
        </h1>
        <p className="text-muted-foreground mt-2">Last updated: January 2026</p>
      </div>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Independent Contractors
          </h2>
          <p>
            All contractors using Tree-Lance are independent service providers.
            Tree-Lance does not employ, supervise, or guarantee the performance
            of any contractor. Contractors are fully responsible for their
            services, equipment, safety, and compliance with local regulations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Liability
          </h2>
          <p>
            Tree-Lance is a technology platform connecting homeowners and
            contractors. Tree-Lance assumes no liability for any damages,
            injuries, property loss, or service failures caused by contractors
            or homeowners. All disputes are between the contractor and homeowner
            directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Payments
          </h2>
          <p>
            Payments are processed via Stripe. Tree-Lance automatically collects
            a 20% service fee. Contractors receive 80% of the job payment.
            Tree-Lance is not responsible for contractor performance or refunds
            beyond processing the payment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Insurance
          </h2>
          <p>
            Contractors are required to maintain valid insurance, licensing, and
            bonding. Tree-Lance may verify documentation but assumes no
            responsibility for contractor coverage or claims.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Homeowner Responsibilities
          </h2>
          <p>
            Homeowners must provide accurate job descriptions and ensure access
            to the worksite. Tree-Lance does not guarantee job completion beyond
            connecting homeowners to contractors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Governing Law
          </h2>
          <p>
            These terms are governed by the laws of the state in which
            Tree-Lance operates. Any disputes shall be resolved in the
            applicable courts.
          </p>
        </section>
      </div>
    </div>
  );
}
