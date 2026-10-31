# POWER FITNESS GYM 🏋️‍♂️

> **Premier Air-Conditioned Fitness Club in Wadala, Mumbai**  
> Rated **4.9 / 5.0** based on 350+ customer reviews.

An immersive, modern, high-performance web experience for **Power Fitness Gym**, featuring interactive 3D scroll-driven video flight scrubbing, real-time operating hours telemetry, interactive macro & BMI calculators, dynamic VIP pass generation, and mobile-first responsive architecture.

---

## 📍 Facility Details

* **Address:** Salt Pan Rd, Raval Pada, Sangam Nagar, Antop Hill, Mumbai, Maharashtra 400037  
  *(Alternative mentions: Near BPCA Building, Naigaon Cross Road, Sahakar Nagar, Wadala)*
* **Phone:** [+91 99874 74437](tel:+919987474437)
* **Rating:** 4.9 / 5.0 (350+ Verified Google Reviews)
* **Opening Hours:**
  * **Monday – Saturday:** 6:00 AM – 12:00 AM (Midnight)
  * **Sunday:** Closed
* **Key Links:**
  * [Google Knowledge Graph & Reviews](https://www.google.com/search?kgmid=%2Fg%2F11mhxvk6pv)
  * [Official Instagram Showcase Video](https://www.instagram.com/reel/DFCW9B9iHFv/)
* **Key Amenities:**
  * 100% Fully Air-Conditioned Workout Floor
  * Full Strength & Free Weight Range (Dumbbells up to 150 lbs, Olympic Bars)
  * Plate-Loaded & Pin-Selected Biomechanical Machines
  * Cardio & Endurance Suite
  * Certified 1-on-1 Personal Training
  * Clean & Sanitized Locker Rooms

---

## ✨ Features & Architecture

1. **Scroll World 3D Video Scrub Engine**:
   * Framework-agnostic, zero-jitter video scrubbing engine.
   * In-memory Blob preloader with chunked range loading and seek coalescing.
   * Linear interpolation (rAF lerp) for smooth cinematic glide.
2. **Dynamic Live Facility Status**:
   * Calculates real-time facility operations in Indian Standard Time (IST).
   * Automatically updates indicator pill (`OPEN NOW · 6 AM - 12 AM` or `CLOSED TODAY / OPENS MON 6 AM`).
3. **Interactive Macro & BMI Calculator**:
   * Real-time calculation for Calories, Protein, Carbohydrates, and Fats based on gender, age, weight, and fitness targets.
4. **Instant VIP Pass Generator**:
   * Form generation creating personalized digital passes with serialized codes (`PFG-2026-XXXX-VIP`).
5. **Ambient Sound Synthesizer**:
   * Built-in Web Audio API sub-harmonic ambient drone with organic pulse and user toggle.
6. **Ultra-Clean Vanilla Stack**:
   * HTML5, Vanilla CSS3 (custom properties, fluid clamp typography, zero heavy frameworks), and Vanilla ES6+ JavaScript with GSAP & ScrollTrigger.

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Gopalyadav-codes/powerfitness.git
   cd powerfitness
   ```

2. Start the local server:
   ```bash
   node server.js
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Deploying to Vercel

This repository is pre-configured for instant zero-config deployment on **[Vercel](https://vercel.com/)**:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Import **`Gopalyadav-codes/powerfitness`**.
3. Leave all default settings as-is (Framework: *Other*, Root Directory: `./`).
4. Click **"Deploy"**.

The included `vercel.json` automatically configures:
- HTTP 206 Byte-Range streaming headers for video scrub performance.
- Long-term caching for static media assets on Vercel's global Edge CDN.

---

## 📄 License

© 2026 POWER FITNESS GYM. All rights reserved.
