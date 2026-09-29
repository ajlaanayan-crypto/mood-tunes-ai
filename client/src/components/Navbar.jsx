import React from 'react';
import { Camera, Image as ImageIcon, Sparkles, Cpu, Grid } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'webcam', label: 'Live Camera HUD', icon: Camera },
    { id: 'analyzer', label: 'Photo Upload', icon: ImageIcon },
    { id: 'catalog', label: 'Selfie Pose Catalog', icon: Grid },
    { id: 'training', label: 'YOLOv8 Model Hub', icon: Cpu }
  ];

  return (
    <header className="navbar">
      <div className="brand-logo">
        <div className="brand-icon">📸</div>
        <div>
          <div className="brand-title">SelfiePulse AI</div>
          <span className="brand-tag">YOLOv8 Pose Studio</span>
        </div>
      </div>

      <nav className="nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
