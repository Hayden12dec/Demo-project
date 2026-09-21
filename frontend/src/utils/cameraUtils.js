/**
 * High-compatibility camera utility for physical and virtual WebRTC streams.
 */

export async function requestWebcamStream() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('WebRTC mediaDevices is not supported in this browser.');
  }

  // Attempt 1: Standard video: true (Maximum cross-browser/device compatibility)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    return stream;
  } catch (err1) {
    console.warn('Standard getUserMedia({video: true}) failed, attempting fallback...', err1);
  }

  // Attempt 2: Explicit resolution fallback
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    return stream;
  } catch (err2) {
    console.warn('Fallback getUserMedia failed:', err2);
    throw err2;
  }
}

/**
 * Creates an animated canvas video stream for environments without a physical webcam
 * or when camera permissions are blocked.
 */
export function createSimulatedMediaStream(candidateLabel = 'Candidate Video Feed') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  let frame = 0;
  let timerId = null;

  const drawFrame = () => {
    frame++;

    // Background gradient
    const bgGrad = ctx.createRadialGradient(320, 240, 40, 320, 240, 360);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 480);

    // Subtle ambient lighting pulse
    const pulse = Math.sin(frame * 0.06) * 6;

    // Outer glow for candidate
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.beginPath();
    ctx.arc(320, 190 + pulse, 110, 0, Math.PI * 2);
    ctx.fill();

    // Candidate Silhouette - Shoulders
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(320, 390 + pulse, 160, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(320, 385 + pulse, 145, 105, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(320, 190 + pulse, 68, 0, Math.PI * 2);
    ctx.fill();

    // Face inner contour
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(320, 190 + pulse, 54, 0, Math.PI * 2);
    ctx.fill();

    // Top Header Pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(16, 16, 260, 36);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.strokeRect(16, 16, 260, 36);

    // Green Active Indicator
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(32, 34, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText('VIRTUAL CAMERA ACTIVE', 46, 38);

    // Candidate Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText(candidateLabel, 20, 460);

    // Live clock
    const timeStr = new Date().toLocaleTimeString();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(timeStr, 540, 38);
  };

  drawFrame();
  timerId = setInterval(drawFrame, 80);

  let stream = null;
  if (canvas.captureStream) {
    stream = canvas.captureStream(25);
  } else if (canvas.mozCaptureStream) {
    stream = canvas.mozCaptureStream(25);
  }

  if (stream) {
    // Attach cleanup method
    stream._stopSimulation = () => {
      if (timerId) clearInterval(timerId);
    };
  }

  return stream;
}
