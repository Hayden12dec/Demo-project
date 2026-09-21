# SmartProctor AI — Frontend Architecture & Technical Documentation

> **Project Title**: AI-Based Smart Examination Proctoring System  
> **Frontend Stack**: React 18, Vite, Vanilla CSS Design System, WebRTC API, Web Audio API, HTML5 Canvas 2D  
> **Document Purpose**: Comprehensive technical reference, code walkthrough guide, and viva defense cheat-sheet for the frontend subsystem.

---

## 1. Executive Summary & Architecture Overview

The frontend is a single-page application (SPA) developed with **React 18** and **Vite**. It handles candidate authentication, pre-exam biometric and hardware calibration, full-screen examination execution, client-side video/audio frame telemetry capture, and real-time 60 FPS holographic bounding-box rendering. Additionally, it provides faculty and proctors with an administrative suite for authoring exams, live multi-candidate video surveillance, and reviewing forensic incident logs with snapshot evidence.

### High-Level Architectural Pipeline

```
+-----------------------------------------------------------------------------------------+
|                                 REACT 18 FRONTEND CLIENT                                |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   [ Hardware Acquisition Layer ]                                                        |
|      - WebRTC Camera Feed (navigator.mediaDevices.getUserMedia)                         |
|      - Web Audio API Noise Monitor (AudioContext + AnalyserNode -> RMS Energy)           |
|                                                                                         |
|   [ Exam Session & Anti-Cheat Engine ]                                                  |
|      - Fullscreen API Enforcement (fullscreenchange)                                    |
|      - Tab-Switch & Minimization Trap (visibilitychange -> document.hidden)              |
|      - Focus/Blur Trap (window.onblur)                                                  |
|      - Offscreen Canvas Frame Grabber (640x480 JPEG Quality 0.60 @ 1.5s interval)       |
|                                                                                         |
|   [ Visual Rendering Engine ]                                                           |
|      - faceTrackerRenderer.js (60 FPS Exponential Smoothing Canvas Interpolation)       |
|      - Dynamic 3D Gaze Vector & Pose Reticle Indicator                                  |
|      - Color-coded Risk Badges & Suspicion Gauges                                       |
|                                     |                                                   |
|                                     v (JSON Payloads via api.js + Bearer JWT)           |
|                                                                                         |
|   [ FastAPI Python Backend (Port 8000) ]                                                |
|      - OpenCV YuNet (Face Detection) + SFace (Face Verification)                        |
|      - YOLOv8 Nano (Mobile Phone & Prohibited Device Detection)                         |
|      - Suspicion Scoring Engine (Cumulative Risk Rating: LOW, MEDIUM, HIGH)             |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Directory Structure & File Manifest

```
frontend/
├── index.html                   # HTML5 document entrypoint & root mount
├── package.json                 # Project dependencies & Vite build scripts
├── vite.config.js               # Vite bundler configuration & local dev server proxy
└── src/
    ├── main.jsx                 # React root bootstrap (ReactDOM.createRoot)
    ├── App.jsx                  # Main application orchestrator & state-based router
    │
    ├── pages/                   # Primary Full-Screen Views
    │   ├── Login.jsx            # Student and Admin unified login form
    │   ├── Register.jsx         # New student registration with baseline photo
    │   ├── AdminRegister.jsx    # Faculty registration form
    │   ├── StudentDashboard.jsx # Exam schedule, previous attempts & scores
    │   ├── SystemCheckPage.jsx  # Pre-exam webcam, lighting & face calibration
    │   ├── ExamSessionPage.jsx  # Active exam environment with live proctoring
    │   ├── ExamResultPage.jsx   # Post-submission scorecard & integrity summary
    │   ├── AdminDashboard.jsx   # Faculty KPI dashboard & attempt analytics
    │   ├── AdminLiveMonitor.jsx # Real-time multi-candidate surveillance grid
    │   ├── AdminExams.jsx       # Exam management & question authoring suite
    │   ├── AdminReportView.jsx  # Forensic audit report with timestamped evidence
    │   └── ProfileEditor.jsx    # User profile & biometric image update
    │
    ├── components/              # Reusable Modular UI Components
    │   ├── Navbar.jsx           # Top navigation bar with active route & logout
    │   ├── WebcamMonitor.jsx    # Video element wrapper with overlay canvas
    │   ├── QuestionPalette.jsx  # Question navigation palette (answered/marked/unvisited)
    │   ├── MetricCard.jsx       # Standard KPI metric card with icons
    │   ├── RiskBadge.jsx        # Color-coded risk status pill (LOW, MEDIUM, HIGH)
    │   ├── Charts.jsx           # SVG-based telemetry graphs & violation breakdown
    │   └── EvidenceViewerModal.jsx # High-res modal viewer for cheating snapshots
    │
    ├── services/                # Communication & Background Listeners
    │   ├── api.js               # Centralized HTTP request utility with JWT interceptors
    │   ├── auth.js              # Token and user session management (localStorage)
    │   └── audioService.js      # Web Audio API ambient sound & voice energy meter
    │
    ├── utils/                   # Hardware & Graphics Utilities
    │   ├── cameraUtils.js       # WebRTC camera stream negotiation & virtual fallback
    │   └── faceTrackerRenderer.js # 60 FPS Canvas rendering engine with exponential smoothing
    │
    └── styles/
        └── index.css            # Dark theme design system, typography, and utility tokens
