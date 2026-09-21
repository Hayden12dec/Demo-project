# Project Progress & Mid-Term Milestone Report (65% Target)

**Project Title:** AI-Based Smart Examination Proctoring System  
**Evaluation Stage:** Phase 2 / Mid-Term Review  
**Current Milestone Progress:** **65% Completed**  
**Target Completion:** 100% (Phase 3 Final Submission)

---

## 1. Executive Summary

This project delivers an automated, AI-assisted proctoring platform designed to ensure academic integrity in online computer-based examinations. The system captures live video feeds and computes real-time behavioral telemetry (facial presence, head pose yaw/pitch, and candidate absence) while providing a resilient exam execution interface for students and monitoring tools for administrators.

At the **65% Mid-Term Stage**, the foundational architecture, core exam management engine, candidate authentication, biometric system calibration, and fundamental vision-based proctoring (Face Detection & Gaze/Head Pose Estimation) are fully functional. Deep learning phone detection fine-tuning and multi-modal audio spectral classification are scheduled for Phase 3.

---

## 2. Milestone Feature Breakdown (Current vs. Roadmap)

| Module / Component | Status | Completion % | Implementation Details |
| :--- | :--- | :--- | :--- |
| **User Authentication & RBAC** | ✅ Completed | **100%** | JWT-based auth, Student and Admin roles, profile persistence. |
| **Pre-Exam System Check** | ✅ Completed | **100%** | Hardware webcam check, ambient lighting verification, face calibration. |
| **Core Examination Engine** | ✅ Completed | **100%** | Question palette, real-time timer, auto-save state, exam submission. |
| **Face Detection & Presence** | ✅ Completed | **100%** | YuNet ONNX & Haar fallback, real-time bounding box tracking. |
| **Gaze & Head Pose Tracking** | ✅ Completed | **85%** | 3D head pose estimation (Yaw, Pitch, Roll) with anomaly thresholds. |
| **Suspicion Scoring Engine** | 🟡 In Progress | **70%** | Weighted penalty scoring, violation timestamps, and risk rating. |
| **Admin Dashboard & Exam Mgmt**| 🟡 In Progress | **75%** | Exam creation, attempt review, live session logs. |
| **YOLOv8 Phone/Device Detection**| 🚧 Phase 3 | **35%** | Model architecture defined; dataset collection and fine-tuning underway. |
| **Audio Noise Spectral Analysis** | 🚧 Phase 3 | **30%** | Web Audio API RMS energy baseline; FFT frequency classifier in development. |
| **Forensic PDF Report Generator**| 🚧 Phase 3 | **20%** | Data model ready; dynamic PDF canvas & export scheduled for final phase. |

**Overall Progress: 65%**

---

## 3. System Architecture & Work Completed

```
+-----------------------------------------------------------------------------------+
|                               PHASE 2 ARCHITECTURE                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Frontend Client (React 18 + Vite) ]                                            |
|    - Student Portal (System Check -> Exam Interface -> Result Summary)           |
|    - Admin Portal (Exam Creator -> Candidate Monitoring -> Session Logs)         |
|    - Live Bounding Box & Gaze Tracker Overlay (Smooth Interpolation)              |
|                                     |                                             |
|                                     v (REST API + JSON Payloads)                  |
|                                                                                   |
|  [ FastAPI Backend Core ]                                                         |
|    - Authentication & Profile Services (JWT HS256)                                |
|    - Exam & Attempt State Machine                                                 |
|    - AI Vision Pipeline:                                                          |
|        * OpenCV YuNet Face Detection (ONNX Runtime)                              |
|        * Head Pose Estimation (Perspective-n-Point / Geometry)                   |
|        * Real-time Temporal Suspicion Scoring Engine                              |
|    - Resilient JSON / MongoDB Document Store                                      |
+-----------------------------------------------------------------------------------+
```

---

## 4. Work in Progress & Phase 3 Timeline (70% - 100%)

1. **Sprint 5 (Milestone 75%)**:
   - Finalize custom-trained YOLOv8 Nano weights for smartphone and handheld note detection.
   - Refine multi-person bounding box filtering.

2. **Sprint 6 (Milestone 85%)**:
   - Implement Web Audio FFT spectral analyzer to distinguish ambient room noise from human speech.
   - Fine-tune SFace cosine similarity face matching during live exam sessions.

3. **Sprint 7 (Milestone 100% - Final Submission)**:
   - Automated cryptographic PDF forensic integrity report generation with timestamped evidence snapshots.
   - End-to-end stress testing, system hardening, and final presentation deployment.
