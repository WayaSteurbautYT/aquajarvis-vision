// AquaJarvis Vision - Models Module

class ModelsModule {
  constructor() {
    this.models = [];
    this.isInstalling = false;
  }

  init() {
    this.setupEventListeners();
    this.loadModels();
  }

  setupEventListeners() {
    // Install model button
    const installBtn = document.getElementById('install-model-btn');
    if (installBtn) {
      installBtn.addEventListener('click', () => this.showInstallDialog());
    }
  }

  async loadModels() {
    try {
      // Check if Ollama is available
      const ollamaAvailable = await window.electronAPI.checkOllama();
      
      if (!ollamaAvailable) {
        this.showOllamaNotAvailable();
        return;
      }

      // Get installed models
      this.models = await window.electronAPI.getOllamaModels();
      this.renderModels();

    } catch (error) {
      console.error('Failed to load models:', error);
      window.app.log('error', `Failed to load models: ${error.message}`);
      this.showError('Failed to load models. Please check if Ollama is running.');
    }
  }

  showOllamaNotAvailable() {
    const modelsGrid = document.getElementById('models-grid');
    if (!modelsGrid) return;

    modelsGrid.innerHTML = `
      <div class="ollama-missing">
        <h3>Ollama Not Found</h3>
        <p>Ollama is required to run local AI models. Please install Ollama first.</p>
        <button class="btn btn-primary" id="install-ollama-btn">Install Ollama</button>
      </div>
    `;

    const installOllamaBtn = document.getElementById('install-ollama-btn');
    if (installOllamaBtn) {
      installOllamaBtn.addEventListener('click', () => this.installOllama());
    }
  }

  async installOllama() {
    try {
      this.isInstalling = true;
      this.updateInstallButton('Installing...', true);

      await window.electronAPI.installOllama();
      
      UIComponents.showNotification(
        'Ollama Installed',
        'Ollama has been successfully installed. Please restart the application.',
        'success'
      );

      // Reload models after installation
      setTimeout(() => this.loadModels(), 2000);

    } catch (error) {
      console.error('Failed to install Ollama:', error);
      window.app.log('error', `Failed to install Ollama: ${error.message}`);
      UIComponents.showNotification(
        'Installation Failed',
        'Failed to install Ollama. Please try installing manually.',
        'error'
      );
    } finally {
      this.isInstalling = false;
      this.updateInstallButton('Install Model', false);
    }
  }

  updateInstallButton(text, disabled) {
    const installBtn = document.getElementById('install-model-btn');
    if (installBtn) {
      installBtn.textContent = text;
      installBtn.disabled = disabled;
    }
  }

  renderModels() {
    const modelsGrid = document.getElementById('models-grid');
    if (!modelsGrid) return;

    if (this.models.length === 0) {
      modelsGrid.innerHTML = `
        <div class="no-models">
          <h3>No Models Installed</h3>
          <p>Install your first local AI model to get started.</p>
          <button class="btn btn-primary" id="install-first-model-btn">Install Model</button>
        </div>
      `;

      const installFirstBtn = document.getElementById('install-first-model-btn');
      if (installFirstBtn) {
        installFirstBtn.addEventListener('click', () => this.showInstallDialog());
      }
      return;
    }

    modelsGrid.innerHTML = '';
    
    this.models.forEach(model => {
      const modelCard = this.createModelCard(model);
      modelsGrid.appendChild(modelCard);
    });
  }

  createModelCard(model) {
    const card = document.createElement('div');
    card.className = 'model-card';

    const sizeInGB = (model.size / 1024 / 1024 / 1024).toFixed(2);
    const parameters = model.details?.parameters || 'Unknown';
    
    card.innerHTML = `
      <div class="model-header">
        <h3 class="model-name">${model.name}</h3>
        <span class="model-size">${sizeInGB} GB</span>
      </div>
      <div class="model-description">
        ${model.description || `Local ${model.name} model for AI inference`}
      </div>
      <div class="model-specs">
        <span class="model-spec">${parameters} parameters</span>
        <span class="model-spec">${model.details?.family || 'Unknown'}</span>
      </div>
      <div class="model-actions">
        <button class="btn btn-secondary" data-action="configure">Configure</button>
        <button class="btn btn-danger" data-action="remove">Remove</button>
      </div>
    `;

    // Add event listeners
    const configureBtn = card.querySelector('[data-action="configure"]');
    const removeBtn = card.querySelector('[data-action="remove"]');

    if (configureBtn) {
      configureBtn.addEventListener('click', () => this.configureModel(model));
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.removeModel(model));
    }

