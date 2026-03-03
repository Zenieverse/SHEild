/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  RefreshCcw, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  Eye,
  Sun,
  Moon,
  Info,
  X,
  Copy,
  Check,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { SAFETY_PLAN_SCHEMA, SYSTEM_INSTRUCTION } from './constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Step = 1 | 2 | 3 | 4 | 'result';

interface FormData {
  environment: string;
  riskType: string;
  timeContext: string;
  supportAvailability: string;
}

interface SafetyPlan {
  risk_level: 'low' | 'medium' | 'high';
  pre_event_plan: string[];
  during_event_actions: string[];
  emergency_steps: string[];
  trusted_contact_script: string;
  hotline_suggestion: string;
}

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing context...");
  const [formData, setFormData] = useState<FormData>({
    environment: '',
    riskType: '',
    timeContext: '',
    supportAvailability: '',
  });
  const [plan, setPlan] = useState<SafetyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const loadingMessages = [
    "Analyzing context...",
    "Consulting safety protocols...",
    "Structuring your plan...",
    "Finalizing de-escalation steps...",
    "Almost ready..."
  ];

  useEffect(() => {
    if (isLoading) {
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Default to dark mode is handled by the root class
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const quickExit = () => {
    window.location.href = 'https://www.google.com';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    if (step === 1 && formData.environment) setStep(2);
    else if (step === 2 && formData.riskType) setStep(3);
    else if (step === 3 && formData.timeContext) setStep(4);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  const generatePlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate a safety plan for the following context:
      Environment: ${formData.environment}
      Risk Type: ${formData.riskType}
      Time: ${formData.timeContext}
      Support Availability: ${formData.supportAvailability}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: SAFETY_PLAN_SCHEMA,
        },
      });

      const result = JSON.parse(response.text || '{}');
      setPlan(result);
      setStep('result');
    } catch (err) {
      console.error(err);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!resultRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const element = resultRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: isHighContrast ? '#000000' : '#0a0a0a',
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      // Add subsequent pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }
      
      pdf.save(`SHEild-Safety-Plan-${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFormData({
      environment: '',
      riskType: '',
      timeContext: '',
      supportAvailability: '',
    });
    setPlan(null);
  };

  const environments = ['Public Transport', 'Home', 'Workplace', 'Unsafe Meeting', 'Date', 'Walking Alone'];
  const riskTypes = ['Harassment', 'Stalking', 'Domestic Tension', 'Unsafe Meeting', 'Physical Threat'];
  const timeContexts = ['Day', 'Night', 'Late Night', 'Early Morning'];
  const supportOptions = ['Alone', 'Friends Nearby', 'Emergency Services Accessible', 'Public Area'];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isHighContrast ? "bg-black text-white" : "bg-neutral-950 text-neutral-100",
      "font-sans selection:bg-emerald-500/30"
    )}>
      {/* Header */}
      <header className="max-w-4xl mx-auto p-4 sm:p-6 flex justify-between items-center sticky top-0 z-50 bg-inherit/80 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={reset} aria-label="SHEild Home" role="button">
          <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" aria-hidden="true" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">SHEild</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setShowAbout(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="About SHEild"
          >
            <Info className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsHighContrast(!isHighContrast)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Toggle High Contrast"
          >
            {isHighContrast ? <Sun className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button 
            onClick={quickExit}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            title="Quick Exit"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Exit</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      {step !== 'result' && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(Number(step) / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'result' ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div ref={resultRef} className={cn(
                "p-8 rounded-3xl border",
                isHighContrast ? "border-white bg-black" : "border-white/10 bg-neutral-900/50"
              )}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Your Safety Plan</h2>
                    <p className="text-neutral-400">Generated based on your specific context.</p>
                  </div>
                  <div className={cn(
                    "px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider",
                    plan?.risk_level === 'high' ? "bg-red-500/20 text-red-400 border border-red-500/50" :
                    plan?.risk_level === 'medium' ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" :
                    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                  )}>
                    {plan?.risk_level} Risk
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      Pre-Event Preparation
                    </h3>
                    <ul className="space-y-2 list-disc list-inside text-neutral-300">
                      {plan?.pre_event_plan.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      During Event Actions
                    </h3>
                    <ul className="space-y-2 list-disc list-inside text-neutral-300">
                      {plan?.during_event_actions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Emergency Steps
                    </h3>
                    <ul className="space-y-2 list-disc list-inside text-neutral-300">
                      {plan?.emergency_steps.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      Trusted Contact Script
                    </h3>
                    <div className="relative group">
                      <div className="p-4 pr-12 rounded-xl bg-white/5 border border-white/10 italic text-neutral-300">
                        "{plan?.trusted_contact_script}"
                      </div>
                      <button
                        onClick={() => copyToClipboard(plan?.trusted_contact_script || '')}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </section>
                </div>

                {plan?.hotline_suggestion && (
                  <div className="mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <h4 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Support & Hotlines
                    </h4>
                    <p className="text-neutral-300 mb-4">{plan.hotline_suggestion}</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest">
                      Disclaimer: This is AI-generated advice. If you are in immediate danger, call emergency services.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Start Over
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {step === 1 && "Where are you heading?"}
                  {step === 2 && "What is the concern?"}
                  {step === 3 && "When is this happening?"}
                  {step === 4 && "Who is around you?"}
                </h2>
                <p className="text-neutral-400 text-lg">
                  Step {step} of 4 • Anonymous & Secure
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {step === 1 && environments.map((env) => (
                  <OptionButton 
                    key={env} 
                    label={env} 
                    selected={formData.environment === env} 
                    onClick={() => setFormData({ ...formData, environment: env })}
                    isHighContrast={isHighContrast}
                  />
                ))}
                {step === 2 && riskTypes.map((risk) => (
                  <OptionButton 
                    key={risk} 
                    label={risk} 
                    selected={formData.riskType === risk} 
                    onClick={() => setFormData({ ...formData, riskType: risk })}
                    isHighContrast={isHighContrast}
                  />
                ))}
                {step === 3 && timeContexts.map((time) => (
                  <OptionButton 
                    key={time} 
                    label={time} 
                    selected={formData.timeContext === time} 
                    onClick={() => setFormData({ ...formData, timeContext: time })}
                    isHighContrast={isHighContrast}
                  />
                ))}
                {step === 4 && supportOptions.map((opt) => (
                  <OptionButton 
                    key={opt} 
                    label={opt} 
                    selected={formData.supportAvailability === opt} 
                    onClick={() => setFormData({ ...formData, supportAvailability: opt })}
                    isHighContrast={isHighContrast}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center pt-8">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                    step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-white/10"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>

                {step === 4 ? (
                  <button
                    onClick={generatePlan}
                    disabled={!formData.supportAvailability || isLoading}
                    className={cn(
                      "flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20",
                      (!formData.supportAvailability || isLoading) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                        <span className="text-xs animate-pulse">{loadingMessage}</span>
                      </div>
                    ) : (
                      <>
                        Generate My Safety Plan
                        <Shield className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !formData.environment) ||
                      (step === 2 && !formData.riskType) ||
                      (step === 3 && !formData.timeContext)
                    }
                    className={cn(
                      "flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold transition-all hover:scale-105",
                      ((step === 1 && !formData.environment) ||
                      (step === 2 && !formData.riskType) ||
                      (step === 3 && !formData.timeContext)) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto p-12 text-center text-neutral-500 text-sm">
        <div className="flex justify-center gap-6 mb-8">
          <button onClick={() => setShowAbout(true)} className="hover:text-neutral-300 transition-colors">About</button>
          <a href="https://www.thehotline.org/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors flex items-center gap-1">
            Global Resources <ExternalLink className="w-3 h-3" />
          </a>
          <button onClick={quickExit} className="text-red-500 hover:text-red-400 font-bold">Quick Exit</button>
        </div>
        <p>© {new Date().getFullYear()} SHEild. Trauma-informed safety planning.</p>
        <p className="mt-2 italic">Your data is never stored. Your safety is our priority.</p>
      </footer>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "max-w-2xl w-full p-8 rounded-3xl border shadow-2xl overflow-y-auto max-h-[90vh]",
                isHighContrast ? "bg-black border-white" : "bg-neutral-900 border-white/10"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-500" aria-hidden="true" />
                  About SHEild
                </h3>
                <button onClick={() => setShowAbout(false)} className="p-2 hover:bg-white/10 rounded-full" aria-label="Close modal">
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="space-y-6 text-neutral-300">
                <p>
                  SHEild is an AI-powered safety planning assistant designed for women and marginalized individuals. 
                  Our goal is to provide immediate, structured, and trauma-informed safety advice for various situations.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      Privacy
                    </h4>
                    <p className="text-sm">We do not store any personal data. Your inputs are used only to generate the plan and are cleared immediately.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <LifeBuoy className="w-4 h-4 text-emerald-500" />
                      Support
                    </h4>
                    <p className="text-sm">SHEild is a tool, not a replacement for professional emergency services or law enforcement.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <h4 className="font-bold text-red-400 mb-2">Disclaimer</h4>
                  <p className="text-sm">
                    The advice provided is AI-generated and should be used as a guideline. 
                    Always prioritize your intuition and immediate safety. 
                    If you are in immediate danger, please contact your local emergency services (e.g., 911, 999, 112).
                  </p>
                </div>

                <button 
                  onClick={() => setShowAbout(false)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionButton({ label, selected, onClick, isHighContrast }: { 
  label: string; 
  selected: boolean; 
  onClick: () => void;
  isHighContrast: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-6 rounded-2xl text-left transition-all border-2 text-lg font-medium",
        selected 
          ? (isHighContrast ? "bg-white text-black border-white" : "bg-emerald-600/20 border-emerald-500 text-emerald-400")
          : (isHighContrast ? "bg-black text-white border-white/40 hover:border-white" : "bg-white/5 border-white/10 hover:border-white/30 text-neutral-300")
      )}
    >
      {label}
    </button>
  );
}
