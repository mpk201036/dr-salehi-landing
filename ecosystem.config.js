module.exports = {
  apps: [
    {
      name: 'dr-salehi',
      script: '.next/standalone/server.js',
      cwd: '/var/www/dr-salehi',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
