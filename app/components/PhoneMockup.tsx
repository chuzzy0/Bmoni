import {
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  Send,
  ScanLine,
} from "lucide-react";

function PhoneCallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 fill-none stroke-current stroke-2"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.22 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-72.5 sm:w-[320px]">
      <div className="absolute -inset-5 rounded-[3rem] bg-violet-500/15 blur-3xl" />

      <div className="relative rounded-[2.5rem] border-[7px] border-[#2b113a] bg-[#110c16] p-1 shadow-[0_30px_70px_rgba(38,12,58,0.35)]">
        <div className="overflow-hidden rounded-4xl bg-white">
          <div className="flex items-center justify-between bg-[#4f1a63] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-violet-700">
                <MessageCircle size={14} />
              </div>

              <div>
                <p className="text-[11px] font-semibold">ChatMonie</p>
                <p className="text-[8px] opacity-75">
                  Official Business • online
                </p>
              </div>
            </div>

            <div className="flex gap-2 opacity-90">
              <ScanLine size={14} />
              <PhoneCallIcon />
              <MoreIcon />
            </div>
          </div>

          <div className="space-y-3 bg-[#f5f3f6] p-3 text-[8px] text-slate-700">
            <div className="text-center text-[7px] text-slate-400">TODAY</div>

            <div className="ml-auto max-w-[76%] rounded-xl rounded-tr-sm bg-[#ddf8ce] px-3 py-2">
              Send ₦5,000.00 to John Doe
              <div className="mt-1 text-right text-[6px] text-slate-400">
                10:24 AM ✓✓
              </div>
            </div>

            <div className="rounded-xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
              <p className="font-semibold text-slate-900">TRANSACTION REVIEW</p>

              <p className="mt-1 leading-3">
                Confirm transfer of ₦5,000 to John Okafor (0812 442 1992)
              </p>

              <div className="mt-2 inline-flex rounded-full bg-violet-100 px-2 py-1 text-[6px] text-violet-700">
                Fee: ₦0.00 • ₦5,000 Rails
              </div>
            </div>

            <div className="ml-auto max-w-[50%] rounded-xl rounded-tr-sm bg-[#ddf8ce] px-3 py-2 text-center">
              Yes, confirm
            </div>

            <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <CheckCircle2 size={9} className="text-emerald-500" />
                Transfer Successful
              </div>

              <div className="mt-2 space-y-1 text-[7px]">
                <div className="flex justify-between">
                  <span>Sender</span>
                  <span>John Okafor</span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span>Amount</span>
                  <span>₦5,000.00</span>
                </div>

                <div className="flex justify-between">
                  <span>New Balance</span>
                  <span>₦128,450.00</span>
                </div>
              </div>

              <div className="mt-2 rounded-md bg-slate-50 px-2 py-1 text-[6px] text-slate-400">
                Ref: CHM-89241
              </div>
            </div>

            <div className="rounded-xl bg-white px-3 py-2 text-[7px] shadow-sm">
              Your secure banking command has been completed.
            </div>

            <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-2 text-[7px] text-slate-400">
              <span>Type a banking command...</span>

              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                <Send size={9} />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-white px-4 py-3 text-[8px] shadow-lg ring-1 ring-slate-200">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
          <LockKeyhole size={14} />
        </div>

        <div>
          <div className="font-semibold text-slate-700">
            End-to-End Encrypted
          </div>
          <div className="text-slate-400">Direct WhatsApp Protocol</div>
        </div>
      </div>
    </div>
  );
}
