# 🛡️ PARTYHAT - Dodge the Digital S.T.D.s

**PARTYHAT** is a high-octane 3D "Runner" game built with **Three.js** and **GLSL Shaders**. Navigate through a neon-soaked digital landscape, dodging viruses, phishing attempts, and malware to keep your data clean.

![Game Splash](assets/splash_mockup.png) <!-- Note: Replace with actual screenshot if available -->

## 🚀 Techo-Stack & Frameworks

- **Core Engine**: [Three.js](https://threejs.org/) (WebGL/WebGPU ready)
- **3D Assets**: GLTF Models with [Draco Compression](https://google.github.io/draco/)
- **Visual Effects**: 
    - **GPGPU Particles**: High-performance particle simulation for neon trails.
    - **Post-Processing**: `EffectComposer` with `UnrealBloomPass` and `OutlinePass`.
- **UI Architecture**: Glassmorphism with Vanilla CSS & Modern Typography (Orbitron/Inter).
- **Controls**: Interactive debugging with `lil-gui` and responsive touch/keyboard input.

## ✨ Immersive Effects & Features

- **Neon Cyber-Runner Aesthetics**: A dark-mode world illuminated by vibrant glowing materials.
- **Dynamic Lane Shifting**: Smooth character movement across multiple digital paths.
- **Real-time Hazards**:
    - **Digital Viruses**: Avoid collision with high-speed 3D malware.
    - **Phishing Popups**: Interactive "Scam Blocker" mini-gestures to delete deceptive emails.
- **Enhanced Power-ups**:
    - **🛡️ VPN Shield**: Temporary invincibility with blue-tinted visual feedback.
    - **⚡ Combo Multipliers**: Build your score with consecutive clean dodges.
- **Cinematic Post-Processing**: Bloom glow, screen shake on impact, and vignette danger pulses.

## 🛠️ Installation & Setup

To run this project locally, follow these steps:

### Prerequisites
- A modern web browser (supporting WebGL 2.0).
- A local development server.

### Local Execution (Static)
Since this project uses **ESM (ECMAScript Modules)** and **Import Maps**, it requires a local server to load assets correctly.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/moreiracarloseduardo/Three.js_Runner.git
    cd Three.js_Runner
    ```
2.  **Start a local server**:
    If you have Node.js installed, you can use:
    ```bash
    # Using 'serve'
    npx serve .
    
    # Or using Python's built-in server
    python -m http.server
    ```
3.  **Open in Browser**:
    Navigate to `http://localhost:3000` (or the port provided by your server).

## 📁 Project Structure

- `index.html`: Main game entry point, UI structure, and core logic.
- `assets/`: 
    - `3dmodels`: Compressed GLB/GLTF assets.
    - `sprites`: High-resolution 2D textures.
    - `draco`: Decompression libraries for 3D performance.
- `build.js`: Script for bundling/embedding assets (used for playable-ad generation).

---

Developed with ❤️ and **Three.js**. Stay safe out there!
