# TMDB Video Downloader – Project Overview

## 1. Chrome Extension

- **Purpose:**  
  Allows users to download videos from TMDB directly via their browser.

- **Key Features:**  
  - Injects UI elements into TMDB pages.
  - Detects available video streams.
  - Sends download requests to the backend server.
  - Receives download status and progress updates.

- **Technologies:**  
  - JavaScript (ES6+)
  - Chrome Extension APIs (background, content scripts, messaging)
  - HTML/CSS for popup and injected UI

## 2. WebSocket Server

- **Purpose:**  
  Handles real-time communication between the Chrome extension and the backend download processor.

- **Key Processes:**  
  - Receives download requests from the extension.
  - Initiates and manages video downloads.
  - Streams progress and status updates back to the extension.
  - Handles multiple concurrent download sessions.

- **Technologies:**  
  - Python & Web Technologies (HTML, CSS, JS)
  - WebSocket library (e.g., `ws` for Node.js)
  - Video processing/downloading libraries (e.g., `ffmpeg`, `youtube-dl`)

## 3. Process Flow

1. **User Interaction:**  
   User clicks the download button on TMDB via the Chrome extension.

2. **Request Handling:**  
   Extension sends a WebSocket message to the server with video details.

3. **Download Initiation:**  
   Server processes the request, starts downloading the video.

4. **Progress Updates:**  
   Server streams real-time progress/status updates to the extension.

5. **Completion:**  
   Once download is complete, server notifies the extension and provides a download link.

6. **User Download:**  
   Extension presents the link to the user for final download.

## 4. Security & Permissions

- Chrome extension requests necessary permissions (e.g., access to TMDB, downloads).
- WebSocket server validates incoming requests to prevent abuse.

## 5. Summary

This project integrates a Chrome extension frontend with a WebSocket-powered backend to provide seamless, real-time video downloading from TMDB, ensuring a responsive and user-friendly experience.