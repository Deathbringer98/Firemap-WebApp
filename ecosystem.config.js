module.exports = {
  apps: [{
    name: "wildfire-api",
    script: "./simple-server.js",
    cwd: "/var/www/wildfiremap.app",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 8080
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 8080
    },
    error_file: "./logs/api-error.log",
    out_file: "./logs/api-out.log",
    log_file: "./logs/api-combined.log",
    time: true
  }]
};
