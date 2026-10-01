import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(project, 'dist/booking.js'), 'utf8');
function booking(search, message = '') {
  const fields = { q6_photographyType: { value: '' }, q14_tellUs: { value: message } };
  const form = { elements: { namedItem: name => fields[name] }, querySelector: () => ({}), addEventListener: () => {} };
  vm.runInNewContext(source, { document: { querySelector: () => form }, location: { search }, URLSearchParams });
  return fields;
}
for (const [id, label] of [['mini', 'Grad Mini'], ['signature', 'Grad Signature'], ['experience', 'Grad Experience']]) {
  const fields = booking('?service=graduation&package=' + id);
  assert.equal(fields.q6_photographyType.value, 'Portrait');
  assert.ok(fields.q14_tellUs.value.includes(label), 'Selected package survives the booking handoff');
}
assert.equal(booking('').q14_tellUs.value, '', 'Ordinary booking remains untouched');
assert.equal(booking('?service=wedding&package=mini').q6_photographyType.value, '');
assert.equal(booking('?service=graduation', 'Already drafted').q14_tellUs.value, 'Already drafted', 'Do not overwrite restored client input');
assert.ok(!booking('?service=graduation&package=%3Cscript%3E').q14_tellUs.value.includes('<script>'), 'Ignore unrecognised package values');
const config = JSON.parse(await readFile(path.join(project, 'dist/content/graduation.json')));
assert.equal(config.production_ready, false, 'Draft remains unreleased until originals and policy are supplied');
for (const photo of Object.values(config.images)) {
  assert.ok(!photo.developmentOnly && !/pexels|unsplash/.test(photo.src), 'Production data contains no reference photography');
}
const page = await readFile(path.join(project, 'dist/graduation/index.html'), 'utf8');
assert.equal((page.match(/<h1\b/g) || []).length, 1);
assert.equal((page.match(/<details><summary>/g) || []).length, 11);
assert.ok(page.includes('noindex,nofollow'));
console.log('Passed: package handoff, existing booking isolation, restored input, unknown packages, draft image separation, one H1 and eleven FAQs. No submissions sent.');
