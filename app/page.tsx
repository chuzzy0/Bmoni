import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Security from "./components/Security";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import AmbientBackground from "./components/AmbientBackground";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-slate-950 pt-24">
      <AmbientBackground />
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
