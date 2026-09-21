import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../services/auth';
import {
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Video,
  FileText,
  User
} from 'lucide-react';

export default function SystemCheckPage({ exam, onSystemCheckSuccess, onCancel }) {
  const [currentUser] = useState(auth.getUser());
  const videoRef = useRef(null);
  const [isStarting, setIsStarting] = useState(false);

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
        console.warn('Camera stream notice:', err);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartExam = async () => {
    setIsStarting(true);
    try {
      let snapshotB64 = null;
      if (videoRef.current && videoRef.current.videoWidth) {
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, 480, 360);
        snapshotB64 = canvas.toDataURL('image/jpeg', 0.7);
      }
      await onSystemCheckSuccess(snapshotB64);
    } catch (err) {
      console.error('Failed to start exam:', err);
      setIsStarting(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <button
            onClick={onCancel}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Pre-Exam Camera Check
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Verify your camera preview before entering the examination session.
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Examination</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-blue)' }}>{exam?.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exam?.subject_code} • {exam?.duration_minutes} Mins</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Direct Camera Box */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
              <Camera size={18} color="var(--accent-blue)" />
              <span>Camera Feed</span>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              ● Camera Connected
            </span>
          </div>

          {/* Video Container directly streaming camera */}
          <div style={{
            position: 'relative',
            borderRadius: '10px',
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
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)'
            }}>
              <Video size={13} color="#10b981" />
              <span>Live Camera Preview</span>
            </div>
          </div>

          {/* Direct Status List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.825rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Camera size={15} color="#10b981" /> Webcam Feed
              </span>
              <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Ready
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate & Exam Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Candidate Card */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="var(--accent-blue)" /> Candidate Details
            </h3>
            <div style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <div><strong>Name:</strong> {currentUser?.name}</div>
              <div><strong>Student ID:</strong> {currentUser?.student_id || 'STU101'}</div>
              <div><strong>Email:</strong> {currentUser?.email}</div>
            </div>
          </div>

          {/* Exam Rules Card */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="var(--accent-blue)" /> Exam Guidelines
            </h3>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li>Your webcam remains visible in the sidebar during the exam.</li>
              <li>You can navigate questions using the palette on the right.</li>
              <li>Answers are automatically saved whenever you select an option.</li>
              <li>Do not refresh or close the browser during the exam.</li>
            </ul>
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={handleStartExam}
              disabled={isStarting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              {isStarting ? (
                'Starting Examination...'
              ) : (
                <>
                  Start Examination <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
