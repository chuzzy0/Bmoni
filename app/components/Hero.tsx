import { MessageCircle, Zap } from "lucide-react";
import PhoneMockup from "./PhoneMockup";

export default function Hero() {
  return (
    <section className="section-glow relative mx-auto max-w-7xl overflow-hidden px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:min-h-[680px] lg:pt-28">
      <div className="animate-drift-a absolute left-[-80px] top-20 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="animate-drift-b absolute right-0 top-20 h-80 w-80 rounded-full bg-purple-100/70 blur-3xl" />

      <div className="relative grid items-center gap-16 lg:grid-cols-[1fr_0.82fr]">
        <div className="max-w-2xl">
          <div
            className="animate-fade-up animate-pulse-ring mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[12px] font-medium text-slate-600 shadow-sm shadow-violet-900/10 backdrop-blur"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live on WhatsApp
            <span className="text-slate-300">•</span>
            Powered by BMONI Stablecoin
          </div>

          <h1
            className="animate-fade-up text-5xl font-semibold leading-[0.96] tracking-tighter sm:text-6xl lg:text-[75px]"
            style={{ animationDelay: "90ms" }}
          >
            Your bank,
            <br />
            <span className="animate-text-shine bg-linear-to-r from-[#4d0b6e] via-[#9a39d6] to-[#4d0b6e] bg-clip-text text-transparent">
              now on WhatsApp.
            </span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-xl text-sm leading-6 text-slate-500 sm:text-[16px]"
            style={{ animationDelay: "180ms" }}
          >
            Check your balance, send money instantly, and withdraw cash just by
            texting. Built on BMONI&apos;s stablecoin infrastructure — zero apps
            to download, 100% secure.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "270ms" }}
          >
            <a
              href="https://wa.me/15556162147"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-whatsapp px-5 py-3 text font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <span className="sheen-layer" />
              <MessageCircle size={14} />
              Chat with us on WhatsApp
            </a>

            <a
              href="#how-it-works"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-3 font-semibold text-slate-700 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:ring-violet-200"
            >
              <span className="sheen-layer" />
              <Zap size={13} className="text-violet-600 transition group-hover:rotate-12" />
              60-sec Onboarding
            </a>
          </div>

          <div
            className="animate-fade-up mt-8 grid max-w-lg grid-cols-3 gap-5 border-t border-slate-200 pt-5"
            style={{ animationDelay: "360ms" }}
          >
            <div>
              <div className="text-md font-semibold">₦0.00</div>
              <div className="text-[14px] text-slate-400">
                Transfer fee to peers
              </div>
            </div>

            <div>
              <div className="text-md font-semibold">&lt; 5s</div>
              <div className="text-[14px] text-slate-400">Settlement speed</div>
            </div>

            <div>
              <div className="text-md font-semibold">1:1</div>
              <div className="text-[14px] text-slate-400">
                BMONI asset backing
              </div>
            </div>
          </div>
        </div>

        <div
          className="animate-fade-up relative pb-8 pt-8 lg:pt-0"
          style={{ animationDelay: "220ms" }}
        >
          <div className="absolute -right-2 top-6 hidden rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-[9px] font-semibold text-slate-500 shadow-lg shadow-violet-950/10 backdrop-blur sm:block animate-float-chip">LIVE TRANSFER • <span className="text-emerald-600">VERIFIED</span></div>
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
