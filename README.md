# Melodicaine

Melodicaine is a private, installable HTML5 music library. The repository contains no music. Every user imports their own audio, WebVTT lyrics, and optional artwork; imported media remains in that browser's IndexedDB storage and is not uploaded to GitHub or another server.

## Features

- Albums, artists, tracks, search, queue, shuffle, and repeat
- Embedded MP3 ID3 artwork plus cover-image fallback
- Synchronized `.vtt` lyrics with a full-screen Now Playing view
- Multi-select library management and deletion confirmation
- Responsive phone interface with a slide-out library/manage drawer
- Progressive Web App installation and offline app shell
- Media Session support for lock-screen, headset, and Bluetooth controls where the browser supports it
- Browser storage estimate and persistent-storage request

## Recommended album layout

```text
Artist/
  Album/
    01 Song.mp3
    01 Song.vtt
    02 Song.mp3
    02 Song.vtt
    cover.jpg
```

Matching MP3 and VTT base filenames are linked automatically. Embedded MP3 artwork is preferred.

## Publish Melodicaine with GitHub Pages

1. Create a new public GitHub repository.
2. Upload the contents of this folder so `index.html` is at the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Open the GitHub Pages address after deployment finishes.

PWA installation and service workers require HTTPS or localhost. Opening `index.html` through `file://` still runs the core player, but installation and offline caching are disabled.

## Mobile notes

Mobile browsers cannot scan a phone automatically. The user must choose files or a folder through the system file picker. Imported libraries are tied to the exact browser and site address. Clearing site data removes the local library.

On iPhone/iPad, open the GitHub Pages site in Safari and use **Share → Add to Home Screen**. On Android and supported desktop browsers, use the in-app **Install** button or the browser's install command.

## Privacy

No analytics, accounts, uploads, external APIs, or network music services are included. The service worker caches only the application shell—not the user's imported music library.

## Local testing

Run a local static server from this directory, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Interface customization

Use the settings cog beside the Ready indicator to adjust the accent hue, saturation, brightness, and persistent interface zoom. Scrollbars use the selected accent color on a black track.

## Playlists and queue
Melodicaine includes persistent named playlists, a permanent LovedPlaylist, playlist-aware shuffle/repeat playback, a reorderable queue with touch-friendly move controls, and an in-app track picker. Installation is available from Interface Settings; iPhone and iPad users receive Safari Add to Home Screen instructions when a native install prompt is unavailable.
