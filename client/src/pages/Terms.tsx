export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold font-display text-foreground">
          Tree-Lance Terms & Conditions
        </h1>
        <p className="text-muted-foreground mt-2">Key Points</p>
      </div>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            1. Independent Contractors
          </h2>
          <p>
            All contractors using Tree-Lance are independent service providers. Tree-Lance does not employ, supervise, or guarantee any contractor's services. Contractors are solely responsible for their work, equipment, safety, and compliance with local laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            2. Liability
          </h2>
          <p>
            Tree-Lance is a technology platform connecting homeowners and contractors. Tree-Lance assumes no liability for damages, injuries, property loss, or service failures. All disputes are strictly between the contractor and the homeowner.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            3. Payments
          </h2>
          <p>
            Payments are processed via Stripe. Tree-Lance collects a 20% service fee, and contractors receive 80% of the job payment. Tree-Lance is not responsible for contractor performance, refunds, or disputes beyond payment processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            4. Insurance & Licensing
          </h2>
          <p>
            Contractors must maintain valid insurance, licensing, and bonding. Tree-Lance may verify documentation but assumes no responsibility for coverage, claims, or compliance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            5. Homeowner Responsibilities
          </h2>
          <p>
            Homeowners must provide accurate job descriptions and ensure access to the worksite. Tree-Lance does not guarantee job completion beyond connecting homeowners to contractors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            6. Governing Law
          </h2>
          <p>
            These terms are governed by the laws of the state in which Tree-Lance operates. Any disputes shall be resolved in the appropriate state courts.
          </p>
        </section>
      </div>
    </div>
  );
}
