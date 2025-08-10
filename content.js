chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendKeystroke') {
    sendKeepAliveKeystroke();
    sendResponse({ success: true });
  }
});

function sendKeepAliveKeystroke() {
  const event = new KeyboardEvent('keydown', {
    key: 'F15',
    code: 'F15',
    keyCode: 126,
    which: 126,
    bubbles: true,
    cancelable: true
  });
  
  document.dispatchEvent(event);
  
  const upEvent = new KeyboardEvent('keyup', {
    key: 'F15',
    code: 'F15',
    keyCode: 126,
    which: 126,
    bubbles: true,
    cancelable: true
  });
  
  document.dispatchEvent(upEvent);
}