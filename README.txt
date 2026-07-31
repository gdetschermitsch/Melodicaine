MELODICAINE — HTML5 MUSIC LIBRARY

HOW TO RUN
1. Open index.html in Chrome, Edge, or another Chromium-based browser.
2. Click “Import album folder(s)” and select a folder containing one or more album folders.
3. Your library is indexed in the browser with IndexedDB and remains searchable after reopening the page.

RECOMMENDED FOLDER LAYOUT
Music/
  Artist Name/
    Album Name/
      01 Song Title.mp3
      01 Song Title.vtt
      02 Another Song.mp3
      02 Another Song.vtt
      cover.jpg

LYRIC MATCHING
- A VTT file is linked when it is in the same folder and has the same base filename as the MP3.
- Example: “01 Song.mp3” + “01 Song.vtt”.
- The app also attempts to match a VTT filename to the title stored in the MP3’s ID3 tag.


FEATURES
- Import one album folder, many album folders, or individual files.
- IndexedDB persistence for MP3, VTT, and cover-image File objects.
- Album, artist, title, and folder search.
- ID3v2 title, artist, album, track-number, and embedded APIC album-art reading.
- Album artwork automatically uses embedded MP3 cover art, with cover.jpg/folder.jpg/front.jpg as fallback.
- Collapsible Manage dock with artist, album, and song multi-selection deletion.
- Import controls and Clear Library are located inside the Manage dock.
- Queue button is available beside Lyrics in the player bar.
- Playback queue, next/previous, shuffle, repeat-all, repeat-one, seek, and volume.
- Synchronized and clickable WebVTT lyric lines.
- Responsive desktop and mobile layout.

IMPORTANT BROWSER NOTES
- Large libraries consume browser-site storage. Storage quota varies by browser and free disk space.
- Imported music is local to the browser profile and page origin. Clearing site data removes the library index.
- Opening index.html directly uses a file:// origin. This generally works in Chromium, but running through a local server is more reliable.

OPTIONAL LOCAL SERVER
From this folder, run one of these commands if available:
  python -m http.server 8080
Then open:
  http://localhost:8080

PRIVACY
The app has no network requests. Files remain on the local device.

NOW PLAYING / LYRICS VIEW
-------------------------
Click the small album cover in the player bar or the Lyrics button to open the immersive now-playing screen. It displays large album artwork beside Spotify-style scrolling synchronized lyrics. Click a lyric line to seek to that time.

## Interface customization

Use the settings cog beside the Ready indicator to adjust the accent hue, saturation, brightness, and persistent interface zoom. Scrollbars use the selected accent color on a black track.
