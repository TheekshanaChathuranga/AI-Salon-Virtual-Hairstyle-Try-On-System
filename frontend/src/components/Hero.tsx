import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Eye } from 'lucide-react';

interface HeroProps {
  onStartTryOn: () => void;
  onExploreCatalog: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartTryOn, onExploreCatalog }) => {
  return (
    <div style={{
      maxWidth: '1240px',
      margin: '40px auto 30px auto',
      padding: '40px 24px',
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: '40px',
      alignItems: 'center'
    }}>
      {/* Left Column: Headlines & Call to Action */}
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          color: 'var(--gold-accent)',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} />
          <span>Haute Coiffure AI Generation</span>
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          lineHeight: 1.15,
          fontWeight: 700,
          marginBottom: '20px',
          letterSpacing: '-0.02em'
        }}>
          Find Your Perfect <br />
          <span style={{
            background: 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA820A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Hairstyle Transformation
          </span>
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: '32px',
          maxWidth: '520px'
        }}>
          Preview curated salon cuts, radiant colors, and voluminous textures with zero commitment. 
          Our neural engine protects your facial identity with seamless Poisson boundary blending.
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '40px' }}>
          <button className="btn-gold" onClick={onStartTryOn} style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            <span>Start Virtual Try-On</span>
            <ArrowRight size={18} />
          </button>

          <button className="btn-secondary" onClick={onExploreCatalog} style={{ padding: '14px 28px' }}>
            <span>Browse Hairstyle Catalog</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--gold-accent)' }}><Eye size={20} /></div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.3 }}>
              <strong>100% Face Identity</strong>
              <div style={{ color: 'var(--text-muted)' }}>Eyes, nose & skin locked</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#4ADE80' }}><ShieldCheck size={20} /></div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.3 }}>
              <strong>24h Auto-Scrub</strong>
              <div style={{ color: 'var(--text-muted)' }}>Ephemeral photo retention</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#F472B6' }}><HeartHandshake size={20} /></div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.3 }}>
              <strong>Stylist Booking</strong>
              <div style={{ color: 'var(--text-muted)' }}>Direct lookbook handoff</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Visual Teaser */}
      <div className="glass-panel-gold" style={{ padding: '20px', position: 'relative' }}>
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
        }}>
          <img
            src="/models/result_blonde_bob_demo.jpg"
            alt="AI Virtual Hairstyle Preview"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '14px' }}
          />

          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: 'rgba(10, 10, 13, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-gold)'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chic Textured Bob • Honey Blonde</div>
              <div style={{ fontSize: '0.75rem', color: '#4ADE80' }}>* AI Transferred with Perfect Facial Match</div>
            </div>
            <span style={{
              background: 'var(--gold-accent)',
              color: '#0A0A0D',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px'
            }}>
              LIVE PREVIEW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
