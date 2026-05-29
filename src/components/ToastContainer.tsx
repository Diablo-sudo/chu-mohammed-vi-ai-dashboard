import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, Info, XCircle, Undo2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const EASE = [0.22, 1, 0.36, 1];

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

type ToastStyle = {
  accent: string;
  accentBorder: string;
  iconColor: string;
  badgeBg: string;
  glow: string;
};

const styleMap: Record<string, ToastStyle> = {
  success: {
    accent: '#00D4AA',
    accentBorder: 'border-l-[#00D4AA]',
    iconColor: 'text-[#00D4AA]',
    badgeBg: 'bg-[#00D4AA]/10',
    glow: '0 8px 32px rgba(0,212,170,0.12)',
  },
  error: {
    accent: '#D64545',
    accentBorder: 'border-l-[#D64545]',
    iconColor: 'text-[#D64545]',
    badgeBg: 'bg-[#D64545]/10',
    glow: '0 8px 32px rgba(214,69,69,0.12)',
  },
  warning: {
    accent: '#FF8C00',
    accentBorder: 'border-l-[#FF8C00]',
    iconColor: 'text-[#FF8C00]',
    badgeBg: 'bg-[#FF8C00]/10',
    glow: '0 8px 32px rgba(255,140,0,0.12)',
  },
  info: {
    accent: '#00D4AA',
    accentBorder: 'border-l-[#00D4AA]',
    iconColor: 'text-[#00D4AA]',
    badgeBg: 'bg-[#00D4AA]/10',
    glow: '0 8px 32px rgba(0,212,170,0.12)',
  },
};

function ProgressBar({ accent, duration, paused, onEnd }: { accent: string; duration: number; paused: boolean; onEnd: () => void }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-chu-border)]/30 overflow-hidden">
      <div
        className="h-full rounded-full opacity-70"
        style={{
          width: '100%',
          backgroundColor: accent,
          animation: `toastShrink ${duration}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
        onAnimationEnd={onEnd}
      />
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      <style>{`@keyframes toastShrink { from { width: 100%; } to { width: 0%; } }`}</style>
      <div
        className="fixed z-[1001] flex flex-col gap-2 p-4 pointer-events-none"
        style={{ top: '96px', right: '20px', width: '380px' }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.slice(0, 5).map((toast) => {
            const Icon = iconMap[toast.type];
            const s = styleMap[toast.type];
            const isHovered = hoveredId === toast.id;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2, ease: EASE } }}
                transition={{ duration: 0.35, ease: EASE }}
                onMouseEnter={() => setHoveredId(toast.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative pointer-events-auto overflow-hidden rounded-xl border bg-[var(--color-chu-card)] text-[var(--color-chu-text)] shadow-lg backdrop-blur-sm w-full"
                style={{ borderColor: 'var(--color-chu-border)', boxShadow: `${s.glow}, 0 2px 8px rgba(0,0,0,0.3)` }}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.accentBorder}`} style={{ backgroundColor: s.accent }} />

                <div className="relative flex items-start gap-2.5 px-4 py-3 pl-5 min-h-[44px]">
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${s.badgeBg}`}>
                    <Icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0 self-center pt-0.5">
                    {toast.title && (
                      <p className="text-sm font-bold leading-tight text-[var(--color-chu-text)]">{toast.title}</p>
                    )}
                    <p className={`text-xs leading-relaxed ${toast.title ? 'text-[var(--color-chu-text-sec)]' : 'font-semibold text-[var(--color-chu-text)]'}`}>
                      {toast.message}
                    </p>
                    {toast.action && (
                      <button
                        onClick={toast.action.onClick}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#00D4AA] hover:text-white transition-colors"
                      >
                        <Undo2 size={11} />
                        {toast.action.label}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-chu-text-sec)]/50 hover:text-[#00D4AA] hover:bg-[var(--color-chu-bg)] border border-transparent hover:border-[#00D4AA]/20 transition-all text-sm font-bold"
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>

                {toast.duration && toast.duration > 0 && (
                  <ProgressBar accent={s.accent} duration={toast.duration} paused={isHovered} onEnd={() => removeToast(toast.id)} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {toasts.length > 5 && (
          <div className="pointer-events-auto text-center text-[11px] text-[var(--color-chu-text-sec)]/50 font-medium">
            +{toasts.length - 5} autres notifications
          </div>
        )}
      </div>
    </>
  );
}
