# ⚡ Nexus AI — Intelligent Coding, Mathematics & Problem Solving Assistant

<p align="center">
  <img src="./src/assets/hero.png" alt="Nexus AI Logo" width="100" />
</p>

<p align="center">
  <b>A sleek, high-performance, and privacy-friendly AI agent built with React 19, Tailwind CSS v4, and Google Gemini.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.3-646cff?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-3.5_Flash_Lite-4285f4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Theme-Dark_%26_Light-indigo?style=for-the-badge" />
</p>

---

## 🌟 Overview

**Nexus AI** is a modern, developer-first AI assistant engineered for software engineering, deep mathematical analysis, scientific derivations, and academic study. Featuring a clean ChatGPT/Gemini-inspired interface, Nexus combines cloud LLM intelligence with an offline fallback solver, real-time code execution sandbox, bi-directional voice conversation, and beautiful KaTeX LaTeX rendering.

---

## ✨ Key Features

### 🌙 1. Sleek Dark & Light Themes
- **Adaptive Dark Palette**: Designed for developers and night owls with deep slate glassmorphism tones (`#0b0e14`, `#151822`).
- **Instant Toggle**: 1-click theme switch via top header Sun/Moon button or Appearance preferences.

### 🧠 2. Bulletproof AI Engine & Auto-Fallback
- **Powered by Google Gemini**: Built with `gemini-3.5-flash-lite`, `gemini-3.8-flash`, and `gemini-3.1-pro`.
- **Intelligent Auto-Fallback**: If a cloud model experiences peak traffic spikes or maintenance, Nexus instantly and transparently switches to the next available model without interrupting your conversation.
- **Smart Offline Mode**: Even without an active API key or internet access, Nexus can solve complex DSA problems, quadratic formulas, physics mechanics, and code review directly in the browser!
- **Local Ollama & OpenAI Support**: Compatible with local Ollama endpoints (`http://localhost:11434/v1`) or custom OpenAI keys.

### 💻 3. Interactive Code Sandbox & Runner
- **Syntax Highlighting**: Real-time Prism.js formatting for Python, JavaScript, TypeScript, C++, Java, HTML, CSS, SQL, and Bash.
- **In-Browser Execution**: Run JavaScript code with real-time console log streams.
- **Live HTML/CSS Preview**: Render frontend code safely inside an isolated iframe sandbox.
- **One-Click Explain**: Get algorithmic time & space complexity ($O(n \log n)$, $O(1)$) and step-by-step logic breakdown.

### 📐 4. KaTeX Math & Science Typesetting
- Display complex equations and step-by-step calculus derivations:
  $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
  $$E = mc^2 \quad \text{and} \quad \oint \vec{B} \cdot d\vec{l} = \mu_0 I_{\text{enc}}$$
- Collapsible **Reasoning & Thought Process** dropdown to inspect how the agent arrived at the solution.

### 🎙️ 5. Bi-directional Voice & Hands-Free Call Mode
- **Speech-to-Text (STT)**: Dictate prompts hands-free in English, Hindi, or Hinglish with auto-transcription.
- **Text-to-Speech (TTS)**: Listen to explanations with customizable system voices and speed controls.
- **Full-Screen Voice Call Mode**: Interactive conversational voice experience featuring a live pulsating visualizer orb.

### 🎯 6. Specialized Agent Personas
- 💻 **Coding Mentor**: Architecture design, algorithmic optimization, bug audits, and edge case prevention.
- 📐 **Math & Science**: Step-by-step proofs, formulas, variable definitions, and final answer highlights.
- 🎓 **Study Tutor**: Concept breakdowns, intuitive analogies, study checklists, and exam revision.
- ⚡ **General Assistant**: Fast, multi-lingual conversational intelligence.

### 📝 7. Study Notes Drawer & File Attachments
- Bookmark any message, code snippet, or formula with 1 click to save it locally.
- Export entire conversations or note collections as Markdown (`.md`) files.
- Attach code files (`.py`, `.js`, `.cpp`, `.java`, `.txt`, `.md`, `.json`, `.csv`) and images for multimodal analysis.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed on your computer.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/nexus-ai.git

# 2. Navigate to project folder
cd nexus-ai

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start chatting!

---

## 🌐 Deploy to Web (100% Free)

### Deploy via Netlify Drop (1 Minute)
1. Run `npm run build` to generate the production package in `/dist`.
2. Drag and drop the `dist/` folder directly to [app.netlify.com/drop](https://app.netlify.com/drop).

### Deploy via Vercel CLI
```bash
npx vercel
```
Follow the interactive prompts to get a live URL in seconds.

---

## 🛠️ Built With

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Math Rendering**: [KaTeX](https://katex.org/)
- **Code Syntax**: [PrismJS](https://prismjs.com/)
- **Voice Capabilities**: Web Speech API (SpeechRecognition & SpeechSynthesis)
- **AI Integration**: Google Gemini API & OpenAI compatible APIs

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
