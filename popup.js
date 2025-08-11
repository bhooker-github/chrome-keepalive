document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const intervalInput = document.getElementById('intervalInput');
  const statusDiv = document.getElementById('status');
  
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    enableToggle.checked = response.enabled;
    intervalInput.value = response.interval;
    updateStatus(response.enabled);
  });
  
  // Update last activity timestamp
  updateLastActivity();
  
  enableToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({ action: 'toggle' }, (response) => {
      updateStatus(response.enabled);
    });
  });
  
  intervalInput.addEventListener('change', () => {
    const interval = parseInt(intervalInput.value);
    if (interval >= 1 && interval <= 30) {
      chrome.runtime.sendMessage({ 
        action: 'setInterval', 
        interval: interval 
      });
    }
  });
  
  function updateStatus(enabled) {
    if (enabled) {
      statusDiv.textContent = 'Active - Sending F15 keystrokes';
      statusDiv.className = 'status active';
    } else {
      statusDiv.textContent = 'Inactive';
      statusDiv.className = 'status inactive';
    }
  }
  
  function updateLastActivity() {
    const lastActivityDiv = document.getElementById('lastActivity');
    chrome.storage.sync.get(['lastActivity'], (result) => {
      if (result.lastActivity) {
        const date = new Date(result.lastActivity);
        lastActivityDiv.textContent = `Last activity: ${date.toLocaleTimeString()}`;
      } else {
        lastActivityDiv.textContent = 'Last activity: Never';
      }
    });
  }
  
  // Refresh activity timestamp every 2 seconds
  setInterval(updateLastActivity, 2000);
});