const form = document.querySelector('#booking-form');
const statusBox = document.querySelector('#form-status');
const submitButton = form.querySelector('.submit-button');
const setHidden = (name, value) => { form.elements.namedItem(name).value = value || ''; };
const setDateParts = (prefix, value) => {
  const [year = '', month = '', day = ''] = value.split('-');
  setHidden(`q${prefix}[month]`, month);
  setHidden(`q${prefix}[day]`, day);
  setHidden(`q${prefix}[year]`, year);
};

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const fullName = form.elements.fullName.value.trim().split(/\s+/);
  setHidden('q2_q2_fullname0[first]', fullName.shift());
  setHidden('q2_q2_fullname0[last]', fullName.join(' '));
  setDateParts('7_preferredDate', form.elements.preferredDateRaw.value);
  setDateParts('8_backupDate', form.elements.backupDateRaw.value);
  setHidden('q10_startTime[timeInput]', form.elements.startTimeRaw.value);
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  form.submit();
  window.setTimeout(() => {
    statusBox.hidden = false;
    statusBox.focus();
    submitButton.textContent = 'Request sent';
  }, 900);
});

