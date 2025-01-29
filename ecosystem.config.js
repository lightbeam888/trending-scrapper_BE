module.exports = {
  apps: [
    {
      name: 'a3-trending-scrapper-analyser',
      script: 'RUNNERS/analyser.ts',
      interpreter: 'ts-node',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'a3-trending-scrapper-backend',
      script: 'RUNNERS/backend.ts',
      interpreter: 'ts-node',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};