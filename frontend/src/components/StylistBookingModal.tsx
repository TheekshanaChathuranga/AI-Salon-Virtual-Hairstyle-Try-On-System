import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { Hairstyle } from '../types';

interface StylistBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hairstyle: Hairstyle;
  selectedColorName?: string;
  resultUrl: string;
}

export const StylistBookingModal: React.FC<StylistBookingModalProps> = ({
  isOpen,
  onClose,
  hairstyle,
  selectedColorName,
  resultUrl
}) => {
  const [selectedStylist, setSelectedStylist] = useState<string>('elena');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 10, 13, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel-gold" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {isBooked ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#4ADE80'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>
              Consultation Reserved!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your stylist has received your custom AI lookbook preview for the <strong>{hairstyle.name}</strong>.
            </p>
            <button className="btn-gold" onClick={onClose} style={{ width: '100%' }}>
              Return to Studio
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '4px' }}>
              Book Hairstyle Appointment
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Your selected style and AI preview will be directly linked to your stylist's consultation iPad.
            </p>

            {/* Lookbook Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              <img
                src={resultUrl}
                alt="AI Result"
                style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{hairstyle.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gold-accent)' }}>
                  Shade: {selectedColorName || 'Natural Tone'}
                </div>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Select Master Stylist
                </label>
                <select
                  value={selectedStylist}
                  onChange={e => setSelectedStylist(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#1A1A22',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="elena">Elena Vance — Creative Director (Cuts & Balayage)</option>
                  <option value="marcus">Marcus Thorne — Senior Texture Specialist</option>
                  <option value="chloe">Chloe Laurent — Master Colorist</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#1A1A22',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Time Slot
                  </label>
                  <select
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#1A1A22',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF'
                    }}
                  >
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sophia Loren"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#1A1A22',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#1A1A22',
                    border: '1px solid var(--border-subtle)',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <button type="submit" className="btn-gold" style={{ marginTop: '8px' }}>
                Confirm Appointment & Send Lookbook
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
