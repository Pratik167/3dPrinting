import { adminToken } from './local-storage.mjs';
console.log('Local Studio access token (keep private):\n' + await adminToken());
