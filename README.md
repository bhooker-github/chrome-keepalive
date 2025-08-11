# Chrome Keep Alive Extension

A Chrome extension that prevents RDP and web sessions from timing out by simulating user activity. Specifically designed for Apache Guacamole RDP sessions but works with any web-based remote desktop.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select this directory
4. The extension icon will appear in your toolbar

## Usage

1. Navigate to your RDP session (e.g., Guacamole)
2. Click the extension icon in your toolbar
3. Toggle "Enable Keep Alive" to start the service
4. Set interval (1-30 minutes) - recommended: 1-5 minutes for RDP
5. Monitor "Last activity" timestamp to verify it's working

## Features

- **Guacamole-optimized**: Targets canvas elements for better RDP compatibility
- **Non-disruptive**: Uses tiny mouse movements and safe key events
- **Chrome app support**: Works with Chrome apps via scripting API injection
- **Configurable interval**: 1-30 minutes (default: 5 minutes)
- **Activity monitoring**: Shows last activity timestamp
- **Persistent settings**: Remembers configuration between sessions

## Technical Details

The extension uses:
- Background service worker for timing and coordination
- Chrome scripting API to inject activity simulation directly into pages
- Targets Guacamole canvas elements specifically for RDP sessions
- Falls back to document-level events if canvas not found
- Mouse movement and click simulation for maximum compatibility

## Troubleshooting

- Check "Last activity" timestamp to verify events are being sent
- For debugging, inspect the service worker console at `chrome://extensions/`
- Works best with 1-5 minute intervals for RDP sessions
- Designed specifically for Apache Guacamole but may work with other web RDP clients