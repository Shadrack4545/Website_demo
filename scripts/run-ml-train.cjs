const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const venvPython =
  process.platform === 'win32'
    ? path.join(root, '.venv', 'Scripts', 'python.exe')
    : path.join(root, '.venv', 'bin', 'python');

const python = fs.existsSync(venvPython) ? venvPython : 'python';

const result = spawnSync(python, [path.join(root, 'ml_backend', 'train_model.py')], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
