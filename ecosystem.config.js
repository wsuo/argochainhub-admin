module.exports = {
  apps: [{
    name: 'argochainhub-admin',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/wsuo/argochainhub-admin',
    env: {
      NODE_ENV: 'production',
      PORT: '3060'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: '3060'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: '3060'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/home/wsuo/logs/argochainhub-admin-error.log',
    out_file: '/home/wsuo/logs/argochainhub-admin-out.log',
    log_file: '/home/wsuo/logs/argochainhub-admin-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
}