// AquaJarvis Vision - UI Components

class UIComponents {
  static createButton(text, className = 'btn-primary', icon = null, onClick = null) {
    const button = document.createElement('button');
    button.className = `btn ${className}`;
    button.innerHTML = text;
    
    if (icon) {
      const iconElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconElement.className = 'btn-icon';
      iconElement.setAttribute('viewBox', '0 0 24 24');
      iconElement.setAttribute('fill', 'none');
      iconElement.setAttribute('stroke', 'currentColor');
      iconElement.setAttribute('stroke-width', '2');
      iconElement.innerHTML = icon;
      button.insertBefore(iconElement, button.firstChild);
    }
    
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    
    return button;
  }

  static createCard(title, description, actions = [], className = '') {
    const card = document.createElement('div');
    card.className = `card ${className}`;
    
    card.innerHTML = `
      <div class="card-header">
        <h3>${title}</h3>
      </div>
      <div class="card-body">
        <p>${description}</p>
      </div>
      <div class="card-actions"></div>
    `;
    
    const actionsContainer = card.querySelector('.card-actions');
    actions.forEach(action => {
      actionsContainer.appendChild(action);
    });
    
    return card;
  }

  static createModal(title, content, footerActions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer"></div>
    `;
    
    const footerContainer = modal.querySelector('.modal-footer');
    footerActions.forEach(action => {
      footerContainer.appendChild(action);
    });
    
    return modal;
  }

  static showNotification(title, message, type = 'info', duration = 5000) {
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

    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          background: var(--surface-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: 0 8px 24px var(--shadow-medium);
          z-index: 1001;
          animation: slideInRight 0.3s ease;
        }
        
        .notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--border-light);
        }
        
        .notification-header h4 {
          margin: 0;
          font-size: var(--font-size-sm);
          font-weight: 600;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: var(--font-size-lg);
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-close:hover {
          color: var(--text-primary);
        }
        
        .notification-body {
          padding: var(--spacing-md);
        }
        
        .notification-body p {
          margin: 0;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        
        .notification-info {
          border-left: 4px solid var(--info-color);
        }
        
        .notification-success {
          border-left: 4px solid var(--success-color);
        }
        
        .notification-warning {
          border-left: 4px solid var(--warning-color);
        }
        
        .notification-error {
          border-left: 4px solid var(--error-color);
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);

    // Handle close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      });
    }

    return notification;
  }

  static createProgressBar(current, total, label = '') {
    const container = document.createElement('div');
    container.className = 'progress-container';
    
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    container.innerHTML = `
      <div class="progress-label">${label}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="progress-text">${current} / ${total} (${Math.round(percentage)}%)</div>
    `;

    // Add styles if not already added
    if (!document.querySelector('#progress-styles')) {
      const style = document.createElement('style');
      style.id = 'progress-styles';
      style.textContent = `
        .progress-container {
          margin: var(--spacing-md) 0;
        }
        
        .progress-label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--surface-secondary);
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: var(--spacing-sm);
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
          border-radius: var(--radius-sm);
          transition: width var(--transition-normal);
        }
        
        .progress-text {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          text-align: right;
        }
      `;
      document.head.appendChild(style);
    }

    return container;
  }

  static updateProgressBar(progressElement, current, total) {
    const fillElement = progressElement.querySelector('.progress-fill');
    const textElement = progressElement.querySelector('.progress-text');
    
    if (fillElement && textElement) {
      const percentage = total > 0 ? (current / total) * 100 : 0;
      fillElement.style.width = `${percentage}%`;
      textElement.textContent = `${current} / ${total} (${Math.round(percentage)}%)`;
    }
  }

  static createLoadingSpinner(size = 'medium') {
    const spinner = document.createElement('div');
    spinner.className = `loading-spinner loading-spinner-${size}`;
    
    // Add styles if not already added
    if (!document.querySelector('#spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = `
        .loading-spinner {
          display: inline-block;
          border: 2px solid var(--border-color);
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-spinner-small {
          width: 16px;
          height: 16px;
        }
        
        .loading-spinner-medium {
          width: 24px;
          height: 24px;
        }
        
        .loading-spinner-large {
          width: 32px;
          height: 32px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return spinner;
  }

  static createStatusIndicator(status, text = '') {
    const indicator = document.createElement('div');
    indicator.className = 'status-indicator';
    
    const statusClass = `status-${status}`;
    indicator.innerHTML = `
      <div class="status-dot ${statusClass}"></div>
      <span class="status-text">${text}</span>
    `;

    return indicator;
  }

  static createIcon(name, size = 'medium') {
    const icons = {
      play: '<polygon points="5 3 19 12 5 21 5 3"></polygon>',
      pause: '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>',
      stop: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>',
      settings: '<circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24m12.44 0l4.24 4.24M1.54 14.04l4.24-4.24"></path>',
      edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
      delete: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
      upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',
      check: '<polyline points="20 6 9 17 4 12"></polyline>',
      warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
      info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
      error: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
    };

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = `icon icon-${size}`;
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.innerHTML = icons[name] || '';

    // Add styles if not already added
    if (!document.querySelector('#icon-styles')) {
      const style = document.createElement('style');
      style.id = 'icon-styles';
      style.textContent = `
        .icon {
          display: inline-block;
          vertical-align: middle;
        }
        
        .icon-small {
          width: 16px;
          height: 16px;
        }
        
        .icon-medium {
          width: 20px;
          height: 20px;
        }
        
        .icon-large {
          width: 24px;
          height: 24px;
        }
      `;
      document.head.appendChild(style);
    }

    return svg;
  }

  static createTooltip(text, targetElement) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;

    // Add styles if not already added
    if (!document.querySelector('#tooltip-styles')) {
      const style = document.createElement('style');
      style.id = 'tooltip-styles';
      style.textContent = `
        .tooltip {
          position: absolute;
          background: var(--background-tertiary);
          color: var(--text-primary);
          padding: var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          opacity: 0;
          transition: opacity var(--transition-fast);
          box-shadow: 0 2px 8px var(--shadow-medium);
        }
        
        .tooltip.visible {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }

    targetElement.addEventListener('mouseenter', (e) => {
      document.body.appendChild(tooltip);
      
      const rect = targetElement.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
      
      setTimeout(() => tooltip.classList.add('visible'), 10);
    });

    targetElement.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 150);
    });

    return tooltip;
  }

  static createDropdown(items, placeholder = 'Select an option', onChange = null) {
    const container = document.createElement('div');
    container.className = 'dropdown';
    
    const select = document.createElement('select');
    select.innerHTML = `<option value="">${placeholder}</option>`;
    
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
    
    if (onChange) {
      select.addEventListener('change', (e) => onChange(e.target.value));
    }
    
    container.appendChild(select);
    
    // Add styles if not already added
    if (!document.querySelector('#dropdown-styles')) {
      const style = document.createElement('style');
      style.id = 'dropdown-styles';
      style.textContent = `
        .dropdown select {
          width: 100%;
          padding: var(--spacing-sm);
          background: var(--background-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: var(--font-size-sm);
        }
        
        .dropdown select:focus {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
      `;
      document.head.appendChild(style);
    }
    
    return container;
  }
}

// Export for use in other modules
window.UIComponents = UIComponents;
