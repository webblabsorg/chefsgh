// PM2 Configuration for Ghana Chef Association API
// To use: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [{
    name: 'chefs-api',
    script: './api/server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      API_PORT: 4000
    },
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_file: './logs/api-combined.log',
    time: true
  }]
};
