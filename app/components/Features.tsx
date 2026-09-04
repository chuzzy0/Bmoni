import { Banknote, Copy, Send, Smartphone, WalletCards } from "lucide-react";
import Reveal from "./Reveal";

const features = [
  {
    icon: Banknote,
    title: "Check Balance",
    text: "Instant real-time balance queries built right into your WhatsApp conversation.",
    chip: "₦128,450.00",
    chip2: "Savings",
  },
  {
    icon: Send,
    title: "Send Money",
    text: "Lightning-fast P2P and bank transfers to any local account with zero complicated forms.",
    chip: "Commercial Bank",
    chip2: "₦0 Fee",
  },
  {
    icon: WalletCards,
    title: "Withdraw Cash",
    text: "Seamless off-ramp into your personal bank account or your authorized physical location.",
    chip: "Instant Settlement",
    chip2: "<5 seconds",
  },
  {
    icon: Copy,
    title: "Transaction History",
    text: "Receive instant summaries, monthly snapshots, and categorized spending insights right in WhatsApp.",
    chip: "Past 6 Months",
    chip2: "Auto-synced",
  },
];

export default function Features() {
  return (
    <section id="features" className="section-glow relative bg-white/65 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-violet-700">
            Conversational core
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Financial freedom at your fingertips
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-md leading-6 text-slate-500">
            Everything your traditional banking app does, without ever leaving
            your favorite chat app.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} delay={i * 90}>
                <article className="group relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(49,14,74,.06)] backdrop-blur transition duration-500 hover:-translate-y-2 hover:shadow-[0_26px_70px_rgba(49,14,74,.11)] hover:ring-violet-200">
                  <span className="sheen-layer" />

                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700 transition duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={17} />
                  </div>

                  <h3 className="mt-5 text-md font-semibold">{feature.title}</h3>

                  <p className="mt-2 text-[13px] leading-5 text-slate-500">
                    {feature.text}
                  </p>

                  <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f1f2fb] px-3 py-2 text-[12px] text-slate-500">
                    <span>{feature.chip}</span>
                    <span className="font-semibold text-emerald-600">
                      {feature.chip2}
                    </span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2f0d45] text-white">
                <Smartphone size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Never open another banking app again
                </p>

                <p className="text-[12px] text-slate-400">
                  Traditional apps take 4MB+ storage, demand constant passwords,
                  and crash during peak hours.
                </p>
              </div>
            </div>

            <div className="flex gap-2 text-[10px]">
              <span className="rounded-lg bg-violet-100 px-3 py-2 font-semibold text-violet-700">
                APP STORAGE
                <br />
                <span className="text-[13px]">0 MB</span> Required
              </span>

              <span className="rounded-lg bg-emerald-100 px-3 py-2 font-semibold text-emerald-700">
                UPTIME
                <br />
                <span className="text-[13px]">99.99%</span> WhatsApp
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
