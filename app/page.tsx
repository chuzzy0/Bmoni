import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Security from "./components/Security";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfbff] text-slate-950">
      <NavBar />
      <Hero />
      <Features />
      <HowItWorks />
      <Security />
      <CTA />
      <Footer />
    </main>
  );
}
