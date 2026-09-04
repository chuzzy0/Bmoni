import { MessageCircle } from "lucide-react";
import Reveal from "./Reveal";

export default function CTA() {
  return (
    <section id="cta" className="bg-[#f7f7fe] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-b from-[#ece8ff] via-white to-white px-6 py-14 text-center shadow-[0_28px_90px_rgba(63,25,91,.11)] ring-1 ring-white/80 sm:px-12">
            <div className="animate-drift-a pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl" />
            <div className="animate-drift-b pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-emerald-100/55 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-10 bottom-0 h-24 rounded-full bg-violet-300/20 blur-3xl" />

            <div className="relative mx-auto w-fit rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-violet-600 shadow-sm">
              Ready in 60 Seconds
            </div>

            <h2 className="relative mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              No app. No forms.
              <br />
              <span className="animate-text-shine bg-linear-to-r from-[#531077] via-[#9b40d5] to-[#531077] bg-clip-text text-transparent">
                Just chat.
              </span>
            </h2>

            <p className="relative mx-auto mt-4 max-w-xl text-md leading-6 text-slate-500">
              Join the future of conversational finance. Message ChatMonie right
              now and experience banking as simple as texting a friend.
            </p>

            <a
              href="https://wa.me/15556162147"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative z-10 mx-auto mt-7 inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#25d366] px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-500/35"
            >
              <span className="sheen-layer" />
              <MessageCircle size={15} />
              Chat with us on WhatsApp
            </a>

            <p className="relative mt-3 text-[11px] text-slate-400">
              No credit card required • Instant setup in 60 seconds
            </p>

            <div className="relative mt-7 flex justify-center -space-x-2">
              {[1, 2, 3, 4].map((x) => (
                <div
                  key={x}
                  className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#2f0d45] text-[8px] font-semibold text-white transition duration-300 hover:-translate-y-1 hover:z-10"
                >
                  {x}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
