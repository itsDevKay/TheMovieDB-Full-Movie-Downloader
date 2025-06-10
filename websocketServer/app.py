# create web socket server
# create web socket server
import asyncio
import websockets
import json 
import yt_dlp
from flask import Flask, jsonify, send_from_directory

# function to generate random uuid
import uuid
import subprocess
from flask import Flask, send_from_directory
import os
from threading import Thread

# Dictionary to keep track of connected clients and their requests
clients = set()
tmdbid_to_client = {}

app = Flask(__name__, static_folder='static')

@app.route('/<path:filename>')
def serve_static(filename):
  static_dir = os.path.join(os.path.dirname(__file__), 'static')
  return send_from_directory(static_dir, filename)

@app.route('/')
def index():
  # static_dir = os.path.join(os.path.dirname(__file__), 'static')
  # return send_from_directory(static_dir, 'index.html')
  return jsonify(status="running", message="WebSocket server is running. Use WebSocket client to connect.")

def generate_uuid():
    return str(uuid.uuid4())

# download video function using yt-dlp
def download_video(websocket, url, output_path):
    ydl_opts = {
        'format': 'best',
        'outtmpl': f'static/{output_path}',
        'noplaylist': True,
        'quiet': True,
        'nocheckcertificate': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            websocket.send(json.dumps({
                "status": "success",
                "message": f"Video downloaded successfully to {output_path}"
            }))
            print(f"Video downloaded successfully to {output_path}")
        return True
    except Exception as e:
        print(f"Error downloading video: {e}")
        return False
  

async def echo(websocket):
  print("Client connected.")
  print(websocket.remote_address)
  await websocket.send(json.dumps({"status": "connected", "message": "Welcome to the WebSocket server!"}))

  # Echo loop
  async for message in websocket:
    print(f"Received message: {message}")
    try:
      data = json.loads(message)
      response = json.dumps({"status": "success", "data": data})

      if data.get("action") == "downloadVideo":
        m3u8_url = data.get("m3u8URL")
        tmdbID = data.get("tmdbID")

        if not m3u8_url:
          print("m3u8URL is required for downloadVideo action")
          response = json.dumps({"status": "error", "message": "m3u8URL is required for downloadVideo action"})
        else:
          request_address = websocket.remote_address[0] if websocket.remote_address else "unknown"
          print(f"Received request from {request_address} to download video from m3u8 URL: {m3u8_url}")

          output_file = generate_uuid() + ".mp4"
          loop = asyncio.get_running_loop()
          # Run download_video in a separate process to avoid blocking
          async def notify_when_done(future, websocket):
            result = await asyncio.wrap_future(future)
            if result:
              client = tmdbid_to_client.get(tmdbID)
              if client:
                await client.send(json.dumps({
                  "action": "videoDownloadComplete",
                  "status": "success",
                  "message": f"Video downloaded successfully to http://localhost:5000/{output_file}",
                  "link": f"http://localhost:5000/{output_file}",
                  "tmdbID": tmdbID,
                  "output": output_file
                }))
            else:
              await websocket.send(json.dumps({
                "status": "error",
                "message": "Video download failed."
              }))

          future = loop.run_in_executor(
            None, download_video, websocket, m3u8_url, output_file
          )
          asyncio.create_task(notify_when_done(future, websocket))
          
          response = json.dumps({
            "status": "started",
            "message": f"Download started for {m3u8_url}",
            "output": output_file
          })

      
      elif (data.get("action") == "extractM3U8"):
        clients.add(websocket)
        tmdbid_to_client[data.get("tmdbID")] = websocket

        videoTitle = data.get("videoTitle", generate_uuid())
        tmdbID = data.get("tmdbID")
        if not tmdbID:
          response = json.dumps({"status": "error", "message": "tmdbID is required for downloadVideo action"})
        else:
          request_address = websocket.remote_address[0] if websocket.remote_address else "unknown"
          print(f"Received request from {request_address} to extract M3U8 for TMDB ID: {tmdbID}")

          # Build the command to run video_downloader.py with arguments
          cmd = [
            "python3",
            "video_downloader.py",
            "--title", videoTitle,
            "--tmdbID", str(tmdbID)
          ]

          # Run the command in the same process
          process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
          print(f"Started video_downloader.py with PID {process.pid} for TMDB ID: {tmdbID}")

          # Simulate video download logic
          response = json.dumps({
            "status": "success",
            "message": f"Video '{videoTitle}' with TMDB ID {tmdbID} is being downloaded."
          })

    except json.JSONDecodeError:
      response = json.dumps({"status": "error", "message": "Invalid JSON"})
    
    await websocket.send(response)
    print(f"Sent response: {response}")



async def main():
  async with websockets.serve(echo, "localhost", 8765):
    print("WebSocket server started on ws://localhost:8765")
    await asyncio.Future()  # run forever

if __name__ == "__main__":
  def run_flask():
    app.run(host="0.0.0.0", port=5000)

  flask_thread = Thread(target=run_flask, daemon=True)
  flask_thread.start()
  print("Flask server started on http://localhost:5000")

  try:
    asyncio.run(main())
  except KeyboardInterrupt:
    print("WebSocket server stopped by user.")
  except Exception as e:
    print(f"An error occurred: {e}")
  finally:
    print("Exiting WebSocket server.")  # Cleanup or logging if needed