import {
  ArrowRight,
  Check,
  MessageCircle,
  QrCode,
  Send,
  ShieldCheck,
} from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  {
    number: "01",
    title: "Message us on WhatsApp",
    text: "Simply click or link or scan our QR code to begin a secure chat with ChatMonie using your existing WhatsApp.",
    cta: "Say 'Hello' to initiate",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Verify in under a minute",
    text: "Quick automated KYC via WhatsApp prompts to activate your encrypted ChatMonie account safely.",
    cta: "Automated NIN/Bank verification",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Start banking by chat",
    text: "Deposit funds, then command plain natural language and manage your money effortlessly 24/7.",
    cta: "Instant settlement ready",
    icon: Send,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-glow py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-violet-700">
            Effortless setup
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Up and running in 60 seconds
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-md leading-6 text-slate-500">
            No long forms. No physical paperwork. Just a natural conversation
            with ChatMonie to get verified, funded and ready.
          </p>
        </Reveal>

        <div className="relative mt-12 grid gap-4 lg:grid-cols-3">
          <div className="absolute left-[16.5%] right-[16.5%] top-[38px] hidden h-px bg-linear-to-r from-transparent via-violet-300 to-transparent lg:block" />

          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <Reveal key={step.number} delay={i * 110}>
                <article className="group relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(49,14,74,.06)] backdrop-blur transition duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(49,14,74,.1)]">
                  <span className="sheen-layer" />

                  <div className="flex items-center justify-between">
                    <span className="relative z-10 grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-[12px] font-bold text-violet-700 ring-4 ring-white transition duration-300 group-hover:bg-violet-600 group-hover:text-white">
                      {step.number}
                    </span>

                    <Icon size={16} className="text-violet-500 transition duration-300 group-hover:scale-110" />
                  </div>

                  <h3 className="mt-5 text-md font-semibold">{step.title}</h3>

                  <p className="mt-2 text-[13px] leading-5 text-slate-500">
                    {step.text}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#f1f2fb] px-3 py-2 text-[10px] font-medium text-slate-500">
                    <Check size={11} className="text-emerald-500" />
                    {step.cta}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={150}>
          <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-[#f0f1ff] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#2f0d45] shadow-sm">
                <QrCode size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Prefer using your desktop WhatsApp?
                </p>

                <p className="text-[12px] text-slate-500">
                  Scan from your mobile camera to start instantly.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/15556162147"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#2f0d45] px-4 py-2.5 text-[12px] font-semibold text-white transition duration-300 hover:-translate-y-0.5"
            >
              <span className="sheen-layer" />
              Scan or Click to Chat
              <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
