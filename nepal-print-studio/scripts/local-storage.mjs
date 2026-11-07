import { mkdir, readFile, writeFile, rename, readdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, randomBytes } from 'node:crypto';

export const root = path.resolve(import.meta.dirname, '..');
const storage = path.join(root, '.local', 'storage');
export async function adminToken() {
  const location = path.join(root, '.local', 'admin-token');
  await mkdir(path.dirname(location), { recursive: true });
  try { return (await readFile(location, 'utf8')).trim(); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const token = randomBytes(24).toString('hex');
    await writeFile(location, token, { mode: 0o600, flag: 'wx' });
    return token;
  }
}
function filename(key) {
  if (!/^(requests|files|rate)\/[a-zA-Z0-9-]+$/.test(key)) throw Error('Invalid storage key');
  return path.join(storage, ...key.split('/'));
}
export const bucket = {
  async get(key) {
    let bytes;
    try { bytes = await readFile(filename(key)); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    return { body: bytes, text: async () => bytes.toString('utf8'), json: async () => JSON.parse(bytes.toString('utf8')) };
  },
  async put(key, value) {
    const destination = filename(key);
    await mkdir(path.dirname(destination), { recursive: true });
    const bytes = typeof value === 'string' ? value : Buffer.from(await new Response(value).arrayBuffer());
    const temporary = destination + '.' + randomUUID() + '.tmp';
    await writeFile(temporary, bytes);
    await rename(temporary, destination);
  },
  async list({ prefix, limit = 100, cursor }) {
    if (!['requests/', 'files/', 'rate/'].includes(prefix)) throw Error('Invalid prefix');
    let entries;
    try { entries = await readdir(path.join(storage, prefix)); }
    catch (error) { if (error.code === 'ENOENT') entries = []; else throw error; }
    const keys = entries.filter(k => /^[a-zA-Z0-9-]+$/.test(k)).sort().map(k => prefix + k);
    const remaining = cursor ? keys.filter(k => k > cursor) : keys;
    const objects = remaining.slice(0, limit).map(key => ({ key }));
    const truncated = remaining.length > objects.length;
    return { objects, truncated, cursor: truncated ? objects.at(-1).key : undefined };
  }
};
