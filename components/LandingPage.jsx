"use client";

import { useState, useEffect } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Mic, Share2, Sparkles, Zap, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import FluidDots from "@/components/FluidDots";
import { motion, AnimatePresence } from "framer-motion";
import { SkiperThemeToggle } from "@/components/SkiperThemeToggle";

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 font-sans transition-colors duration-500">
            {/* Background Animation */}
            <FluidDots />

            {/* Navbar */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-50 container mx-auto px-6 py-6 flex justify-between items-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-colors duration-500"
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center">
                        {/* Simple Logo Icon */}
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="#4285F4" />
                            <path d="M2 23L16 30L30 23V9L16 16L2 9V23Z" fill="#E8F0FE" />
                            <path d="M16 16L2 9V23L16 30L30 23V9L16 16Z" stroke="#4285F4" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-medium tracking-tight text-gray-800 dark:text-white">MediPrescribe</span>
                </div>
                <div className="hidden md:flex gap-6 items-center">
                    <Link href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Product</Link>
                    <Link href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
                    <Link href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">About</Link>

                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                    {mounted && (
                        <SkiperThemeToggle />
                    )}

                    <SignInButton mode="modal">
                        <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Sign In
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="px-5 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200 dark:shadow-gray-900/20">
                            Get Started
                        </button>
                    </SignUpButton>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden fixed inset-x-0 top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-xl"
                    >
                        <div className="container mx-auto px-6 pt-28 pb-8 flex flex-col gap-6">
                            <Link href="#" className="text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Product</Link>
                            <Link href="#" className="text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                            <Link href="#" className="text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-medium text-gray-800 dark:text-gray-100">Theme</span>
                                {mounted && (
                                    <SkiperThemeToggle />
                                )}
                            </div>
                            <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-2"></div>
                            <div className="flex flex-col gap-4">
                                <SignInButton mode="modal">
                                    <button className="w-full py-3 text-center text-gray-600 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        Sign In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="w-full py-3 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-200 dark:shadow-gray-900/20">
                                        Get Started
                                    </button>
                                </SignUpButton>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <main className="relative z-10 container mx-auto px-6 pt-24 pb-32 text-center">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">New Release v2.0</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.1] text-gray-900 dark:text-white select-none"
                    >
                        Prescriptions at the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Speed of Voice.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light select-none"
                    >
                        The AI-powered prescription pad that listens, understands, and delivers.
                        Create professional prescriptions in seconds, not minutes.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <SignUpButton mode="modal">
                            <button className="group px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                                Start Prescribing Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                        <button className="px-8 py-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all flex items-center gap-2 shadow-sm">
                            <Zap className="w-5 h-5 text-gray-400" />
                            Watch Demo
                        </button>
                    </motion.div>
                </div>

                {/* Feature Grid - Minimalist */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 text-left max-w-6xl mx-auto"
                >
                    <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10 transition-all duration-300">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Mic className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Voice-First Design</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Just speak naturally. Our AI captures patient details, diagnosis, and medicines instantly with 99% accuracy.</p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-green-900/10 transition-all duration-300">
                        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Share2 className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">WhatsApp Integration</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Send prescriptions directly to your patient&apos;s WhatsApp with a single click. Secure, fast, and paperless.</p>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="group p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-900/10 transition-all duration-300">
                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-7 h-7 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Smart Reminders</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">AI suggests follow-up dates based on diagnosis. Automated reminders keep your patients on the path to recovery.</p>
                    </motion.div>
                </motion.div>

                {/* Social Proof / Stats - Clean */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="mt-40 border-t border-gray-100 dark:border-gray-800 pt-20"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        <div>
                            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">10k+</div>
                            <div className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest">Prescriptions</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">500+</div>
                            <div className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest">Doctors</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">99.9%</div>
                            <div className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest">Uptime</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">4.9</div>
                            <div className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest">App Rating</div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-40 mb-10 text-center text-gray-400 dark:text-gray-600 text-sm font-medium">
                    <p>© 2024 MediPrescribe. Built for the future of healthcare.</p>
                </footer>
            </main>
        </div>
    );
}

