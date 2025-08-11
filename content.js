chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendKeystroke') {
    sendKeepAliveActivity();
    sendResponse({ success: true });
  }
});

function sendKeepAliveActivity() {
  console.log('Chrome Keep Alive: Sending activity to Guacamole session');
  
  // Look for Guacamole canvas or display element
  const guacCanvas = document.querySelector('canvas') || 
                     document.querySelector('[data-guac-display]') ||
                     document.querySelector('#display') ||
                     document.querySelector('.guac-display');
  
  if (guacCanvas) {
    console.log('Found Guacamole canvas, sending mouse movement');
    
    // Get canvas dimensions for proper coordinates
    const rect = guacCanvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Very small mouse movement on the Guacamole canvas
    const mouseMove1 = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: centerX,
      clientY: centerY,
      view: window
    });
    
    const mouseMove2 = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: centerX + 1,
      clientY: centerY,
      view: window
    });
    
    // Send to canvas specifically
    guacCanvas.dispatchEvent(mouseMove1);
    setTimeout(() => guacCanvas.dispatchEvent(mouseMove2), 50);
    
    // Also try keyboard event on canvas
    const shiftDown = new KeyboardEvent('keydown', {
      key: 'Shift',
      code: 'ShiftRight',
      keyCode: 16,
      which: 16,
      bubbles: true,
      cancelable: true
    });
    
    const shiftUp = new KeyboardEvent('keyup', {
      key: 'Shift',
      code: 'ShiftRight', 
      keyCode: 16,
      which: 16,
      bubbles: true,
      cancelable: true
    });
    
    guacCanvas.dispatchEvent(shiftDown);
    setTimeout(() => guacCanvas.dispatchEvent(shiftUp), 100);
    
  } else {
    console.log('Guacamole canvas not found, trying document-level events');
    
    // Fallback to document-level events
    const mouseEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });
    document.dispatchEvent(mouseEvent);
    
    // Try Ctrl key (safe modifier)
    const ctrlDown = new KeyboardEvent('keydown', {
      key: 'Control',
      code: 'ControlLeft',
      keyCode: 17,
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    
    const ctrlUp = new KeyboardEvent('keyup', {
      key: 'Control',
      code: 'ControlLeft',
      keyCode: 17,
      ctrlKey: false,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(ctrlDown);
    setTimeout(() => document.dispatchEvent(ctrlUp), 100);
  }
}