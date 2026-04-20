const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const nodeChildProcess = require('node:child_process');
const { PassThrough } = require('stream');

const projectDir = path.resolve(__dirname, '..');
const distDir = path.join(projectDir, 'local-next');

process.chdir(projectDir);
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

const originalSpawn = childProcess.spawn;
const originalExecFile = childProcess.execFile;
const originalFork = childProcess.fork;

function logProcessCall(kind, command, args) {
  try {
    console.error(`${kind}_ATTEMPT`, command, Array.isArray(args) ? args.join(' ') : '');
    console.error(new Error(`${kind.toLowerCase()} trace`).stack);
  } catch (error) {
    console.error(`Failed to log ${kind.toLowerCase()} attempt`, error);
  }
}

function patchedSpawn(command, args, options) {
  logProcessCall('SPAWN', command, args);
  return originalSpawn.call(this, command, args, options);
}

function patchedExecFile(file, args, options, callback) {
  logProcessCall('EXECFILE', file, args);
  return originalExecFile.call(this, file, args, options, callback);
}

function patchedFork(modulePath, args, options) {
  logProcessCall('FORK', modulePath, args);
  return originalFork.call(this, modulePath, args, options);
}

childProcess.spawn = patchedSpawn;
childProcess.execFile = patchedExecFile;
childProcess.fork = patchedFork;
nodeChildProcess.spawn = patchedSpawn;
nodeChildProcess.execFile = patchedExecFile;
nodeChildProcess.fork = patchedFork;

try {
  fs.rmSync(distDir, { recursive: true, force: true });
} catch (error) {
  console.warn('Failed to clean local-next output:', error);
}

const jestWorkerModule = require('next/dist/compiled/jest-worker');
const OriginalJestWorker = jestWorkerModule.Worker;

class InProcessJestWorker {
  constructor(workerPath, options = {}) {
    this._workerPath = workerPath;
    this._module = require(workerPath);
    this._options = options;
    this._stdout = new PassThrough();
    this._stderr = new PassThrough();

    const exposedMethods = options.exposedMethods || [];
    for (const methodName of exposedMethods) {
      this[methodName] = async (...args) => {
        const target = this._resolveMethod(methodName);
        if (typeof target !== 'function') {
          throw new Error(`Worker method "${methodName}" not found in ${workerPath}`);
        }

        return await target(...args);
      };
    }
  }

  _resolveMethod(methodName) {
    if (typeof this._module[methodName] === 'function') {
      return this._module[methodName];
    }

    if (this._module.default) {
      if (typeof this._module.default[methodName] === 'function') {
        return this._module.default[methodName];
      }

      if (methodName === 'default' && typeof this._module.default === 'function') {
        return this._module.default;
      }
    }

    return null;
  }

  end() {
    return Promise.resolve();
  }

  getStdout() {
    return this._stdout;
  }

  getStderr() {
    return this._stderr;
  }

  close() {
    return Promise.resolve();
  }
}

jestWorkerModule.Worker = InProcessJestWorker;

const configModule = require('next/dist/server/config');
const originalLoadConfig = configModule.default;

configModule.default = async (...args) => {
  const config = await originalLoadConfig(...args);

  return {
    ...config,
    distDir: 'local-next',
    eslint: {
      ...config.eslint,
      ignoreDuringBuilds: true,
    },
    typescript: {
      ...config.typescript,
      ignoreBuildErrors: true,
    },
    experimental: {
      ...config.experimental,
      cpus: 1,
      webpackBuildWorker: false,
    },
  };
};

async function main() {
  const buildModule = require('next/dist/build');
  const { Bundler } = require('next/dist/lib/bundler');

  try {
    await buildModule.default(projectDir, false, false, false, false, false, false, Bundler.Webpack);
    console.log('BUILD_OK');
  } finally {
    childProcess.spawn = originalSpawn;
    childProcess.execFile = originalExecFile;
    childProcess.fork = originalFork;
    nodeChildProcess.spawn = originalSpawn;
    nodeChildProcess.execFile = originalExecFile;
    nodeChildProcess.fork = originalFork;
    jestWorkerModule.Worker = OriginalJestWorker;
    configModule.default = originalLoadConfig;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
