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
          <p className="text-xs text-slate-600 dark:text-slate-200 font-medium">
            Introduce el PIN de 4 dígitos para ingresar a <span className="font-bold text-[#c5a059]">{panelTitle}</span>
          </p>
        </div>

        {/* PIN Input Display */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className={`flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border transition-all ${
              error 
                ? 'border-rose-500 ring-2 ring-rose-500/30 animate-bounce' 
                : 'border-slate-300 dark:border-white/20'
            }`}>
              {[0, 1, 2, 3].map((idx) => {
                const char = pin[idx];
                return (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-[#043355] border border-slate-200 dark:border-white/30 flex items-center justify-center font-mono text-xl font-bold text-slate-900 dark:text-white shadow-sm"
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
              className="absolute right-2 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
              title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-semibold">
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
                className="py-3 rounded-2xl bg-white/80 dark:bg-[#032a48] hover:bg-white dark:hover:bg-[#053d66] border border-slate-200/80 dark:border-white/20 font-bold text-lg text-slate-900 dark:text-white shadow-sm hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded-2xl bg-slate-200/70 dark:bg-[#021f37] hover:bg-slate-200 dark:hover:bg-[#032e52] border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 rounded-2xl bg-white/80 dark:bg-[#032a48] hover:bg-white dark:hover:bg-[#053d66] border border-slate-200/80 dark:border-white/20 font-bold text-lg text-slate-900 dark:text-white shadow-sm hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 rounded-2xl bg-slate-200/70 dark:bg-[#021f37] hover:bg-slate-200 dark:hover:bg-[#032e52] border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              ⌫
            </button>
          </div>

          {/* Optional Google Login for Admin */}
          {targetPin === '3546' && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { loginWithGoogle } = await import('../services/firebaseService');
                    const user = await loginWithGoogle();
                    if (user) {
                      onSuccess();
                    }
                  } catch (e) {
                    console.error('Google Sign In failed:', e);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100/90 dark:bg-[#02253f] hover:bg-[#c5a059] hover:text-black border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Acceder con Google (Admin)</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
