import React, { useState } from 'react';
import { Sparkles, X, Check, Heart, ShieldCheck } from 'lucide-react';

interface MatchQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteQuiz: (score: number, answers: any) => void;
}

export const MatchQuizModal: React.FC<MatchQuizModalProps> = ({
  isOpen,
  onClose,
  onCompleteQuiz
}) => {
  const [step, setStep] = useState(1);
  const [lookingFor, setLookingFor] = useState('Serious Relationship');
  const [weekendStyle, setWeekendStyle] = useState('Cozy movie night & dinners');
  const [values, setValues] = useState('Honesty, Family & Ambition');
  const [communication, setCommunication] = useState('Daily texting & phone calls');

  if (!isOpen) return null;

  const handleFinish = () => {
    // Generate a high match compatibility score based on quiz complete
    const calculatedScore = Math.floor(Math.random() * 10) + 90; // 90-99%
    onCompleteQuiz(calculatedScore, { lookingFor, weekendStyle, values, communication });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white font-serif">Compatibility Quiz ❤️</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">1. What are you primarily looking for on Bouncer?</h3>
            <div className="space-y-2">
              {['Serious Relationship', 'Casual Dating & Chemistry', 'Marriage & Family', 'New Friends & Networking'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLookingFor(option)}
                  className={`w-full p-3.5 rounded-2xl text-xs font-bold text-left transition-all border ${
                    lookingFor === option ? 'bg-rose-600 text-white border-rose-500 shadow-md' : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-extrabold text-xs shadow-lg mt-4"
            >
              Next Question →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">2. What is your ideal weekend activity?</h3>
            <div className="space-y-2">
              {['Cozy movie night & dinners', 'Outdoor adventure & travel', 'Social events & nightlife', 'Fitness & beach days'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWeekendStyle(option)}
                  className={`w-full p-3.5 rounded-2xl text-xs font-bold text-left transition-all border ${
                    weekendStyle === option ? 'bg-rose-600 text-white border-rose-500 shadow-md' : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-extrabold text-xs shadow-lg"
              >
                Calculate My Compatibility ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
