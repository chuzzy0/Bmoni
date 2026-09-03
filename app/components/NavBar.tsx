import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#fbfbff]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="#" className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={190} height={190} />
        </Link>

        <nav className="hidden items-center gap-8 text-slate-600 md:flex">
          <a href="#" className="transition hover:text-slate-950">
            Home
          </a>

          <a href="#features" className="transition hover:text-slate-950">
            Features
          </a>

          <a href="#how-it-works" className="transition hover:text-slate-950">
            How It Works
          </a>

          <a href="#security" className="transition hover:text-slate-950">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#cta"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[15px] font-semibold text-white shadow-lg shadow-violet-950/15 transition hover:-translate-y-0.5"
          >
            Start Chatting
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </header>
  );
}
