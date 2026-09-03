import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#f0f1ff] py-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 text-[10px] text-slate-500 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <Link href="#" className="flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={190} height={190} />
            </Link>
          </div>
          <p className="mt-3 max-w-sm leading-5">
            Conversational stablecoin payments designed for simple, intelligent
            financial inclusion in everyday chat.
          </p>
          <div className="mt-4 rounded-lg bg-violet-100 px-3 py-2 text-[10px] text-violet-700">
            A ChatMonie project built on BMONI stablecoin infrastructure.
          </div>
          <p className="mt-8">
            © 2026 ChatMonie. Built on BMONI stablecoin infrastructure. All
            rights reserved.
          </p>
        </div>

        <div>
          <p className="font-semibold text-slate-900">Product</p>

          <div className="mt-3 space-y-2">
            <a href="#features" className="block hover:text-slate-900">
              Features
            </a>
            <a href="#how-it-works" className="block hover:text-slate-900">
              How It Works
            </a>
            <a href="#security" className="block hover:text-slate-900">
              Security
            </a>
          </div>
        </div>

        <div>
          <p className="font-semibold text-slate-900">Protocols</p>

          <div className="mt-3 space-y-2">
            <span className="block">BMONI Rails</span>
            <span className="block">WhatsApp Native</span>
            <span className="block">Decentralized Fiduciary</span>
          </div>
        </div>

        <div>
          <p className="font-semibold text-slate-900">Legal & Social</p>

          <div className="mt-3 space-y-2">
            <span className="block">Privacy Policy</span>
            <span className="block">Terms of Service</span>
            <span className="block">Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
