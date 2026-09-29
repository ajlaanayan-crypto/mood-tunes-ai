import React, { useRef, useEffect, useState } from 'react';
import { Camera, Sparkles, Zap, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WebcamStudio({ onSnapPhoto }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // Real-time pose evaluation states
  const [poseData, setPoseData] = useState({
    pose_label: 'Detecting Pose...',
    pose_score: 75.0,
    head_tilt_degrees: 0,
    recommendations: ['Position yourself in front of the camera'],
    is_best_pose: false
  });

  const [autoSnap, setAutoSnap] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const lastSnapTimeRef = useRef(0);

  // Initialize camera stream
  useEffect(() => {
    async function startCamera() {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError("Webcam permission denied or camera not found. You can also test with uploaded photos in 'Photo Upload' tab!");
      }
    }
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Frame processing loop
  useEffect(() => {
    let animationFrameId;
    let isProcessing = false;

    const processLoop = async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4 && !isProcessing) {
        isProcessing = true;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Golden Ratio Rule-of-Thirds Grid Overlay
        drawGridOverlay(ctx, canvas.width, canvas.height);

        // Send base64 frame payload to backend for YOLOv8 Pose Analysis or compute client-side
        try {
          // Send frame snapshot to backend every ~500ms
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = 320;
          frameCanvas.height = 240;
          const frameCtx = frameCanvas.getContext('2d');
          frameCtx.drawImage(video, 0, 0, 320, 240);
          const base64Img = frameCanvas.toDataURL('image/jpeg', 0.6);

          const res = await fetch('/api/detect_pose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_base64: base64Img,
              width: canvas.width,
              height: canvas.height
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setPoseData(data);
              drawSkeletonHUD(ctx, data.keypoints, data.bbox, canvas.width, canvas.height, data.pose_score);

              // Auto snap if score >= 90%
              if (autoSnap && data.pose_score >= 90 && Date.now() - lastSnapTimeRef.current > 4000) {
                lastSnapTimeRef.current = Date.now();
                captureSnapshot();
              }
            }
          }
        } catch (err) {
          // Client-side fallback preview estimation
          drawFallbackHUD(ctx, canvas.width, canvas.height);
        }

        isProcessing = false;
      }
      animationFrameId = requestAnimationFrame(processLoop);
    };

    processLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoSnap, streamActive]);

  // Draw rule of thirds grid
  const drawGridOverlay = (ctx, width, height) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical third lines
    ctx.beginPath();
    ctx.moveTo(width / 3, 0); ctx.lineTo(width / 3, height);
    ctx.moveTo((width * 2) / 3, 0); ctx.lineTo((width * 2) / 3, height);
    // Horizontal third lines
    ctx.moveTo(0, height / 3); ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (height * 2) / 3); ctx.lineTo(width, (height * 2) / 3);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Draw YOLOv8 keypoints skeleton HUD
  const drawSkeletonHUD = (ctx, keypoints, bbox, width, height, score) => {
    if (!keypoints || keypoints.length === 0) return;

    const isHigh = score >= 88;
    const colorPrimary = isHigh ? '#10B981' : '#8B5CF6';
    const colorGlow = isHigh ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)';

    // Draw Bounding Box
    if (bbox && bbox.length === 4) {
      const [x1, y1, x2, y2] = bbox;
      ctx.strokeStyle = colorPrimary;
      ctx.lineWidth = 2;
      ctx.shadowColor = colorGlow;
      ctx.shadowBlur = 10;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      
      // Draw corner accents
      const len = 16;
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Top Left
      ctx.moveTo(x1, y1 + len); ctx.lineTo(x1, y1); ctx.lineTo(x1 + len, y1);
      // Top Right
      ctx.moveTo(x2 - len, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + len);
      // Bottom Left
      ctx.moveTo(x1, y2 - len); ctx.lineTo(x1, y2); ctx.lineTo(x1 + len, y2);
      // Bottom Right
      ctx.moveTo(x2 - len, y2); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 - len);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw Skeleton Joint Lines
    const connections = [
      [1, 2], [1, 0], [2, 0], [1, 3], [2, 4], // facial
      [5, 6], [5, 7], [6, 8], [7, 9], [8, 10] // upper body shoulders & arms
    ];

    ctx.strokeStyle = colorPrimary;
    ctx.lineWidth = 2.5;

    connections.forEach(([i1, i2]) => {
      if (keypoints[i1] && keypoints[i2]) {
        const p1 = keypoints[i1];
        const p2 = keypoints[i2];
        if (p1[2] > 0.3 && p2[2] > 0.3) {
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }
      }
    });

    // Draw Keypoint Nodes
    keypoints.forEach((pt) => {
      if (pt && pt[2] > 0.3) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = colorPrimary;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 4.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    ctx.shadowBlur = 0;
  };

  const drawFallbackHUD = (ctx, width, height) => {
    // Draw target face oval guide
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.38, width * 0.18, height * 0.26, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    setFlashing(true);
    setTimeout(() => setFlashing(false), 400);

    const video = videoRef.current;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth || 1280;
    snapCanvas.height = video.videoHeight || 720;
    const ctx = snapCanvas.getContext('2d');

    // Flip horizontally for natural photo export
    ctx.translate(snapCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

    const dataUrl = snapCanvas.toDataURL('image/png');
    onSnapPhoto(dataUrl, poseData);
  };

  return (
    <div className="studio-layout">
      {/* Left Column: Camera Feed */}
      <div className="glass-card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="section-title">
              <Sparkles className="text-pink" style={{ color: 'var(--primary-pink)' }} /> Live YOLOv8 Pose HUD
            </h2>
            <p className="section-desc">Align your head angle & posture in real-time for maximum selfie score.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={autoSnap}
              onChange={(e) => setAutoSnap(e.target.checked)}
              style={{ accentColor: 'var(--primary-pink)' }}
            />
            <span style={{ color: autoSnap ? '#EC4899' : 'var(--text-muted)', fontWeight: 600 }}>
              Auto Snap (Score &gt; 90%)
            </span>
          </label>
        </div>

        {cameraError ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle size={40} style={{ color: '#EF4444', marginBottom: '12px' }} />
            <p style={{ fontSize: '0.95rem', color: '#FCA5A5' }}>{cameraError}</p>
          </div>
        ) : (
          <div className="webcam-viewport">
            {flashing && <div className="camera-flash-overlay" />}
            
            {/* Live Score Floating Badge */}
            <div className="hud-score-badge">
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                  Pose Score
                </div>
                <div className="score-number">{poseData.pose_score}%</div>
              </div>
              {poseData.is_best_pose ? (
                <CheckCircle2 size={24} style={{ color: '#10B981' }} />
              ) : (
                <Zap size={24} style={{ color: 'var(--primary-violet)' }} />
              )}
            </div>

            <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
            <canvas ref={canvasRef} className="webcam-canvas" />

            {/* Bottom HUD Recommendation Banner */}
            <div className="hud-pose-banner">
              <div className="hud-tip-text">
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <span>{poseData.recommendations[0] || 'Keep your face centered and tilt slightly.'}</span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.3)', color: '#D8B4FE' }}>
                {poseData.pose_label}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <button onClick={captureSnapshot} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <Camera size={20} /> Capture Studio Selfie
          </button>
        </div>
      </div>

      {/* Right Column: Real-time Analytics & Tips */}
      <div className="glass-card">
        <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
          🎯 Pose Analytics HUD
        </h3>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detected Pose</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-pink)', marginTop: '2px' }}>
            {poseData.pose_label}
          </div>
        </div>

        {/* Head Tilt Gauge */}
        <div style={{ marginBottom: '16px' }}>
          <div className="metric-row">
            <span style={{ color: 'var(--text-muted)' }}>Head Tilt Angle</span>
            <span style={{ fontWeight: 700, color: Math.abs(poseData.head_tilt_degrees) >= 12 && Math.abs(poseData.head_tilt_degrees) <= 25 ? '#10B981' : '#F59E0B' }}>
              {poseData.head_tilt_degrees}° {Math.abs(poseData.head_tilt_degrees) >= 12 && Math.abs(poseData.head_tilt_degrees) <= 25 ? '(Golden Angle ✨)' : ''}
            </span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill" style={{ width: `${Math.min(100, Math.abs(poseData.head_tilt_degrees) * 3)}%` }} />
          </div>
        </div>

        {/* Composition / Framing Gauge */}
        <div style={{ marginBottom: '16px' }}>
          <div className="metric-row">
            <span style={{ color: 'var(--text-muted)' }}>Rule of Thirds Alignment</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-cyan)' }}>
              {poseData.framing_score || 85}%
            </span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill" style={{ width: `${poseData.framing_score || 85}%`, background: 'linear-gradient(90deg, #06B6D4, #3B82F6)' }} />
          </div>
        </div>

        {/* Live Tips List */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
            ✨ AI Photography Suggestions:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {poseData.recommendations.map((tip, idx) => (
              <div key={idx} style={{ fontSize: '0.84rem', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#E5E7EB' }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
