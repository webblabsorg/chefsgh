// Vercel Serverless Function under /api/api for project-root=/api deployments
import app from '../server/index.js';

export default function handler(req, res) {
  return app(req, res);
}
