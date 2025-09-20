import { useEffect, useMemo, useRef, useState } from "react";

export default function NgoCampaignTerms() {
  const contentRef = useRef(null);
  const [agree, setAgree] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct = Math.min(100, Math.max(0, (el.scrollTop / Math.max(1, max)) * 100));
      setProgress(pct);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const sections = useMemo(
    () => [
      { id: "intro", title: "Introduction" },
      { id: "eligibility", title: "Eligibility & Authenticity" },
      { id: "docs", title: "Documents & Evidence" },
      { id: "funds", title: "Funds, Disbursal & Use" },
      { id: "transparency", title: "Transparency & Reporting" },
      { id: "data", title: "Data & Privacy" },
      { id: "ai", title: "AI Pre‑Screening" },
      { id: "compliance", title: "Legal & Compliance" },
      { id: "termination", title: "Suspension & Termination" },
      { id: "liability", title: "Liability & Indemnity" },
      { id: "changes", title: "Changes to Terms" },
      { id: "acceptance", title: "Acceptance" },
    ],
    []
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur border-b border-indigo-100/70 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">A</div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800">AidVerify — NGO Campaign Terms</h1>
            <p className="text-xs text-slate-500">Last updated: 29 Aug 2025</p>
          </div>
          <div className="w-40 h-2 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[76px] self-start">
          <nav className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Contents</p>
            <ul className="space-y-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-lg px-3 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main
          ref={contentRef}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm max-h-[calc(100dvh-150px)] overflow-y-auto p-6 sm:p-8"
        >
          <Section id="intro" title="Introduction">
            <p>
              These terms govern listing of campaigns by registered NGOs on AidVerify. By submitting a
              campaign, you agree to provide accurate information, comply with applicable laws, and
              maintain full transparency on fund utilization.
            </p>
          </Section>

          <Section id="eligibility" title="Eligibility & Authenticity">
            <ul className="list-disc pl-5 space-y-2">
              <li>Only legally registered NGOs may apply; valid registration proof is mandatory.</li>
              <li>Information provided must be true, complete, and up‑to‑date.</li>
              <li>Impersonation or misrepresentation will lead to immediate removal and blacklisting.</li>
            </ul>
          </Section>

          <Section id="docs" title="Documents & Evidence">
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload clear scans of registration, authorization, and banking documents.</li>
              <li>Provide field images/videos and external links supporting your cause.</li>
              <li>We may request additional verification at any time.</li>
            </ul>
          </Section>

          <Section id="funds" title="Funds, Disbursal & Use">
            <ul className="list-disc pl-5 space-y-2">
              <li>Funds raised must be used solely for the stated campaign objectives.</li>
              <li>All withdrawals/disbursals may require KYC and compliance checks.</li>
              <li>Misuse of funds will result in suspension and recovery actions.</li>
            </ul>
          </Section>

          <Section id="transparency" title="Transparency & Reporting">
            <ul className="list-disc pl-5 space-y-2">
              <li>Submit expense reports with itemized bills, vendor details, and dates.</li>
              <li>Receipts/bills must be uploaded; entries are anchored to an immutable ledger.</li>
              <li>Provide periodic impact updates (photos, videos, stories) for donor visibility.</li>
            </ul>
          </Section>

          <Section id="data" title="Data & Privacy">
            <ul className="list-disc pl-5 space-y-2">
              <li>We process your data to verify campaigns and operate the platform.</li>
              <li>Do not upload sensitive personal data of beneficiaries without consent.</li>
              <li>Review our Privacy Policy for details on retention and rights.</li>
            </ul>
          </Section>

          <Section id="ai" title="AI Pre‑Screening">
            <ul className="list-disc pl-5 space-y-2">
              <li>Submissions may be analyzed by automated systems for fraud/risk signals.</li>
              <li>High‑trust campaigns may be listed as “Unverified” pending manual review.</li>
              <li>Final verification and badge issuance remain at AidVerify’s discretion.</li>
            </ul>
          </Section>

          <Section id="compliance" title="Legal & Compliance">
            <ul className="list-disc pl-5 space-y-2">
              <li>NGOs must comply with all applicable laws (incl. FCRA/CSR norms where relevant).</li>
              <li>Taxes, filings, and permits are the NGO’s responsibility.</li>
              <li>Campaigns must not promote prohibited activities or hate content.</li>
            </ul>
          </Section>

          <Section id="termination" title="Suspension & Termination">
            <ul className="list-disc pl-5 space-y-2">
              <li>We may pause or remove campaigns that violate these terms or raise risk signals.</li>
              <li>Serious violations may trigger permanent suspension and reporting to authorities.</li>
            </ul>
          </Section>

          <Section id="liability" title="Liability & Indemnity">
            <ul className="list-disc pl-5 space-y-2">
              <li>AidVerify provides a platform; NGOs are solely responsible for their statements and use of funds.</li>
              <li>NGOs agree to indemnify AidVerify against claims arising from their campaigns.</li>
            </ul>
          </Section>

          <Section id="changes" title="Changes to Terms">
            <p>
              We may update these terms to reflect legal, technical, or business changes. Continued use
              after updates constitutes acceptance of the revised terms.
            </p>
          </Section>

          <Section id="acceptance" title="Acceptance">
            <p>
              By checking the box below and clicking “Accept & Continue”, you confirm that you have
              read and agree to these terms on behalf of your organization.
            </p>
          </Section>
        </main>
      </div>

      {/* Consent Bar */}
      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center gap-3">
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I agree to the AidVerify NGO Campaign Terms
          </label>
          <div className="sm:ml-auto flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!agree}
              onClick={() => window.location.assign("/ngo/apply")}
              className={[
                "w-full sm:w-auto px-4 py-2 rounded-xl font-semibold transition-all",
                agree
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 pb-8 mb-8 border-b last:border-b-0">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">{title}</h2>
      <div className="prose prose-slate max-w-none">
        {children}
      </div>
    </section>
  );
}