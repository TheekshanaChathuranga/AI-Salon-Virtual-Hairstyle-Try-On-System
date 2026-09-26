import React, { useState } from 'react';
import { Search, Check } from 'lucide-react';
import type { Hairstyle } from '../types';

interface HairstyleCatalogProps {
  hairstyles: Hairstyle[];
  selectedHairstyle: Hairstyle | null;
  onSelectHairstyle: (style: Hairstyle) => void;
}

export const HairstyleCatalog: React.FC<HairstyleCatalogProps> = ({
  hairstyles,
  selectedHairstyle,
  onSelectHairstyle
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Styles' },
    { id: 'short', label: 'Short Hair' },
    { id: 'medium', label: 'Medium Hair' },
    { id: 'long', label: 'Long Hair' },
    { id: 'special', label: 'Special Occasions' }
  ];

  const filteredStyles = hairstyles.filter(style => {
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory;
    const matchesSearch =
      style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Hairstyle Lookbook</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Choose a signature cut from our runway and salon catalog.
          </p>
        </div>

        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '30px',
          padding: '8px 18px',
          width: '280px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search cut, texture, tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`pill-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Hairstyle Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px'
      }}>
        {filteredStyles.map(style => {
          const isSelected = selectedHairstyle?.id === style.id;
          return (
            <div
              key={style.id}
              onClick={() => onSelectHairstyle(style)}
              className={isSelected ? "glass-panel-gold" : "glass-panel"}
              style={{
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? '0 10px 30px rgba(212, 175, 55, 0.3)' : 'none',
                position: 'relative'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'var(--gold-accent)',
                  color: '#0A0A0D',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                }}>
                  <Check size={16} strokeWidth={3} />
                </div>
              )}

              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '1',
                marginBottom: '14px',
                background: '#1A1A22'
              }}>
                <img
                  src={style.thumbnail_url}
                  alt={style.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{style.name}</h3>
                <span style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted)'
                }}>
                  {style.category}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
                {style.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {style.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.7rem',
                      background: 'rgba(212, 175, 55, 0.1)',
                      color: 'var(--gold-accent)',
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
