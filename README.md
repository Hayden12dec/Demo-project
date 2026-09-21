# SmartProctor AI — Mid-Term Evaluation Build (Phase 2 • 65% Milestone)

> **Academic Project Submission**: AI-Based Smart Examination Proctoring System  
> **Progress Status**: **65% Completed (Phase 2 Mid-Term Prototype)**  
> **Documentation**: See [PROJECT_PROGRESS_REPORT.md](file:///c:/Users/ferns/Downloads/project/milestone_60_percent/PROJECT_PROGRESS_REPORT.md) for full sprint deliverables and milestone checklist.

---

## 🎯 Completed Phase 2 Features (65% Milestone)

- ✅ **Authentication & Role-Based Access**: Student Portal and Faculty / Proctor Dashboard with JWT security.
- ✅ **Pre-Exam System Check**: Hardware camera calibration, room lighting analysis, and biometric baseline enrollment.
- ✅ **Interactive Examination Engine**: Multi-choice question palette, remaining time countdown, auto-save state, and exam submission.
- ✅ **Core AI Vision Tracking**:
  - Real-time OpenCV YuNet Face Detection & Bounding Box Interpolation.
  - 3D Head Pose (Yaw, Pitch, Roll) and Gaze Tracking.
  - Absence Detection and Flagging.
- ✅ **Real-Time Scoring Engine**: Dynamic cumulative suspicion scoring with risk rating (`LOW`, `MEDIUM`, `HIGH`).
- ✅ **Proctor Dashboard**: Session logs, candidate attempt breakdown, and violation telemetry breakdown.

---

## 🚧 Phase 3 Deliverables (Under Development / Final Submission)

- ⏳ **YOLOv8 Deep Learning Phone/Device Detection**: Custom weight training on handheld devices and suspicious notes.
- ⏳ **Web Audio Spectral Noise Classifier**: Distinguishing background voices vs ambient noise.
- ⏳ **Automated Forensic PDF Generator**: Cryptographic report export with embedded snapshot timelines.

---

## 🚀 How to Run the Phase 2 Milestone Demo

### Quick Start (Windows)
Execute in PowerShell:
```powershell
.\run_system.ps1
```

### Manual Start:
1. **Backend (FastAPI)**:
   ```bash
   uvicorn backend.app:app --reload --port 8000
   ```
2. **Frontend (React + Vite)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Default Demo Credentials:
- **Student**: `student@proctor.edu` / `Student@123`
- **Admin**: `admin@proctor.edu` / `Admin@123`
