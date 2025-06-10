chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.clear(() => {
    console.log('Chrome local storage cleared on extension startup.');
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear(() => {
    console.log('Chrome local storage cleared on extension install.');
  });
});

// Notify the popup that the extension is ready
chrome.runtime.onInstalled.addListener(() => {
  // chrome.runtime.sendMessage({
  //   action: 'extensionReady',
  //   message: 'M3U8 Downloader extension is ready.'
  // });

  // create socket connection to the server
  const socket = new WebSocket('ws://localhost:8765');
  // handle socket events
  socket.onopen = () => {
    console.log('WebSocket connection established');

    // listen for messages from the content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.from === 'popup') {
        console.log('Background script received message from popup:', request);
      }
      if (request.action === 'extractM3U8') {
        console.log('Background script received downloadVideo action:', request);
        /*
          videoTitle
          tmdbID
        */
        const { videoTitle, tmdbID } = request;
        // Here you can implement the logic to handle the video download

        // send data to server via WebSocket
        socket.send(JSON.stringify({
          action: 'extractM3U8',
          videoTitle: videoTitle,
          tmdbID: tmdbID
        }));
        
        console.log('Sent video download request to server:', videoTitle, tmdbID);
        sendResponse({ 
          success: true, 
          message: 'Video download request sent to server.',
          action: 'addVideoRow',
          videoTitle,
          status: 'processing'
        });
      }

      if (request.action === 'addVideoRow') {
        chrome.runtime.sendMessage({
          action: request.action,
          videoTitle: request.videoTitle,
          status: request.status
        })
        .then(() => {
          console.log(`Video row added for: ${request.videoTitle} with status: ${request.status}`);
        })
      }
    });

    socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
      if (event.data) {
        try {
          const message = JSON.parse(event.data);
          // handle the message from the server
          if (message.action === 'videoDownloadComplete') {
            console.log('Video download status:', message);
            // store the video download status in local storage
            chrome.storage.local.get({ videoDownloads: [] }, (result) => {
              const videoDownloads = result.videoDownloads;
              // find the video download by tmdbID
              const videoIndex = videoDownloads.findIndex(video => video.tmdbID === message.tmdbID);
              if (videoIndex !== -1) {
                // update the status of the video download
                videoDownloads[videoIndex].status = message.status;
                videoDownloads[videoIndex].link = message.link || '';
                videoDownloads[videoIndex].timestamp = Date.now();
                console.log(`Updating video download status for TMDB ID: ${message.tmdbID} to ${message.status}`);
                chrome.storage.local.set({ videoDownloads: videoDownloads }, () => {
                  console.log('Video download status updated in local storage');

                  // send message to content script
                  chrome.runtime.sendMessage({
                    action: 'updateVideoRow',
                    videoTitle: videoDownloads[videoIndex].title,
                    status: message.status,
                    link: message.link || ''
                  });
                  console.log(`Video row updated for: ${videoDownloads[videoIndex].title} with status: ${message.status}`);
                });
              } else {
                console.warn(`Video download with TMDB ID ${message.tmdbID} not found.`);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing message from server:', error);
        }
      }
      // handle messages from the server if needed
    };
  }
  // handle socket errors and close events
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    chrome.runtime.sendMessage({
      action: 'webSocketError',
      message: 'WebSocket connection error: ' + error.message
    });
  };
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    chrome.runtime.sendMessage({
      action: 'webSocketClosed',
      message: 'WebSocket connection has been closed.'
    });
  };

});

