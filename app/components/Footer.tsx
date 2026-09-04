import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 py-14 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 text-sm text-slate-500 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="#"
              className="transition-opacity duration-200 hover:opacity-80"
            >
              <Image
                src="/logo.png"
                alt="ChatMonie"
                width={120}
                height={120}
                className="h-auto w-[110px]"
              />
            </Link>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
            Conversational stablecoin payments designed for simple,
            intelligent financial inclusion in everyday chat.
          </p>

          <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-700">
            A ChatMonie project built on BMONI stablecoin infrastructure.
          </div>

          <p className="mt-8 text-xs leading-5 text-slate-400">
            © 2026 ChatMonie. Built on BMONI stablecoin infrastructure. All
            rights reserved.
          </p>
        </div>

        {/* Product */}
        <div>
          <p className="text-sm font-bold tracking-wide text-slate-900">
            Product
          </p>

          <div className="mt-5 space-y-3">
            <a
              href="#features"
              className="block w-fit text-sm transition-all duration-200 hover:translate-x-1 hover:text-slate-900"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="block w-fit text-sm transition-all duration-200 hover:translate-x-1 hover:text-slate-900"
            >
              How It Works
            </a>

            <a
              href="#security"
              className="block w-fit text-sm transition-all duration-200 hover:translate-x-1 hover:text-slate-900"
            >
              Security
            </a>
          </div>
        </div>

        {/* Protocols */}
        <div>
          <p className="text-sm font-bold tracking-wide text-slate-900">
            Protocols
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <span className="block">BMONI Rails</span>
            <span className="block">WhatsApp Native</span>
            <span className="block">Decentralized Fiduciary</span>
          </div>
        </div>

        {/* Legal & Social */}
        <div>
          <p className="text-sm font-bold tracking-wide text-slate-900">
            Legal & Social
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <span className="block">Privacy Policy</span>
            <span className="block">Terms of Service</span>
            <span className="block">Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}