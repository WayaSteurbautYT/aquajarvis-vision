// AquaJarvis Vision - Development Setup Script

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AquaJarvis Vision development environment...');

async function setupDev() {
  try {
    // Create necessary directories
    const directories = [
      'logs',
      'data',
      'data/models',
      'data/tools',
      'data/learning'
    ];

    console.log('📁 Creating directories...');
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created ${dir}`);
      } else {
        console.log(`ℹ️  Directory ${dir} already exists`);
      }
    });

    // Create default configuration file
    const configPath = 'config.json';
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        app: {
          name: 'AquaJarvis Vision',
          version: '1.0.0',
          development: true
        },
        ollama: {
          host: 'http://localhost:11434',
          timeout: 30000,
          defaultModel: 'llama2'
        },
        permissions: {
          screenCapture: false,
          mouseKeyboard: false,
          voiceInput: false,
          fileAccess: false
        },
        ui: {
          theme: 'aquamarine',
          fontSize: 14,
          autoSave: true
        },
        learning: {
          enabled: true,
          maxDataSize: '100MB',
          encryptionEnabled: true
        },
        automation: {
          maxWorkflows: 50,
          autoBackup: true,
          emergencyStopHotkey: 'Ctrl+Shift+S'
        },
        logging: {
          level: 'info',
          maxFileSize: '10MB',
          maxFiles: 5
        }
      };

      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('✅ Created default configuration file');
    } else {
      console.log('ℹ️  Configuration file already exists');
    }

    // Create .env file if it doesn't exist
    const envPath = '.env';
    if (!fs.existsSync(envPath)) {
      const envContent = `# AquaJarvis Vision Environment Variables
NODE_ENV=development
ELECTRON_IS_DEV=true

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_TIMEOUT=30000

# Development Settings
DEBUG=aquajarvis:*
LOG_LEVEL=debug

# Security
ENCRYPTION_KEY=your-encryption-key-here-change-in-production

# API Keys (if needed)
# OPENAI_API_KEY=your-key-here
# ANTHROPIC_API_KEY=your-key-here
`;

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Created .env file');
    } else {
      console.log('ℹ️  .env file already exists');
    }

    // Install dependencies if needed
    console.log('📦 Checking dependencies...');
    try {
      execSync('npm list --depth=0', { stdio: 'pipe' });
      console.log('✅ Dependencies are installed');
    } catch (error) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    }

    // Check if Ollama is installed
    console.log('🤖 Checking Ollama installation...');
    try {
      execSync('ollama --version', { stdio: 'pipe' });
      console.log('✅ Ollama is installed');
    } catch (error) {
      console.log('⚠️  Ollama not found. Please install Ollama manually:');
      console.log('   - Download from: https://ollama.ai/');
      console.log('   - Or run: npm run setup-ollama');
    }

    console.log('\n🎉 Development setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run dev" to start the application in development mode');
    console.log('2. Open the developer tools to debug');
    console.log('3. Check the logs directory for application logs');
    console.log('4. Modify config.json to customize settings');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setupDev();
}

module.exports = { setupDev };
