import { MessageCircle, Zap } from "lucide-react";
import PhoneMockup from "./PhoneMockup";

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:min-h-[620px] lg:pt-28">
      <div className="absolute left-[-80px] top-20 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-purple-100/70 blur-3xl" />

      <div className="relative grid items-center gap-16 lg:grid-cols-[1fr_0.8fr]">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live on WhatsApp
            <span className="text-slate-300">•</span>
            Powered by BMONI Stablecoin
          </div>

          <h1 className="text-5xl font-semibold leading-[0.98] tracking-tighter sm:text-6xl lg:text-[72px]">
            Your bank,
            <br />
            <span className="bg-linear-to-r from-[#4d0b6e] via-[#7d1bb0] to-[#9a39d6] bg-clip-text text-transparent">
              now on WhatsApp.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-6 text-slate-500 sm:text-[16px]">
            Check your balance, send money instantly, and withdraw cash just by
            texting. Built on BMONI&apos;s stablecoin infrastructure — zero apps
            to download, 100% secure.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="https://wa.me/15556162147"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
            >
              <MessageCircle size={14} />
              Chat with us on WhatsApp
            </a>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5"
            >
              <Zap size={13} className="text-violet-600" />
              60-sec Onboarding
            </a>
          </div>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-5 border-t border-slate-200 pt-5">
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

        <div className="pb-8 pt-8 lg:pt-0">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
