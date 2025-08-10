# Chrome Keep Alive Extension

A Chrome extension that prevents RDP and web sessions from timing out by sending periodic F15 keystrokes.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select this directory
4. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon in your toolbar
2. Toggle "Enable Keep Alive" to start/stop the service
3. Adjust the interval (1-30 minutes) as needed
4. The extension will send F15 keystrokes to the active tab at the specified interval

## Features

- Sends F15 keystrokes (non-disruptive function key)
- Configurable interval (1-30 minutes)
- Works on all websites including RDP sessions
- Simple on/off toggle
- Remembers settings between sessions

## Technical Details

The extension uses:
- Background script to manage timing and state
- Content script to inject keystrokes into web pages
- Chrome storage API to persist settings
- F15 key (rarely used, won't interfere with normal usage)