module.exports = {
    apps: [
      {
        name: 'luckytaya-admin',        // Name of your application
        script: 'npm',             // PM2 will run npm directly
        args: 'run start:admin',   // The script to run (npm run start:admin)
        instances: 3,              // Number of clusters (can be increased dynamically)
        exec_mode: 'cluster',      // Run in cluster mode
        autorestart: true,         // Automatically restart app if it crashes
        watch: false,              // Optionally enable file watching (for development)
        max_memory_restart: '200M',  // Optionally restart app if it exceeds 1 GB of memory
        env: {
          NODE_ENV: 'development'  // Environment variables, you can add more here
        },      }
    ]
  };
  