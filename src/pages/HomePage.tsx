import SiteNavbar from "../components/SiteNavbar";
import { useState } from "react";

const HomePage: React.FC = () => {
  // Video loading transition state
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <SiteNavbar />

      {/* Hero Section */}
      <section className="bg-arch-pattern min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center hero-content">
          {/* Decorative animated circle behind hero text */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10"
          >
            <div className="relative">
              {/* slow rotating ring */}
              <div className="w-56 h-56 md:w-80 md:h-80 rounded-full border border-[#D4FF00]/25 opacity-60 spin-slow" />
              {/* subtle expanding ripples */}
              <div className="absolute inset-0 rounded-full border border-[#D4FF00]/15 ripple" />
              <div className="absolute inset-0 rounded-full border border-[#D4FF00]/10 ripple-delay" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight">
            Your Balance
            <br />
            <span className="text-[#D4FF00]">Your Rac'fella</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-[#A0A0A0] mb-10 max-w-3xl mx-auto leading-relaxed">
            When you're lost in chaos, Call and Calm
          </p>

          <a
            href="https://wa.me/18207773878?text=hi"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#D4FF00] text-[#0D0D0D] px-10 py-4 rounded-lg text-lg font-semibold hover:bg-[#BEF264] transition-all duration-200 glow-hover mb-12 inline-block shadow-md focus-visible:outline-none"
            aria-label="Start chatting with Racfella"
          >
            Try Racfella for Free
          </a>

          {/* Trust Icons */}
          {/* <div className="flex flex-wrap justify-center gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="text-2xl mb-2 group-hover:scale-105 transition-transform duration-200">
                  {feature.icon}
                </div>
                <span className="text-sm text-[#A0A0A0] group-hover:text-white transition-colors duration-200">
                  {feature.label}
                </span>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="relative px-6 py-24 bg-[#0B0B0B] border-t border-b border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Text Side */}
          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              See Racfella in Action
            </h2>
            <p className="text-[#A0A0A0] leading-relaxed text-base md:text-lg">
              Watch how Racfella listens, analyzes emotional cues and helps you
              regain balance. Real-time supportive flow powered by privacy-first
              AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <a
                href="https://wa.me/18207773878?text=hi"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#D4FF00] text-[#0D0D0D] px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#BEF264] transition-colors duration-200 shadow-md focus-visible:outline-none"
              >
                Start Now
              </a>
              <a
                href="#learn-more"
                className="group px-8 py-3 rounded-lg text-base font-medium border border-[#2A2A2A] bg-[#111] hover:bg-[#1A1A1A] text-[#E0E0E0] hover:text-white transition-colors duration-200 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF00]/60"
              >
                Learn More
              </a>
            </div>
          </div>
          {/* Video Player */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#141414] border border-[#1F1F1F] shadow-xl">
            {/* Placeholder while loading */}
            <div
              className={`absolute inset-0 flex items-center justify-center select-none transition-opacity duration-500 ${
                videoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <div className="w-24 h-24 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center animate-pulse">
                <div className="w-14 h-14 rounded-full bg-[#D4FF00] flex items-center justify-center shadow-lg">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5V19L19 12L8 5Z" fill="#0D0D0D" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4FF00]/5 via-transparent to-[#D4FF00]/10 pointer-events-none" />
            {/* HTML5 video (place file at /public/intro.mp4) */}
            <video
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
              playsInline
              autoPlay
              muted
              loop
              controls
              onLoadedData={() => setVideoLoaded(true)}
              aria-label="Racfella Introduction Video"
            >
              <source src="/Intro.mp4" type="video/mp4" />
              <source
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Learn More Detailed Section */}
      <section
        id="learn-more"
        className="px-6 py-28 bg-[#0E0E0E] border-t border-[#1A1A1A]"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-14">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Why Racfella?</h2>
            <p className="text-[#A0A0A0] leading-relaxed text-base">
              When noise overwhelms, Rac’fella restores signal. A privacy-first,
              emotion-intelligent companion built for traders who face chaos
              daily. Not just another Consigliere; a confidant that stabilizes
              your state before you even ask 😎
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-[#D4FF00] mt-0.5">•</span>
                <p className="text-sm text-[#C7C7C7]">
                  Anonymous emotional reflection & real-time grounding prompts.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4FF00] mt-0.5">•</span>
                <p className="text-sm text-[#C7C7C7]">
                  Agentic support flow—guides you instead of just replying.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4FF00] mt-0.5">•</span>
                <p className="text-sm text-[#C7C7C7]">
                  Designed for volatile emotional states—fast, stable &
                  non-judgmental.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#2F2F2F] transition-colors duration-200">
              <h3 className="font-semibold text-lg mb-2">Instant Guidance</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Rapid stabilization when spirals hit. Grounding sequences
                crafted from cognitive science: breathing anchors, reframing
                cues, calm prompts. Precision-designed to intercept volatility
                so you recover seconds, not hours. Rac’fella mirrors your
                thinking with CBT logic, Socratic cues, and Stoic calm guiding
                without judging.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#2F2F2F] transition-colors duration-200">
              <h3 className="font-semibold text-lg mb-2">Emotion Tracking</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Your invisible journal. Track emotional spikes without exposure,
                surface hidden triggers, map recovery patterns. A discreet
                mirror of your mind helping you master what once mastered you.
                Every spike leaves a trace. Rac’fella maps emotional volatility
                discreetly, turning chaos into patterns, and patterns into
                resilience.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#2F2F2F] transition-colors duration-200">
              <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                No public identity. No invasive profiling. Your state exists
                only in the moment you share it encrypted, transient, sovereign.
                Rac’fella doesn’t remember you to own you; it forgets to protect
                you. Your emotions never become someone else’s data
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#2F2F2F] transition-colors duration-200">
              <h3 className="font-semibold text-lg mb-2">Agentic Flow</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Not passive. Not reactive. Rac’fella steers conversations with
                pacing, questions, and grounding guiding you out of loops, not
                echoing them. The difference between a mirror and a mentor😎
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] py-10 px-6 border-t border-[#1A1A1A] mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4 tracking-tight">
            <span className="text-[#D4FF00]">Rac</span>fella
          </div>
          <p className="text-[#A0A0A0] text-sm">
            © 2025 Racfella. Call and Calm. Your Balance. Your Destiny.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
