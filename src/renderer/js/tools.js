// AquaJarvis Vision - Generated Tools Module

class ToolsModule {
  constructor() {
    this.tools = [];
  }

  init() {
    this.setupEventListeners();
    this.loadTools();
  }

  setupEventListeners() {
    // Create tool button
    const createBtn = document.getElementById('create-tool-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.showCreateToolDialog());
    }
  }

  async loadTools() {
    try {
      this.tools = await window.electronAPI.getGeneratedTools();
      this.renderTools();
    } catch (error) {
      console.error('Failed to load tools:', error);
      window.app.log('error', `Failed to load tools: ${error.message}`);
    }
  }

  renderTools() {
    const toolsList = document.getElementById('tools-list');
    if (!toolsList) return;

    if (this.tools.length === 0) {
      toolsList.innerHTML = `
        <div class="no-tools">
          <h3>No Generated Tools</h3>
          <p>Create your first automation tool to get started.</p>
          <button class="btn btn-primary" id="create-first-tool-btn">Create Tool</button>
        </div>
      `;

      const createFirstBtn = document.getElementById('create-first-tool-btn');
      if (createFirstBtn) {
        createFirstBtn.addEventListener('click', () => this.showCreateToolDialog());
      }
      return;
    }

    toolsList.innerHTML = '';
    
    this.tools.forEach(tool => {
      const toolItem = this.createToolItem(tool);
      toolsList.appendChild(toolItem);
    });
  }

