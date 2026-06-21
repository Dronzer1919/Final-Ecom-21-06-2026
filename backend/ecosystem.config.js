// PM2 Ecosystem Configuration File
// This file helps PM2 manage your Node.js application

module.exports = {
  apps: [{
    name: 'pos-backend',
    script: 'src/server.js',
    
    // Instances
    instances: 1, // Or 'max' to use all CPU cores
    exec_mode: 'fork', // Or 'cluster' for load balancing
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Advanced features
    watch: false, // Set to true to watch for file changes and auto-restart
    ignore_watch: ['node_modules', 'logs', '.env'],
    max_memory_restart: '500M', // Restart if memory usage exceeds 500MB
    
    // Restart behavior
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000,
    
    // Source map support
    source_map_support: true,
    
    // Merge logs from different instances
    merge_logs: true,
    
    // Time to wait before restarting a crashed app
    restart_delay: 4000
  }]
};
