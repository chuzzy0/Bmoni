import { MessageCircle } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="bg-[#f7f7fe] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-3xl bg-linear-to-b from-[#e9ebff] to-white px-6 py-14 text-center shadow-xl shadow-violet-900/10 ring-1 ring-slate-200 sm:px-12">
          <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-violet-600 shadow-sm">
            Ready in 60 Seconds
          </div>

          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            No app. No forms.
            <br />
            <span className="bg-gradient-to-r from-[#531077] to-[#9b40d5] bg-clip-text text-transparent">
              Just chat.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-md leading-6 text-slate-500">
            Join the future of conversational finance. Message ChatMonie right
            now and experience banking as simple as texting a friend.
          </p>

          <a
            href="#"
            className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5"
          >
            <MessageCircle size={15} />
            Chat with us on WhatsApp
          </a>

          <p className="mt-3 text-[11px] text-slate-400">
            No credit card required • Instant setup in 60 seconds
          </p>

          <div className="mt-7 flex justify-center -space-x-2">
            {[1, 2, 3, 4].map((x) => (
              <div
                key={x}
                className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#2f0d45] text-[8px] font-semibold text-white"
              >
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
