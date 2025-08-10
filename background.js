let keepAliveEnabled = false;
let intervalId = null;
let currentTabId = null;

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['enabled', 'interval'], (result) => {
    keepAliveEnabled = result.enabled || false;
    const interval = result.interval || 5;
    if (keepAliveEnabled) {
      startKeepAlive(interval);
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: false,
    interval: 5
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  currentTabId = activeInfo.tabId;
  updateKeepAliveForCurrentTab();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === 'complete') {
    updateKeepAliveForCurrentTab();
  }
});

function updateKeepAliveForCurrentTab() {
  chrome.storage.sync.get(['enabled', 'interval'], (result) => {
    keepAliveEnabled = result.enabled || false;
    const interval = result.interval || 5;
    
    if (keepAliveEnabled) {
      startKeepAlive(interval);
    } else {
      stopKeepAlive();
    }
  });
}

function startKeepAlive(intervalMinutes) {
  stopKeepAlive();
  
  const intervalMs = intervalMinutes * 60 * 1000;
  
  intervalId = setInterval(() => {
    if (currentTabId) {
      chrome.tabs.sendMessage(currentTabId, { action: 'sendKeystroke' }).catch(() => {
        // Tab might not have content script loaded, ignore error
      });
    }
  }, intervalMs);
}

function stopKeepAlive() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    keepAliveEnabled = !keepAliveEnabled;
    chrome.storage.sync.set({ enabled: keepAliveEnabled });
    
    if (keepAliveEnabled) {
      chrome.storage.sync.get(['interval'], (result) => {
        startKeepAlive(result.interval || 5);
      });
    } else {
      stopKeepAlive();
    }
    
    sendResponse({ enabled: keepAliveEnabled });
  } else if (request.action === 'setInterval') {
    chrome.storage.sync.set({ interval: request.interval });
    
    if (keepAliveEnabled) {
      startKeepAlive(request.interval);
    }
    
    sendResponse({ success: true });
  } else if (request.action === 'getStatus') {
    chrome.storage.sync.get(['enabled', 'interval'], (result) => {
      sendResponse({
        enabled: result.enabled || false,
        interval: result.interval || 5
      });
    });
    return true;
  }
});