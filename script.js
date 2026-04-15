const form = document.getElementById('lead-form');
const steps = [...document.querySelectorAll('.form-step')];
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const submitBtn = document.getElementById('submitBtn');
const stepLabel = document.getElementById('step-label');
const progressFill = document.getElementById('progress-fill');
const modal = document.getElementById('successModal');
const closeModal = document.getElementById('closeModal');
const whatsappShare = document.getElementById('whatsappShare');
let currentStep = 1;

function updateStep() {
  steps.forEach(step => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  stepLabel.textContent = `Step ${currentStep} of ${steps.length}`;
  progressFill.style.width = `${(currentStep / steps.length) * 100}%`;
  backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  nextBtn.classList.toggle('hidden', currentStep === steps.length);
  submitBtn.classList.toggle('hidden', currentStep !== steps.length);
}

function setHiddenValue(container, fieldName, multi) {
  const hiddenInput = form.querySelector(`input[name="${fieldName}"]`);
  const selected = [...container.querySelectorAll('.option-btn.selected')].map(btn => btn.textContent.trim());
  hiddenInput.value = multi ? selected.join(', ') : (selected[0] || '');
}

document.querySelectorAll('.single-select').forEach(group => {
  const fieldName = group.dataset.field;
  group.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.option-btn').forEach(item => item.classList.remove('selected'));
      btn.classList.add('selected');
      setHiddenValue(group, fieldName, false);
    });
  });
});

document.querySelectorAll('.multi-select').forEach(group => {
  const fieldName = group.dataset.field;
  group.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      setHiddenValue(group, fieldName, true);
    });
  });
});

function validateCurrentStep() {
  const activeStep = form.querySelector(`.form-step[data-step="${currentStep}"]`);
  const inputs = [...activeStep.querySelectorAll('input, select, textarea')]
    .filter(el => !['hidden', 'checkbox'].includes(el.type));

  for (const input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }

  const hiddenRequired = [...activeStep.querySelectorAll('input[type="hidden"][required]')];
  for (const hidden of hiddenRequired) {
    if (!hidden.value.trim()) {
      alert('Please select at least one option before continuing.');
      return false;
    }
  }

  return true;
}

nextBtn.addEventListener('click', () => {
  if (!validateCurrentStep()) return;
  currentStep += 1;
  updateStep();
  window.scrollTo({ top: form.offsetTop - 90, behavior: 'smooth' });
});

backBtn.addEventListener('click', () => {
  currentStep -= 1;
  updateStep();
  window.scrollTo({ top: form.offsetTop - 90, behavior: 'smooth' });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const consent = document.getElementById('consent');
  if (!consent.checked) {
    alert('Please agree to be contacted before submitting.');
    return;
  }

  if (!validateCurrentStep()) return;

  const formData = new FormData(form);

  const fullName = formData.get('full_name') || '';
  const phoneNumber = formData.get('phone_number') || '';
  const email = formData.get('email') || '';
  const projectType = formData.get('project_type') || '';
  const services = formData.get('services_needed') || '';
  const timeline = formData.get('timeline') || '';
  const city = formData.get('city') || '';
  const zip = formData.get('zip_code') || '';

  const whatsappMessage = encodeURIComponent(
    `New Lead from GetEstimateFast\n\n` +
    `Name: ${fullName}\n` +
    `Phone: ${phoneNumber}\n` +
    `Email: ${email}\n` +
    `Project Type: ${projectType}\n` +
    `Services Needed: ${services}\n` +
    `Timeline: ${timeline}\n` +
    `Location: ${city} ${zip}`
  );

  whatsappShare.href = `https://wa.me/18135917560?text=${whatsappMessage}`;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const response = await fetch('https://formsubmit.co/ajax/getestimatefast@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });

    if (!response.ok) throw new Error('Unable to submit form');

    modal.classList.remove('hidden');
    form.reset();
    document.querySelectorAll('.option-btn.selected').forEach(btn => btn.classList.remove('selected'));
    currentStep = 1;
    updateStep();
  } catch (error) {
    alert('We could not send your request automatically right now. Please use the WhatsApp button to contact us directly.');
    window.open(`https://wa.me/18135917560?text=${whatsappMessage}`, '_blank');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Request';
  }
});

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.classList.add('hidden');
});

updateStep();
