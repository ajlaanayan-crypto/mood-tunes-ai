import React, { useState } from 'react';
import Navbar from './components/Navbar';
import WebcamStudio from './components/WebcamStudio';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import PoseCatalog from './components/PoseCatalog';
import TrainingDashboard from './components/TrainingDashboard';
import SnapStudio from './components/SnapStudio';

export default function App() {
  const [activeTab, setActiveTab] = useState('webcam');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedPoseData, setCapturedPoseData] = useState(null);
  const [showSnapStudio, setShowSnapStudio] = useState(false);

  const handleSnapPhoto = (photoDataUrl, poseDetails) => {
    setCapturedPhoto(photoDataUrl);
    setCapturedPoseData(poseDetails);
    setShowSnapStudio(true);
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'webcam' && (
          <WebcamStudio onSnapPhoto={handleSnapPhoto} />
        )}

        {activeTab === 'analyzer' && (
          <PhotoAnalyzer onSnapPhoto={handleSnapPhoto} />
        )}

        {activeTab === 'catalog' && (
          <PoseCatalog />
        )}

        {activeTab === 'training' && (
          <TrainingDashboard />
        )}
      </main>

      {/* Snap Studio Modal */}
      {showSnapStudio && capturedPhoto && (
        <SnapStudio
          photoData={capturedPhoto}
          poseData={capturedPoseData}
          onClose={() => setShowSnapStudio(false)}
        />
      )}
    </div>
  );
}
