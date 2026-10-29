import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, KeyRound, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPin: string;
  panelTitle: string;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  targetPin,
  panelTitle,
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(false);
    setPin('');
  };

  const verifyPin = (candidatePin: string) => {
    if (candidatePin === targetPin) {
      setPin('');
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm liquid-glass-card rounded-3xl p-6 shadow-2xl relative border border-white/20 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#c5a059]/20 to-[#c5a059]/5 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Acceso Seguro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Introduce el PIN de 4 dígitos para ingresar a <span className="font-semibold text-[#c5a059]">{panelTitle}</span>
          </p>
        </div>

        {/* PIN Input Display */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className={`flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border transition-all ${
              error 
                ? 'border-rose-500 ring-2 ring-rose-500/30 animate-bounce' 
                : 'border-slate-200 dark:border-slate-800'
            }`}>
              {[0, 1, 2, 3].map((idx) => {
                const char = pin[idx];
                return (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono text-xl font-bold text-slate-900 dark:text-white shadow-sm"
                  >
                    {char ? (showPin ? char : '•') : ''}
                  </div>
                );
              })}
            </div>

            {/* Toggle show/hide PIN */}
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-2 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>PIN incorrecto. Inténtalo de nuevo.</span>
            </div>
          )}

          {/* Virtual Keypad */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60 font-semibold text-lg text-slate-800 dark:text-white shadow-sm hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60 font-semibold text-lg text-slate-800 dark:text-white shadow-sm hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              ⌫
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
