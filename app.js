(() => {
  'use strict';

  const APP_NAME = 'MelodicaineStudio';
  // Retained to preserve existing imported libraries across the project rename.
  const DB_NAME = 'LocalAlbumLibraryDB';
  const DB_VERSION = 1;
  const TRACK_STORE = 'tracks';
  const SETTINGS_STORE = 'settings';

  const state = {
    db: null,
    tracks: [],
    albums: [],
    queue: [],
    queueIndex: -1,
    currentTrack: null,
    currentObjectUrl: null,
    currentCoverUrl: null,
    lyricCues: [],
    activeCueIndex: -1,
    selectedAlbumId: null,
    activeView: 'artists',
    shuffle: false,
    repeat: 'off',
    search: '',
    manageType: 'artist',
    manageSelected: new Set(),
    confirmResolver: null,
    confirmReturnFocus: null,
    drawerReturnFocus: null,
    deferredInstallPrompt: null,
    settingsReturnFocus: null,
    donationReturnFocus: null,
    quickGuideReturnFocus: null,
    playlists: [],
    selectedPlaylistId: null,
    playbackContext: { type: 'queue', id: null },
    playbackHistory: []
  };

  const $ = (id) => document.getElementById(id);
  const focusElement = (element) => {
    if (!element?.isConnected) return;
    try { element.focus({ preventScroll: true }); }
    catch { element.focus(); }
  };
  const audio = $('audioPlayer');

  function requestedVolume() {
    return Math.max(0, Math.min(1, Number(els?.volumeBar?.value ?? 0.85)));
  }

  // Keep playback on the native HTMLMediaElement path. Routing the player through
  // Web Audio causes several mobile browsers to suspend playback when Melodicaine
  // is minimized or the screen locks, which also removes the notification controls.
  function applyVolume() {
    audio.volume = requestedVolume();
    syncVolumeGraphic();
  }
  const els = {
    folderPicker: $('folderPicker'), folderPickerLabel: $('folderPickerLabel'), filePicker: $('filePicker'), quickGuideButton: $('quickGuideButton'), manageMobileHelp: $('manageMobileHelp'), searchInput: $('searchInput'), statusText: $('statusText'),
    artistGrid: $('artistGrid'), artistEmpty: $('artistEmpty'), albumGrid: $('albumGrid'), albumEmpty: $('albumEmpty'), trackTableBody: $('trackTableBody'), trackEmpty: $('trackEmpty'),
    queueList: $('queueList'), queueEmpty: $('queueEmpty'), artistCount: $('artistCount'), albumCount: $('albumCount'), trackCount: $('trackCount'), playlistCount: $('playlistCount'), queueCount: $('queueCount'),
    playlistGrid: $('playlistGrid'), playlistEmpty: $('playlistEmpty'), createPlaylistForm: $('createPlaylistForm'), playlistNameInput: $('playlistNameInput'), playlistDetail: $('playlistDetail'), closePlaylistButton: $('closePlaylistButton'), playlistDetailTitle: $('playlistDetailTitle'), playlistDetailStats: $('playlistDetailStats'), playlistTrackList: $('playlistTrackList'), playlistDetailEmpty: $('playlistDetailEmpty'), playPlaylistButton: $('playPlaylistButton'), queuePlaylistButton: $('queuePlaylistButton'), renamePlaylistButton: $('renamePlaylistButton'), deletePlaylistButton: $('deletePlaylistButton'),
    storageText: $('storageText'), clearLibraryButton: $('clearLibraryButton'), clearQueueButton: $('clearQueueButton'), playAllButton: $('playAllButton'),
    albumDetail: $('albumDetail'), closeAlbumButton: $('closeAlbumButton'), detailCover: $('detailCover'),
    detailTitle: $('detailTitle'), detailArtist: $('detailArtist'), detailStats: $('detailStats'), albumTrackList: $('albumTrackList'),
    playAlbumButton: $('playAlbumButton'), queueAlbumButton: $('queueAlbumButton'), deleteAlbumButton: $('deleteAlbumButton'),
    nowTitle: $('nowTitle'), nowArtist: $('nowArtist'), playerCover: $('playerCover'), playPauseButton: $('playPauseButton'), previousButton: $('previousButton'),
    nextButton: $('nextButton'), addCurrentToQueueButton: $('addCurrentToQueueButton'), loveCurrentButton: $('loveCurrentButton'), shuffleButton: $('shuffleButton'), repeatButton: $('repeatButton'), seekBar: $('seekBar'), currentTime: $('currentTime'),
    durationTime: $('durationTime'), volumeBar: $('volumeBar'), volumeGraphic: $('volumeGraphic'), showLyricsButton: $('showLyricsButton'), toggleLyricsButton: $('toggleLyricsButton'),
    lyricsPanel: $('lyricsPanel'), lyricsTrackTitle: $('lyricsTrackTitle'), lyricsTrackArtist: $('lyricsTrackArtist'), lyricsCover: $('lyricsCover'), lyricsContent: $('lyricsContent'), toast: $('toast'),
    manageDock: $('manageDock'), manageDockToggle: $('manageDockToggle'), manageItemList: $('manageItemList'),
    manageSelectionCount: $('manageSelectionCount'), selectAllManageButton: $('selectAllManageButton'), deleteSelectedButton: $('deleteSelectedButton'),
    donationButton: $('donationButton'), donationDialog: $('donationDialog'), closeDonationButton: $('closeDonationButton'), donationOkayButton: $('donationOkayButton'), donationDisclaimerStep: $('donationDisclaimerStep'), donationLinksStep: $('donationLinksStep'), cruxtainWebsiteButton: $('cruxtainWebsiteButton'),
    settingsButton: $('settingsButton'), settingsDialog: $('settingsDialog'), closeSettingsButton: $('closeSettingsButton'), doneSettingsButton: $('doneSettingsButton'), resetSettingsButton: $('resetSettingsButton'),
    quickGuideDialog: $('quickGuideDialog'), closeQuickGuideButton: $('closeQuickGuideButton'), doneQuickGuideButton: $('doneQuickGuideButton'),
    accentHueSlider: $('accentHueSlider'), accentBrightnessSlider: $('accentBrightnessSlider'), accentSaturationSlider: $('accentSaturationSlider'), accentHueValue: $('accentHueValue'), accentBrightnessValue: $('accentBrightnessValue'), accentSaturationValue: $('accentSaturationValue'),
    graphicsHueSlider: $('graphicsHueSlider'), graphicsBrightnessSlider: $('graphicsBrightnessSlider'), graphicsSaturationSlider: $('graphicsSaturationSlider'), graphicsHueValue: $('graphicsHueValue'), graphicsBrightnessValue: $('graphicsBrightnessValue'), graphicsSaturationValue: $('graphicsSaturationValue'),
    textHueSlider: $('textHueSlider'), textBrightnessSlider: $('textBrightnessSlider'), textSaturationSlider: $('textSaturationSlider'), textHueValue: $('textHueValue'), textBrightnessValue: $('textBrightnessValue'), textSaturationValue: $('textSaturationValue'), interfaceScaleSlider: $('interfaceScaleSlider'), interfaceScaleValue: $('interfaceScaleValue'), graphicsScaleSlider: $('graphicsScaleSlider'), graphicsScaleValue: $('graphicsScaleValue'), textScaleSlider: $('textScaleSlider'), textScaleValue: $('textScaleValue'), zoomSlider: $('zoomSlider'), zoomValue: $('zoomValue'),
    addMenuDialog: $('addMenuDialog'), closeAddMenuButton: $('closeAddMenuButton'), addMenuTrackName: $('addMenuTrackName'), addMenuQueueButton: $('addMenuQueueButton'), addMenuNewPlaylistButton: $('addMenuNewPlaylistButton'), addMenuPlaylistButton: $('addMenuPlaylistButton'), addMenuPlaylistList: $('addMenuPlaylistList'), addMenuLovedButton: $('addMenuLovedButton'),
    showQueueButton: $('showQueueButton'), mobileMenuButton: $('mobileMenuButton'), drawerScrim: $('drawerScrim'), librarySidebar: $('librarySidebar'), closeDrawerButton: $('closeDrawerButton'), mobileManageButton: $('mobileManageButton'), installButton: $('installButton'), installHelpText: $('installHelpText'), installStateBadge: $('installStateBadge'), iosInstallSteps: $('iosInstallSteps'), persistenceText: $('persistenceText'), requestPersistenceButton: $('requestPersistenceButton'), confirmDialog: $('confirmDialog'), confirmMessage: $('confirmMessage'), confirmYesButton: $('confirmYesButton'), confirmNoButton: $('confirmNoButton')
  };

  const mobileLayout = window.matchMedia('(max-width: 960px)');

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(TRACK_STORE)) {
          const store = db.createObjectStore(TRACK_STORE, { keyPath: 'id' });
          store.createIndex('albumId', 'albumId', { unique: false });
          store.createIndex('searchText', 'searchText', { unique: false });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAllTracks() {
    const tx = state.db.transaction(TRACK_STORE, 'readonly');
    return requestToPromise(tx.objectStore(TRACK_STORE).getAll());
  }

  async function putTracks(records) {
    const tx = state.db.transaction(TRACK_STORE, 'readwrite');
    const store = tx.objectStore(TRACK_STORE);
    records.forEach((record) => store.put(record));
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function deleteTracks(ids) {
    const tx = state.db.transaction(TRACK_STORE, 'readwrite');
    ids.forEach((id) => tx.objectStore(TRACK_STORE).delete(id));
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function clearDatabase() {
    const tx = state.db.transaction(TRACK_STORE, 'readwrite');
    tx.objectStore(TRACK_STORE).clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getSetting(key, fallback) {
    const tx = state.db.transaction(SETTINGS_STORE, 'readonly');
    const result = await requestToPromise(tx.objectStore(SETTINGS_STORE).get(key));
    return result ? result.value : fallback;
  }

  function setSetting(key, value) {
    const tx = state.db.transaction(SETTINGS_STORE, 'readwrite');
    tx.objectStore(SETTINGS_STORE).put({ key, value });
  }

  const DEFAULT_INTERFACE_SETTINGS = Object.freeze({
    accent: Object.freeze({ hue: 151, brightness: 70, saturation: 64 }),
    graphics: Object.freeze({ hue: 151, brightness: 70, saturation: 64 }),
    text: Object.freeze({ hue: 220, brightness: 97, saturation: 43 }),
    scale: 100,
    graphicsScale: 100,
    textScale: 100,
    zoom: 100
  });

  const FIXED_TEXT_PIXEL_SIZES = Object.freeze([9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 21, 22, 24, 25, 26, 27, 28, 30, 31, 34, 36, 42, 46, 48, 50, 52, 80]);
  const REM_TEXT_SIZES = Object.freeze({
    'rem-065': 0.65,
    'rem-086': 0.86,
    'rem-100': 1,
    'rem-105': 1.05
  });

  function clampSetting(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function normalizeColorSettings(settings, defaults, brightnessMax = 90) {
    return {
      hue: clampSetting(settings?.hue, 0, 360, defaults.hue),
      brightness: clampSetting(settings?.brightness, 25, brightnessMax, defaults.brightness),
      saturation: clampSetting(settings?.saturation, 0, 100, defaults.saturation)
    };
  }

  function setColorControls(prefix, values) {
    const hueSlider = els[`${prefix}HueSlider`];
    const brightnessSlider = els[`${prefix}BrightnessSlider`];
    const saturationSlider = els[`${prefix}SaturationSlider`];
    const hueValue = els[`${prefix}HueValue`];
    const brightnessValue = els[`${prefix}BrightnessValue`];
    const saturationValue = els[`${prefix}SaturationValue`];
    hueSlider.value = values.hue;
    brightnessSlider.value = values.brightness;
    saturationSlider.value = values.saturation;
    hueValue.value = hueValue.textContent = `${values.hue}°`;
    brightnessValue.value = brightnessValue.textContent = `${values.brightness}%`;
    saturationValue.value = saturationValue.textContent = `${values.saturation}%`;
  }

  function applyInterfaceSettings(settings, persist = false) {
    // Migrate the original flat appearance object without invalidating existing users' saved settings.
    const legacyAccent = settings?.accent || (settings && 'hue' in settings ? settings : null);
    const values = {
      accent: normalizeColorSettings(legacyAccent, DEFAULT_INTERFACE_SETTINGS.accent),
      graphics: normalizeColorSettings(settings?.graphics || legacyAccent, DEFAULT_INTERFACE_SETTINGS.graphics),
      text: normalizeColorSettings(settings?.text, DEFAULT_INTERFACE_SETTINGS.text, 100),
      scale: clampSetting(settings?.scale, 85, 115, DEFAULT_INTERFACE_SETTINGS.scale),
      graphicsScale: clampSetting(settings?.graphicsScale, 75, 125, DEFAULT_INTERFACE_SETTINGS.graphicsScale),
      textScale: clampSetting(settings?.textScale, 75, 125, DEFAULT_INTERFACE_SETTINGS.textScale),
      zoom: clampSetting(settings?.zoom, 75, 125, DEFAULT_INTERFACE_SETTINGS.zoom)
    };

    const root = document.documentElement;
    root.style.setProperty('--accent-hue', String(values.accent.hue));
    root.style.setProperty('--accent-saturation', `${values.accent.saturation}%`);
    root.style.setProperty('--accent-lightness', `${values.accent.brightness}%`);
    root.style.setProperty('--graphics-hue-shift', `${values.graphics.hue - DEFAULT_INTERFACE_SETTINGS.graphics.hue}deg`);
    root.style.setProperty('--graphics-saturation-scale', String(Math.max(0.15, values.graphics.saturation / DEFAULT_INTERFACE_SETTINGS.graphics.saturation)));
    root.style.setProperty('--graphics-brightness-scale', String(Math.max(0.35, values.graphics.brightness / DEFAULT_INTERFACE_SETTINGS.graphics.brightness)));
    root.style.setProperty('--text-hue', String(values.text.hue));
    root.style.setProperty('--text-saturation', `${values.text.saturation}%`);
    root.style.setProperty('--text-lightness', `${values.text.brightness}%`);
    root.style.setProperty('--graphics-size-scale', String(values.graphicsScale / 100));
    root.style.setProperty('--interface-zoom', String(values.zoom / 100));
    root.style.fontSize = `${values.scale}%`;

    const textFactor = values.textScale / 100;
    FIXED_TEXT_PIXEL_SIZES.forEach((size) => {
      root.style.setProperty(`--font-size-${size}`, `${Math.round(size * textFactor * 100) / 100}px`);
    });
    Object.entries(REM_TEXT_SIZES).forEach(([name, remSize]) => {
      const pixels = 16 * remSize * (values.scale / 100) * textFactor;
      root.style.setProperty(`--font-size-${name}`, `${Math.round(pixels * 100) / 100}px`);
    });

    setColorControls('accent', values.accent);
    setColorControls('graphics', values.graphics);
    setColorControls('text', values.text);
    els.interfaceScaleSlider.value = values.scale;
    els.interfaceScaleValue.value = els.interfaceScaleValue.textContent = `${values.scale}%`;
    els.graphicsScaleSlider.value = values.graphicsScale;
    els.graphicsScaleValue.value = els.graphicsScaleValue.textContent = `${values.graphicsScale}%`;
    els.textScaleSlider.value = values.textScale;
    els.textScaleValue.value = els.textScaleValue.textContent = `${values.textScale}%`;
    els.zoomSlider.value = values.zoom;
    els.zoomValue.value = els.zoomValue.textContent = `${values.zoom}%`;

    const accent = `hsl(${values.accent.hue} ${values.accent.saturation}% ${values.accent.brightness}%)`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', accent);

    if (persist && state.db) setSetting('interfaceAppearance', values);
    return values;
  }

  function readColorControls(prefix) {
    return {
      hue: els[`${prefix}HueSlider`].value,
      brightness: els[`${prefix}BrightnessSlider`].value,
      saturation: els[`${prefix}SaturationSlider`].value
    };
  }

  function readInterfaceControls() {
    return {
      accent: readColorControls('accent'),
      graphics: readColorControls('graphics'),
      text: readColorControls('text'),
      scale: els.interfaceScaleSlider.value,
      graphicsScale: els.graphicsScaleSlider.value,
      textScale: els.textScaleSlider.value,
      zoom: els.zoomSlider.value
    };
  }

  function openDonation() {
    state.donationReturnFocus = document.activeElement;
    els.donationDisclaimerStep.classList.remove('hidden');
    els.donationLinksStep.classList.add('hidden');
    els.donationDialog.classList.remove('hidden');
    document.body.classList.add('donation-open');
    requestAnimationFrame(() => focusElement(els.closeDonationButton));
  }

  function showDonationLinks() {
    els.donationDisclaimerStep.classList.add('hidden');
    els.donationLinksStep.classList.remove('hidden');
    requestAnimationFrame(() => focusElement(els.donationLinksStep.querySelector('a')));
  }

  function closeDonation() {
    if (els.donationDialog.classList.contains('hidden')) return;
    els.donationDialog.classList.add('hidden');
    document.body.classList.remove('donation-open');
    const returnFocus = state.donationReturnFocus;
    state.donationReturnFocus = null;
    requestAnimationFrame(() => focusElement(returnFocus || els.donationButton));
  }

  function openQuickGuide() {
    state.quickGuideReturnFocus = document.activeElement;
    els.quickGuideDialog.classList.remove('hidden');
    document.body.classList.add('quick-guide-open');
    requestAnimationFrame(() => focusElement(els.closeQuickGuideButton));
  }

  function closeQuickGuide() {
    if (els.quickGuideDialog.classList.contains('hidden')) return;
    els.quickGuideDialog.classList.add('hidden');
    document.body.classList.remove('quick-guide-open');
    const returnFocus = state.quickGuideReturnFocus;
    state.quickGuideReturnFocus = null;
    requestAnimationFrame(() => focusElement(returnFocus || els.quickGuideButton));
  }

  function openSettings() {
    state.settingsReturnFocus = document.activeElement;
    els.settingsDialog.classList.remove('hidden');
    els.settingsButton.classList.add('active');
    document.body.classList.add('settings-open');
    requestAnimationFrame(() => focusElement(els.closeSettingsButton));
  }

  function closeSettings() {
    if (els.settingsDialog.classList.contains('hidden')) return;
    els.settingsDialog.classList.add('hidden');
    els.settingsButton.classList.remove('active');
    document.body.classList.remove('settings-open');
    const returnFocus = state.settingsReturnFocus;
    state.settingsReturnFocus = null;
    requestAnimationFrame(() => focusElement(returnFocus || els.settingsButton));
  }

  function handleSettingInput() {
    applyInterfaceSettings(readInterfaceControls(), true);
  }

  function cleanName(name) {
    return name.replace(/\.[^.]+$/, '').replace(/^\s*\d{1,3}[\s._-]+/, '').replace(/[_]+/g, ' ').trim();
  }

  function normalizePath(file) {
    return file.webkitRelativePath || file.name;
  }

  function pathParts(file) {
    return normalizePath(file).split('/').filter(Boolean);
  }

  function baseName(name) {
    return name.toLowerCase().replace(/\.[^.]+$/, '');
  }

  function stableId(parts) {
    const input = parts.join('|');
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `t_${(hash >>> 0).toString(36)}`;
  }

  function decodeText(bytes) {
    try { return new TextDecoder('utf-8').decode(bytes).replace(/\0/g, '').trim(); }
    catch { return ''; }
  }

  function decodeID3String(bytes, encoding) {
    try {
      if (encoding === 0) return new TextDecoder('windows-1252').decode(bytes).replace(/\0/g, '').trim();
      if (encoding === 3) return new TextDecoder('utf-8').decode(bytes).replace(/\0/g, '').trim();
      return new TextDecoder('utf-16').decode(bytes).replace(/\0/g, '').trim();
    } catch { return ''; }
  }

  function parseAPICFrame(content) {
    if (!content || content.length < 8) return null;
    const encoding = content[0];
    let cursor = 1;
    let mimeEnd = cursor;
    while (mimeEnd < content.length && content[mimeEnd] !== 0) mimeEnd++;
    const mime = decodeText(content.slice(cursor, mimeEnd)) || 'image/jpeg';
    cursor = mimeEnd + 1;
    if (cursor >= content.length) return null;
    cursor += 1;
    const twoByteTerminator = encoding === 1 || encoding === 2;
    if (twoByteTerminator) {
      while (cursor + 1 < content.length && !(content[cursor] === 0 && content[cursor + 1] === 0)) cursor += 2;
      cursor += 2;
    } else {
      while (cursor < content.length && content[cursor] !== 0) cursor++;
      cursor += 1;
    }
    if (cursor >= content.length) return null;
    const imageBytes = content.slice(cursor);
    return imageBytes.length ? new Blob([imageBytes], { type: mime.startsWith('image/') ? mime : 'image/jpeg' }) : null;
  }

  async function parseID3(file) {
    const defaults = { title: cleanName(file.name), artist: 'Unknown artist', album: '', trackNumber: null, coverFile: null };
    try {
      const slice = await file.slice(0, Math.min(file.size, 8 * 1024 * 1024)).arrayBuffer();
      const bytes = new Uint8Array(slice);
      if (String.fromCharCode(...bytes.slice(0, 3)) !== 'ID3') return defaults;
      const version = bytes[3];
      const tagSize = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
      let offset = 10;
      const end = Math.min(bytes.length, 10 + tagSize);
      const result = { ...defaults };
      while (offset + 10 <= end) {
        const frameId = decodeText(bytes.slice(offset, offset + 4));
        if (!frameId || /^\x00+$/.test(frameId)) break;
        let size;
        if (version === 4) size = ((bytes[offset + 4] & 0x7f) << 21) | ((bytes[offset + 5] & 0x7f) << 14) | ((bytes[offset + 6] & 0x7f) << 7) | (bytes[offset + 7] & 0x7f);
        else size = ((bytes[offset + 4] << 24) >>> 0) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];
        if (!size || size < 0 || offset + 10 + size > end) break;
        const content = bytes.slice(offset + 10, offset + 10 + size);
        if (['TIT2', 'TPE1', 'TALB', 'TRCK'].includes(frameId) && content.length > 1) {
          const text = decodeID3String(content.slice(1), content[0]);
          if (frameId === 'TIT2' && text) result.title = text;
          if (frameId === 'TPE1' && text) result.artist = text;
          if (frameId === 'TALB' && text) result.album = text;
          if (frameId === 'TRCK' && text) result.trackNumber = parseInt(text.split('/')[0], 10) || null;
        }
        if (frameId === 'APIC' && !result.coverFile) result.coverFile = parseAPICFrame(content);
        offset += 10 + size;
      }
      return result;
    } catch {
      return defaults;
    }
  }

  function chooseAlbumInfo(file, tags) {
    const parts = pathParts(file);
    const folder = parts.length > 1 ? parts[parts.length - 2] : 'Imported Music';
    const root = parts.length > 2 ? parts[0] : folder;
    const album = tags.album || folder || 'Unknown album';
    const albumId = stableId([root, folder, album]);
    return { album, albumId, folderPath: parts.slice(0, -1).join('/') || 'Imported Music' };
  }

  async function importFiles(fileList) {
    const files = Array.from(fileList || []);
    const audioFiles = files.filter((f) => /\.mp3$/i.test(f.name) || f.type === 'audio/mpeg');
    if (!audioFiles.length) {
      showToast('No MP3 files were found.');
      return;
    }
    setStatus(`Reading ${audioFiles.length} track${audioFiles.length === 1 ? '' : 's'}…`);

    const vttMap = new Map();
    const imageMap = new Map();
    files.forEach((file) => {
      const parts = pathParts(file);
      const folder = parts.slice(0, -1).join('/').toLowerCase();
      if (/\.vtt$/i.test(file.name)) vttMap.set(`${folder}|${baseName(file.name)}`, file);
      if (/\.(jpe?g|png|webp)$/i.test(file.name)) {
        const priority = /^(cover|folder|front)\./i.test(file.name) ? 2 : 1;
        const current = imageMap.get(folder);
        if (!current || priority > current.priority) imageMap.set(folder, { file, priority });
      }
    });

    const records = [];
    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      setStatus(`Indexing ${i + 1} of ${audioFiles.length}: ${file.name}`);
      const tags = await parseID3(file);
      const albumInfo = chooseAlbumInfo(file, tags);
      const parts = pathParts(file);
      const folder = parts.slice(0, -1).join('/').toLowerCase();
      const lyricsFile = vttMap.get(`${folder}|${baseName(file.name)}`) || vttMap.get(`${folder}|${baseName(tags.title)}`) || null;
      const coverEntry = imageMap.get(folder) || imageMap.get(parts.slice(0, -2).join('/').toLowerCase());
      const id = stableId([normalizePath(file), String(file.size), String(file.lastModified)]);
      records.push({
        id,
        file,
        lyricsFile,
        coverFile: tags.coverFile || (coverEntry ? coverEntry.file : null),
        title: tags.title || cleanName(file.name),
        artist: tags.artist || 'Unknown artist',
        album: albumInfo.album,
        albumId: albumInfo.albumId,
        folderPath: albumInfo.folderPath,
        trackNumber: tags.trackNumber,
        importedAt: Date.now(),
        searchText: `${tags.title} ${tags.artist} ${albumInfo.album} ${albumInfo.folderPath}`.toLowerCase()
      });
    }

    try {
      await putTracks(records);
      await loadLibrary();
      showToast(`Imported ${records.length} track${records.length === 1 ? '' : 's'}.`);
      setStatus('Import complete');
      updateStorageEstimate();
    } catch (error) {
      console.error(error);
      setStatus('Import failed');
      showToast('Import failed. Browser storage may be full.');
    } finally {
      els.folderPicker.value = '';
      els.filePicker.value = '';
    }
  }

  function buildAlbums(tracks) {
    const map = new Map();
    tracks.forEach((track) => {
      if (!map.has(track.albumId)) {
        map.set(track.albumId, {
          id: track.albumId,
          title: track.album,
          artist: track.artist,
          folderPath: track.folderPath,
          importedAt: track.importedAt,
          coverFile: track.coverFile,
          tracks: []
        });
      }
      const album = map.get(track.albumId);
      album.tracks.push(track);
      if (album.artist === 'Unknown artist' && track.artist !== 'Unknown artist') album.artist = track.artist;
      if (!album.coverFile && track.coverFile) album.coverFile = track.coverFile;
      album.importedAt = Math.max(album.importedAt, track.importedAt);
    });
    map.forEach((album) => album.tracks.sort(trackSort));
    return Array.from(map.values());
  }

  function trackSort(a, b) {
    if (a.trackNumber && b.trackNumber && a.trackNumber !== b.trackNumber) return a.trackNumber - b.trackNumber;
    if (a.trackNumber && !b.trackNumber) return -1;
    if (!a.trackNumber && b.trackNumber) return 1;
    return a.title.localeCompare(b.title, undefined, { numeric: true });
  }

  const LOVED_PLAYLIST_ID = 'loved-playlist';

  function normalizePlaylists(value) {
    const source = Array.isArray(value) ? value : [];
    const clean = source.map((playlist) => ({
      id: String(playlist.id || stableId([playlist.name || 'playlist', String(Date.now())])),
      name: String(playlist.name || 'Untitled playlist').trim().slice(0, 60) || 'Untitled playlist',
      trackIds: Array.isArray(playlist.trackIds) ? playlist.trackIds.map(String) : [],
      createdAt: Number(playlist.createdAt) || Date.now()
    }));
    if (!clean.some((playlist) => playlist.id === LOVED_PLAYLIST_ID)) clean.unshift({ id: LOVED_PLAYLIST_ID, name: 'LovedPlaylist', trackIds: [], createdAt: Date.now() });
    const loved = clean.find((playlist) => playlist.id === LOVED_PLAYLIST_ID);
    loved.name = 'LovedPlaylist';
    return clean;
  }

  async function loadPlaylists() {
    state.playlists = normalizePlaylists(await getSetting('playlists', []));
    savePlaylists();
  }

  function savePlaylists() { if (state.db) setSetting('playlists', state.playlists); }
  function getPlaylist(id) { return state.playlists.find((playlist) => playlist.id === id); }
  function playlistTracks(playlist) {
    if (!playlist) return [];
    const byId = new Map(state.tracks.map((track) => [track.id, track]));
    return playlist.trackIds.map((id) => byId.get(id)).filter(Boolean);
  }
  function uniquePlaylistName(name, ignoreId = null) {
    const base = String(name || '').trim().slice(0, 60);
    if (!base) return null;
    const exists = state.playlists.some((playlist) => playlist.id !== ignoreId && playlist.name.toLowerCase() === base.toLowerCase());
    return exists ? null : base;
  }
  function isTrackLoved(track) {
    if (!track) return false;
    return Boolean(getPlaylist(LOVED_PLAYLIST_ID)?.trackIds.includes(track.id));
  }
  function toggleTrackLoved(track) {
    if (!track) return false;
    const loved = getPlaylist(LOVED_PLAYLIST_ID);
    if (!loved) return false;
    const index = loved.trackIds.indexOf(track.id);
    if (index >= 0) {
      loved.trackIds.splice(index, 1);
      savePlaylists(); renderPlaylists(); renderPlaylistDetail(); renderTracks(); syncLoveButton();
      showToast(`Removed “${track.title}” from LovedPlaylist.`);
      return false;
    }
    addTrackToPlaylist(track, LOVED_PLAYLIST_ID);
    renderTracks();
    return true;
  }

  function addTrackToPlaylist(track, playlistId = LOVED_PLAYLIST_ID) {
    if (!track) return false;
    const playlist = getPlaylist(playlistId);
    if (!playlist) return false;
    if (playlist.trackIds.includes(track.id)) { showToast(`“${track.title}” is already in ${playlist.name}.`); return false; }
    playlist.trackIds.push(track.id);
    savePlaylists(); renderPlaylists(); renderPlaylistDetail(); syncLoveButton();
    showToast(`Added “${track.title}” to ${playlist.name}.`);
    return true;
  }
  function removeTrackFromPlaylist(playlist, index) {
    if (!playlist || index < 0 || index >= playlist.trackIds.length) return;
    playlist.trackIds.splice(index, 1); savePlaylists(); renderPlaylists(); renderPlaylistDetail(); syncLoveButton();
  }

  function toggleCurrentTrackLoved() {
    if (!state.currentTrack) { showToast('Play a song first.'); return; }
    toggleTrackLoved(state.currentTrack);
  }
  function movePlaylistTrack(playlist, from, to) {
    if (!playlist || from === to || from < 0 || to < 0 || from >= playlist.trackIds.length || to >= playlist.trackIds.length) return;
    const [id] = playlist.trackIds.splice(from, 1); playlist.trackIds.splice(to, 0, id); savePlaylists(); renderPlaylistDetail();
  }
  function choosePlaylistForTrack(track) {
    const choices = state.playlists.map((playlist, index) => `${index + 1}. ${playlist.name}`).join('\n');
    const answer = window.prompt(`Add “${track.title}” to which playlist?\n${choices}\n\nEnter a number or playlist name:`);
    if (!answer) return;
    const numeric = Number(answer);
    const playlist = Number.isInteger(numeric) && numeric >= 1 ? state.playlists[numeric - 1] : state.playlists.find((item) => item.name.toLowerCase() === answer.trim().toLowerCase());
    if (!playlist) { showToast('Playlist not found.'); return; }
    addTrackToPlaylist(track, playlist.id);
  }

  function renderAddMenuPlaylists() {
    if (!els.addMenuPlaylistList) return;
    els.addMenuPlaylistList.innerHTML = '';
    const playlists = state.playlists.filter((playlist) => playlist.id !== LOVED_PLAYLIST_ID);
    if (!playlists.length) {
      const empty = document.createElement('p');
      empty.className = 'add-menu-empty';
      empty.textContent = 'No custom playlists yet. Use “Add to new playlist” first.';
      els.addMenuPlaylistList.appendChild(empty);
      return;
    }
    playlists.forEach((playlist) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'add-menu-playlist-choice';
      button.textContent = `${playlist.name} (${playlist.trackIds.length})`;
      button.addEventListener('click', () => {
        if (addTrackToPlaylist(state.currentTrack, playlist.id)) closeAddMenu();
      });
      els.addMenuPlaylistList.appendChild(button);
    });
  }

  function openAddMenu() {
    if (!state.currentTrack) { showToast('Play a song first.'); return; }
    els.addMenuTrackName.textContent = `${state.currentTrack.title} — ${state.currentTrack.artist || 'Unknown artist'}`;
    els.addMenuPlaylistList.classList.add('hidden');
    els.addMenuPlaylistButton.setAttribute('aria-expanded', 'false');
    renderAddMenuPlaylists();
    els.addMenuDialog.classList.remove('hidden');
    els.addCurrentToQueueButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('modal-open');
    focusElement(els.addMenuQueueButton);
  }

  function closeAddMenu() {
    if (!els.addMenuDialog || els.addMenuDialog.classList.contains('hidden')) return;
    els.addMenuDialog.classList.add('hidden');
    els.addCurrentToQueueButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('modal-open');
    focusElement(els.addCurrentToQueueButton);
  }

  function createPlaylistForTrack(track) {
    if (!track) return;
    const requested = window.prompt('Name the new playlist:');
    if (requested == null) return;
    const name = uniquePlaylistName(requested);
    if (!name) { showToast('Enter a unique playlist name.'); return; }
    const playlist = { id: stableId([name, String(Date.now()), String(Math.random())]), name, trackIds: [], createdAt: Date.now() };
    state.playlists.push(playlist);
    savePlaylists();
    addTrackToPlaylist(track, playlist.id);
    renderCounts();
    closeAddMenu();
  }

  async function loadLibrary() {
    state.tracks = await getAllTracks();
    state.albums = buildAlbums(state.tracks);
    await loadPlaylists();
    state.playlists.forEach((playlist) => { playlist.trackIds = playlist.trackIds.filter((id) => state.tracks.some((track) => track.id === id)); });
    savePlaylists();
    state.manageSelected.clear();
    renderAll();
    renderManageItems();
  }

  function buildArtists() {
    const map = new Map();
    state.tracks.forEach((track) => {
      const name = track.artist || 'Unknown artist';
      if (!map.has(name)) map.set(name, { name, tracks: [], albumIds: new Set(), coverFile: null });
      const artist = map.get(name);
      artist.tracks.push(track);
      artist.albumIds.add(track.albumId);
      if (!artist.coverFile && track.coverFile) artist.coverFile = track.coverFile;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  function filteredArtists() {
    const artists = buildArtists();
    if (!state.search) return artists;
    return artists.filter((artist) => artist.name.toLowerCase().includes(state.search) || artist.tracks.some((track) => track.searchText.includes(state.search)));
  }

  function filteredTracks() {
    if (!state.search) return [...state.tracks].sort((a, b) => a.title.localeCompare(b.title));
    return state.tracks.filter((track) => track.searchText.includes(state.search)).sort((a, b) => a.title.localeCompare(b.title));
  }

  function filteredAlbums() {
    let albums = state.albums.filter((album) => {
      if (!state.search) return true;
      return `${album.title} ${album.artist} ${album.folderPath}`.toLowerCase().includes(state.search) || album.tracks.some((t) => t.searchText.includes(state.search));
    });
    albums.sort((a, b) => a.title.localeCompare(b.title));
    return albums;
  }

  function makeCover(container, file, fallback = '♫') {
    if (container.dataset.objectUrl) URL.revokeObjectURL(container.dataset.objectUrl);
    container.innerHTML = '';
    delete container.dataset.objectUrl;
    if (file) {
      const url = URL.createObjectURL(file);
      container.dataset.objectUrl = url;
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      container.appendChild(img);
    } else {
      const img = document.createElement('img');
      img.src = './assets/logo.png';
      img.alt = '';
      img.className = 'melodicaine-placeholder';
      img.setAttribute('aria-hidden', 'true');
      container.appendChild(img);
      container.setAttribute('aria-label', fallback ? 'MelodicaineStudio artwork placeholder' : 'Artwork placeholder');
    }
  }


  function manageGroups() {
    if (state.manageType === 'song') return state.tracks.slice().sort(trackSort).map((track) => ({ id: track.id, title: track.title, subtitle: `${track.artist} · ${track.album}`, trackIds: [track.id] }));
    if (state.manageType === 'album') return state.albums.slice().sort((a, b) => a.title.localeCompare(b.title)).map((album) => ({ id: album.id, title: album.title, subtitle: `${album.artist} · ${album.tracks.length} track${album.tracks.length === 1 ? '' : 's'}`, trackIds: album.tracks.map((t) => t.id) }));
    const artists = new Map();
    state.tracks.forEach((track) => { const key = track.artist || 'Unknown artist'; if (!artists.has(key)) artists.set(key, []); artists.get(key).push(track); });
    return Array.from(artists, ([artist, tracks]) => { const albums = new Set(tracks.map((t) => t.albumId)).size; return { id: artist, title: artist, subtitle: `${albums} album${albums === 1 ? '' : 's'} · ${tracks.length} songs`, trackIds: tracks.map((t) => t.id) }; }).sort((a, b) => a.title.localeCompare(b.title));
  }

  function renderManageItems() {
    if (!els.manageItemList) return;
    const groups = manageGroups();
    els.manageItemList.innerHTML = '';
    groups.forEach((group) => {
      const label = document.createElement('label'); label.className = 'manage-item';
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = state.manageSelected.has(group.id);
      checkbox.addEventListener('change', () => { checkbox.checked ? state.manageSelected.add(group.id) : state.manageSelected.delete(group.id); updateManageSelection(groups); });
      const text = document.createElement('span'); text.className = 'manage-item-text'; text.innerHTML = '<span class="manage-item-title"></span><span class="manage-item-subtitle"></span>';
      text.querySelector('.manage-item-title').textContent = group.title; text.querySelector('.manage-item-subtitle').textContent = group.subtitle;
      label.append(checkbox, text); els.manageItemList.appendChild(label);
    });
    if (!groups.length) els.manageItemList.innerHTML = '<p class="lyrics-placeholder">No library items yet.</p>';
    updateManageSelection(groups);
  }

  function updateManageSelection(groups = manageGroups()) {
    const count = state.manageSelected.size;
    els.manageSelectionCount.textContent = `${count} selected`; els.deleteSelectedButton.disabled = count === 0;
    els.selectAllManageButton.textContent = groups.length && count === groups.length ? 'Clear selection' : 'Select all';
  }

  function toggleManage(force) {
    const open = typeof force === 'boolean' ? force : els.manageDock.classList.contains('minimized');
    els.manageDock.classList.toggle('minimized', !open);
    els.manageDockToggle.setAttribute('aria-expanded', String(open));
    if (open) renderManageItems();
  }

  function askConfirmation(message) {
    state.confirmReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    els.confirmMessage.textContent = message;
    els.confirmDialog.classList.remove('hidden');
    focusElement(els.confirmNoButton);
    return new Promise((resolve) => { state.confirmResolver = resolve; });
  }

  function finishConfirmation(value) {
    els.confirmDialog.classList.add('hidden');
    const resolve = state.confirmResolver;
    const returnFocus = state.confirmReturnFocus;
    state.confirmResolver = null;
    state.confirmReturnFocus = null;
    focusElement(returnFocus);
    if (resolve) resolve(value);
  }

  function removeDeletedFromPlayback(idSet) {
    state.queue = state.queue.filter((track) => !idSet.has(track.id));
    state.playbackHistory = state.playbackHistory.filter((trackId) => !idSet.has(trackId));
    if (state.currentTrack && idSet.has(state.currentTrack.id)) {
      audio.pause(); audio.removeAttribute('src'); audio.load(); state.currentTrack = null; state.queueIndex = -1;
      els.nowTitle.textContent = 'Nothing playing'; els.nowArtist.textContent = 'Choose another track';
      makeCover(els.playerCover, null, '♪'); makeCover(els.lyricsCover, null, '♫');
      els.lyricsContent.innerHTML = '<p class="lyrics-placeholder">Play a track with a matching WebVTT file to see timed lyrics.</p>';
    } else state.queueIndex = state.currentTrack ? state.queue.findIndex((t) => t.id === state.currentTrack.id) : -1;
  }

  async function deleteManagedSelection() {
    const groups = manageGroups().filter((group) => state.manageSelected.has(group.id)); if (!groups.length) return;
    const typeLabel = state.manageType === 'song' ? 'song' : state.manageType;
    const approved = await askConfirmation(`Are you sure you want to delete ${groups.length} selected ${typeLabel}${groups.length === 1 ? '' : 's'} from this library?`); if (!approved) return;
    const ids = new Set(groups.flatMap((group) => group.trackIds)); await deleteTracks(Array.from(ids)); removeDeletedFromPlayback(ids); await loadLibrary(); renderQueue();
    showToast(`Deleted ${groups.length} selected ${typeLabel}${groups.length === 1 ? '' : 's'}.`); updateStorageEstimate();
  }

  function renderArtists() {
    const artists = filteredArtists();
    els.artistGrid.innerHTML = '';
    artists.forEach((artist) => {
      const card = document.createElement('article');
      card.className = 'album-card artist-card';
      card.tabIndex = 0;
      const cover = document.createElement('div');
      cover.className = 'album-cover artist-cover';
      makeCover(cover, artist.coverFile, '♬');
      const title = document.createElement('h3');
      title.textContent = artist.name;
      const albums = document.createElement('p');
      albums.textContent = `${artist.albumIds.size} album${artist.albumIds.size === 1 ? '' : 's'}`;
      const tracks = document.createElement('span');
      tracks.textContent = `${artist.tracks.length} track${artist.tracks.length === 1 ? '' : 's'}`;
      card.append(cover, title, albums, tracks);
      const openArtist = () => {
        els.searchInput.value = artist.name;
        state.search = artist.name.toLowerCase();
        renderAll();
        showView('albums');
      };
      card.addEventListener('click', openArtist);
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') openArtist(); });
      els.artistGrid.appendChild(card);
    });
    els.artistEmpty.style.display = artists.length ? 'none' : 'grid';
  }

  function renderAlbums() {
    const albums = filteredAlbums();
    els.albumGrid.innerHTML = '';
    albums.forEach((album) => {
      const card = document.createElement('article');
      card.className = 'album-card';
      card.tabIndex = 0;
      const cover = document.createElement('div');
      cover.className = 'album-cover';
      makeCover(cover, album.coverFile);
      const title = document.createElement('h3');
      title.textContent = album.title;
      const artist = document.createElement('p');
      artist.textContent = album.artist;
      const count = document.createElement('p');
      count.textContent = `${album.tracks.length} track${album.tracks.length === 1 ? '' : 's'}`;
      card.append(cover, title, artist, count);
      card.addEventListener('click', () => openAlbum(album.id));
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') openAlbum(album.id); });
      els.albumGrid.appendChild(card);
    });
    els.albumEmpty.style.display = albums.length ? 'none' : 'grid';
  }

  function renderTracks() {
    const tracks = filteredTracks();
    els.trackTableBody.innerHTML = '';
    tracks.forEach((track, index) => {
      const row = document.createElement('tr');
      const loved = isTrackLoved(track);
      row.innerHTML = `<td>${index + 1}</td><td></td><td></td><td></td><td>${track.lyricsFile ? '<span class="lyric-badge">VTT</span>' : '—'}</td><td><div class="row-actions"><button class="icon-button graphic-row-button playlist-add" title="Add to playlist" aria-label="Add to playlist"><img class="ui-control-graphic row-ui-graphic" src="${UI_GRAPHICS.add}" alt="" aria-hidden="true" /></button><button class="icon-button graphic-row-button love-add${loved ? ' active' : ''}" title="${loved ? 'Remove from LovedPlaylist' : 'Add to LovedPlaylist'}" aria-label="${loved ? 'Remove from LovedPlaylist' : 'Add to LovedPlaylist'}" aria-pressed="${loved}"><img class="ui-control-graphic row-ui-graphic" src="${loved ? UI_GRAPHICS.loveOn : UI_GRAPHICS.loveOff}" alt="" aria-hidden="true" /></button><button class="icon-button graphic-row-button queue-add" title="Add to queue" aria-label="Add to queue"><img class="ui-control-graphic row-ui-graphic" src="${UI_GRAPHICS.add}" alt="" aria-hidden="true" /></button></div></td>`;
      row.children[1].textContent = track.title;
      row.children[2].textContent = track.artist;
      row.children[3].textContent = track.album;
      row.addEventListener('dblclick', () => playTrack(track, tracks));
      row.addEventListener('click', (event) => {
        if (!event.target.closest('button')) playTrack(track, tracks);
      });
      row.querySelector('.playlist-add').addEventListener('click', (event) => { event.stopPropagation(); choosePlaylistForTrack(track); });
      row.querySelector('.love-add').addEventListener('click', (event) => { event.stopPropagation(); toggleTrackLoved(track); });
      row.querySelector('.queue-add').addEventListener('click', (event) => {
        event.stopPropagation();
        addToQueue([track]);
      });
      els.trackTableBody.appendChild(row);
    });
    els.trackEmpty.style.display = tracks.length ? 'none' : 'grid';
  }

  function renderQueue() {
    els.queueList.innerHTML = '';
    state.queue.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = `queue-item${index === state.queueIndex ? ' active' : ''}`;
      item.draggable = true;
      item.dataset.queueIndex = index;
      item.innerHTML = `<button class="queue-drag" title="Drag to reorder" aria-label="Drag ${track.title} to reorder">☰</button><span>${index + 1}</span><div><strong></strong><p></p></div><div class="queue-actions"><button class="icon-button queue-move-up" title="Move up" aria-label="Move up">↑</button><button class="icon-button queue-move-down" title="Move down" aria-label="Move down">↓</button><button class="icon-button graphic-row-button queue-duplicate" title="Add another copy to queue" aria-label="Add another copy to queue"><img class="ui-control-graphic row-ui-graphic" src="${UI_GRAPHICS.add}" alt="" aria-hidden="true" /></button><button class="icon-button queue-remove" title="Remove from queue" aria-label="Remove from queue">×</button></div>`;
      item.querySelector('strong').textContent = track.title;
      item.querySelector('p').textContent = `${track.artist} · ${track.album}`;
      item.addEventListener('click', (event) => { if (!event.target.closest('button')) playQueueIndex(index); });
      item.querySelector('.queue-remove').addEventListener('click', () => removeQueueIndex(index));
      item.querySelector('.queue-duplicate').addEventListener('click', () => addToQueue([track]));
      item.querySelector('.queue-move-up').addEventListener('click', () => moveQueueItem(index, index - 1));
      item.querySelector('.queue-move-down').addEventListener('click', () => moveQueueItem(index, index + 1));
      item.addEventListener('dragstart', (event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)); item.classList.add('dragging'); });
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
      item.addEventListener('dragover', (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; });
      item.addEventListener('drop', (event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); moveQueueItem(from, index); });
      els.queueList.appendChild(item);
    });
    els.queueEmpty.style.display = state.queue.length ? 'none' : 'grid';
    els.queueCount.textContent = state.queue.length;
  }

  function moveQueueItem(from, to) {
    if (from === to || from < 0 || to < 0 || from >= state.queue.length || to >= state.queue.length) return;
    const [track] = state.queue.splice(from, 1);
    state.queue.splice(to, 0, track);
    if (state.queueIndex === from) state.queueIndex = to;
    else if (from < state.queueIndex && to >= state.queueIndex) state.queueIndex--;
    else if (from > state.queueIndex && to <= state.queueIndex) state.queueIndex++;
    renderQueue();
  }

  function renderPlaylists() {
    if (!els.playlistGrid) return;
    els.playlistGrid.innerHTML = '';
    state.playlists.forEach((playlist) => {
      const tracks = playlistTracks(playlist);
      const card = document.createElement('article');
      card.className = 'album-card playlist-card'; card.tabIndex = 0;
      const cover = document.createElement('div'); cover.className = 'album-cover playlist-cover';
      makeCover(cover, tracks.find((track) => track.coverFile)?.coverFile, 'Playlist');
      const title = document.createElement('h3'); title.textContent = playlist.name;
      const count = document.createElement('p'); count.textContent = `${tracks.length} track${tracks.length === 1 ? '' : 's'}`;
      card.append(cover, title, count);
      card.addEventListener('click', () => openPlaylist(playlist.id));
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPlaylist(playlist.id); } });
      els.playlistGrid.appendChild(card);
    });
    els.playlistEmpty.style.display = state.playlists.length ? 'none' : 'grid';
  }

  function openPlaylist(id) {
    state.selectedPlaylistId = id;
    document.querySelectorAll('.view').forEach((view) => view.classList.remove('active-view'));
    els.albumDetail.classList.add('hidden');
    els.playlistDetail?.classList.add('hidden');
    els.playlistDetail.classList.remove('hidden');
    renderPlaylistDetail();
  }
  function closePlaylist() { state.selectedPlaylistId = null; els.playlistDetail.classList.add('hidden'); showView('playlists'); }
  function renderPlaylistDetail() {
    if (!els.playlistDetail || els.playlistDetail.classList.contains('hidden') && !state.selectedPlaylistId) return;
    const playlist = getPlaylist(state.selectedPlaylistId); if (!playlist) { if (state.selectedPlaylistId) closePlaylist(); return; }
    const tracks = playlistTracks(playlist);
    els.playlistDetailTitle.textContent = playlist.name;
    els.playlistDetailStats.textContent = `${tracks.length} track${tracks.length === 1 ? '' : 's'} · drag or use arrows to reorder`;
    els.deletePlaylistButton.disabled = playlist.id === LOVED_PLAYLIST_ID;
    els.renamePlaylistButton.disabled = playlist.id === LOVED_PLAYLIST_ID;
    els.playlistTrackList.innerHTML = '';
    tracks.forEach((track, index) => {
      const row = document.createElement('div'); row.className = 'queue-item playlist-track-item'; row.draggable = true;
      row.innerHTML = `<button class="queue-drag" title="Drag to reorder">☰</button><span>${index + 1}</span><div><strong></strong><p></p></div><div class="queue-actions"><button class="icon-button move-up" title="Move up">↑</button><button class="icon-button move-down" title="Move down">↓</button><button class="icon-button graphic-row-button add-queue" title="Add to queue" aria-label="Add to queue"><img class="ui-control-graphic row-ui-graphic" src="${UI_GRAPHICS.add}" alt="" aria-hidden="true" /></button><button class="icon-button remove-playlist" title="Remove from playlist">×</button></div>`;
      row.querySelector('strong').textContent = track.title; row.querySelector('p').textContent = `${track.artist} · ${track.album}`;
      row.addEventListener('click', (event) => { if (!event.target.closest('button')) playTrack(track, tracks, { type: 'playlist', id: playlist.id }); });
      row.querySelector('.move-up').addEventListener('click', () => movePlaylistTrack(playlist, index, index - 1));
      row.querySelector('.move-down').addEventListener('click', () => movePlaylistTrack(playlist, index, index + 1));
      row.querySelector('.add-queue').addEventListener('click', () => addToQueue([track]));
      row.querySelector('.remove-playlist').addEventListener('click', () => removeTrackFromPlaylist(playlist, index));
      row.addEventListener('dragstart', (event) => { event.dataTransfer.setData('text/plain', String(index)); row.classList.add('dragging'); });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', (event) => { event.preventDefault(); movePlaylistTrack(playlist, Number(event.dataTransfer.getData('text/plain')), index); });
      els.playlistTrackList.appendChild(row);
    });
    els.playlistDetailEmpty.style.display = tracks.length ? 'none' : 'grid';
  }

  function syncLoveButton() {
    if (!els.loveCurrentButton) return;
    const loved = getPlaylist(LOVED_PLAYLIST_ID);
    const active = Boolean(state.currentTrack && loved?.trackIds.includes(state.currentTrack.id));
    els.loveCurrentButton.classList.toggle('active', active);
    const label = active ? 'Remove current song from LovedPlaylist' : 'Add current song to LovedPlaylist';
    setButtonGraphic(
      els.loveCurrentButton,
      active ? UI_GRAPHICS.loveOn : UI_GRAPHICS.loveOff,
      label,
      label,
      active
    );
  }

  function renderCounts() {
    els.artistCount.textContent = buildArtists().length;
    els.albumCount.textContent = state.albums.length;
    els.trackCount.textContent = state.tracks.length;
    els.playlistCount.textContent = state.playlists.length;
    els.queueCount.textContent = state.queue.length;
  }

  function renderAll() {
    renderArtists();
    renderAlbums();
    renderTracks();
    renderPlaylists();
    renderQueue();
    renderCounts();
    if (state.selectedAlbumId) renderAlbumDetail();
  }

  function openAlbum(albumId) {
    state.selectedAlbumId = albumId;
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active-view'));
    els.albumDetail.classList.remove('hidden');
    renderAlbumDetail();
  }

  function closeAlbum() {
    state.selectedAlbumId = null;
    els.albumDetail.classList.add('hidden');
    showView(state.activeView);
  }

  function renderAlbumDetail() {
    const album = state.albums.find((a) => a.id === state.selectedAlbumId);
    if (!album) return closeAlbum();
    els.detailTitle.textContent = album.title;
    els.detailArtist.textContent = album.artist;
    els.detailStats.textContent = `${album.tracks.length} track${album.tracks.length === 1 ? '' : 's'} · ${album.folderPath}`;
    makeCover(els.detailCover, album.coverFile);
    els.albumTrackList.innerHTML = '';
    album.tracks.forEach((track, index) => {
      const row = document.createElement('div');
      row.className = 'album-track';
      row.innerHTML = `<span>${track.trackNumber || index + 1}</span><div><div class="track-title"></div><div class="track-subtitle"></div></div><span>${track.lyricsFile ? '<span class="lyric-badge">Lyrics</span>' : ''}</span><button class="icon-button graphic-row-button" title="Add to queue" aria-label="Add to queue"><img class="ui-control-graphic row-ui-graphic" src="${UI_GRAPHICS.add}" alt="" aria-hidden="true" /></button>`;
      row.querySelector('.track-title').textContent = track.title;
      row.querySelector('.track-subtitle').textContent = track.artist;
      row.addEventListener('click', (event) => { if (!event.target.closest('button')) playTrack(track, album.tracks, { type: 'album', id: album.id }); });
      row.querySelector('button').addEventListener('click', (event) => { event.stopPropagation(); addToQueue([track]); });
      els.albumTrackList.appendChild(row);
    });
  }

  function showView(view) {
    state.activeView = view;
    els.albumDetail.classList.add('hidden');
    els.playlistDetail.classList.add('hidden');
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active-view'));
    $(`${view}View`).classList.add('active-view');
    document.querySelectorAll('.nav-button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  }

  function addToQueue(tracks, replace = false, startIndex = null) {
    if (replace) {
      state.queue = [...tracks];
      state.queueIndex = startIndex ?? -1;
    } else {
      state.queue.push(...tracks);
    }
    renderQueue();
    showToast(`${tracks.length} track${tracks.length === 1 ? '' : 's'} added to queue.`);
  }

  function removeQueueIndex(index) {
    state.queue.splice(index, 1);
    if (index < state.queueIndex) state.queueIndex--;
    else if (index === state.queueIndex) state.queueIndex = Math.min(state.queueIndex, state.queue.length - 1);
    renderQueue();
  }

  async function playTrack(track, contextTracks = null, context = null, options = {}) {
    const previousTrackId = state.currentTrack?.id ?? null;
    if (!options.skipHistory && previousTrackId && previousTrackId !== track.id) {
      state.playbackHistory.push(previousTrackId);
      if (state.playbackHistory.length > 500) state.playbackHistory.shift();
    }
    if (contextTracks) {
      state.queue = [...contextTracks];
      state.queueIndex = state.queue.findIndex((t) => t.id === track.id);
      state.playbackContext = context || { type: 'queue', id: null };
    } else {
      const existing = state.queue.findIndex((t) => t.id === track.id);
      if (existing >= 0) state.queueIndex = existing;
      else { state.queue.push(track); state.queueIndex = state.queue.length - 1; }
      state.playbackContext = { type: 'queue', id: null };
    }
    state.currentTrack = track;
    updateMediaSession(track);
    if (state.currentObjectUrl) URL.revokeObjectURL(state.currentObjectUrl);
    state.currentObjectUrl = URL.createObjectURL(track.file);
    audio.src = state.currentObjectUrl;
    applyVolume();
    updateNowPlaying(track);
    await loadLyrics(track);
    renderQueue();
    syncLoveButton();
    try { await audio.play(); } catch (error) { console.warn(error); }
  }

  function playQueueIndex(index, options = {}) {
    if (!state.queue[index]) return;
    state.queueIndex = index;
    playTrack(state.queue[index], null, null, options);
  }

  function updateNowPlaying(track) {
    els.nowTitle.textContent = track.title;
    els.nowArtist.textContent = `${track.artist} · ${track.album}`;
    els.lyricsTrackTitle.textContent = track.title;
    els.lyricsTrackArtist.textContent = `${track.artist} · ${track.album}`;
    makeCover(els.playerCover, track.coverFile, '♪');
    makeCover(els.lyricsCover, track.coverFile, '♫');
    document.title = `${track.title} — ${APP_NAME}`;
  }

  function parseTimestamp(value) {
    const parts = value.trim().split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  function parseVTT(text) {
    const normalized = text.replace(/^\uFEFF/, '').replace(/\r/g, '');
    const blocks = normalized.split(/\n{2,}/);
    const cues = [];
    blocks.forEach((block) => {
      const lines = block.trim().split('\n');
      const timingIndex = lines.findIndex((line) => line.includes('-->'));
      if (timingIndex < 0) return;
      const [startRaw, endRawWithSettings] = lines[timingIndex].split('-->').map((s) => s.trim());
      const endRaw = endRawWithSettings.split(/\s+/)[0];
      const cueText = lines.slice(timingIndex + 1).join('\n').replace(/<[^>]+>/g, '').trim();
      if (cueText) cues.push({ start: parseTimestamp(startRaw), end: parseTimestamp(endRaw), text: cueText });
    });
    return cues.sort((a, b) => a.start - b.start);
  }

  async function loadLyrics(track) {
    state.lyricCues = [];
    state.activeCueIndex = -1;
    els.lyricsContent.innerHTML = '';
    if (!track.lyricsFile) {
      els.lyricsContent.innerHTML = '<p class="lyrics-placeholder">No matching .vtt file was found for this track.</p>';
      return;
    }
    try {
      state.lyricCues = parseVTT(await track.lyricsFile.text());
      if (!state.lyricCues.length) throw new Error('No cues');
      state.lyricCues.forEach((cue, index) => {
        const line = document.createElement('p');
        line.className = 'lyric-line';
        line.textContent = cue.text;
        line.dataset.index = index;
        line.addEventListener('click', () => { audio.currentTime = cue.start; });
        els.lyricsContent.appendChild(line);
      });
    } catch {
      els.lyricsContent.innerHTML = '<p class="lyrics-placeholder">The linked VTT file could not be parsed.</p>';
    }
  }

  function syncLyrics(time) {
    if (!state.lyricCues.length) return;
    let nextIndex = -1;
    for (let i = 0; i < state.lyricCues.length; i++) {
      const cue = state.lyricCues[i];
      if (time >= cue.start && time < cue.end) { nextIndex = i; break; }
      if (time >= cue.start) nextIndex = i;
    }
    if (nextIndex === state.activeCueIndex) return;
    const previous = els.lyricsContent.querySelector('.lyric-line.active');
    if (previous) previous.classList.remove('active');
    state.activeCueIndex = nextIndex;
    const active = els.lyricsContent.querySelector(`[data-index="${nextIndex}"]`);
    if (active) {
      active.classList.add('active');
      active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function nextTrack(manual = false) {
    if (!state.queue.length) return;
    if (!manual && state.repeat === 'one') {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    let next;
    if (state.shuffle && state.queue.length > 1) {
      do { next = Math.floor(Math.random() * state.queue.length); } while (next === state.queueIndex);
    } else next = state.queueIndex + 1;
    if (next >= state.queue.length) {
      if (state.repeat === 'all') next = 0;
      else { audio.pause(); audio.currentTime = 0; return; }
    }
    playQueueIndex(next);
  }

  function previousTrack() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }

    while (state.playbackHistory.length) {
      const previousTrackId = state.playbackHistory.pop();
      const previousTrack = state.tracks.find((track) => track.id === previousTrackId);
      if (!previousTrack || previousTrack.id === state.currentTrack?.id) continue;
      playTrack(previousTrack, null, null, { skipHistory: true });
      return;
    }

    if (state.currentTrack) audio.currentTime = 0;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  }

  function setStatus(text) { els.statusText.textContent = text; }

  function showToast(text) {
    els.toast.textContent = text;
    els.toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 2400);
  }

  function toggleLyrics(force) {
    const open = typeof force === 'boolean' ? force : !els.lyricsPanel.classList.contains('open');
    els.lyricsPanel.classList.toggle('open', open);
    els.lyricsPanel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('lyrics-open', open);
  }

  async function updateStorageEstimate() {
    if (!navigator.storage?.estimate) { els.storageText.textContent = 'Estimate unavailable'; return; }
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    const gb = (n) => (n / 1024 / 1024 / 1024).toFixed(n > 1024 ** 3 ? 2 : 3);
    els.storageText.textContent = `${gb(usage)} GB used of about ${gb(quota)} GB`;
  }

  function setDrawer(open, restoreFocus = true) {
    const shouldOpen = Boolean(open && mobileLayout.matches);
    if (shouldOpen && !document.body.classList.contains('drawer-open')) {
      state.drawerReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : els.mobileMenuButton;
    }
    const returnFocus = !shouldOpen && restoreFocus ? state.drawerReturnFocus : null;
    if (shouldOpen && els.librarySidebar) {
      els.librarySidebar.setAttribute('aria-hidden', 'false');
      if ('inert' in els.librarySidebar) els.librarySidebar.inert = false;
    }
    document.body.classList.toggle('drawer-open', shouldOpen);
    els.mobileMenuButton?.setAttribute('aria-expanded', String(shouldOpen));
    if (els.drawerScrim) els.drawerScrim.hidden = !shouldOpen;
    if (!shouldOpen && returnFocus) focusElement(returnFocus);
    if (els.librarySidebar && !shouldOpen) {
      els.librarySidebar.setAttribute('aria-hidden', String(mobileLayout.matches && !shouldOpen));
      if ('inert' in els.librarySidebar) els.librarySidebar.inert = mobileLayout.matches && !shouldOpen;
    }
    if (!shouldOpen) state.drawerReturnFocus = null;
  }

  function openMobileManage() {
    setDrawer(true, false);
    toggleManage(true);
    requestAnimationFrame(() => {
      if (!els.librarySidebar || !mobileLayout.matches) return;
      const brandHeight = els.librarySidebar.querySelector('.brand')?.offsetHeight || 0;
      const targetTop = Math.max(0, els.manageDock.offsetTop - brandHeight - 12);
      els.librarySidebar.scrollTo({ top: targetTop, behavior: 'auto' });
      focusElement(els.manageDockToggle);
    });
  }

  function syncDrawerForViewport() {
    if (!mobileLayout.matches) {
      document.body.classList.remove('drawer-open');
      els.drawerScrim.hidden = true;
      els.mobileMenuButton?.setAttribute('aria-expanded', 'false');
      els.librarySidebar?.removeAttribute('aria-hidden');
      if (els.librarySidebar && 'inert' in els.librarySidebar) els.librarySidebar.inert = false;
      state.drawerReturnFocus = null;
      return;
    }
    setDrawer(document.body.classList.contains('drawer-open'), false);
  }

  async function updatePersistenceStatus(request = false) {
    if (!navigator.storage?.persisted) {
      if (els.persistenceText) els.persistenceText.textContent = 'Persistence: unavailable in this browser';
      if (els.requestPersistenceButton) els.requestPersistenceButton.hidden = true;
      return;
    }
    let persisted = await navigator.storage.persisted();
    if (request && !persisted && navigator.storage.persist) persisted = await navigator.storage.persist();
    if (els.persistenceText) els.persistenceText.textContent = persisted ? 'Persistence: protected' : 'Persistence: browser-managed';
    if (els.requestPersistenceButton) {
      els.requestPersistenceButton.textContent = persisted ? 'Local library protected' : 'Protect local library';
      els.requestPersistenceButton.disabled = persisted;
    }
  }

  function artworkUrlForMediaSession(track) {
    if (!track?.coverBlob) return [];
    const url = URL.createObjectURL(track.coverBlob);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return [{ src: url, sizes: '512x512', type: track.coverBlob.type || 'image/jpeg' }];
  }

  function updateMediaSession(track) {
    if (!('mediaSession' in navigator) || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Unknown track',
        artist: track.artist || 'Unknown artist',
        album: track.album || 'Unknown album',
        artwork: artworkUrlForMediaSession(track)
      });
      try { navigator.mediaSession.setPositionState?.(); } catch {}
    } catch (error) { console.warn('Media Session metadata unavailable', error); }
  }

  function configureMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const handlers = {
      play: () => { audio.play().catch((error) => console.warn('Background play failed', error)); },
      pause: () => audio.pause(), previoustrack: previousTrack, nexttrack: () => nextTrack(true),
      seekbackward: (details) => { audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10)); },
      seekforward: (details) => { audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + (details.seekOffset || 10)); },
      seekto: (details) => { if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime; }
    };
    Object.entries(handlers).forEach(([action, handler]) => { try { navigator.mediaSession.setActionHandler(action, handler); } catch {} });
  }

  function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true;
  }

  function getInstallPlatform() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    return { isIOS, isAndroid };
  }

  function updateInstallUI() {
    if (!els.installButton || !els.installHelpText || !els.installStateBadge) return;
    const installed = isStandaloneApp();
    const { isIOS, isAndroid } = getInstallPlatform();
    els.iosInstallSteps?.classList.add('hidden');
    els.installButton.setAttribute('aria-expanded', 'false');

    if (installed) {
      els.installStateBadge.textContent = 'Installed';
      els.installStateBadge.classList.add('installed');
      els.installHelpText.textContent = 'MelodicaineStudio is running as an installed app on this device.';
      els.installButton.textContent = 'Already installed';
      els.installButton.disabled = true;
      return;
    }

    els.installStateBadge.textContent = isIOS ? 'Manual setup' : 'Available';
    els.installStateBadge.classList.remove('installed');
    els.installButton.disabled = false;

    if (state.deferredInstallPrompt) {
      els.installButton.textContent = 'Install MelodicaineStudio';
      els.installHelpText.textContent = isAndroid
        ? 'Install MelodicaineStudio to your Home Screen and launch it like a standalone Android app.'
        : 'Install MelodicaineStudio as a standalone desktop or mobile application.';
      return;
    }

    if (isIOS) {
      els.installButton.textContent = 'Show iPhone setup and limits';
      els.installHelpText.textContent = 'iPhone installation is manual. The button below opens the exact Safari steps and explains the storage limit.';
      return;
    }

    if (isAndroid) {
      els.installButton.textContent = 'Show Android install help';
      els.installHelpText.textContent = 'Use Chrome or another install-capable browser. The browser may also show “Install app” in its menu.';
      return;
    }

    els.installButton.textContent = 'Install MelodicaineStudio';
    els.installHelpText.textContent = 'Open this site in Chrome, Edge, or another install-capable browser to install it as an app.';
  }

  async function handleInstallRequest() {
    if (isStandaloneApp()) { updateInstallUI(); return; }
    const { isIOS, isAndroid } = getInstallPlatform();

    if (state.deferredInstallPrompt) {
      const promptEvent = state.deferredInstallPrompt;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice?.outcome === 'accepted') state.deferredInstallPrompt = null;
      updateInstallUI();
      return;
    }

    if (isIOS) {
      const panel = els.iosInstallSteps;
      if (!panel) return;
      const willOpen = panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !willOpen);
      els.installButton.setAttribute('aria-expanded', String(willOpen));
      els.installButton.textContent = willOpen ? 'Hide iPhone setup and limits' : 'Show iPhone setup and limits';
      if (willOpen) requestAnimationFrame(() => { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); focusElement(panel); });
      return;
    }

    els.installHelpText.textContent = isAndroid
      ? 'In Chrome, open the ⋮ menu and choose “Install app” or “Add to Home screen.” Then launch MelodicaineStudio from its icon.'
      : 'Open the browser menu and choose “Install MelodicaineStudio” or “Install app.” Chrome and Edge support this directly.';
  }

  function configureMobileImportCapabilities() {
    const { isIOS } = getInstallPlatform();
    if (!isIOS) return;
    if (els.folderPicker) {
      els.folderPicker.disabled = true;
      els.folderPicker.removeAttribute('webkitdirectory');
      els.folderPicker.removeAttribute('directory');
    }
    if (els.folderPickerLabel) {
      els.folderPickerLabel.classList.add('disabled-import');
      els.folderPickerLabel.setAttribute('aria-disabled', 'true');
      els.folderPickerLabel.textContent = 'Album folder import unavailable on iPhone';
      els.folderPickerLabel.removeAttribute('for');
    }
    if (els.manageMobileHelp) {
      els.manageMobileHelp.innerHTML = '<strong>iPhone:</strong> use “Import individual files.” iOS cannot grant a web app ongoing access to a folder, and large imports consume Safari-managed website storage.';
    }
  }

  function registerPWA() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('./service-worker.js').catch((error) => console.warn('Service worker registration failed', error));
    }
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      updateInstallUI();
    });
    window.addEventListener('appinstalled', () => {
      state.deferredInstallPrompt = null;
      updateInstallUI();
      showToast(`${APP_NAME} installed.`);
    });
    window.matchMedia('(display-mode: standalone)').addEventListener?.('change', updateInstallUI);
    updateInstallUI();
  }


  const UI_GRAPHICS = Object.freeze({
    play: './assets/ui/play.png',
    pause: './assets/ui/pause.png',
    previous: './assets/ui/back.png',
    next: './assets/ui/forward.png',
    shuffleOff: './assets/ui/shuffleoff.png',
    shuffleOn: './assets/ui/shuffleon.png',
    repeatOff: './assets/ui/repeatoff.png',
    repeatAll: './assets/ui/repeaton.png',
    repeatOne: './assets/ui/repeat1.png',
    volumeLow: './assets/ui/volumelow.png',
    volumeMedium: './assets/ui/volumemedium.png',
    volumeLoud: './assets/ui/volumeloud.png',
    add: './assets/ui/add.png',
    loveOff: './assets/ui/loveoff.png',
    loveOn: './assets/ui/loveon.png'
  });

  function setButtonGraphic(button, source, title, ariaLabel, pressed = null) {
    const image = button?.querySelector('.ui-control-graphic');
    if (image && image.getAttribute('src') !== source) image.src = source;
    if (title) button.title = title;
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
    if (pressed !== null) button.setAttribute('aria-pressed', String(pressed));
  }

  function syncShuffleGraphic() {
    setButtonGraphic(
      els.shuffleButton,
      state.shuffle ? UI_GRAPHICS.shuffleOn : UI_GRAPHICS.shuffleOff,
      `Shuffle: ${state.shuffle ? 'on' : 'off'}`,
      `Shuffle ${state.shuffle ? 'on' : 'off'}`,
      state.shuffle
    );
    els.shuffleButton.classList.toggle('active', state.shuffle);
  }

  function syncRepeatGraphic() {
    const source = state.repeat === 'one' ? UI_GRAPHICS.repeatOne : state.repeat === 'all' ? UI_GRAPHICS.repeatAll : UI_GRAPHICS.repeatOff;
    const spokenState = state.repeat === 'one' ? 'one track' : state.repeat === 'all' ? 'all tracks' : 'off';
    setButtonGraphic(els.repeatButton, source, `Repeat: ${spokenState}`, `Repeat ${spokenState}`, state.repeat !== 'off');
    els.repeatButton.classList.toggle('active', state.repeat !== 'off');
  }

  function syncPlayPauseGraphic() {
    const playing = !audio.paused && !audio.ended;
    setButtonGraphic(els.playPauseButton, playing ? UI_GRAPHICS.pause : UI_GRAPHICS.play, playing ? 'Pause' : 'Play', playing ? 'Pause' : 'Play');
  }

  function syncVolumeGraphic() {
    if (!els.volumeGraphic) return;
    const volume = requestedVolume();
    const source = volume <= 0.34 ? UI_GRAPHICS.volumeLow : volume <= 0.67 ? UI_GRAPHICS.volumeMedium : UI_GRAPHICS.volumeLoud;
    if (els.volumeGraphic.getAttribute('src') !== source) els.volumeGraphic.src = source;
    els.volumeGraphic.alt = volume === 0 ? 'Volume muted' : `Volume ${Math.round(volume * 100)} percent`;
  }

  function bindEvents() {
    els.mobileMenuButton?.addEventListener('click', () => {
      const open = !document.body.classList.contains('drawer-open');
      setDrawer(open, false);
      if (open) requestAnimationFrame(() => focusElement(els.closeDrawerButton));
    });
    els.closeDrawerButton?.addEventListener('click', () => setDrawer(false));
    els.drawerScrim?.addEventListener('click', () => setDrawer(false));
    els.mobileManageButton?.addEventListener('click', openMobileManage);
    document.querySelectorAll('[data-mobile-view]').forEach((button) => button.addEventListener('click', () => { showView(button.dataset.mobileView); setDrawer(false); }));
    els.requestPersistenceButton?.addEventListener('click', () => updatePersistenceStatus(true));
    els.installButton?.addEventListener('click', handleInstallRequest);
    els.donationButton.addEventListener('click', openDonation);
    els.closeDonationButton.addEventListener('click', closeDonation);
    els.donationOkayButton.addEventListener('click', showDonationLinks);
    els.donationDialog.addEventListener('click', (event) => { if (event.target === els.donationDialog) closeDonation(); });
    els.settingsButton.addEventListener('click', openSettings);
    els.closeSettingsButton.addEventListener('click', closeSettings);
    els.doneSettingsButton.addEventListener('click', closeSettings);
    els.settingsDialog.addEventListener('click', (event) => { if (event.target === els.settingsDialog) closeSettings(); });
    els.quickGuideButton.addEventListener('click', openQuickGuide);
    els.closeQuickGuideButton.addEventListener('click', closeQuickGuide);
    els.doneQuickGuideButton.addEventListener('click', closeQuickGuide);
    els.quickGuideDialog.addEventListener('click', (event) => { if (event.target === els.quickGuideDialog) closeQuickGuide(); });
    [
      els.accentHueSlider, els.accentBrightnessSlider, els.accentSaturationSlider,
      els.graphicsHueSlider, els.graphicsBrightnessSlider, els.graphicsSaturationSlider,
      els.textHueSlider, els.textBrightnessSlider, els.textSaturationSlider,
      els.interfaceScaleSlider, els.graphicsScaleSlider, els.textScaleSlider, els.zoomSlider
    ].forEach((slider) => slider.addEventListener('input', handleSettingInput));
    els.resetSettingsButton.addEventListener('click', () => { applyInterfaceSettings(DEFAULT_INTERFACE_SETTINGS, true); showToast('Interface settings restored.'); });
    els.manageDockToggle.addEventListener('click', () => toggleManage());
    document.querySelectorAll('.manage-tab').forEach((button) => button.addEventListener('click', () => {
      state.manageType = button.dataset.manageType;
      state.manageSelected.clear();
      document.querySelectorAll('.manage-tab').forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      renderManageItems();
    }));
    els.selectAllManageButton.addEventListener('click', () => { const groups = manageGroups(); if (groups.length && state.manageSelected.size === groups.length) state.manageSelected.clear(); else groups.forEach((group) => state.manageSelected.add(group.id)); renderManageItems(); });
    els.deleteSelectedButton.addEventListener('click', deleteManagedSelection);
    els.confirmYesButton.addEventListener('click', () => finishConfirmation(true));
    els.confirmNoButton.addEventListener('click', () => finishConfirmation(false));
    els.confirmDialog.addEventListener('click', (event) => { if (event.target === els.confirmDialog) finishConfirmation(false); });
    els.folderPicker.addEventListener('change', (e) => importFiles(e.target.files));
    els.filePicker.addEventListener('change', (e) => importFiles(e.target.files));
    els.searchInput.addEventListener('input', () => { state.search = els.searchInput.value.trim().toLowerCase(); renderArtists(); renderAlbums(); renderTracks(); renderPlaylists(); });
    document.querySelectorAll('.nav-button').forEach((button) => button.addEventListener('click', () => {
      const view = button.dataset.view;
      showView(view);
      if (mobileLayout.matches) setDrawer(false);
    }));
    els.closeAlbumButton.addEventListener('click', closeAlbum);
    els.playAllButton.addEventListener('click', () => { const tracks = filteredTracks(); if (tracks.length) playTrack(tracks[0], tracks); });
    els.createPlaylistForm.addEventListener('submit', (event) => {
      event.preventDefault(); const name = uniquePlaylistName(els.playlistNameInput.value);
      if (!name) { showToast('Enter a unique playlist name.'); return; }
      const playlist = { id: stableId([name, String(Date.now()), String(Math.random())]), name, trackIds: [], createdAt: Date.now() };
      state.playlists.push(playlist); savePlaylists(); els.playlistNameInput.value = ''; renderPlaylists(); renderCounts(); openPlaylist(playlist.id);
    });
    els.closePlaylistButton.addEventListener('click', closePlaylist);
    els.playPlaylistButton.addEventListener('click', () => { const playlist = getPlaylist(state.selectedPlaylistId); const tracks = playlistTracks(playlist); if (tracks.length) playTrack(tracks[0], tracks, { type: 'playlist', id: playlist.id }); });
    els.queuePlaylistButton.addEventListener('click', () => { const tracks = playlistTracks(getPlaylist(state.selectedPlaylistId)); if (tracks.length) addToQueue(tracks); });
    els.renamePlaylistButton.addEventListener('click', () => { const playlist = getPlaylist(state.selectedPlaylistId); if (!playlist || playlist.id === LOVED_PLAYLIST_ID) return; const name = window.prompt('Rename playlist:', playlist.name); if (name == null) return; const clean = uniquePlaylistName(name, playlist.id); if (!clean) { showToast('Enter a unique playlist name.'); return; } playlist.name = clean; savePlaylists(); renderPlaylists(); renderPlaylistDetail(); });
    els.deletePlaylistButton.addEventListener('click', async () => { const playlist = getPlaylist(state.selectedPlaylistId); if (!playlist || playlist.id === LOVED_PLAYLIST_ID) return; if (!(await askConfirmation(`Delete playlist “${playlist.name}”? The music files will remain in your library.`))) return; state.playlists = state.playlists.filter((item) => item.id !== playlist.id); savePlaylists(); closePlaylist(); renderPlaylists(); renderCounts(); });

    els.clearQueueButton.addEventListener('click', () => { state.queue = []; state.queueIndex = -1; renderQueue(); });
    els.playAlbumButton.addEventListener('click', () => { const a = state.albums.find((x) => x.id === state.selectedAlbumId); if (a?.tracks.length) playTrack(a.tracks[0], a.tracks, { type: 'album', id: a.id }); });
    els.queueAlbumButton.addEventListener('click', () => { const a = state.albums.find((x) => x.id === state.selectedAlbumId); if (a) addToQueue(a.tracks); });
    els.deleteAlbumButton.addEventListener('click', async () => {
      const album = state.albums.find((x) => x.id === state.selectedAlbumId);
      if (!album || !(await askConfirmation(`Are you sure you want to delete “${album.title}” from this browser library?`))) return;
      await deleteTracks(album.tracks.map((t) => t.id));
      closeAlbum();
      await loadLibrary();
      showToast('Album deleted.');
      updateStorageEstimate();
    });
    els.clearLibraryButton.addEventListener('click', async () => {
      if (!state.tracks.length || !(await askConfirmation('Are you sure you want to clear the entire local library and playback queue?'))) return;
      audio.pause();
      await clearDatabase();
      state.queue = []; state.queueIndex = -1; state.currentTrack = null;
      await loadLibrary();
      showToast('Library cleared.');
      updateStorageEstimate();
    });

    els.playPauseButton.addEventListener('click', () => {
      if (!audio.src) { const first = filteredTracks()[0]; if (first) playTrack(first, filteredTracks()); return; }
      audio.paused ? audio.play() : audio.pause();
    });
    els.nextButton.addEventListener('click', () => nextTrack(true));
    els.previousButton.addEventListener('click', previousTrack);
    els.addCurrentToQueueButton.addEventListener('click', openAddMenu);
    els.closeAddMenuButton.addEventListener('click', closeAddMenu);
    els.addMenuDialog.addEventListener('click', (event) => { if (event.target === els.addMenuDialog) closeAddMenu(); });
    els.addMenuQueueButton.addEventListener('click', () => { addToQueue([state.currentTrack]); closeAddMenu(); });
    els.addMenuNewPlaylistButton.addEventListener('click', () => createPlaylistForTrack(state.currentTrack));
    els.addMenuPlaylistButton.addEventListener('click', () => {
      const open = els.addMenuPlaylistList.classList.toggle('hidden') === false;
      els.addMenuPlaylistButton.setAttribute('aria-expanded', String(open));
      if (open) focusElement(els.addMenuPlaylistList.querySelector('button'));
    });
    els.addMenuLovedButton.addEventListener('click', () => { if (addTrackToPlaylist(state.currentTrack)) closeAddMenu(); });
    els.loveCurrentButton.addEventListener('click', toggleCurrentTrackLoved);
    els.shuffleButton.addEventListener('click', () => { state.shuffle = !state.shuffle; syncShuffleGraphic(); });
    els.repeatButton.addEventListener('click', () => {
      state.repeat = state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off';
      syncRepeatGraphic();
    });
    els.seekBar.addEventListener('input', () => { if (audio.duration) audio.currentTime = (Number(els.seekBar.value) / 1000) * audio.duration; });
    els.volumeBar.addEventListener('input', async () => {
      applyVolume();
      setSetting('volume', requestedVolume());
    });
    els.showQueueButton.addEventListener('click', () => { toggleLyrics(false); showView('queue'); });
    els.showLyricsButton.addEventListener('click', () => toggleLyrics());
    els.playerCover.addEventListener('click', () => toggleLyrics(true));
    els.toggleLyricsButton.addEventListener('click', () => toggleLyrics(false));
    els.lyricsPanel.addEventListener('click', (event) => { if (event.target === els.lyricsPanel) toggleLyrics(false); });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!els.quickGuideDialog.classList.contains('hidden')) { closeQuickGuide(); return; }
      if (!els.addMenuDialog.classList.contains('hidden')) { closeAddMenu(); return; }
      if (!els.donationDialog.classList.contains('hidden')) { closeDonation(); return; }
      if (!els.settingsDialog.classList.contains('hidden')) { closeSettings(); return; }
      toggleLyrics(false);
      if (!els.confirmDialog.classList.contains('hidden')) finishConfirmation(false);
      else if (document.body.classList.contains('drawer-open')) setDrawer(false);
    });

    if (mobileLayout.addEventListener) mobileLayout.addEventListener('change', syncDrawerForViewport);
    else mobileLayout.addListener?.(syncDrawerForViewport);
    window.addEventListener('orientationchange', () => setTimeout(syncDrawerForViewport, 0));

    audio.addEventListener('play', () => { syncPlayPauseGraphic(); if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'; });
    audio.addEventListener('pause', () => { syncPlayPauseGraphic(); if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'; });
    audio.addEventListener('volumechange', syncVolumeGraphic);
    audio.addEventListener('loadedmetadata', () => { els.durationTime.textContent = formatTime(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      els.currentTime.textContent = formatTime(audio.currentTime);
      els.seekBar.value = audio.duration ? Math.round((audio.currentTime / audio.duration) * 1000) : 0;
      syncLyrics(audio.currentTime);
      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && Number.isFinite(audio.duration) && audio.duration > 0) {
        try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, audio.duration) }); } catch {}
      }
    });
    audio.addEventListener('ended', () => nextTrack(false));
    audio.addEventListener('error', () => showToast('This audio file could not be played.'));

    window.addEventListener('beforeunload', () => {
      if (state.currentObjectUrl) URL.revokeObjectURL(state.currentObjectUrl);
      document.querySelectorAll('[data-object-url]').forEach((el) => URL.revokeObjectURL(el.dataset.objectUrl));
    });
  }

  async function init() {
    try {
      state.db = await openDatabase();
      const savedAppearance = await getSetting('interfaceAppearance', DEFAULT_INTERFACE_SETTINGS);
      applyInterfaceSettings(savedAppearance, false);
      const savedVolume = await getSetting('volume', 0.85);
      els.volumeBar.value = savedVolume;
      audio.volume = savedVolume;
      syncShuffleGraphic();
      syncRepeatGraphic();
      syncPlayPauseGraphic();
      syncVolumeGraphic();
    syncLoveButton();
      bindEvents();
      syncDrawerForViewport();
      configureMediaSession();
      configureMobileImportCapabilities();
    registerPWA();
      await loadLibrary();
      updateStorageEstimate();
      updatePersistenceStatus(false);
      setStatus('Ready');
      if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
    } catch (error) {
      console.error(error);
      setStatus('Storage unavailable');
      showToast('IndexedDB could not be opened in this browser.');
    }
  }

  init();
})();
