const form = document.querySelector('#booking-form');
const statusBox = document.querySelector('#form-status');
const copyButton = document.querySelector('#copy-request');
let requestText = '';

const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-TT', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided';
const valueOr = (data, key, fallback = 'Not provided') => data.get(key)?.toString().trim() || fallback;

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const service = valueOr(data, 'type');
  const name = valueOr(data, 'name');
  requestText = [
    'ZAH MEDIA BOOKING REQUEST',
    '',
    `Name: ${name}`,
    `Email: ${valueOr(data, 'email')}`,
    `Phone / WhatsApp: ${valueOr(data, 'phone')}`,
    `Photography type: ${service}`,
    `Preferred date: ${formatDate(valueOr(data, 'date', ''))}`,
    `Backup date: ${formatDate(valueOr(data, 'backupDate', ''))}`,
    `Location: ${valueOr(data, 'location')}`,
    `Start time: ${valueOr(data, 'time')}`,
    `Coverage needed: ${valueOr(data, 'duration', 'Not sure yet')}`,
    `Estimated guests: ${valueOr(data, 'guests')}`,
    `Budget range: ${valueOr(data, 'budget', 'Prefer to discuss')}`,
    `How they heard about ZAH Media: ${valueOr(data, 'referral')}`,
    '',
    'Plans and vision:',
    valueOr(data, 'details'),
    '',
    'I understand this is a request and my date is not yet confirmed.'
  ].join('\n');

  const subject = `Booking request — ${service} — ${name}`;
  statusBox.hidden = false;
  statusBox.focus();
  window.location.href = `mailto:zahmediaofficial@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText)}`;
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(requestText);
    copyButton.textContent = 'Copied';
  } catch {
    copyButton.textContent = 'Select and copy from your email message';
  }
});

