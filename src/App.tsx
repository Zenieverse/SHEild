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
  Info
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
  const [formData, setFormData] = useState<FormData>({
    environment: '',
    riskType: '',
    timeContext: '',
    supportAvailability: '',
  });
  const [plan, setPlan] = useState<SafetyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Default to dark mode is handled by the root class
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
    if (!resultRef.current) return;
    
    // Temporarily adjust styles for PDF generation if needed
    const canvas = await html2canvas(resultRef.current, {
      scale: 2,
      backgroundColor: isHighContrast ? '#000000' : '#0a0a0a',
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('SHEild-Safety-Plan.pdf');
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
      <header className="max-w-4xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
          <Shield className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-tight">SHEild</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHighContrast(!isHighContrast)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Toggle High Contrast"
          >
            {isHighContrast ? <Sun className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </header>

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
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 italic text-neutral-300">
                      "{plan?.trusted_contact_script}"
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
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
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
                      <>
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
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
        <p>© {new Date().getFullYear()} SHEild. Trauma-informed safety planning.</p>
        <p className="mt-2 italic">Your data is never stored. Your safety is our priority.</p>
      </footer>
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
