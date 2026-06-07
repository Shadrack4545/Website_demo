/**
 * Start the Flask XGBoost API server.
 * Auto-trains the model if trained_model.pkl is missing.
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const venvPython =
  process.platform === 'win32'
    ? path.join(root, '.venv', 'Scripts', 'python.exe')
    : path.join(root, '.venv', 'bin', 'python');

const python = fs.existsSync(venvPython) ? venvPython : 'python';
const modelPath = path.join(root, 'ml_backend', 'trained_model.pkl');

if (!fs.existsSync(modelPath)) {
  console.log('[ml] trained_model.pkl not found — training XGBoost model first...\n');
  const train = spawnSync(python, [path.join(root, 'ml_backend', 'train_model.py')], {
    cwd: root,
    stdio: 'inherit',
  });
  if (train.status !== 0) {
    console.error('[ml] Training failed. Check Python dependencies in .venv');
    process.exit(train.status ?? 1);
  }
  console.log('\n[ml] Training complete.\n');
}

console.log('[ml] Starting Flask API on http://localhost:5000\n');

const server = spawn(python, [path.join(root, 'ml_backend', 'server.py')], {
  cwd: root,
  stdio: 'inherit',
});

server.on('exit', (code) => process.exit(code ?? 0));

process.on('SIGINT', () => server.kill('SIGINT'));
process.on('SIGTERM', () => server.kill('SIGTERM'));
