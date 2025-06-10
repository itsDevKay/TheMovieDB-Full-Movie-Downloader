// setup when page loads
document.addEventListener('DOMContentLoaded', () => {
  // check if the current page is a TMDB movie page
  if (window.location.href.includes('themoviedb.org/movie/')) {
    const dlContainer = document.createElement('div');
    dlContainer.innerHTML = `
      <button id="download-video" class="group flex items-center justify-center space-2 rating_false reactions_false bg-tmdb-dark-blue rounded-full cursor-pointer hover:scale-105 transition ease-in-out duration-150" data-role="tooltip" style="
          margin-left: 10px;
          margin-bottom: 5px;
      ">
        <div class="flex items-center justify-center">
          <div id="vibes_content" class="flex items-center text-white font-bold cursor-pointer transform" style="
      ">
              <div class="flex flex-nowrap items-center whitespace-nowrap" style="
          text-align: center;
          padding: 10px 20px;
          font-size: 16px;
      ">Download Video</div>
          </div>
        </div>
      </button>
    `;

    var titleHeader = document.querySelector('.header.poster').querySelector('h2');
    titleHeader.style.display = 'flex';
    titleHeader.appendChild(dlContainer);
    const downloadButton = document.getElementById('download-video');
    downloadButton.addEventListener('click', (() => {
      // get url from the tab page
      let tmdbID = window.location.href.split('movie/')[1].split('-')[0];

      console.log(`TMDB ID: ${tmdbID}`);

      // send a message to the background script to start the download
      chrome.runtime.sendMessage({
        action: 'extractM3U8',
        videoTitle: `${titleHeader.children[0].text} ${titleHeader.children[1].textContent}`,
        tmdbID: tmdbID
      });

      // save the video title and status to local storage
      chrome.storage.local.get({ videoDownloads: [] }, (result) => {
        const videoDownloads = result.videoDownloads;
        // verify if the video download already exists
        const existingDownload = videoDownloads.find(video => video.tmdbID === tmdbID);
        if (existingDownload) {
          console.warn(`Video download for TMDB ID ${video.tmdbID} already exists.`);
          return;
        }
        // add the new video download request
        console.log(`Saving video download request for TMDB ID: ${tmdbID}`);
        videoDownloads.push({
          title: `${titleHeader.children[0].text} ${titleHeader.children[1].textContent}`,
          status: 'processing',
          tmdbID: tmdbID,
          timestamp: Date.now()
        });
        chrome.storage.local.set({ videoDownloads: videoDownloads }, () => {
          console.log('Video download request saved to local storage');
        });
      });
    }))
  }
});

// listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateVideoRow' && request.status === 'complete') {
    alert(`Download complete: ${request.title || 'Video'}`);
  }
});