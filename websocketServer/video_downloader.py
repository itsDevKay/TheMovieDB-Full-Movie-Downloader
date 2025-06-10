from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

import time
import json
import websocket
import sys

def create_websocket_connection():
  try:
    ws = websocket.create_connection("ws://localhost:8765")
    print("WebSocket connection established.")
    return ws
  except Exception as e:
    print(f"Failed to connect to WebSocket: {e}")
    return None

def create_chrome_driver():
  options = Options()
  options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
  options.add_argument('--disable-blink-features=AutomationControlled')
  options.add_argument('--start-maximized')
  options.add_argument('--disable-extensions')
  options.add_argument('--no-sandbox')

  # set headless mode if needed
  options.add_argument('--headless')  # Uncomment this line to run in headless mode

  driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
  return driver

def open_vidsrc_get_server_url(driver, tmdbID):
  url = f"https://vidsrc.net/embed/movie?tmdb={tmdbID}"
  try:
    driver.get(url)
    time.sleep(3)  # Wait for page to load

    # Find the first iframe and click it
    iframe = driver.find_element(By.TAG_NAME, "iframe")
    driver.switch_to.frame(iframe)
    time.sleep(2)  # Wait for iframe to load

    # evaluate script to click #pl_but
    driver.execute_script("document.querySelector('#pl_but').click();")
    print("Switched to iframe.")

    time.sleep(5)  # Wait for the video to load

    logs = driver.get_log("performance")
    for entry in logs:
      log = json.loads(entry["message"])["message"]

      if log.get("method") == "Network.requestWillBeSent":
        url = log.get("params", {}).get("request", {}).get("url", "")
        if "https://cloudnestra.com/rcp/" in url:
          # print(f"Found video server URL: {url}")
          return url
  except Exception as e:
    print(f"An error occurred: {e}")
    return None

def extract_m3u8_from_server(driver, url):
  try:
    driver.get(url)
    time.sleep(3)

    driver.execute_script("document.querySelector('#pl_but').click();")

    time.sleep(5)  # Wait for the video to load

    m3u8_url = None

    logs = driver.get_log("performance")
    for entry in logs:
      log = json.loads(entry["message"])["message"]

      if log.get("method") == "Network.requestWillBeSent":
        url = log.get("params", {}).get("request", {}).get("url", "")
        
        # if ".m3u8" in url:
        if "master.m3u8" in url:
          print(f"Found m3u8 URL: {url}")
          m3u8_url = url
          break
    return m3u8_url
  except Exception as e:
    print(f"An error occurred while extracting m3u8: {e}")
    return None

# Example usage:
if __name__ == "__main__":
  video_title = None
  tmdbID = None

  for i, arg in enumerate(sys.argv):
    if arg == "--title" and i + 1 < len(sys.argv):
      video_title = sys.argv[i + 1]
    if arg == "--tmdbID" and i + 1 < len(sys.argv):
      tmdbID = sys.argv[i + 1]

  if not tmdbID or not video_title:
    print("Usage: python video_downloader.py --title <video_title> --tmdbID <tmdbID>")
    sys.exit(1)
  print(f"Video Title: {video_title}, TMDB ID: {tmdbID}")

  driver = create_chrome_driver()
  if driver:
    server_url = open_vidsrc_get_server_url(driver, tmdbID)
    if server_url:
      print(f"Server URL: {server_url}")
      m3u8_url = extract_m3u8_from_server(driver, server_url)
      if m3u8_url:
        ws = create_websocket_connection()
        driver.close()  # Close the driver after extracting the m3u8 URL
        if ws:
          ws.send(json.dumps({"action": "downloadVideo", "videoTitle": video_title, "tmdbID": tmdbID, "m3u8URL": m3u8_url}))
          response = ws.recv()
          print(f"WebSocket response: {response}")
          ws.close()
        else:
          print("WebSocket connection could not be established.")
        print(f"Extracted m3u8 URL: {m3u8_url}")
      else:
        print("Failed to extract m3u8 URL.")
    else:
      print("Failed to get server URL.")
    driver.quit()
else:
  print("Failed to create Chrome driver.")
# Note: This script requires the `selenium` and `webdriver_manager` packages.
# You can install them using pip:
# pip install selenium webdriver-manager
# Make sure you have Chrome installed and the correct version of ChromeDriver.
# This script is designed to work with the VidSrc website to extract video URLs.
# Ensure you have the necessary permissions to scrape and download content from the website.
# This script is for educational purposes only. Use responsibly and in compliance with the website's terms of service.