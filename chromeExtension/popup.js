window.onload = function() {
  const errorMessageContainer = document.getElementById('error-container');
  const errorMessageDisplay = document.getElementById('error-message');

  // get videoTitle and status from local storage
  chrome.storage.local.get({ videoDownloads: [] }, (result) => {
    const videoDownloads = result.videoDownloads || [];
    if (videoDownloads.length === 0) {
      // displayError('No video downloads found.');
      return;
    }

    videoDownloads.forEach(video => {
      addVideoRow(video.title, video.status === 'success' ? 'completed': video.status, video.link ?? '');
    });
  });

  function displayError(message) {
    errorMessageDisplay.textContent = message;
    errorMessageContainer.style.display = 'flex';
  }

  function addVideoRow(videoTitle, status, videoLink = '') {
    let rowHtml = '';
    setListeners = false;
    switch (status) {
      case 'processing':
        rowHtml = createProcessingVideoRow(videoTitle);
        break;
      case 'completed':
        rowHtml = createCompletedVideoRow(videoTitle, videoLink);
        setListeners = true;
        break;
      case 'failed':
        rowHtml = createFailedVideoRow(videoTitle);
        break;
      default:
        console.error('Unknown video status:', status);
        return;
    }
    const tableBody = document.querySelector('tbody');
    const videoRow = document.createElement('tr');
    videoRow.className = 'video-row bg-gray-700 rounded-md';
    videoRow.setAttribute('data-title', videoTitle);
    videoRow.setAttribute('data-status', status);
    videoRow.setAttribute('data-timestamp', Date.now());
    
    videoRow.innerHTML = rowHtml;
    tableBody.appendChild(videoRow);

    if (setListeners) {
      const downloadLink = videoRow.querySelector('.video-download');
      if (downloadLink) {
        downloadLink.addEventListener('click', function(e) {
          e.preventDefault();
          const link = downloadLink.getAttribute('href');
          const a = document.createElement('a');
          a.href = link;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      }

      const removeButtons = videoRow.querySelectorAll('.remove-video-btn');
      removeButtons.forEach(button => {
        button.addEventListener('click', function() {
          const row = this.closest('tr');
          const videoTitle = row.getAttribute('data-title');
          // Remove the row from the table
          row.remove();
          // Remove the video from local storage
          chrome.storage.local.get({ videoDownloads: [] }, (result) => {
            const videoDownloads = result.videoDownloads || [];
            const updatedDownloads = videoDownloads.filter(video => video.title !== videoTitle);
            chrome.storage.local.set({ videoDownloads: updatedDownloads }, () => {
              console.log(`Removed video download for: ${videoTitle}`);
            });
          });
        });
      });
    }
  }

  function createProcessingVideoRow(videoTitle) {
      return `
        <td class="py-2 px-4">
          <button
            class="remove-video-btn"
            title="Remove"
            style="background:none;border:none;cursor:pointer;padding:0;margin-right:8px;vertical-align:middle;"
            
            aria-label="Remove video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ff0000" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="9" stroke="#ff0000" stroke-width="2" fill="none"/>
              <line x1="6.5" y1="6.5" x2="13.5" y2="13.5" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
              <line x1="13.5" y1="6.5" x2="6.5" y2="13.5" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </td>
        <td class="py-2 px-4 truncate">${videoTitle}</td>
        <td class="py-2 px-4 text-yellow-400">processing</td>
        <td class="py-2 px-4">
          <span class="spinner" style="display:inline-block; vertical-align:middle; width:18px; height:18px;">
            <svg style="animation:spin 1s linear infinite;" width="18" height="18" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#f6e05e" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 94.2"/>
            </svg>
            <style>
              @keyframes spin {
                100% { transform: rotate(360deg);}
              }
            </style>
          </span>
        </td>
      `;
  }

  function createCompletedVideoRow(videoTitle, videoLink) {
    return `
      <td class="py-2 px-4">
        <button
          class="remove-video-btn"
          title="Remove"
          style="background:none;border:none;cursor:pointer;padding:0;margin-right:8px;vertical-align:middle;"
          
          aria-label="Remove video"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ff0000" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" stroke="#ff0000" stroke-width="2" fill="none"/>
            <line x1="6.5" y1="6.5" x2="13.5" y2="13.5" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
            <line x1="13.5" y1="6.5" x2="6.5" y2="13.5" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </td>
      <td class="py-2 px-4 truncate">${videoTitle}</td>
      <td class="py-2 px-4 text-green-400" style="color:greenyellow">READY</td>
      <td class="py-2 px-4">
        <a href="${videoLink}" class="video-download text-blue-400 hover:underline">Download</a>
      </td>
      
    `;
  }
  function createFailedVideoRow(videoTitle) {
    return `
      <td class="py-2 px-4">
        <button
          class="remove-video-btn"
          title="Remove"
          style="background:none;border:none;cursor:pointer;padding:0;margin-right:8px;vertical-align:middle;"
          
          aria-label="Remove video"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ff0000" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" stroke="#ff0000" stroke-width="2" fill="none"/>
            <line x1="6.5" y1="6.5" x2="13.5" y2="13.5" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
            <line x1="13.5" y1="6.5" x2="6.5" y2="13.5" stroke="#ff0000" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </td>
      <td class="py-2 px-4 truncate">${videoTitle}</td>
      <td class="py-2 px-4 text-red-500" style="color:#ed8993">failed</td>
      <td class="py-2 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-label="Download failed" style="vertical-align:middle;">
          <circle cx="10" cy="10" r="9" stroke="#ed8993" stroke-width="2" fill="none"/>
          <line x1="6.5" y1="6.5" x2="13.5" y2="13.5" stroke="#ed8993" stroke-width="2" stroke-linecap="round"/>
          <line x1="13.5" y1="6.5" x2="6.5" y2="13.5" stroke="#ed8993" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </td>
    `;
  }
}