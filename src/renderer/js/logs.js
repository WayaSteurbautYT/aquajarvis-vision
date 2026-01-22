// AquaJarvis Vision - Logs Module

class LogsModule {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.logLevels = ['debug', 'info', 'warning', 'error', 'success'];
  }

  init() {
    this.setupEventListeners();
    this.loadLogs();
    this.setupLogCapture();
  }

  setupEventListeners() {
    // Clear logs button
    const clearBtn = document.getElementById('clear-logs-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearLogs());
    }

    // Export logs button
    const exportBtn = document.getElementById('export-logs-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportLogs());
    }
  }

  setupLogCapture() {
    // Override the app's log method to capture logs
    const originalLog = window.app.log;
    window.app.log = (level, message) => {
      // Call original log method
      originalLog.call(window.app, level, message);
      
      // Add to our logs array
      this.addLog(level, message);
    };
  }

  async loadLogs() {
    try {
      // Load logs from storage or initialize empty array
      this.logs = [];
      this.renderLogs();
    } catch (error) {
      console.error('Failed to load logs:', error);
      this.logs = [];
      this.renderLogs();
    }
  }

  addLog(level, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toLowerCase(),
      message,
      id: Date.now() + Math.random()
    };

    // Add to beginning of array (newest first)
    this.logs.unshift(logEntry);

    // Limit the number of logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Update UI if on logs page
    if (window.app.currentPage === 'logs') {
      this.renderLogs();
    }
  }

  renderLogs() {
    const logsContent = document.getElementById('logs-content');
    if (!logsContent) return;

    if (this.logs.length === 0) {
      logsContent.innerHTML = `
        <div class="no-logs">
          <p>No logs available. Start using AquaJarvis Vision to see activity logs.</p>
        </div>
      `;
      return;
    }

    logsContent.innerHTML = '';
    
    this.logs.forEach(log => {
      const logElement = this.createLogElement(log);
      logsContent.appendChild(logElement);
    });
  }

  createLogElement(log) {
    const element = document.createElement('div');
    element.className = `log-entry log-${log.level}`;
    
    const timestamp = new Date(log.timestamp);
    const timeString = timestamp.toLocaleTimeString();
    const dateString = timestamp.toLocaleDateString();
    
    element.innerHTML = `
      <span class="log-timestamp" title="${dateString} ${timeString}">${timeString}</span>
      <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
      <span class="log-message">${this.escapeHtml(log.message)}</span>
    `;

    return element;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async clearLogs() {
    try {
      const result = await window.electronAPI.showMessageBox({
        type: 'question',
        buttons: ['Clear Logs', 'Cancel'],
        defaultId: 1,
        title: 'Clear All Logs',
        message: 'Are you sure you want to clear all logs?',
        detail: 'This action cannot be undone and will permanently delete all log history.'
      });

      if (result.response === 0) {
        this.logs = [];
        this.renderLogs();
        
        UIComponents.showNotification(
          'Logs Cleared',
          'All logs have been successfully cleared.',
          'success'
        );

        window.app.log('info', 'Logs cleared by user');
      }

    } catch (error) {
      console.error('Failed to clear logs:', error);
      window.app.log('error', `Failed to clear logs: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to clear logs. Please try again.',
        'error'
      );
    }
  }

  async exportLogs() {
    try {
      if (this.logs.length === 0) {
        UIComponents.showNotification(
          'No Logs to Export',
          'There are no logs available to export.',
          'info'
        );
        return;
      }

      // Create log data structure
      const logData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalLogs: this.logs.length,
        logs: this.logs
      };

      // Convert to JSON
      const jsonString = JSON.stringify(logData, null, 2);
      
      // Create download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aquajarvis-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      UIComponents.showNotification(
        'Logs Exported',
        `Successfully exported ${this.logs.length} log entries.`,
        'success'
      );

      window.app.log('info', `Logs exported: ${this.logs.length} entries`);

    } catch (error) {
      console.error('Failed to export logs:', error);
      window.app.log('error', `Failed to export logs: ${error.message}`);
      UIComponents.showNotification(
        'Error',
        'Failed to export logs. Please try again.',
        'error'
      );
    }
  }

  // Filter logs by level
  filterLogs(level) {
    if (level === 'all') {
      return this.logs;
    }
    return this.logs.filter(log => log.level === level);
  }

  // Search logs
  searchLogs(query) {
    if (!query.trim()) {
      return this.logs;
    }
    
    const searchTerm = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(searchTerm) ||
      log.level.toLowerCase().includes(searchTerm)
    );
  }

  // Get log statistics
  getLogStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {}
    };

    this.logLevels.forEach(level => {
      stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
    });

    // Get recent logs (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    stats.recent = this.logs.filter(log => new Date(log.timestamp) > oneDayAgo).length;

    return stats;
  }

  // Add system event logs
  logSystemEvent(event, details = '') {
    const message = details ? `${event}: ${details}` : event;
    this.addLog('info', message);
  }

  // Add error logs with stack trace
  logError(error, context = '') {
    const message = context ? `${context}: ${error.message}` : error.message;
    this.addLog('error', message);
    
    // Log stack trace if available
    if (error.stack) {
      this.addLog('debug', `Stack trace: ${error.stack}`);
    }
  }

  // Add performance logs
  logPerformance(operation, duration) {
    this.addLog('info', `Performance: ${operation} completed in ${duration}ms`);
  }

  // Add user action logs
  logUserAction(action, details = '') {
    const message = details ? `User action: ${action} - ${details}` : `User action: ${action}`;
    this.addLog('info', message);
  }

  // Add automation logs
  logAutomation(event, workflowName, details = '') {
    const message = details ? `Automation [${workflowName}]: ${event} - ${details}` : `Automation [${workflowName}]: ${event}`;
    this.addLog('info', message);
  }

  // Add model logs
  logModel(event, modelName, details = '') {
    const message = details ? `Model [${modelName}]: ${event} - ${details}` : `Model [${modelName}]: ${event}`;
    this.addLog('info', message);
  }

  // Add voice input logs
  logVoiceInput(event, details = '') {
    const message = details ? `Voice input: ${event} - ${details}` : `Voice input: ${event}`;
    this.addLog('info', message);
  }

  // Add permission logs
  logPermission(permission, granted) {
    const message = `Permission ${permission}: ${granted ? 'granted' : 'denied'}`;
    this.addLog('info', message);
  }
}

// Export for use in other modules
window.LogsModule = LogsModule;
