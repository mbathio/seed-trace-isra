// backend/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "isra-seeds-api",
      script: "dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,
      max_memory_restart: "1G",
      node_args: "--max_old_space_size=1024",
    },
  ],
};
