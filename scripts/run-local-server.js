const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const projectDir = path.resolve(__dirname, '..');
const distDir = path.join(projectDir, 'local-next');
const port = Number(process.env.PORT || 5000);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const browserUrl = process.env.BROWSER_URL || `http://127.0.0.1:${port}`;

if (!fs.existsSync(distDir)) {
  console.error(`Build output not found: ${distDir}`);
  console.error('Run the local build step before starting the server.');
  process.exit(1);
}

const app = next({
  dev: false,
  dir: projectDir,
  hostname,
  port,
  customServer: false,
  conf: {
    distDir: 'local-next',
    configOrigin: 'server',
    configFileName: 'next.config.ts',
    allowedDevOrigins: ['*.dev.coze.site'],
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'lf-coze-web-cdn.coze.cn',
          pathname: '/**',
        },
      ],
    },
  },
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      const parsedUrl = parse(req.url || '/', true);
      await handle(req, res, parsedUrl);
    } catch (error) {
      console.error('Request handling error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, () => {
    console.log(`Server ready at ${browserUrl}`);
    console.log(`Listening on ${hostname}:${port}`);
  });
}).catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