  createToolItem(tool) {
    const item = document.createElement('div');
    item.className = 'tool-item';

    const createdDate = new Date(tool.createdAt).toLocaleDateString();
    const lastRunDate = tool.lastRun ? new Date(tool.lastRun).toLocaleDateString() : 'Never';
    
    item.innerHTML = `
      <div class="tool-header">
        <h3 class="tool-name">${tool.name}</h3>
        <div class="tool-status">
          <div class="tool-status-dot ${tool.enabled ? 'status-enabled' : 'status-disabled'}"></div>
          <span class="tool-status-text">${tool.enabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div class="tool-description">
        ${tool.description || 'No description available'}
      </div>
      <div class="tool-meta">
        <span>Created: ${createdDate}</span>
        <span>Last run: ${lastRunDate}</span>
        <span>Runs: ${tool.runCount || 0}</span>
      </div>
      <div class="tool-actions">
        <button class="btn btn-secondary" data-action="edit">Edit</button>
        <button class="btn btn-primary" data-action="run" ${!tool.enabled ? 'disabled' : ''}>Run</button>
        <button class="btn btn-secondary" data-action="toggle">${tool.enabled ? 'Disable' : 'Enable'}</button>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </div>
    `;

    // Add event listeners
    const editBtn = item.querySelector('[data-action="edit"]');
    const runBtn = item.querySelector('[data-action="run"]');
    const toggleBtn = item.querySelector('[data-action="toggle"]');
    const deleteBtn = item.querySelector('[data-action="delete"]');

    if (editBtn) {
      editBtn.addEventListener('click', () => this.editTool(tool));
    }

    if (runBtn) {
      runBtn.addEventListener('click', () => this.runTool(tool));
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTool(tool));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteTool(tool));
    }

    return item;
  }

  showCreateToolDialog() {
    const content = `
      <div class="tool-creator">
        <h3>Create New Tool</h3>
        <div class="tool-form">
          <div class="form-group">
            <label for="tool-name">Tool Name</label>
            <input type="text" id="tool-name" placeholder="Enter tool name" required>
          </div>
          <div class="form-group">
            <label for="tool-description">Description</label>
            <textarea id="tool-description" placeholder="Describe what this tool does" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="tool-trigger">Trigger</label>
            <input type="text" id="tool-trigger" placeholder="Voice command or keyword trigger">
          </div>
          <div class="form-group">
            <label for="tool-actions">Actions</label>
            <textarea id="tool-actions" placeholder="Describe the automation steps" rows="5"></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="tool-enabled" checked>
              <span>Enable immediately</span>
            </label>
          </div>
        </div>
      </div>
    `;

    const modal = UIComponents.createModal(
      'Create New Tool',
      content,
      [
        UIComponents.createButton('Cancel', 'btn-secondary', null, () => window.app.hideModal()),
        UIComponents.createButton('Create', 'btn-primary', null, () => this.createTool())
      ]
    );

    const overlay = document.getElementById('modal-overlay');
    overlay.style.display = 'flex';
    overlay.appendChild(modal);
  }

  async createTool() {
    const name = document.getElementById('tool-name').value.trim();
    const description = document.getElementById('tool-description').value.trim();
    const trigger = document.getElementById('tool-trigger').value.trim();
    const actions = document.getElementById('tool-actions').value.trim();
    const enabled = document.getElementById('tool-enabled').checked;

    if (!name) {
      UIComponents.showNotification('Error', 'Tool name is required', 'error');
      return;
    }

    try {
      const tool = {
        name,
        description,
        trigger,
        actions,
        enabled,
        createdAt: new Date().toISOString(),
        runCount: 0
      };

      await window.electronAPI.createGeneratedTool(tool);

      UIComponents.showNotification(
        'Tool Created',
        `${name} has been successfully created.`,
        'success'
      );

      window.app.hideModal();
      this.loadTools(); // Refresh the tools list

    } catch (error) {
      console.error('Failed to create tool:', error);
      window.app.log('error', `Failed to create tool: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to create tool. Please try again.',
        'error'
      );
    }
  }

  async editTool(tool) {
    const content = `
      <div class="tool-editor">
        <h3>Edit Tool: ${tool.name}</h3>
        <div class="tool-form">
          <div class="form-group">
            <label for="edit-tool-name">Tool Name</label>
            <input type="text" id="edit-tool-name" value="${tool.name}" required>
          </div>
          <div class="form-group">
            <label for="edit-tool-description">Description</label>
            <textarea id="edit-tool-description" rows="3">${tool.description || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="edit-tool-trigger">Trigger</label>
            <input type="text" id="edit-tool-trigger" value="${tool.trigger || ''}">
          </div>
          <div class="form-group">
            <label for="edit-tool-actions">Actions</label>
            <textarea id="edit-tool-actions" rows="5">${tool.actions || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="edit-tool-enabled" ${tool.enabled ? 'checked' : ''}>
              <span>Enabled</span>
            </label>
          </div>
        </div>
      </div>
    `;

    const modal = UIComponents.createModal(
      'Edit Tool',
      content,
      [
        UIComponents.createButton('Cancel', 'btn-secondary', null, () => window.app.hideModal()),
        UIComponents.createButton('Save', 'btn-primary', null, () => this.saveTool(tool))
      ]
    );

    const overlay = document.getElementById('modal-overlay');
    overlay.style.display = 'flex';
    overlay.appendChild(modal);
  }

  async saveTool(tool) {
    const name = document.getElementById('edit-tool-name').value.trim();
    const description = document.getElementById('edit-tool-description').value.trim();
    const trigger = document.getElementById('edit-tool-trigger').value.trim();
    const actions = document.getElementById('edit-tool-actions').value.trim();
    const enabled = document.getElementById('edit-tool-enabled').checked;

    if (!name) {
      UIComponents.showNotification('Error', 'Tool name is required', 'error');
      return;
    }

    try {
      const updatedTool = {
        ...tool,
        name,
        description,
        trigger,
        actions,
        enabled,
        updatedAt: new Date().toISOString()
      };

      await window.electronAPI.updateGeneratedTool(tool.id, updatedTool);

      UIComponents.showNotification(
        'Tool Updated',
        `${name} has been successfully updated.`,
        'success'
      );

      window.app.hideModal();
      this.loadTools(); // Refresh the tools list

    } catch (error) {
      console.error('Failed to update tool:', error);
      window.app.log('error', `Failed to update tool: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to update tool. Please try again.',
        'error'
      );
    }
  }

  async runTool(tool) {
    try {
      UIComponents.showNotification(
        'Running Tool',
        `Executing ${tool.name}...`,
        'info'
      );

      await window.electronAPI.runGeneratedTool(tool.id);

      UIComponents.showNotification(
        'Tool Completed',
        `${tool.name} has been successfully executed.`,
        'success'
      );

      this.loadTools(); // Refresh to update run count

    } catch (error) {
      console.error('Failed to run tool:', error);
      window.app.log('error', `Failed to run tool ${tool.name}: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        `Failed to run ${tool.name}. Please check the logs.`,
        'error'
      );
    }
  }

  async toggleTool(tool) {
    try {
      const updatedTool = {
        ...tool,
        enabled: !tool.enabled,
        updatedAt: new Date().toISOString()
      };

      await window.electronAPI.updateGeneratedTool(tool.id, updatedTool);

      UIComponents.showNotification(
        'Tool Updated',
        `${tool.name} has been ${updatedTool.enabled ? 'enabled' : 'disabled'}.`,
        'success'
      );

      this.loadTools(); // Refresh the tools list

    } catch (error) {
      console.error('Failed to toggle tool:', error);
      window.app.log('error', `Failed to toggle tool: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to update tool status. Please try again.',
        'error'
      );
    }
  }

  async deleteTool(tool) {
    try {
      const result = await window.electronAPI.showMessageBox({
        type: 'question',
        buttons: ['Delete', 'Cancel'],
        defaultId: 1,
        title: 'Delete Tool',
        message: `Are you sure you want to delete ${tool.name}?`,
        detail: 'This action cannot be undone.'
      });

      if (result.response === 0) {
        await window.electronAPI.deleteGeneratedTool(tool.id);

        UIComponents.showNotification(
          'Tool Deleted',
          `${tool.name} has been permanently deleted.`,
          'success'
        );

        this.loadTools(); // Refresh the tools list
      }

    } catch (error) {
      console.error('Failed to delete tool:', error);
      window.app.log('error', `Failed to delete tool: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to delete tool. Please try again.',
        'error'
      );
    }
  }
}

// Export for use in other modules
window.ToolsModule = ToolsModule;
