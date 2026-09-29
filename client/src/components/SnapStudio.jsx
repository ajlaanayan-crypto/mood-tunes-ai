import React, { useState } from 'react';
import { Download, Sparkles, Sliders } from 'lucide-react';

export default function SnapStudio({ photoData, poseData, onClose }) {
  const [selectedFilter, setSelectedFilter] = useState('golden');
  const [showBadge, setShowBadge] = useState(true);

  const filters = [
    { id: 'normal', name: 'Original', css: 'none' },
    { id: 'golden', name: 'Golden Hour', css: 'contrast(105%) saturate(120%) sepia(20%) hue-rotate(-10deg)' },
    { id: 'cyber', name: 'Cyber Neon', css: 'contrast(115%) saturate(140%) hue-rotate(190deg)' },
    { id: 'vogue', name: 'Vogue B&W', css: 'grayscale(100%) contrast(130%) brightness(105%)' },
    { id: 'sunset', name: 'Sunset Glow', css: 'contrast(110%) saturate(130%) sepia(35%)' },
    { id: 'emerald', name: 'Emerald Vibe', css: 'contrast(110%) hue-rotate(80deg) saturate(125%)' }
  ];

  const activeFilterObj = filters.find(f => f.id === selectedFilter) || filters[0];

  const downloadFinalPhoto = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoData;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Apply Filter via canvas context
      ctx.filter = activeFilterObj.css;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      // Draw Badge overlay if enabled
      if (showBadge && poseData) {
        const badgeWidth = Math.min(360, canvas.width * 0.45);
        const badgeHeight = 64;
        const margin = 30;
        const bx = canvas.width - badgeWidth - margin;
        const by = canvas.height - badgeHeight - margin;

        // Draw translucent dark container
        ctx.fillStyle = 'rgba(15, 20, 32, 0.85)';
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(bx, by, badgeWidth, badgeHeight, 16);
        } else {
          ctx.rect(bx, by, badgeWidth, badgeHeight);
        }
        ctx.fill();
        ctx.stroke();

        // Draw Badge Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px "Space Grotesk", sans-serif';
        ctx.fillText(`📸 ${poseData.pose_label || 'Best Pose'}`, bx + 18, by + 30);

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`YOLOv8 AI Score: ${poseData.pose_score || 95}%`, bx + 18, by + 52);
      }

      // Trigger Download
      const link = document.createElement('a');
      link.download = `SelfiePulse_YOLOv8_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 12, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{ maxWidth: '960px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="section-title">
              <Sparkles style={{ color: 'var(--primary-pink)' }} /> Studio Snapshot Editor
            </h2>
            <p className="section-desc">Apply aesthetic lighting filters & custom YOLOv8 badge.</p>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px' }}>
            ✕ Close
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Main Photo Preview */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={photoData}
              alt="Captured Selfie"
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
                filter: activeFilterObj.css,
                transition: 'filter 0.3s ease'
              }}
            />

            {/* Custom Overlay Badge Preview */}
            {showBadge && poseData && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                padding: '10px 16px',
                background: 'rgba(15, 20, 32, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(236, 72, 153, 0.5)',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>
                  📸 {poseData.pose_label}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981' }}>
                  YOLOv8 AI Score: {poseData.pose_score}%
                </div>
              </div>
            )}
          </div>

          {/* Filter & Export Controls */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={16} /> Aesthetic Studio Filters:
            </h4>

            <div className="filter-grid">
              {filters.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`filter-thumb ${selectedFilter === f.id ? 'selected' : ''}`}
                >
                  {f.name}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={showBadge}
                  onChange={(e) => setShowBadge(e.target.checked)}
                  style={{ accentColor: 'var(--primary-pink)' }}
                />
                <span style={{ fontWeight: 600 }}>Include YOLOv8 Pose Verification Badge</span>
              </label>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={downloadFinalPhoto} className="btn-primary" style={{ justifyContent: 'center', padding: '14px' }}>
                <Download size={20} /> Download High-Res Photo
              </button>
              <button onClick={onClose} className="btn-secondary" style={{ justifyContent: 'center' }}>
                Back to Camera
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
