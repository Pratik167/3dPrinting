import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const email = (process.env.CONTACT_EMAIL || '').trim();
if (email && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
  throw Error('CONTACT_EMAIL must be a valid business email address.');
}
let html = await readFile(path.join(root, 'worker/ui.html'), 'utf8');
// Only the public interface is exported. No Worker code, local data or secrets.
const adapter = `
// GitHub Pages is static hosting: use email enquiries instead of server APIs.
const contactEmail = ${JSON.stringify(email).replace(/</g, '\\u003c')};
$('#trackOpen').hidden = true;
$('#adminOpen').hidden = true;
$('#quoteForm .upload').hidden = true;
$('#quoteForm [name=file]').disabled = true;
$('#quoteForm [type=submit]').textContent = contactEmail ? 'Prepare email enquiry ↗' : 'Enquiries not yet open';
$('#quoteForm [type=submit]').disabled = !contactEmail;
const instructions = $('#quoteForm .hint.wide');
instructions.textContent = contactEmail
  ? 'This opens an email draft. Send it from your email app and attach any model files there. No enquiry is saved by this website.'
  : 'This is a catalogue preview. Online enquiries, uploads and tracking are not available yet.';
$('#quoteForm').onsubmit = event => {
  event.preventDefault();
  if (!contactEmail) return;
  const form = new FormData(event.currentTarget);
  const fields = ['name','email','phone','product','material','color','dimensions','quantity','message'];
  const body = fields.map(key => key + ': ' + String(form.get(key) || '')).join('\\n');
  location.href = 'mailto:' + contactEmail + '?subject=' + encodeURIComponent('3D printing quotation — ' + form.get('product')) + '&body=' + encodeURIComponent(body);
  feedback($('#quoteResult'), 'Your email app should open a draft. Please send it to complete your enquiry. If it does not open, email ' + contactEmail + ' directly. Attach your files in the email.');
};
document.querySelectorAll('details').forEach(item => {
  if (item.querySelector('summary').textContent.includes('pay online')) {
    item.querySelector('p').textContent = 'Online payments are not available on this website. Pricing and payment arrangements must be confirmed directly with the studio.';
  }
});
policy.privacy = '<h2>Privacy notice</h2><p class="sub">This catalogue website does not save form entries or upload files. If you prepare an email enquiry, the details are passed to your email application. They are sent to the studio only when you send that email. Your email provider handles that message under its own privacy terms.</p><p class="sub">GitHub hosts this website and may process technical access information. No advertising cookies or analytics have been added by the studio.</p>';
`;
if (!html.includes('</script>')) throw Error('Missing application script');
html = html.replace('</script>', adapter + '\n</script>');
new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
const destination = path.join(root, '_site');
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'index.html'), html);
await writeFile(path.join(destination, '.nojekyll'), '');
console.log('GitHub Pages site built in _site/ (' + (email ? 'email enquiries enabled' : 'catalogue preview; set CONTACT_EMAIL to enable email enquiries') + ').');