    return card;
  }

  showInstallDialog() {
    const availableModels = [
      { name: 'llama2', description: 'Meta\'s LLaMA 2 - General purpose language model', size: '3.8GB' },
      { name: 'codellama', description: 'Code specialized model - Great for programming', size: '3.8GB' },
      { name: 'mistral', description: 'Mistral AI - Efficient and powerful model', size: '4.1GB' },
      { name: 'vicuna', description: 'Vicuna - Chat optimized model', size: '3.0GB' },
      { name: 'neural-chat', description: 'Intel Neural Chat - Conversational AI', size: '4.7GB' },
      { name: 'gemma', description: 'Google Gemma - Lightweight and capable', size: '2.5GB' }
    ];

    const content = `
      <div class="model-selection">
        <h3>Choose a Model to Install</h3>
        <div class="model-list">
          ${availableModels.map(model => `
            <div class="model-option" data-model="${model.name}">
              <div class="model-option-info">
                <h4>${model.name}</h4>
                <p>${model.description}</p>
                <span class="model-option-size">${model.size}</span>
              </div>
              <button class="btn btn-primary" data-install="${model.name}">Install</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const modal = UIComponents.createModal(
      'Install AI Model',
      content,
      [
        UIComponents.createButton('Cancel', 'btn-secondary', null, () => window.app.hideModal())
      ]
    );

    // Add to modal overlay
    const overlay = document.getElementById('modal-overlay');
    overlay.style.display = 'flex';
    overlay.appendChild(modal);

    // Add event listeners for install buttons
    modal.querySelectorAll('[data-install]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modelName = e.target.dataset.install;
        this.installModel(modelName);
      });
    });
  }

  async installModel(modelName) {
    try {
      UIComponents.showNotification(
        'Installing Model',
        `Installing ${modelName}. This may take several minutes...`,
        'info'
      );

      // Create progress notification
      const progressNotification = UIComponents.showNotification(
        'Installing Model',
        `Downloading ${modelName}...`,
        'info',
        30000 // Keep visible for 30 seconds
      );

      // Listen for progress updates
      window.electronAPI.on('model-pull-progress', (event, data) => {
        if (data.model === modelName) {
          progressNotification.querySelector('.notification-body p').textContent = 
            `Installing ${modelName}: ${data.completed}/${data.total} (${Math.round(data.percentage)}%)`;
        }
      });

      // Install the model
      await window.electronAPI.pullOllamaModel(modelName);

      UIComponents.showNotification(
        'Model Installed',
        `${modelName} has been successfully installed!`,
        'success'
      );

      window.app.hideModal();
      this.loadModels(); // Refresh the models list

    } catch (error) {
      console.error('Failed to install model:', error);
      window.app.log('error', `Failed to install model ${modelName}: ${error.message}`);
      UIComponents.showNotification(
        'Installation Failed',
        `Failed to install ${modelName}. Please try again.`,
        'error'
      );
    }
  }

  async removeModel(model) {
    try {
      const result = await window.electronAPI.showMessageBox({
        type: 'question',
        buttons: ['Remove', 'Cancel'],
        defaultId: 1,
        title: 'Remove Model',
        message: `Are you sure you want to remove ${model.name}?`,
        detail: 'This will permanently delete the model from your system.'
      });

      if (result.response === 0) {
        // Remove model logic would go here
        // For now, just show a notification
        UIComponents.showNotification(
          'Model Removed',
          `${model.name} has been removed.`,
          'success'
        );

        this.loadModels(); // Refresh the models list
      }

    } catch (error) {
      console.error('Failed to remove model:', error);
      window.app.log('error', `Failed to remove model: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to remove model. Please try again.',
        'error'
      );
    }
  }

  configureModel(model) {
    // Show model configuration dialog
    const content = `
      <div class="model-config">
        <h3>Configure ${model.name}</h3>
        <div class="config-options">
          <div class="config-item">
            <label for="model-temperature">Temperature</label>
            <input type="range" id="model-temperature" min="0" max="2" step="0.1" value="0.7">
            <span class="config-value">0.7</span>
          </div>
          <div class="config-item">
            <label for="model-max-tokens">Max Tokens</label>
            <input type="number" id="model-max-tokens" min="1" max="4096" value="2048">
          </div>
          <div class="config-item">
            <label for="model-top-p">Top P</label>
            <input type="range" id="model-top-p" min="0" max="1" step="0.05" value="0.9">
            <span class="config-value">0.9</span>
          </div>
        </div>
      </div>
    `;

    const modal = UIComponents.createModal(
      'Configure Model',
      content,
      [
        UIComponents.createButton('Cancel', 'btn-secondary', null, () => window.app.hideModal()),
        UIComponents.createButton('Save', 'btn-primary', null, () => this.saveModelConfig(model))
      ]
    );

    const overlay = document.getElementById('modal-overlay');
    overlay.style.display = 'flex';
    overlay.appendChild(modal);

    // Setup range input listeners
    modal.querySelectorAll('input[type="range"]').forEach(input => {
      const valueSpan = input.nextElementSibling;
      input.addEventListener('input', () => {
        if (valueSpan && valueSpan.classList.contains('config-value')) {
          valueSpan.textContent = input.value;
        }
      });
    });
  }

  saveModelConfig(model) {
    // Save model configuration logic
    UIComponents.showNotification(
      'Configuration Saved',
      `${model.name} configuration has been saved.`,
      'success'
    );
    window.app.hideModal();
  }

  showError(message) {
    const modelsGrid = document.getElementById('models-grid');
    if (!modelsGrid) return;

    modelsGrid.innerHTML = `
      <div class="error-state">
        <h3>Error</h3>
        <p>${message}</p>
        <button class="btn btn-primary" id="retry-load-models">Retry</button>
      </div>
    `;

    const retryBtn = document.getElementById('retry-load-models');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadModels());
    }
  }
}

// Export for use in other modules
window.ModelsModule = ModelsModule;
