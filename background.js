let keepAliveEnabled = false;
let intervalId = null;
let currentTabId = null;

chrome.runtime.onStartup.addListener(async () => {
  console.log('Service worker startup');
  // Get current active tab
  try {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
      currentTabId = tabs[0].id;
    }
  } catch (e) {
    console.log('Failed to get active tab on startup:', e);
  }
  
  chrome.storage.sync.get(['enabled', 'interval'], (result) => {
    keepAliveEnabled = result.enabled || false;
    const interval = result.interval || 5;
    console.log('Startup - enabled:', keepAliveEnabled, 'interval:', interval);
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
  
  intervalId = setInterval(async () => {
    // Get active tab if currentTabId is null
    if (!currentTabId) {
      try {
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        if (tabs[0]) {
          currentTabId = tabs[0].id;
        }
      } catch (e) {
        console.log('Failed to get active tab:', e);
        return;
      }
    }
    
    if (currentTabId) {
      // Inject script directly using scripting API (works in Chrome apps)
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        func: () => {
          console.log('Keep alive: Injecting activity into Guacamole');
          
          // Find Guacamole canvas
          const canvas = document.querySelector('canvas') || 
                        document.querySelector('[data-guac-display]') ||
                        document.querySelector('#display');
          
          if (canvas) {
            console.log('Found canvas, sending mouse events');
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Tiny mouse movement
            const mouseEvent = new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: true,
              clientX: centerX + Math.floor(Math.random() * 3) - 1,
              clientY: centerY + Math.floor(Math.random() * 3) - 1,
              view: window
            });
            canvas.dispatchEvent(mouseEvent);
            
            // Also try mouse down/up for more activity
            const mouseDown = new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
              button: 0,
              clientX: centerX,
              clientY: centerY
            });
            
            const mouseUp = new MouseEvent('mouseup', {
              bubbles: true,
              cancelable: true,
              button: 0,
              clientX: centerX,
              clientY: centerY
            });
            
            canvas.dispatchEvent(mouseDown);
            setTimeout(() => canvas.dispatchEvent(mouseUp), 1);
            
            return { success: true, method: 'canvas' };
          } else {
            console.log('No canvas found, sending document events');
            document.dispatchEvent(new Event('focus'));
            return { success: true, method: 'document' };
          }
        }
      }).then((results) => {
        if (results && results[0] && results[0].result && results[0].result.success) {
          chrome.storage.sync.set({ lastActivity: Date.now() });
          console.log('Keep alive: successfully injected script, method:', results[0].result.method);
        } else {
          console.log('Keep alive: script injection failed');
        }
      }).catch((error) => {
        console.log('Script injection error:', error);
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
  console.log('Message received:', request.action);
  
  if (request.action === 'toggle') {
    // Get current tab when toggling
    chrome.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (tabs[0]) {
        currentTabId = tabs[0].id;
        console.log('Set currentTabId to:', currentTabId);
      }
      
      keepAliveEnabled = !keepAliveEnabled;
      chrome.storage.sync.set({ enabled: keepAliveEnabled });
      console.log('Toggled to:', keepAliveEnabled);
      
      if (keepAliveEnabled) {
        chrome.storage.sync.get(['interval'], (result) => {
          console.log('Starting keep alive with interval:', result.interval || 5);
          startKeepAlive(result.interval || 5);
        });
      } else {
        stopKeepAlive();
      }
      
      sendResponse({ enabled: keepAliveEnabled });
    }).catch(e => {
      console.log('Failed to get tab on toggle:', e);
      sendResponse({ enabled: false });
    });
    
    return true; // Keep message channel open for async response
    
  } else if (request.action === 'setInterval') {
    chrome.storage.sync.set({ interval: request.interval });
    console.log('Set interval to:', request.interval);
    
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