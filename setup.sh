#!/bin/bash

# Screen Vision - Local Ollama Edition
# One-Click Setup Script for Linux/macOS
# Make executable with: chmod +x setup.sh

set -e

echo "🚀 Screen Vision - Local Ollama Edition Setup"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 not found. Please install Python 3.10+"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Install with: brew install python3"
    else
        print_info "Install with: sudo apt install python3 python3-pip (Ubuntu/Debian)"
    fi
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
print_status "Python found: $PYTHON_VERSION"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Install with: brew install git"
    else
        print_info "Install with: sudo apt install git (Ubuntu/Debian)"
    fi
    exit 1
fi
GIT_VERSION=$(git --version)
print_status "Git found: $GIT_VERSION"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    print_warning "Ollama not found. Installing Ollama..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_info "Installing Ollama for macOS..."
        curl -fsSL https://ollama.com/install.sh | sh
    else
        # Linux
        print_info "Installing Ollama for Linux..."
        curl -fsSL https://ollama.com/install.sh | sh
    fi
    
    # Add ollama to PATH for current session
    export PATH="$PATH:/usr/local/bin"
    
    print_status "Ollama installed successfully!"
else
    OLLAMA_VERSION=$(ollama --version)
    print_status "Ollama found: $OLLAMA_VERSION"
fi

# Clone or update repository
REPO_DIR="$HOME/screen.vision"
if [ -d "$REPO_DIR" ]; then
    print_info "Repository exists. Updating..."
    cd "$REPO_DIR"
    git pull origin main
else
    print_info "Cloning repository..."
    git clone https://github.com/bullmeza/screen.vision.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# Install Python dependencies
print_info "Installing Python dependencies..."
pip3 install -r requirements.txt

# Pull the vision model
print_info "Pulling qwen3-vl model (this may take a while)..."
ollama pull qwen3-vl

# Create environment file
ENV_FILE="$REPO_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    print_info "Creating .env configuration file..."
    cat > "$ENV_FILE" << EOF
# Screen Vision Configuration
# Local Ollama (default)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3-vl

# Optional: OpenRouter for cloud models
# OPENROUTER_API_KEY=sk-or-v1-...
# OPENROUTER_MODEL=qwen/qwen3-vl-30b-a3b-instruct

# Optional: Custom local provider
# CUSTOM_API_BASE_URL=http://localhost:8080
# CUSTOM_API_KEY=your-key
EOF
fi

# Create desktop entry for Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    DESKTOP_ENTRY="$HOME/.local/share/applications/screen-vision.desktop"
    mkdir -p "$(dirname "$DESKTOP_ENTRY")"
    
    print_info "Creating desktop entry..."
    cat > "$DESKTOP_ENTRY" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Screen Vision
Comment=Local AI Screen Assistant
Exec=python3 $REPO_DIR/app.py
Icon=applications-graphics
Terminal=false
Categories=Development;Utility;
EOF
    
    chmod +x "$DESKTOP_ENTRY"
    print_status "Desktop entry created!"
fi

# Create launcher script for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    LAUNCHER_SCRIPT="$HOME/Desktop/Screen Vision.command"
    print_info "Creating launcher script..."
    
    cat > "$LAUNCHER_SCRIPT" << EOF
#!/bin/bash
cd "$REPO_DIR"
python3 app.py
EOF
    
    chmod +x "$LAUNCHER_SCRIPT"
    print_status "Launcher script created on Desktop!"
fi

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null; then
    print_info "Starting Ollama..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a Ollama
    else
        # Linux
        ollama serve &
    fi
    
    sleep 3
    print_status "Ollama started!"
else
    print_status "Ollama is already running!"
fi

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "================================================="
echo -e "${CYAN}📱 To start Screen Vision:${NC}"
echo -e "${WHITE}   1. Run: python3 app.py${NC}"
echo -e "${WHITE}   2. Visit: http://localhost:8000${NC}"
echo ""
echo -e "${CYAN}📚 For more information, visit:${NC}"
echo -e "${WHITE}   https://github.com/bullmeza/screen.vision${NC}"
echo ""
echo -e "${YELLOW}⚠️  Make sure Ollama is running before starting Screen Vision!${NC}"

# Ask if user wants to start Screen Vision now
echo ""
read -p "🎯 Ready to start Screen Vision? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    print_info "Starting Screen Vision..."
    python3 app.py &
    sleep 2
    
    # Try to open browser
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8000
    elif command -v open &> /dev/null; then
        open http://localhost:8000
    fi
else
    print_info "Setup complete! Run 'python3 app.py' when you're ready."
fi
