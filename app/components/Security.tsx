import {
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Reveal from "./Reveal";

const items = [
  ["256-bit AES", "Military Grade Encryption"],
  ["Zero Spam", "No Unsolicited Messages"],
  ["2FA Security", "PIN + Biometrics Checks"],
  ["1:1 Backing", "BMONI Stablecoin Reserve"],
];

export default function Security() {
  return (
    <section
      id="security"
      className="section-glow relative overflow-hidden bg-[#2b0a40] py-20 text-white sm:py-24"
    >
      <div className="animate-drift-a pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="animate-drift-b pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/14 blur-3xl" />
      <div className="scan-line pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
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
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([a, b], i) => (
            <Reveal key={a} delay={i * 90}>
              <div className="group rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur transition duration-500 hover:-translate-y-2 hover:border-violet-300/40 hover:bg-white/10">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 transition duration-300 group-hover:bg-violet-500/40">
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
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-violet-100/70">
            <span>◉ Audited Smart Contracts</span>
            <span>◉ NDPR & GDPR Compliant Fiduciary Rails</span>
            <span>◉ Non-Custodial Fiat-rail Integration</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
