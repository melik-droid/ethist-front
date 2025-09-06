import SiteNavbar from "../components/SiteNavbar";

const HomePage: React.FC = () => {
  // ...

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <SiteNavbar />

      {/* Hero Section */}
      <section className="bg-arch-pattern min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center hero-content">
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
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
            {/* Placeholder overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4FF00]/5 via-transparent to-[#D4FF00]/10" />
            {/* Replace iframe source when real video is ready */}
            <iframe
              className="w-full h-full opacity-0" /* hidden until real video provided */
              src=""
              title="Racfella Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
              Racfella helps you center your mind when everything feels noisy. A
              privacy-first, emotion-aware companion designed to respond
              instantly and adapt to your emotional state.
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
                Get structured calming sequences when your mind
                spirals—breathing cues, reframing steps and grounding anchors.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#2F2F2F] transition-colors duration-200">
              <h3 className="font-semibold text-lg mb-2">Emotion Tracking</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Record and later review your emotional spikes to discover
                triggers & recovery patterns discreetly.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#2F2F2F] transition-colors duration-200">
              <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                No public identity layer. Your state is processed contextually
                without invasive profiling.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#2F2F2F] transition-colors duration-200">
              <h3 className="font-semibold text-lg mb-2">Agentic Flow</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Racfella steers the interaction—asking, grounding and pacing
                instead of passively echoing.
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
            © 2025 Racfella. Call and Calm. Your Balance.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
