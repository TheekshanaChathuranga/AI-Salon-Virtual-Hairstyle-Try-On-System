import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Eye, ShieldCheck } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
}

const STAGES = [
  { label: 'Detecting 5-point facial landmarks & pose...', icon: Eye },
  { label: 'Aligning hairstyle geometry & volume flow...', icon: Cpu },
  { label: 'Applying Poisson seamless boundary blending...', icon: Sparkles },
  { label: 'Fine-tuning strand illumination & color grade...', icon: ShieldCheck }
];

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIndex(prev => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStage = STAGES[currentStageIndex];
  const IconComponent = currentStage.icon;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 10, 13, 0.85)',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel-gold" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '36px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Animated Central Core */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid var(--gold-accent)',
            animation: 'pulseGuide 2s infinite'
          }} />
          <IconComponent size={36} color="var(--gold-accent)" />
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>
          Crafting Your Hairstyle Look
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', minHeight: '22px' }}>
          {currentStage.label}
        </p>

        {/* Shimmer Bar */}
        <div style={{
          height: '6px',
          borderRadius: '3px',
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div className="shimmer-bar" style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <span>Identity: 100% Protected</span>
          <span>•</span>
          <span>GPU Acceleration: Active</span>
        </div>
      </div>
    </div>
  );
};
