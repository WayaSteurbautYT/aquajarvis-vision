# Screen Vision - Local Ollama Edition
# One-Click Setup Script for Windows
# Run this PowerShell script as Administrator

Write-Host "🚀 Screen Vision - Local Ollama Edition Setup" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Please run this script as Administrator!" -ForegroundColor Red
    pause
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Installing Python..." -ForegroundColor Red
    Write-Host "Please download and install Python 3.10+ from https://www.python.org/downloads/"
    pause
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Installing Git..." -ForegroundColor Red
    Write-Host "Please download and install Git from https://git-scm.com/download/win"
    pause
    exit 1
}

# Check if Ollama is installed
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "✅ Ollama found: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Ollama..." -ForegroundColor Yellow
    
    # Download Ollama
    $ollamaUrl = "https://ollama.com/download/OllamaSetup.exe"
    $ollamaPath = "$env:TEMP\OllamaSetup.exe"
    
    Write-Host "Downloading Ollama from $ollamaUrl..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $ollamaUrl -OutFile $ollamaPath
    
    Write-Host "Installing Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath $ollamaPath -Wait
    
    # Remove installer
    Remove-Item $ollamaPath -Force
    
    Write-Host "✅ Ollama installed successfully!" -ForegroundColor Green
}

# Clone or update the repository
$repoPath = "$env:USERPROFILE\Desktop\screen.vision"
if (Test-Path $repoPath) {
    Write-Host "📁 Repository exists. Updating..." -ForegroundColor Yellow
    Set-Location $repoPath
    git pull origin main
} else {
    Write-Host "📁 Cloning repository..." -ForegroundColor Yellow
    git clone https://github.com/bullmeza/screen.vision.git $repoPath
    Set-Location $repoPath
}

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Pull the vision model
Write-Host "🤖 Pulling qwen3-vl model (this may take a while)..." -ForegroundColor Yellow
ollama pull qwen3-vl

# Create desktop shortcut
$desktopPath = "$env:USERPROFILE\Desktop\Screen Vision.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($desktopPath)
$shortcut.TargetPath = "python"
$shortcut.Arguments = "app.py"
$shortcut.WorkingDirectory = $repoPath
$shortcut.IconLocation = "shell32.dll,13"
$shortcut.Description = "Screen Vision - Local AI Assistant"
$shortcut.Save()

# Create environment file
$envPath = "$repoPath\.env"
if (-NOT (Test-Path $envPath)) {
    Write-Host "⚙️ Creating .env configuration file..." -ForegroundColor Yellow
    @"
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
"@ | Out-File -FilePath $envPath -Encoding UTF8
}

Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "📱 Desktop shortcut created: Screen Vision.lnk" -ForegroundColor Cyan
Write-Host "🌐 To start Screen Vision:" -ForegroundColor Cyan
Write-Host "   1. Double-click the desktop shortcut" -ForegroundColor White
Write-Host "   2. Or run: python app.py" -ForegroundColor White
Write-Host "   3. Visit: http://localhost:8000" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📚 For more information, visit:" -ForegroundColor Cyan
Write-Host "   https://github.com/bullmeza/screen.vision" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "⚠️  Make sure Ollama is running before starting Screen Vision!" -ForegroundColor Yellow
Write-Host "   Ollama should start automatically with Windows." -ForegroundColor White

# Start Ollama if not running
try {
    $ollamaProcess = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
    if (-NOT $ollamaProcess) {
        Write-Host "🚀 Starting Ollama..." -ForegroundColor Yellow
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "✅ Ollama started!" -ForegroundColor Green
    } else {
        Write-Host "✅ Ollama is already running!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not start Ollama automatically. Please start it manually." -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "🎯 Ready to start Screen Vision? (Y/N)" -ForegroundColor Green
$choice = Read-Host

if ($choice -eq 'Y' -or $choice -eq 'y') {
    Write-Host "🚀 Starting Screen Vision..." -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList "app.py" -WorkingDirectory $repoPath
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
} else {
    Write-Host "👋 Setup complete! Run the desktop shortcut when you're ready." -ForegroundColor Cyan
}

pause
