# TMDB Video Downloader Chrome Extension

## Overview

TMDB Video Downloader is a Chrome extension that enhances the TMDB website by embedding a download button for videos. It communicates with a WebSocket server to manage video download requests and updates.

## Features

- **Download Button Integration:** Adds a download button directly on the TMDB website.
- **WebSocket Communication:** Sends download requests to a WebSocket server when the button is clicked.
- **Popup UI Status:** The extension popup displays real-time processing status for your download.
- **Seamless Download:** Once the server completes processing, the video becomes available for download via the extension popup.

## How It Works

1. **Visit TMDB:** Browse to a video page on the TMDB website.
2. **Click Download:** Use the embedded download button to initiate a request.
3. **Processing:** The extension communicates with the WebSocket server and shows the status in the popup.
4. **Download Ready:** When processing is complete, download the video from the popup.

## Requirements

- Google Chrome browser
- Access to the WebSocket server

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the extension directory.

## License

MIT License  