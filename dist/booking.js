const form = document.querySelector('#booking-form');
// Jotform's existing service choices remain unchanged; graduation is a portrait request.
const bookingQuery = new URLSearchParams(location.search);
if (bookingQuery.get('service') === 'graduation') {
  const packages = { mini: 'Grad Mini — TT$600 (30 minutes)', signature: 'Grad Signature — TT$900 (60 minutes)', experience: 'Grad Experience — TT$1,300 (90 minutes)' };
  form.elements.namedItem('q6_photographyType').value = 'Portrait';
  const plans = form.elements.namedItem('q14_tellUs');
  if (!plans.value.trim()) plans.value = 'Graduation portrait session' + (packages[bookingQuery.get('package')] ? ': ' + packages[bookingQuery.get('package')] : '') + '\n\nMy preferred location, group size and any other details: ';
}
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
});


