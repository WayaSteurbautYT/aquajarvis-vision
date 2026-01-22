// AquaJarvis Vision - Settings Module

class SettingsModule {
  constructor() {
    this.settings = {};
  }

  init() {
    this.setupEventListeners();
    this.loadSettings();
  }

  setupEventListeners() {
    // Permission checkboxes
    const permissionCheckboxes = [
      'perm-screen-capture',
      'perm-mouse-keyboard',
      'perm-voice-input',
      'perm-file-access'
    ];

    permissionCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => this.handlePermissionChange(id, e.target.checked));
      }
    });

    // Color scheme selector
    const colorScheme = document.getElementById('color-scheme');
    if (colorScheme) {
      colorScheme.addEventListener('change', (e) => this.handleColorSchemeChange(e.target.value));
    }

    // Font size slider
    const fontSize = document.getElementById('font-size');
    if (fontSize) {
      fontSize.addEventListener('input', (e) => this.handleFontSizeChange(e.target.value));
    }

    // Learning settings
    const enableLearning = document.getElementById('enable-learning');
    if (enableLearning) {
      enableLearning.addEventListener('change', (e) => this.handleLearningToggle(e.target.checked));
    }

    // Learning data buttons
    const clearLearningBtn = document.getElementById('clear-learning-btn');
    if (clearLearningBtn) {
      clearLearningBtn.addEventListener('click', () => this.clearLearningData());
    }

    const exportLearningBtn = document.getElementById('export-learning-btn');
    if (exportLearningBtn) {
      exportLearningBtn.addEventListener('click', () => this.exportLearningData());
    }
  }

  async loadSettings() {
    try {
      this.settings = await window.electronAPI.getSettings() || {};
      this.updateUI();
    } catch (error) {
      console.error('Failed to load settings:', error);
      window.app.log('error', `Failed to load settings: ${error.message}`);
    }
  }

  updateUI() {
    // Update color scheme
    const colorScheme = document.getElementById('color-scheme');
    if (colorScheme && this.settings.colorScheme) {
      colorScheme.value = this.settings.colorScheme;
    }

    // Update font size
    const fontSize = document.getElementById('font-size');
    if (fontSize && this.settings.fontSize) {
      fontSize.value = this.settings.fontSize;
      document.documentElement.style.setProperty('--font-size-md', `${this.settings.fontSize}px`);
    }

    // Update learning toggle
    const enableLearning = document.getElementById('enable-learning');
    if (enableLearning && this.settings.enableLearning !== undefined) {
      enableLearning.checked = this.settings.enableLearning;
    }
  }

  async handlePermissionChange(checkboxId, isChecked) {
    const permissionMap = {
      'perm-screen-capture': 'screenCapture',
      'perm-mouse-keyboard': 'mouseKeyboard',
      'perm-voice-input': 'voiceInput',
      'perm-file-access': 'fileAccess'
    };

    const permission = permissionMap[checkboxId];
    if (!permission) return;

    try {
      if (isChecked) {
        // Request permission from main process
        const granted = await window.electronAPI.requestPermission(permission);
        if (!granted) {
          // Revert checkbox if permission denied
          const checkbox = document.getElementById(checkboxId);
          if (checkbox) {
            checkbox.checked = false;
          }
          UIComponents.showNotification(
            'Permission Denied',
            `Permission for ${permission} was denied by the user.`,
            'warning'
          );
          return;
        }
      }

      // Update local state
      window.app.permissions[permission] = isChecked;
      
      // Save setting
      await window.app.saveSetting(`permissions.${permission}`, isChecked);
      
      // Show notification
      UIComponents.showNotification(
        'Permission Updated',
        `${permission} permission ${isChecked ? 'granted' : 'revoked'}`,
        isChecked ? 'success' : 'info'
      );

      window.app.log('info', `Permission ${permission} ${isChecked ? 'granted' : 'revoked'}`);

    } catch (error) {
      console.error('Failed to update permission:', error);
      window.app.log('error', `Failed to update permission ${permission}: ${error.message}`);
      
      // Revert checkbox on error
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.checked = !isChecked;
      }
    }
  }

  async handleColorSchemeChange(scheme) {
    try {
      // Apply theme
      window.app.applyTheme(scheme);
      
      // Save setting
      await window.app.saveSetting('colorScheme', scheme);
      
      // Show notification
      UIComponents.showNotification(
        'Theme Updated',
        `Color scheme changed to ${scheme}`,
        'success'
      );

      window.app.log('info', `Color scheme changed to ${scheme}`);

    } catch (error) {
      console.error('Failed to change color scheme:', error);
      window.app.log('error', `Failed to change color scheme: ${error.message}`);
    }
  }

  async handleFontSizeChange(size) {
    try {
      // Update CSS variable
      document.documentElement.style.setProperty('--font-size-md', `${size}px`);
      
      // Save setting
      await window.app.saveSetting('fontSize', parseInt(size));
      
      window.app.log('info', `Font size changed to ${size}px`);

    } catch (error) {
      console.error('Failed to change font size:', error);
      window.app.log('error', `Failed to change font size: ${error.message}`);
    }
  }

  async handleLearningToggle(isEnabled) {
    try {
      // Save setting
      await window.app.saveSetting('enableLearning', isEnabled);
      
      // Show notification
      UIComponents.showNotification(
        'Learning Updated',
        `Local learning ${isEnabled ? 'enabled' : 'disabled'}`,
        isEnabled ? 'success' : 'info'
      );

      window.app.log('info', `Local learning ${isEnabled ? 'enabled' : 'disabled'}`);

    } catch (error) {
      console.error('Failed to toggle learning:', error);
      window.app.log('error', `Failed to toggle learning: ${error.message}`);
    }
  }

  async clearLearningData() {
    try {
      const result = await window.electronAPI.showMessageBox({
        type: 'question',
        buttons: ['Clear Data', 'Cancel'],
        defaultId: 1,
        title: 'Clear Learning Data',
        message: 'Are you sure you want to clear all local learning data?',
        detail: 'This action cannot be undone. All learned patterns and preferences will be permanently deleted.'
      });

      if (result.response === 0) {
        await window.electronAPI.clearLearningData();
        
        UIComponents.showNotification(
          'Learning Data Cleared',
          'All local learning data has been successfully cleared.',
          'success'
        );

        window.app.log('info', 'Learning data cleared by user');
      }

    } catch (error) {
      console.error('Failed to clear learning data:', error);
      window.app.log('error', `Failed to clear learning data: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to clear learning data. Please try again.',
        'error'
      );
    }
  }

  async exportLearningData() {
    try {
      const data = await window.electronAPI.exportLearningData();
      
      if (data) {
        // Create download link
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquajarvis-learning-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UIComponents.showNotification(
          'Learning Data Exported',
          'Learning data has been successfully exported.',
          'success'
        );

        window.app.log('info', 'Learning data exported by user');
      } else {
        UIComponents.showNotification(
          'No Data to Export',
          'There is no learning data available to export.',
          'info'
        );
      }

    } catch (error) {
      console.error('Failed to export learning data:', error);
      window.app.log('error', `Failed to export learning data: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to export learning data. Please try again.',
        'error'
      );
    }
  }
}

// Export for use in other modules
window.SettingsModule = SettingsModule;
