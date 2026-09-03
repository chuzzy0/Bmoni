import {
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

const items = [
  ["256-bit AES", "Military Grade Encryption"],
  ["Zero Spam", "No Unsolicited Messages"],
  ["2FA Security", "PIN + Biometrics Checks"],
  ["1:1 Backing", "BMONI Stablecoin Reserve"],
];

export default function Security() {
  return (
    <section id="security" className="bg-[#2f0d45] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-violet-700">
            Bank-grade encryption • Regulatory compliance
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Fiduciary security engineered directly into your conversation
          </h2>

          <p className="mt-4 text-md leading-6 text-violet-100/70">
            Built on BMONI&apos;s institutional-grade stablecoin infrastructure.
            All conversations are end-to-end encrypted with two-factor biometric
            confirmation for varying single withdrawal or outbound payment.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([a, b], i) => (
            <div
              key={a}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
                {i === 0 ? (
                  <LockKeyhole size={15} />
                ) : i === 1 ? (
                  <MessageCircle size={15} />
                ) : i === 2 ? (
                  <ShieldCheck size={15} />
                ) : (
                  <WalletCards size={15} />
                )}
              </div>

              <p className="mt-3 text-sm font-semibold">{a}</p>
              <p className="mt-1 text-[10px] text-violet-100/60">{b}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-violet-100/70">
          <span>◉ Audited Smart Contracts</span>
          <span>◉ NDPR & GDPR Compliant Fiduciary Rails</span>
          <span>◉ Non-Custodial Fiat-rail Integration</span>
        </div>
      </div>
    </section>
  );
}
