// AquaJarvis Vision - Ollama Setup Script

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const https = require('https');
const os = require('os');

console.log('🤖 Setting up Ollama for AquaJarvis Vision...');

async function setupOllama() {
  try {
    const platform = os.platform();
    const arch = os.arch();

    console.log(`📋 Detected platform: ${platform}-${arch}`);

    // Check if Ollama is already installed
    console.log('🔍 Checking for existing Ollama installation...');
    try {
      const version = execSync('ollama --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Ollama is already installed: ${version}`);
      
      // Check if Ollama service is running
      console.log('🔄 Checking Ollama service...');
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          console.log('✅ Ollama service is running');
        } else {
          console.log('⚠️  Ollama is installed but service is not running');
          console.log('   Please start Ollama manually or restart your system');
        }
      } catch (error) {
        console.log('⚠️  Ollama service is not accessible');
        console.log('   Please start Ollama manually');
      }
      
      return;
    } catch (error) {
      console.log('ℹ️  Ollama not found, proceeding with installation...');
    }

    // Download and install Ollama based on platform
    if (platform === 'win32') {
      await installOllamaWindows();
    } else if (platform === 'darwin') {
      await installOllamaMac();
    } else if (platform === 'linux') {
      await installOllamaLinux();
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log('🎉 Ollama installation completed!');
    console.log('\nNext steps:');
    console.log('1. Restart your terminal/command prompt');
    console.log('2. Start Ollama by running: ollama serve');
    console.log('3. Install a model: ollama pull llama2');
    console.log('4. Test: ollama run llama2');

  } catch (error) {
    console.error('❌ Ollama setup failed:', error.message);
    console.log('\nManual installation instructions:');
    console.log('1. Visit https://ollama.ai/');
    console.log('2. Download Ollama for your platform');
    console.log('3. Follow the installation instructions');
    process.exit(1);
  }
}

async function installOllamaWindows() {
  console.log('📥 Downloading Ollama for Windows...');
  
  const url = 'https://ollama.ai/download/OllamaSetup.exe';
  const outputPath = path.join(process.cwd(), 'OllamaSetup.exe');
  
  await downloadFile(url, outputPath);
  
  console.log('🚀 Starting Ollama installer...');
  console.log('⚠️  Please follow the installation prompts in the window that opens');
  
  return new Promise((resolve, reject) => {
    const installer = spawn('OllamaSetup.exe', [], { 
      stdio: 'inherit',
      detached: true 
    });
    
    installer.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Ollama installation completed');
        resolve();
      } else {
        reject(new Error(`Installer exited with code ${code}`));
      }
    });
    
    installer.on('error', (error) => {
      reject(error);
    });
  });
}

async function installOllamaMac() {
  console.log('📥 Downloading Ollama for macOS...');
  
  const url = 'https://ollama.ai/download/Ollama-darwin.zip';
  const outputPath = path.join(process.cwd(), 'Ollama-darwin.zip');
  
  await downloadFile(url, outputPath);
  
  console.log('📦 Extracting Ollama...');
  execSync(`unzip -o "${outputPath}" -d /Applications/`, { stdio: 'inherit' });
  
  console.log('✅ Ollama installed to /Applications');
}

async function installOllamaLinux() {
  console.log('📥 Downloading Ollama for Linux...');
  
  const url = 'https://ollama.ai/download/ollama-linux-amd64';
  const outputPath = '/usr/local/bin/ollama';
  
  await downloadFile(url, outputPath);
  
  // Make executable
  execSync('chmod +x /usr/local/bin/ollama', { stdio: 'inherit' });
  
  console.log('✅ Ollama installed to /usr/local/bin/ollama');
  
  // Create systemd service (optional)
  try {
    console.log('🔧 Setting up Ollama service...');
    const serviceContent = `[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3

[Install]
WantedBy=default.target`;

    fs.writeFileSync('/etc/systemd/system/ollama.service', serviceContent);
    
    // Create ollama user
    try {
      execSync('useradd -r -s /bin/false -m -d /usr/share/ollama ollama', { stdio: 'pipe' });
    } catch (error) {
      // User might already exist
    }
    
    console.log('✅ Ollama service created. Enable with: sudo systemctl enable ollama');
  } catch (error) {
    console.log('⚠️  Could not create systemd service (requires sudo)');
  }
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status code ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = Math.round((downloadedSize / totalSize) * 100);
        process.stdout.write(`\r⬇️  Downloading: ${progress}%`);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download completed');
        resolve();
      });
      
    }).on('error', (error) => {
      fs.unlink(outputPath, () => {}); // Delete the file on error
      reject(error);
    });
  });
}

// Install a default model after setup
async function installDefaultModel() {
  console.log('📦 Installing default model (llama2)...');
  
  return new Promise((resolve, reject) => {
    const ollama = spawn('ollama', ['pull', 'llama2'], { stdio: 'inherit' });
    
    ollama.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Default model installed successfully');
        resolve();
      } else {
        console.log('⚠️  Failed to install default model');
        console.log('   You can install it later with: ollama pull llama2');
        resolve();
      }
    });
    
    ollama.on('error', (error) => {
      console.log('⚠️  Could not install default model:', error.message);
      resolve();
    });
  });
}

// Run setup
if (require.main === module) {
  setupOllama()
    .then(() => {
      console.log('\n🎯 Would you like to install a default model (llama2)? This may take several minutes.');
      console.log('   Press Ctrl+C to skip, or wait to continue...');
      
      setTimeout(() => {
        installDefaultModel().then(() => {
          console.log('\n🚀 Setup complete! Start Ollama with: ollama serve');
        });
      }, 5000);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupOllama, installDefaultModel };
