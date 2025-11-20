import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Mic, Share2, Sparkles, Shield, Zap, CheckCircle2 } from "lucide-react";

export default async function Home() {
  const user = await currentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">MediPrescribe</span>
        </div>
        <div className="flex gap-4">
          <SignInButton mode="modal">
            <button className="px-6 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-6 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-all transform hover:scale-105">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-300">v2.0 is now live</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
            Prescriptions at the <br />
            <span className="text-gradient">Speed of Voice</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The AI-powered prescription pad that listens, understands, and delivers. 
            Create professional prescriptions in seconds, not minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignUpButton mode="modal">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 flex items-center gap-2">
                Start Prescribing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <button className="px-8 py-4 glass-card rounded-full text-lg font-medium hover:bg-white/10 transition-all flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Voice-First Design</h3>
            <p className="text-gray-400">Just speak naturally. Our AI captures patient details, diagnosis, and medicines instantly.</p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">WhatsApp Integration</h3>
            <p className="text-gray-400">Send prescriptions directly to your patient's WhatsApp with a single click. No printing needed.</p>
          </div>

          <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Reminders</h3>
            <p className="text-gray-400">AI suggests follow-up dates based on diagnosis and severity. Keep your patients on track.</p>
          </div>
        </div>

        {/* Social Proof / Stats */}
        <div className="mt-32 border-t border-white/10 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Prescriptions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Rating</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 text-center text-gray-500 text-sm">
          <p>© 2024 MediPrescribe. Built for the future of healthcare.</p>
        </footer>
      </main>
    </div>
  );
}