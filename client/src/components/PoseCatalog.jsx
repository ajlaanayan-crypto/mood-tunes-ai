import React, { useState, useEffect } from 'react';
import { Grid, Sparkles, Target, Zap, Info } from 'lucide-react';

export default function PoseCatalog() {
  const [poses, setPoses] = useState([
    {
      id: 'tilt_glamour',
      name: 'Tilt & Glamour',
      target_tilt: '15° - 25°',
      score_boost: '+20%',
      description: 'Tilt your head slightly to define your jawline and frame your cheekbones naturally.',
      tip: 'Align your chin toward the top corner of your phone camera.',
      difficulty: 'Easy'
    },
    {
      id: 'hand_chin',
      name: 'Hand on Chin / Thinker',
      target_tilt: '10° - 18°',
      score_boost: '+25%',
      description: 'Lightly rest your index finger or hand under your jaw for a stylish fashion-magazine look.',
      tip: 'Keep wrist relaxed, do not press hard on cheeks.',
      difficulty: 'Medium'
    },
    {
      id: 'peace_vibe',
      name: 'Peace & Vibe',
      target_tilt: '5° - 20°',
      score_boost: '+18%',
      description: 'Show a playful V peace sign near your eye level for a vibrant candid picture.',
      tip: 'Ensure hand does not block soft lighting on your face.',
      difficulty: 'Easy'
    },
    {
      id: 'side_profile',
      name: 'Side Profile Chic',
      target_tilt: '12° - 20°',
      score_boost: '+22%',
      description: 'Turn your face 45 degrees to highlight neck posture and side profile contours.',
      tip: 'Keep neck elongated and shoulders pushed back.',
      difficulty: 'Hard'
    },
    {
      id: 'rule_thirds',
      name: 'Rule of Thirds Cinematic',
      target_tilt: '5° - 15°',
      score_boost: '+24%',
      description: 'Position your eyes along the upper 1/3 horizontal grid line for a professional photographer look.',
      tip: 'Leave negative space on one side of the frame.',
      difficulty: 'Medium'
    },
    {
      id: 'classic_smile',
      name: 'Classic Confidence',
      target_tilt: '0° - 8°',
      score_boost: '+15%',
      description: 'Centered posture with eyes focused into the top lens for a genuine smile.',
      tip: 'Keep shoulders level and relaxed.',
      difficulty: 'Easy'
    }
  ]);

  useEffect(() => {
    fetch('/api/pose_catalog')
      .then(res => res.json())
      .then(data => {
        if (data.poses) setPoses(data.poses);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="glass-card">
      <div className="section-header">
        <h2 className="section-title">
          <Grid style={{ color: 'var(--primary-violet)' }} /> YOLOv8 Selfie Pose Guide
        </h2>
        <p className="section-desc">Master these 6 trained selfie poses to score 90%+ in the AI evaluator.</p>
      </div>

      <div className="catalog-grid">
        {poses.map((pose) => (
          <div key={pose.id} className="pose-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {pose.name}
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                background: 'rgba(236, 72, 153, 0.2)',
                color: '#F472B6',
                border: '1px solid rgba(236, 72, 153, 0.4)'
              }}>
                {pose.score_boost} Score
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>
              {pose.description}
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>
              <div style={{ color: 'var(--primary-cyan)', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={14} /> Target Head Tilt: {pose.target_tilt}
              </div>
              <div style={{ color: 'var(--text-dim)' }}>
                Level: <strong style={{ color: '#E5E7EB' }}>{pose.difficulty}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#D1D5DB', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <Info size={14} style={{ minWidth: '14px', marginTop: '2px', color: 'var(--accent-gold)' }} />
              <span>{pose.tip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
