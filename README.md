<div align="center">

# Screen Vision - Local Ollama Edition

### Get a guided tour for anything, right on your screen - 100% Local & Private

</div>

![Screen Vision Demo](demo.gif)

## What's New in Local Edition

This version replaces ALL cloud dependencies with **local AI models** for complete privacy and offline functionality:

**No API keys required**  
**100% local processing**  
**Works with Ollama, OpenRouter, and other local providers**  
**Supports free local models**  
**Runs on Windows, macOS, and Linux**  
**NVIDIA GPU acceleration supported**  

## Quick Start (5 minutes)

### 1. Install Ollama
```bash
# Windows/macOS: Download from https://ollama.com/
# Linux:
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Pull Vision Model
```bash
ollama pull qwen3-vl
```

### 3. Run Screen Vision
```bash
git clone https://github.com/bullmeza/screen.vision.git
cd screen.vision
pip install -r requirements.txt
python app.py
```

Visit `http://localhost:8000` and start using Screen Vision locally!

## How It Works

The system is straightforward:

1. **You describe your goal** — "I want to set up two-factor authentication on my Google account" or "Help me configure my Git SSH keys"

2. **You share your screen** — The app uses your browser's built-in screen sharing (the same tech used for video calls)

3. **Local AI analyzes what it sees** — Vision language models run locally on your machine to figure out current state

4. **You get one instruction at a time** — No information overload. Just "Click the blue Settings button in the top right" or "Scroll down to find Security"

5. **Automatic progress detection** — When you complete a step, Screen Vision notices the screen changed and automatically gives you the next instruction

## Supported Models

### Local Models (Recommended)
| Model | Provider | Purpose | Requirements |
|-------|----------|---------|-------------|
| **qwen3-vl** | Ollama | Primary vision model | 8GB+ RAM, GPU recommended |
| **llava** | Ollama | Alternative vision | 8GB+ RAM |
| **bakllava** | Ollama | Lightweight vision | 4GB+ RAM |

### Cloud Models (Optional)
| Model | Provider | Purpose |
|-------|----------|---------|
| **GPT-4V** | OpenRouter | Premium vision |
| **Claude-3** | OpenRouter | Advanced reasoning |
| **Gemini Pro** | OpenRouter | Fast analysis |

## Configuration

### Environment Variables (Optional)

Create a `.env` file for custom configuration:

```bash
# Local Ollama (default)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3-vl

# Optional: OpenRouter for cloud models
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=qwen/qwen3-vl-30b-a3b-instruct

# Optional: Custom local provider
CUSTOM_API_BASE_URL=http://localhost:8080
CUSTOM_API_KEY=your-key
```

### Model Selection

The app automatically detects available models. You can force a specific model:

```bash
# Use specific Ollama model
OLLAMA_MODEL=llava python app.py

# Use OpenRouter cloud model
OPENROUTER_API_KEY=your-key python app.py
```

## Privacy & Security

**100% Local Processing** - This version processes everything locally:

- **Zero data leaves your machine**
- **No API keys or cloud dependencies**
- **Works completely offline**
- **No telemetry or analytics**
- **Open source and auditable**

## Tech Stack

- **Frontend**: Next.js 13, React 18, Tailwind CSS, Zustand
- **Backend**: FastAPI, Python
- **AI**: Ollama (local), OpenRouter (optional cloud)
- **UI**: Radix primitives, Framer Motion, Lucide icons

**Frontend (Next.js + React)**

- Handles screen capture via MediaDevices API
- Runs change detection by comparing scaled-down frames
- Manages PiP window for always-on-top instructions
- Masks its own window from screenshots (so AI doesn't see itself)

**Backend (FastAPI + Python)**

- `/api/step` — Given a goal and screenshot, returns the next single instruction
- `/api/check` — Compares before/after screenshots to verify if a step was completed
- `/api/help` — Answers follow-up questions about what's on screen
- `/api/coordinates` — Locates specific UI elements when needed

## Installation & Setup

### Prerequisites

- Python 3.10+
- Ollama (recommended) or other local LLM provider
- NVIDIA GPU (recommended but not required)

### Option 1: One-Click Setup (Windows)

```powershell
# Run this in PowerShell as Administrator
iwr -useb https://raw.githubusercontent.com/bullmeza/screen.vision/main/setup.ps1 | iex
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/bullmeza/screen.vision.git
cd screen.vision

# Install Python dependencies
pip install -r requirements.txt

# Install Ollama (if not already installed)
# Windows/macOS: Download from https://ollama.com/
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Pull the vision model
ollama pull qwen3-vl

# Run the application
python app.py
```

### Option 3: Development Mode

For frontend development with hot reload:

```bash
# Install frontend dependencies
npm install

# Start both frontend and backend
npm run dev
```

This runs:
- Next.js dev server on `http://localhost:3000`
- FastAPI server on `http://localhost:8000`

## Usage

1. **Start the app**: `python app.py`
2. **Open browser**: Navigate to `http://localhost:8000`
3. **Describe your goal**: "Help me set up two-factor authentication"
4. **Share your screen**: Allow browser screen sharing
5. **Follow instructions**: Get step-by-step guidance

## Switching Between Providers

### Using Ollama (Default)
```bash
python app.py
```

### Using OpenRouter (Cloud)
```bash
export OPENROUTER_API_KEY=your-key
python app.py
```

### Using Custom Local Provider
```bash
export CUSTOM_API_BASE_URL=http://localhost:8080
export CUSTOM_API_KEY=your-key
python app.py
```

## Troubleshooting

### Model Not Found
```bash
# Check available models
ollama list

# Pull the required model
ollama pull qwen3-vl
```

### GPU Not Detected
```bash
# Check Ollama GPU support
ollama run qwen3-vl "test"

# If GPU issues, try CPU-only mode
export OLLAMA_GPU=nvidia
```

### Port Already in Use
```bash
# Use different port
python -c "import uvicorn; uvicorn.run('api.index:app', port=8001)"
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with local models
5. Submit a pull request

### Adding New Model Providers

To add support for new local model providers:

1. Create a new client in `api/utils/`
2. Update `api/index.py` to use your client
3. Add configuration options to `.env.example`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.com/) for local LLM hosting
- [Qwen](https://qwenlm.github.io/) for the excellent vision model
- [OpenRouter](https://openrouter.ai/) for cloud model access
- The original Screen Vision project for the core concept

---

**Star this repo if you find it useful!**

**Report issues at [GitHub Issues](https://github.com/bullmeza/screen.vision/issues)**

**Join discussions at [GitHub Discussions](https://github.com/bullmeza/screen.vision/discussions)**
