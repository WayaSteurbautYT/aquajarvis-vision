// AquaJarvis Vision - Onboarding Module

class OnboardingModule {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
  }

  init() {
    this.setupEventListeners();
    this.showStep(1);
  }

  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('onboarding-prev');
    const nextBtn = document.getElementById('onboarding-next');
    const finishBtn = document.getElementById('onboarding-finish');
    const closeBtn = document.getElementById('onboarding-close');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousStep());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', () => this.finishOnboarding());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.finishOnboarding());
    }
  }

  showStep(stepNumber) {
    // Hide all steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));

    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
      currentStepElement.classList.add('active');
    }

    // Update buttons
    this.updateButtons(stepNumber);

    this.currentStep = stepNumber;
  }

  updateButtons(stepNumber) {
    const prevBtn = document.getElementById('onboarding-prev');
    const nextBtn = document.getElementById('onboarding-next');
    const finishBtn = document.getElementById('onboarding-finish');

    if (prevBtn) {
      prevBtn.style.display = stepNumber === 1 ? 'none' : 'block';
    }

    if (nextBtn) {
      nextBtn.style.display = stepNumber === this.totalSteps ? 'none' : 'block';
    }

    if (finishBtn) {
      finishBtn.style.display = stepNumber === this.totalSteps ? 'block' : 'none';
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.showStep(this.currentStep + 1);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.showStep(this.currentStep - 1);
    }
  }

  async finishOnboarding() {
    try {
      // Mark onboarding as completed
      await window.app.saveSetting('onboardingCompleted', true);
      
      // Hide modal
      window.app.hideModal();
      
      // Show success notification
      UIComponents.showNotification(
        'Welcome to AquaJarvis Vision!',
        'You\'re all set to start using your local AI assistant.',
        'success'
      );

      // Log completion
      window.app.log('info', 'Onboarding completed');

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      window.app.log('error', `Onboarding completion failed: ${error.message}`);
    }
  }
}

// Export for use in other modules
window.OnboardingModule = OnboardingModule;