```

---

## 3. Detailed Page Workflows

### 3.1 Authentication & Routing (`App.jsx`, `Login.jsx`, `auth.js`)
- **State-Based Navigation**: Instead of external routing libraries, `App.jsx` controls navigation using a top-level `currentRoute` state variable.
- **Session Persistence**: `auth.js` persists the user object and JWT token into the browser's `localStorage`.
- **Role Guarding**:
  - `student`: Default lands on `student-dashboard`. Access to `system-check`, `exam-session`, `exam-result`, and `profile`.
  - `admin`: Default lands on `admin-dashboard`. Access to `admin-live`, `admin-exams`, `report-view`, and `profile`.
- **Navbar Auto-Suppression**: During an active examination (`currentRoute === 'exam-session'`), the navigation bar is completely unmounted to prevent distraction and accidental navigation.

---

### 3.2 Pre-Exam Hardware & Biometric Check (`SystemCheckPage.jsx`)
Before entering an exam, the student must pass three mandatory hardware checks:
1. **Webcam Feed Verification**:
   - Calls `requestWebcamStream()` from `cameraUtils.js`.
   - Mounts the live video feed into the DOM.
2. **Environmental Lighting & Face Presence**:
   - Captures an uncompressed frame and posts it to `POST /api/proctoring/system-check`.
   - Backend evaluates average grayscale pixel brightness (`brightness >= 30.0`) and confirms exactly one face is visible.
3. **Biometric Baseline Registration**:
   - Sends the verified camera frame to `POST /api/proctoring/update-face-reference`.
   - Stores the Base64 facial image as the candidate's active reference against which all exam frames are compared.
- **Unlock Logic**: The **"Proceed to Exam"** button remains disabled until all three check pills display green checkmarks.

---

### 3.3 Active Exam & Telemetry Engine (`ExamSessionPage.jsx`)
This is the core operational screen during the test.

1. **Timer & Auto-Save**:
   - Maintains a countdown timer ticking every second (`setInterval`).
   - When remaining time reaches zero, `handleSubmitExam()` triggers automatically.
   - Every answer selection immediately commits to the backend via `POST /api/attempts/{id}/save-answer`.
2. **Question Palette State Management**:
   - Tracks questions into three distinct categories:
     - `Answered` (Green)
     - `Marked for Review` (Purple)
     - `Unvisited / Unanswered` (Dark Gray)
3. **Anti-Cheating Window Listeners**:
   - **Tab-Switching**: Listens to the `visibilitychange` event. If `document.hidden === true`, immediately dispatches an incident flag (`TAB_SWITCHED_OR_MINIMIZED`).
   - **Window Focus Loss**: Listens to the window `blur` event. If the candidate clicks outside the exam tab or opens an external application, dispatches `WINDOW_BLUR_OFF_FOCUS`.
   - **Fullscreen Integrity**: Listens to `fullscreenchange`. If `!document.fullscreenElement`, dispatches `FULLSCREEN_EXITED`.
4. **The Live Proctoring Polling Loop**:
   - An interval timer fires every **1500 ms (1.5 seconds)**.
   - An offscreen canvas captures the webcam feed at 640x480 resolution with JPEG quality `0.60` (`canvas.toDataURL('image/jpeg', 0.6)`).
   - Reads current microphone RMS energy from `audioService.js`.
   - Dispatches a payload to `POST /api/proctoring/frame`:
     ```json
     {
       "attempt_id": "c71a...",
       "image_base64": "data:image/jpeg;base64,...",
       "audio_energy": 0.048
     }
     ```
   - Updates local UI state with the returned telemetry:
     - Facial presence & count
     - 3D Head Pose (Yaw, Pitch, Roll angles)
     - Mobile phone / prohibited device detection
     - Running suspicion penalty score & overall risk rating (`LOW`, `MEDIUM`, `HIGH`).

---

### 3.4 Faculty & Proctor Surveillance Suite (`AdminDashboard.jsx`, `AdminLiveMonitor.jsx`, `AdminReportView.jsx`)
1. **`AdminDashboard.jsx`**:
   - Displays aggregated test metrics: Total Attempts, High-Risk Violations Flagged, Active Live Tests, Average Integrity Score.
   - Allows instant navigation to exam management or live camera surveillance.
2. **`AdminLiveMonitor.jsx`**:
   - Polls `GET /api/admin/live-attempts` every 3 seconds.
   - Renders a multi-card grid where each active candidate's video snapshot, head pose angles, and live suspicion score are displayed.
3. **`AdminReportView.jsx`**:
   - Comprehensive audit log for any submitted exam attempt.
   - Displays an incident timeline with exact timestamps, violation types, and severity weights.
   - Includes photographic evidence snapshots taken automatically when suspicious activity was flagged.

---

## 4. Key Technical Modules (Deep-Dive)

### 4.1 Camera Stream Acquisition: `cameraUtils.js`
- **`requestWebcamStream()`**:
  - First attempts standard WebRTC initialization: `navigator.mediaDevices.getUserMedia({ video: true, audio: false })`.
  - Fallback logic: If standard constraints fail, re-attempts with explicit resolution bounds (`width: { ideal: 640 }, height: { ideal: 480 }`).
- **`createSimulatedMediaStream()`**:
  - A fallback for environments without a physical camera or where camera permissions are blocked.
  - Generates an HTML5 canvas running an animation loop at 25 FPS, complete with an animated candidate silhouette, ambient lighting pulse, and timestamp watermark, then converts it to a live stream via `canvas.captureStream(25)`.

---

### 4.2 Web Audio Acoustic Telemetry: `audioService.js`
- **Architecture**: Implements the `AudioMonitor` class using the browser's native **Web Audio API**.
- **Operation**:
  1. Requests microphone access: `navigator.mediaDevices.getUserMedia({ audio: true, video: false })`.
  2. Creates an `AudioContext` and an `AnalyserNode` with an `fftSize` of 512 and `smoothingTimeConstant` of 0.8.
  3. Connects the microphone source to the analyser.
  4. Runs a `requestAnimationFrame` loop reading frequency bin data into a `Uint8Array`.
  5. Computes Root-Mean-Square (RMS) acoustic energy:
     $$\text{RMS} = \frac{\sqrt{\frac{1}{N}\sum_{i=1}^{N} x_i^2}}{255}$$
  6. Returns a normalized floating-point energy level between `0.0` and `1.0`.
- **Privacy Advantage**: Transmits only numerical energy values rather than raw voice recordings, ensuring compliance with privacy standards while still detecting talking and room noise.

---

### 4.3 60 FPS Visual Interpolation Engine: `faceTrackerRenderer.js`
- **Problem**: Network latency means the AI backend only returns bounding boxes every 1.5 seconds. Rendering boxes directly causes severe visual stutter.
- **Solution — Adaptive Dual-Rate Exponential Smoothing**:
  - The `SmoothTracker` class maintains `currentFace` and `targetFace` states.
  - On every animation frame (`requestAnimationFrame` at 60 FPS), current coordinates smoothly interpolate toward target coordinates:
    ```javascript
    const factor = Math.min(1.0, dt * smoothingSpeed);
    current.x += (target.x - current.x) * factor;
    current.y += (target.y - current.y) * factor;
    ```
- **Holographic HUD Elements Rendered**:
  - Precision corner bracket bounding boxes.
  - Sweeping laser scanline animation.
  - 3D Gaze Orientation Reticle (displays an interactive directional line projecting outward from the face based on Yaw and Pitch angles).
  - Dedicated red bounding boxes and warning tags when mobile phones or secondary persons are detected.

---

### 4.4 Centralized API Client: `api.js`
- Standardizes all REST communication using the Fetch API.
- Automatically extracts the JWT token from `localStorage` and attaches the `Authorization: Bearer <token>` header to all outgoing requests.
- Intercepts `401 Unauthorized` responses and cleans up invalid credentials automatically.

---

## 5. Frequently Asked Viva Questions & Answers

### Q1: What libraries and frameworks did you use in the frontend?
**Answer**:
> *"The frontend is built with **React 18** and **Vite** for fast performance and component-based UI management. For icons, we used **Lucide-React**. All styling is done using custom **Vanilla CSS** with CSS variables and glassmorphism design principles. For media handling, we used the browser's native **WebRTC API** and **Web Audio API** without requiring heavy third-party media libraries."*

### Q2: How does the camera frame get sent from the frontend to the backend?
**Answer**:
> *"In `ExamSessionPage.jsx`, we draw the live `<video>` feed onto an offscreen `<canvas>` at 640x480 resolution. We then call `canvas.toDataURL('image/jpeg', 0.6)`, which encodes the frame into a compressed Base64 JPEG string (~30 KB). This payload is transmitted via HTTP POST to `/api/proctoring/frame` along with the candidate's current microphone RMS energy."*

### Q3: Why not use WebSockets instead of HTTP POST for the video stream?
**Answer**:
> *"For full continuous 30 FPS video streaming, WebSockets or WebRTC media servers are typical, but they require high network bandwidth and server resources. Because our AI proctoring system uses temporal sliding-window analysis, sampling compressed frames every 1.5 seconds via HTTP POST drastically cuts server load and bandwidth by over 90%, while our frontend canvas interpolation engine (`faceTrackerRenderer.js`) still delivers a smooth 60 FPS overlay locally."*

### Q4: How does the system detect if a student opens another tab or window?
**Answer**:
> *"We bind event listeners to `document.addEventListener('visibilitychange')` and `window.addEventListener('blur')`. When a student switches tabs or minimizes the browser, `document.hidden` evaluates to `true`, and the frontend logs a `TAB_SWITCHED_OR_MINIMIZED` event. We also bind to `fullscreenchange` to catch students exiting full-screen mode."*

### Q5: How is candidate privacy maintained with audio monitoring?
**Answer**:
> *"In `audioService.js`, we use the browser's native Web Audio API (`AudioContext` and `AnalyserNode`) to calculate the Root-Mean-Square (RMS) volume energy locally in memory. Only a single numerical float (e.g. `0.048`) is sent to the server. No microphone voice recordings or audio files are ever saved or transmitted."*

### Q6: What happens if a candidate's camera disconnects or permissions are blocked during testing?
**Answer**:
> *"Our camera utility (`cameraUtils.js`) provides dual-layer resilience. It first attempts standard resolution negotiation. If hardware is completely unavailable or blocked, it invokes `createSimulatedMediaStream()`, which generates a simulated video feed on an HTML5 canvas to keep the application stable and testable without crashing."*

### Q7: Where are student biometric face references stored?
**Answer**:
> *"During the pre-exam system check (`SystemCheckPage.jsx`), the candidate captures a clean reference photo. This is sent to `/api/proctoring/update-face-reference` and stored as a Base64 string in the user's record in `data_store/users.json`. During the exam, live frames are compared against this exact baseline image using SFace cosine similarity."*
