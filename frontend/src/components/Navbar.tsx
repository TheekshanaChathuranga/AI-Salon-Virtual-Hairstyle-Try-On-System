import React from 'react';
import { Sparkles, Scissors, ShieldCheck, LayoutDashboard, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'tryon' | 'catalog' | 'admin';
  setCurrentTab: (tab: 'tryon' | 'catalog' | 'admin') => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onReset }) => {
  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '16px',
      zIndex: 50,
      margin: '0 auto',
      maxWidth: '1240px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      marginTop: '16px'
    }}>
      {/* Brand */}
      <div 
        onClick={() => setCurrentTab('tryon')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #8A6B0D 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0A0A0D'
        }}>
          <Scissors size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.04em' }}>
            ATELIER <span style={{ color: 'var(--gold-accent)' }}>AI</span>
          </div>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Hairstyle Try-On Studio
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={`pill-tab ${currentTab === 'tryon' ? 'active' : ''}`}
          onClick={() => setCurrentTab('tryon')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Sparkles size={16} />
          <span>Virtual Try-On</span>
        </button>

        <button
          className={`pill-tab ${currentTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentTab('catalog')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Scissors size={16} />
          <span>Hairstyle Library</span>
        </button>

        <button
          className={`pill-tab ${currentTab === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentTab('admin')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LayoutDashboard size={16} />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Status & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: '#4ADE80',
          background: 'rgba(74, 222, 128, 0.1)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(74, 222, 128, 0.25)'
        }}>
          <ShieldCheck size={14} />
          <span>Privacy Shield Active (24h)</span>
        </div>

        <button
          onClick={onReset}
          title="Start Fresh Session"
          className="btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} />
          <span>New Try-On</span>
        </button>
      </div>
    </nav>
  );
};
