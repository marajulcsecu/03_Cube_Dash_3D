/**
 * Cube Dash 3D - Entry Point
 * Offline-first mobile 3D tunnel runner for MegaGameBox.
 */

console.log('[Cube Dash 3D] Initializing repository foundation...');

window.addEventListener('DOMContentLoaded', () => {
  const bootShell = document.getElementById('boot-shell');
  
  // Verify DOM & canvas setup
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('[Cube Dash 3D] Canvas element missing!');
    showFatalError('Failed to initialize game canvas target.');
    return;
  }

  // Foundation boot status update
  const bootStatus = document.getElementById('boot-status');
  setTimeout(() => {
    if (bootStatus) {
      bootStatus.textContent = 'Foundation Scaffolding Ready • Awaiting State Machine';
    }
    console.log('[Cube Dash 3D] Foundation boot complete.');
  }, 800);
});

function showFatalError(msg) {
  const bootShell = document.getElementById('boot-shell');
  const errorShell = document.getElementById('error-shell');
  const errorMsg = document.getElementById('error-message');
  
  if (bootShell) bootShell.style.display = 'none';
  if (errorShell) errorShell.style.display = 'flex';
  if (errorMsg) errorMsg.textContent = msg;
}

document.getElementById('error-retry-btn')?.addEventListener('click', () => {
  window.location.reload();
});
