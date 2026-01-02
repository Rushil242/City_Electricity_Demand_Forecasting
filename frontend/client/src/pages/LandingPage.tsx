import React from 'react';
import { ChevronRight, Zap, Database, BrainCircuit, Activity } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-slate-900">
      
      {/* Background Image Container with Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/landing-bg.png"
          alt="Smart Grid Background"
          className="w-full h-full object-cover scale-105"
        />
        {/* Dark Gradient Overlay - Modified to be slightly bluer to match theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950"></div>
        {/* subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Translucent Glass Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 bg-slate-900/10 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            <Zap className="text-cyan-400" size={20} />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">
            BESCOM <span className="text-cyan-400">INTEL</span>
          </span>
        </div>
        <div>
           <button 
             onClick={onLaunch} 
             className="bg-white/10 hover:bg-cyan-500 hover:text-slate-900 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-white/20 hover:border-cyan-400 rounded-sm"
           >
              Launch Dashboard
           </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative z-20 min-h-screen flex flex-col justify-center px-8 md:px-24 pt-20">
        <div className="max-w-5xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-300 text-xs font-bold tracking-widest uppercase">Live Telemetry System</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] mb-8 text-white drop-shadow-2xl">
            POWER THE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              FUTURE
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed font-light border-l-2 border-cyan-500/50 pl-6">
            Next-generation electricity demand forecasting powered by a <strong>Hybrid XGBoost & LSTM Architecture</strong>. 
            Analyze complex load patterns, predict peak demand with high precision, and visualize grid stability in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6">
            <button
              onClick={onLaunch}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-sm p-4 px-10 font-bold text-white bg-cyan-600 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(8,145,178,0.7)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="flex items-center gap-3 tracking-widest uppercase text-sm">
                Enter Mission Control <ChevronRight size={18} />
              </span>
            </button>
            
             <button className="px-10 py-4 border border-white/20 text-slate-300 font-bold text-sm uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-cyan-400/50 transition-all rounded-sm">
              System Architecture
            </button>
          </div>
        </div>
      </header>

      {/* TECH STACK SECTION */}
      <section className="relative z-20 bg-slate-950 py-32 px-8 md:px-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
                CORE TECHNOLOGY
              </h2>
              <div className="h-1 w-24 bg-cyan-500 mt-4"></div>
            </div>
            <p className="hidden md:block text-slate-400 max-w-sm text-right text-sm">
              Engineered for millisecond-latency updates and high-dimensional data processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-900/40 p-10 border border-white/5 hover:border-cyan-500/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-cyan-950/50 rounded-lg flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:border-cyan-500/50">
                <BrainCircuit size={24} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-4 text-slate-100">Hybrid ML Engine</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Combines <strong>XGBoost</strong> for feature-rich gradient boosting and <strong>LSTM (Long Short-Term Memory)</strong> networks to capture temporal dependencies in time-series data.
              </p>
            </div>

             {/* Feature 2 */}
             <div className="group bg-slate-900/40 p-10 border border-white/5 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-blue-950/50 rounded-lg flex items-center justify-center mb-8 border border-blue-500/20 group-hover:border-blue-500/50">
                <Database size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-4 text-slate-100">Real-Time Ingestion</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                High-throughput Flask backend architecture designed to ingest, normalize, and serve hourly electricity demand data with minimal latency.
              </p>
            </div>

             {/* Feature 3 */}
             <div className="group bg-slate-900/40 p-10 border border-white/5 hover:border-purple-500/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-purple-950/50 rounded-lg flex items-center justify-center mb-8 border border-purple-500/20 group-hover:border-purple-500/50">
                <Activity size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-4 text-slate-100">Predictive Analytics</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Advanced alerting system that monitors deviation between forecasted and actual load, triggering automated responses for grid stabilization.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="relative z-20 bg-black py-12 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs uppercase tracking-wider">
          <p>© {new Date().getFullYear()} BESCOM Forecasting Division.</p>
          <div className="flex gap-8">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy Protocol</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">System Status: Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;