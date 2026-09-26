import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { SALON_COLORS } from '../services/api';

interface ColorSelectorProps {
  selectedColorId: string;
  onSelectColor: (colorId: string) => void;
  customHex: string;
  setCustomHex: (hex: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColorId,
  onSelectColor,
  customHex,
  setCustomHex
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  return (
    <div className="glass-panel" style={{ padding: '24px', maxWidth: '800px', margin: '24px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={18} color="var(--gold-accent)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Salon Color Layer (Optional)</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {selectedColorId === 'custom' ? `Custom Shade (${customHex})` : SALON_COLORS.find(c => c.id === selectedColorId)?.name || 'Default Model Tone'}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Select a professional salon dye shade. The AI adjusts hair pigments while preserving natural highlight luminosity.
      </p>

      {/* Swatches Grid */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        {SALON_COLORS.map(color => {
          const isSelected = selectedColorId === color.id;
          return (
            <div
              key={color.id}
              onClick={() => {
                setShowCustomPicker(false);
                onSelectColor(color.id);
              }}
              className={`color-swatch ${isSelected ? 'active' : ''}`}
              title={`${color.name}: ${color.description}`}
              style={{
                backgroundColor: color.hex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSelected && <Check size={14} color={color.hex === '#1C1C1E' || color.hex === '#3B2219' ? '#FFFFFF' : '#0A0A0D'} strokeWidth={3} />}
            </div>
          );
        })}

        {/* Custom Color Swatch */}
        <div
          onClick={() => {
            setShowCustomPicker(!showCustomPicker);
            onSelectColor('custom');
          }}
          className={`color-swatch ${selectedColorId === 'custom' ? 'active' : ''}`}
          title="Custom Hex Shade"
          style={{
            background: 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {selectedColorId === 'custom' && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
        </div>
      </div>

      {/* Custom Color Picker Input */}
      {showCustomPicker && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-gold)'
        }}>
          <input
            type="color"
            value={customHex}
            onChange={e => setCustomHex(e.target.value)}
            style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
          />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Custom Hex Dye</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fine-tune custom pigment hex code</div>
          </div>
          <input
            type="text"
            value={customHex}
            onChange={e => setCustomHex(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#FFFFFF',
              width: '100px',
              textAlign: 'center',
              fontSize: '0.85rem'
            }}
          />
        </div>
      )}
    </div>
  );
};
