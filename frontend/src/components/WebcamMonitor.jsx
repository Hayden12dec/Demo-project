import React, { useEffect, useRef } from 'react';
import { Camera, Video } from 'lucide-react';

export default function WebcamMonitor({ attemptId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.debug('Camera play note:', e));
          };
        }
      } catch (err) {
        console.warn('Camera initialization note:', err);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="glass-card" style={{ padding: '0.85rem', width: '310px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600 }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ color: 'var(--text-primary)' }}>
            Camera: <strong style={{ color: '#10b981' }}>Active</strong>
          </span>
        </div>

        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--bg-secondary)',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Camera size={12} color="var(--accent-blue)" />
          <span>Live Preview</span>
        </div>
      </div>

      {/* Direct Video Container */}
      <div style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#020617',
        aspectRatio: '4/3',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />

        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.68rem',
          backdropFilter: 'blur(4px)',
          color: '#e2e8f0'
        }}>
          <Video size={11} color="#10b981" />
          <span>Candidate Video</span>
        </div>
      </div>
    </div>
  );
}
