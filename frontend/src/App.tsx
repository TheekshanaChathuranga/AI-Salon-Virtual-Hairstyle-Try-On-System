import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CameraCapture } from './components/CameraCapture';
import { HairstyleCatalog } from './components/HairstyleCatalog';
import { ColorSelector } from './components/ColorSelector';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { ProcessingModal } from './components/ProcessingModal';
import { StylistBookingModal } from './components/StylistBookingModal';
import { AdminView } from './components/AdminView';
import { ApiService, SALON_COLORS } from './services/api';
import type { Hairstyle, CustomerSession } from './types';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<'tryon' | 'catalog' | 'admin'>('tryon');
  const [step, setStep] = useState<number>(1); // 1: Photo, 2: Style & Color, 3: Processing, 4: Result

  // Session & Privacy
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  // Try-On Pipeline State
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState<string | null>(null);
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string>('original');
  const [customHex, setCustomHex] = useState<string>('#D4AF37');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // Initialize session and fetch hairstyles catalog on mount
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const s = await ApiService.createSession(true);
    setSession(s);
    const styles = await ApiService.getHairstyles();
    setHairstyles(styles);
    if (styles.length > 0) {
      setSelectedHairstyle(styles[0]);
    }
  };

  const handleStartFromHero = () => {
    setCurrentTab('tryon');
    setStep(1);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handlePhotoSelected = (photoUrl: string) => {
    setCustomerPhotoUrl(photoUrl);
    setStep(2);
  };

  const handleRunTryOn = async () => {
    if (!customerPhotoUrl || !selectedHairstyle) return;

    setIsProcessing(true);
    const chosenColor = selectedColorId === 'custom' ? customHex : selectedColorId;

    const job = await ApiService.submitTryOn(
      session?.session_token || 'demo-token',
      selectedHairstyle.id,
      customerPhotoUrl,
      chosenColor
    );

    setIsProcessing(false);
    if (job.status === 'COMPLETED' && job.output_image_url) {
      setResultUrl(job.output_image_url);
      setStep(4);
    } else {
      alert(job.error_message || 'The hairstyle preview could not be generated. Please try another photo.');
    }
  };

  const handleResetSession = () => {
    setStep(1);
    setCustomerPhotoUrl(null);
    setResultUrl(null);
    setSelectedColorId('original');
  };

  const handleDeletePhoto = async () => {
    if (confirm("Are you sure you want to permanently delete your photo from our servers?")) {
      if (customerPhotoUrl) {
        await ApiService.scrubImage(customerPhotoUrl);
      }
      if (resultUrl) {
        await ApiService.scrubImage(resultUrl);
      }
      alert("Your photograph and generated images have been permanently wiped from the salon servers.");
      handleResetSession();
    }
  };

  const currentColorName = selectedColorId === 'custom'
    ? `Custom (${customHex})`
    : SALON_COLORS.find(c => c.id === selectedColorId)?.name;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onReset={handleResetSession}
      />

      {/* View Mode 1: Virtual Try-On Flow */}
      {currentTab === 'tryon' && (
        <>
          {step === 1 && !customerPhotoUrl && (
            <Hero
              onStartTryOn={handleStartFromHero}
              onExploreCatalog={() => setCurrentTab('catalog')}
            />
          )}

          {/* Stepper Indicator */}
          <div style={{ maxWidth: '800px', margin: '30px auto 20px auto', padding: '0 20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              {[
                { s: 1, label: 'Photo Intake' },
                { s: 2, label: 'Style & Color' },
                { s: 4, label: 'Before & After' }
              ].map(({ s, label }) => {
                const isActive = step >= s;
                const isCurrent = step === s;
                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCurrent ? 'var(--gold-accent)' : isActive ? '#22C55E' : 'rgba(255,255,255,0.08)',
                      color: isCurrent ? '#0A0A0D' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      boxShadow: isCurrent ? '0 0 16px rgba(212,175,55,0.5)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {s === 4 ? '3' : s}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: isCurrent ? '#FFFFFF' : 'var(--text-muted)', fontWeight: isCurrent ? 600 : 400 }}>
                      {label}
                    </span>
                  </div>
                );
              })}
              {/* Connector line */}
              <div style={{
                position: 'absolute',
                top: '18px',
                left: '40px',
                right: '40px',
                height: '2px',
                background: 'rgba(255,255,255,0.08)',
                zIndex: 1
              }}>
                <div style={{
                  height: '100%',
                  background: 'var(--gold-accent)',
                  width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Step 1: Capture / Upload */}
          {step === 1 && (
            <CameraCapture
              onPhotoSelected={handlePhotoSelected}
              consentGiven={consentGiven}
              setConsentGiven={setConsentGiven}
            />
          )}

          {/* Step 2: Hairstyle & Color Selection */}
          {step === 2 && (
            <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
              {/* Top Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Change Photo</span>
                </button>

                <button
                  className="btn-gold"
                  onClick={handleRunTryOn}
                  style={{ padding: '14px 36px', fontSize: '1.05rem' }}
                >
                  <Sparkles size={18} />
                  <span>Generate AI Try-On Preview</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Hairstyle Catalog Selection */}
              <HairstyleCatalog
                hairstyles={hairstyles}
                selectedHairstyle={selectedHairstyle}
                onSelectHairstyle={setSelectedHairstyle}
              />

              {/* Hair Color Selection Layer */}
              <ColorSelector
                selectedColorId={selectedColorId}
                onSelectColor={setSelectedColorId}
                customHex={customHex}
                setCustomHex={setCustomHex}
              />

              {/* Bottom Sticky Action Bar */}
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                  className="btn-gold"
                  onClick={handleRunTryOn}
                  style={{ padding: '16px 48px', fontSize: '1.15rem' }}
                >
                  <Sparkles size={20} />
                  <span>Generate With {selectedHairstyle?.name || 'Selected Cut'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Before / After Studio */}
          {step === 4 && customerPhotoUrl && resultUrl && selectedHairstyle && (
            <div style={{ padding: '0 24px' }}>
              <BeforeAfterSlider
                originalUrl={customerPhotoUrl}
                resultUrl={resultUrl}
                hairstyle={selectedHairstyle}
                selectedColorName={currentColorName}
                onTryAnother={() => setStep(2)}
                onDeletePhoto={handleDeletePhoto}
                onBookStylist={() => setIsBookingOpen(true)}
              />
            </div>
          )}
        </>
      )}

      {/* View Mode 2: Full Hairstyle Library */}
      {currentTab === 'catalog' && (
        <div style={{ padding: '20px 24px' }}>
          <HairstyleCatalog
            hairstyles={hairstyles}
            selectedHairstyle={selectedHairstyle}
            onSelectHairstyle={(style) => {
              setSelectedHairstyle(style);
              setCurrentTab('tryon');
              if (!customerPhotoUrl) {
                setStep(1);
              } else {
                setStep(2);
              }
            }}
          />
        </div>
      )}

      {/* View Mode 3: Admin Dashboard */}
      {currentTab === 'admin' && (
        <AdminView />
      )}

      {/* Neural Processing Modal */}
      <ProcessingModal isOpen={isProcessing} />

      {/* Stylist Booking Modal */}
      {selectedHairstyle && resultUrl && (
        <StylistBookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          hairstyle={selectedHairstyle}
          selectedColorName={currentColorName}
          resultUrl={resultUrl}
        />
      )}
    </div>
  );
}
