import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, AlertTriangle, Plus, Check, EyeOff } from 'lucide-react';
import { ApiService } from '../services/api';
import type { AdminStats, Hairstyle } from '../types';

export const AdminView: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Hairstyle Form State
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('short');
  const [newLength] = useState<string>('bob');
  const [newTexture, setNewTexture] = useState<string>('wavy');
  const [newDesc, setNewDesc] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await ApiService.getAdminStats();
    setStats(s);
    const h = await ApiService.getHairstyles();
    setHairstyles(h);
  };

  const handleCreateStyle = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Hairstyle = {
      id: 'custom-' + Date.now(),
      name: newName,
      category: newCategory as any,
      length: newLength as any,
      texture: newTexture as any,
      description: newDesc,
      reference_image_url: '/hairstyles/blonde_bob.jpg',
      thumbnail_url: '/hairstyles/blonde_bob.jpg',
      tags: ['new', newCategory],
      active: true
    };
    setHairstyles([created, ...hairstyles]);
    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
  };

  const toggleActive = (id: string) => {
    setHairstyles(hairstyles.map(h => h.id === id ? { ...h, active: !h.active } : h));
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Salon Admin Portal & Telemetry</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time Virtual Try-On metrics, GPU inference telemetry, and catalog curation.
          </p>
        </div>

        <button className="btn-gold" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add New Hairstyle</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-accent)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>TOTAL TRY-ONS</span>
            <TrendingUp size={20} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>{stats?.total_tryons ?? 148}</div>
          <div style={{ fontSize: '0.8rem', color: '#4ADE80', marginTop: '4px' }}>+18% from last week</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60A5FA', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>TODAY'S GENERATIONS</span>
            <Clock size={20} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>{stats?.daily_tryons ?? 24}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active sessions today</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AVG INFERENCE LATENCY</span>
            <Clock size={20} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>{stats?.average_generation_time_ms ?? 185} <span style={{ fontSize: '1rem', fontWeight: 400 }}>ms</span></div>
          <div style={{ fontSize: '0.8rem', color: '#4ADE80', marginTop: '4px' }}>LocalVision & Poisson Blending</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F87171', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>FAILED RUNS</span>
            <AlertTriangle size={20} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700 }}>{stats?.failed_generations ?? 2}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Due to dark/unaligned photos</div>
        </div>
      </div>

      {/* Popular Hairstyles Ranking */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>
          Most Popular Salon Hairstyles
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(stats?.popular_hairstyles ?? []).map((item, idx) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '24px', fontWeight: 700, color: 'var(--gold-accent)' }}>#{idx + 1}</span>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '10px' }}>
                  {item.category}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, item.count * 1.5)}%`, height: '100%', background: 'var(--gold-accent)' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.count} try-ons</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hairstyle Catalog Management Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>
          Catalog Hairstyle Management
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Hairstyle</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Texture</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hairstyles.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={h.thumbnail_url} alt={h.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{h.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.description.slice(0, 45)}...</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{h.category}</td>
                  <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{h.texture}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: h.active ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: h.active ? '#4ADE80' : '#F87171'
                    }}>
                      {h.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleActive(h.id)}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      {h.active ? <EyeOff size={14} /> : <Check size={14} />}
                      <span>{h.active ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hairstyle Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel-gold" style={{ maxWidth: '500px', width: '100%', padding: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px' }}>Add Salon Hairstyle</h3>
            <form onSubmit={handleCreateStyle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Style Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Italian Soft Shag"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1A1A22', border: '1px solid var(--border-subtle)', color: '#FFFFFF', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1A1A22', border: '1px solid var(--border-subtle)', color: '#FFFFFF', marginTop: '4px' }}
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                    <option value="special">Special</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Texture</label>
                  <select
                    value={newTexture}
                    onChange={e => setNewTexture(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1A1A22', border: '1px solid var(--border-subtle)', color: '#FFFFFF', marginTop: '4px' }}
                  >
                    <option value="straight">Straight</option>
                    <option value="wavy">Wavy</option>
                    <option value="curly">Curly</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe layers, face framing, and volume..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1A1A22', border: '1px solid var(--border-subtle)', color: '#FFFFFF', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>Save Hairstyle</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
