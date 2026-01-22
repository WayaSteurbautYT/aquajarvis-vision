// AquaJarvis Vision - Main Application JavaScript

class AquaJarvisApp {
  constructor() {
    this.currentPage = 'workflows';
    this.isVoiceActive = false;
    this.settings = {};
    this.permissions = {};
    this.systemSpecs = null;
    
    this.init();
  }

  async init() {
    try {
      // Hide loading screen
      setTimeout(() => {
        this.hideLoadingScreen();
      }, 2000);

      // Initialize app
      await this.loadSettings();
      await this.loadPermissions();
      await this.loadSystemSpecs();
      this.setupEventListeners();
      this.setupNavigation();
      this.setupVoiceInput();
      this.setupEmergencyStop();
      this.setupLogPanel();
      
      // Apply theme
      this.applyTheme(this.settings.colorScheme || 'aquamarine');
      
      // Show onboarding if first launch
      if (!this.settings.onboardingCompleted) {
        this.showOnboarding();
      }

      // Log system info
      this.log('info', 'AquaJarvis Vision initialized successfully');
      this.log('info', `System: ${this.getSystemInfo()}`);
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.log('error', `Initialization failed: ${error.message}`);
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    if (loadingScreen && app) {
      loadingScreen.style.display = 'none';
      app.style.display = 'flex';
    }
  }

  async loadSettings() {
    try {
      this.settings = await window.electronAPI.getSettings() || {};
      console.log('Settings loaded:', this.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = {};
    }
  }

  async loadPermissions() {
    try {
      this.permissions = await window.electronAPI.getPermissions() || {};
      console.log('Permissions loaded:', this.permissions);
      this.updatePermissionUI();
    } catch (error) {
      console.error('Failed to load permissions:', error);
      this.permissions = {};
    }
  }

  async loadSystemSpecs() {
    try {
      this.systemSpecs = await window.electronAPI.getSystemSpecs();
      console.log('System specs loaded:', this.systemSpecs);
    } catch (error) {
      console.error('Failed to load system specs:', error);
      this.systemSpecs = null;
    }
  }

  setupEventListeners() {
    // Listen for events from main process
    window.electronAPI.on('show-onboarding', () => this.showOnboarding());
    window.electronAPI.on('open-settings', () => this.navigateToPage('settings'));
    window.electronAPI.on('open-permissions', () => this.navigateToPage('settings'));
    window.electronAPI.on('open-model-manager', () => this.navigateToPage('models'));
    window.electronAPI.on('open-tools', () => this.navigateToPage('tools'));
    window.electronAPI.on('show-about', () => this.showAbout());
    window.electronAPI.on('new-automation', () => this.createNewWorkflow());
    window.electronAPI.on('emergency-stop', () => this.emergencyStop());

    // Window resize handler
    window.addEventListener('resize', () => this.handleResize());
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) {
          this.navigateToPage(page);
        }
      });
    });

    // New workflow button
    const newWorkflowBtn = document.getElementById('new-workflow-btn');
    if (newWorkflowBtn) {
      newWorkflowBtn.addEventListener('click', () => this.createNewWorkflow());
    }
  }

  navigateToPage(pageName) {
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageName) {
        item.classList.add('active');
      }
    });

    // Update pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Update header
    const pageTitle = document.getElementById('page-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    
    if (pageTitle) {
      pageTitle.textContent = this.formatPageTitle(pageName);
    }
    
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = this.formatPageTitle(pageName);
    }

    this.currentPage = pageName;
    this.log('info', `Navigated to ${pageName} page`);
  }

  formatPageTitle(pageName) {
    const titles = {
      workflows: 'Workflows',
      models: 'Models',
      tools: 'Tools',
      logs: 'Logs',
      settings: 'Settings'
    };
    return titles[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }

  setupVoiceInput() {
    const voiceToggle = document.getElementById('voice-toggle');
    
    if (voiceToggle) {
      voiceToggle.addEventListener('click', async () => {
        if (this.isVoiceActive) {
          await this.stopVoiceInput();
        } else {
          await this.startVoiceInput();
        }
      });
    }
  }

  async startVoiceInput() {
    try {
      if (!this.permissions.voiceInput) {
        const granted = await window.electronAPI.requestPermission('voiceInput');
        if (!granted) {
          this.log('warning', 'Voice input permission denied');
          return;
        }
      }

      await window.electronAPI.startVoiceInput();
      this.isVoiceActive = true;
      this.updateVoiceUI(true);
      this.log('info', 'Voice input started');
    } catch (error) {
      console.error('Failed to start voice input:', error);
      this.log('error', `Failed to start voice input: ${error.message}`);
    }
  }

  async stopVoiceInput() {
    try {
      await window.electronAPI.stopVoiceInput();
      this.isVoiceActive = false;
      this.updateVoiceUI(false);
      this.log('info', 'Voice input stopped');
    } catch (error) {
      console.error('Failed to stop voice input:', error);
      this.log('error', `Failed to stop voice input: ${error.message}`);
    }
  }

  updateVoiceUI(isActive) {
    const voiceToggle = document.getElementById('voice-toggle');
    if (voiceToggle) {
      if (isActive) {
        voiceToggle.classList.add('active');
      } else {
        voiceToggle.classList.remove('active');
      }
    }
  }

  setupEmergencyStop() {
    const emergencyStop = document.getElementById('emergency-stop');
    
    if (emergencyStop) {
      emergencyStop.addEventListener('click', () => {
        this.emergencyStop();
      });
    }
  }

  emergencyStop() {
    this.log('warning', 'Emergency stop triggered!');
    
    // Stop all automations
    window.electronAPI.stopAutomation().catch(console.error);
    
    // Stop voice input
    if (this.isVoiceActive) {
      this.stopVoiceInput();
    }
    
    // Show notification
    this.showNotification('Emergency Stop', 'All automations have been stopped', 'warning');
  }

  setupLogPanel() {
    const logPanelToggle = document.getElementById('log-panel-toggle');
    const logPanel = document.getElementById('log-panel');
    
    if (logPanelToggle && logPanel) {
      logPanelToggle.addEventListener('click', () => {
        logPanel.classList.toggle('collapsed');
      });
    }
  }

  createNewWorkflow() {
    this.log('info', 'Creating new workflow...');
    // This will be implemented in the workflows module
    if (window.workflowsModule) {
      window.workflowsModule.createNewWorkflow();
    }
  }

  showOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    const overlay = document.getElementById('modal-overlay');
    
    if (modal && overlay) {
      overlay.style.display = 'flex';
      modal.style.display = 'block';
      
      // Initialize onboarding
      if (window.onboardingModule) {
        window.onboardingModule.init();
      }
    }
  }

  showAbout() {
    const modal = document.getElementById('about-modal');
    const overlay = document.getElementById('modal-overlay');
    
    if (modal && overlay) {
      overlay.style.display = 'flex';
      modal.style.display = 'block';
    }
  }

  hideModal() {
    const overlay = document.getElementById('modal-overlay');
    const modals = overlay.querySelectorAll('.modal');
    
    if (overlay) {
      overlay.style.display = 'none';
      modals.forEach(modal => {
        modal.style.display = 'none';
      });
    }
  }

  applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    this.log('info', `Applied theme: ${themeName}`);
  }

  updatePermissionUI() {
    const permissionCheckboxes = {
      'perm-screen-capture': this.permissions.screenCapture,
      'perm-mouse-keyboard': this.permissions.mouseKeyboard,
      'perm-voice-input': this.permissions.voiceInput,
      'perm-file-access': this.permissions.fileAccess
    };

    Object.entries(permissionCheckboxes).forEach(([id, granted]) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = granted || false;
      }
    });
  }

  getSystemInfo() {
    if (!this.systemSpecs) return 'Unknown';
    
    const { cpu, memory, os } = this.systemSpecs;
    return `${os.platform} ${os.arch} - ${cpu.cores} cores, ${Math.round(memory.total / 1024 / 1024 / 1024)}GB RAM`;
  }

  showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-header">
        <h4>${title}</h4>
        <button class="notification-close">×</button>
      </div>
      <div class="notification-body">
        <p>${message}</p>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

    // Handle close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      });
    }
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    // Add to log panel
    const logPanelContent = document.getElementById('log-panel-content');
    if (logPanelContent) {
      const logElement = document.createElement('div');
      logElement.className = 'log-entry';
      logElement.innerHTML = `
        <span class="log-timestamp">${new Date().toLocaleTimeString()}</span>
        <span class="log-level ${level}">${level.toUpperCase()}</span>
        <span class="log-message">${message}</span>
      `;
      logPanelContent.appendChild(logElement);
      logPanelContent.scrollTop = logPanelContent.scrollHeight;
    }

    // Also log to console
    console[level] ? console[level](message) : console.log(message);
  }

  handleResize() {
    // Handle responsive layout changes
    const width = window.innerWidth;
    const logPanel = document.getElementById('log-panel');
    
    if (logPanel) {
      if (width < 768) {
        logPanel.style.width = '100%';
      } else {
        logPanel.style.width = '400px';
      }
    }
  }

  async saveSetting(key, value) {
    try {
      await window.electronAPI.setSetting(key, value);
      this.settings[key] = value;
      this.log('info', `Setting saved: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to save setting:', error);
      this.log('error', `Failed to save setting ${key}: ${error.message}`);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AquaJarvisApp();
});

// Handle modal close buttons
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-close') || e.target.id === 'onboarding-close' || e.target.id === 'about-close') {
    window.app.hideModal();
  }
  
  // Handle overlay clicks
  if (e.target.id === 'modal-overlay') {
    window.app.hideModal();
  }
});

// Handle external links
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('link-item')) {
    e.preventDefault();
    const url = e.target.dataset.url;
    if (url) {
      window.electronAPI.openExternal(url);
    }
  }
});

// Export for use in other modules
window.AquaJarvisApp = AquaJarvisApp;
