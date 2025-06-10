# WebSocket Video Downloader

## Overview

This project implements a WebSocket server that handles video download requests based on TMDB IDs. It automates browser actions to locate streaming sources, downloads videos, and serves them to clients via a Flask server.

## Features

- **WebSocket Server:** Listens for video download requests containing TMDB IDs.
- **Threaded Video Downloading:** Spawns a new thread for each request to run `video_downloader.py`.
- **Selenium Automation:** Uses Selenium to automate a browser, monitor network requests, and extract the master `.m3u8` streaming URL.
- **Process-based Downloading:** Launches a separate process to download the video using `yt-dlp` once the `.m3u8` link is found.
- **Static File Serving:** Stores downloaded videos in the `static/` directory.
- **Flask Integration:** Serves video files via a Flask server and communicates download URLs back to the requesting client.

## Workflow

1. **Client Request:** A client connects via WebSocket and requests a video download by TMDB ID.
2. **Selenium Automation:** The server starts a thread running `video_downloader.py`, which uses Selenium to find the master `.m3u8` file.
3. **Download Initiation:** Once the `.m3u8` link is found, the server starts a new process to download the video using `yt-dlp`.
4. **File Storage:** The downloaded video is saved in the `static/` folder.
5. **Serving the File:** The Flask server serves the video file and sends the download URL to the client.

## Directory Structure

```
/socketAPI
├── static/                # Downloaded video files
├── video_downloader.py    # Selenium automation script
├── server.py              # WebSocket and Flask server logic
├── README.md              # Project documentation
```

## Requirements

- Python 3.x
- Selenium
- Flask
- yt-dlp
- WebSocket libraries

## Usage

1. Start the server.
2. Connect a client via WebSocket and send a TMDB ID.
3. Receive the download URL once the video is processed.

## License

MIT License.