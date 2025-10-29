import http from 'http';

function request(path, options = {}) {
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method: options.method || 'GET', headers: options.headers || {} }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function main() {
  const health = await request('/api/health');
  if (health.status !== 200) throw new Error('Health check failed');
  const me = await request('/api/auth/me');
  if (me.status !== 401) throw new Error('Auth guard check failed');
  console.log('Smoke OK');
}

main().catch((e) => { console.error(e); process.exit(1); });
