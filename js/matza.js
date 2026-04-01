// ============================================================
// מצת שלום — שלח מצת שלום בין העמים
// ============================================================

const MATZA_VIDEOS = [
  { id: 'matza-1', src: 'media/matza-1.mp4', label: 'מצה קלאסית' },
  { id: 'matza-2', src: 'media/matza-2.mp4', label: 'מצה באביב' },
  { id: 'matza-3', src: 'media/matza-3.mp4', label: 'מצה מסתובבת' },
  { id: 'matza-4', src: 'media/matza-4.mp4', label: 'מצה חגיגית' },
]

const EMOJI_CATEGORIES = {
  'שלום ואהבה': ['🕊️','☮️','❤️','💕','🫂','🤗','💝','🌈','💖','🤍','💛','🩷'],
  'טבע ופרחים': ['🌸','🌺','🌻','🌷','🌹','🫒','🌿','🍃','🌼','🪻','🌾','🪷'],
  'פסח ויהדות': ['✡️','🕎','🍷','📖','🫓','🕯️','🔯','📜'],
  'חגיגה': ['🎉','🎊','✨','🌟','⭐','🎆','🎇','🔥','🥳','💫','🪄','🎈'],
  'סמלים': ['🇮🇱','🏳️','🤝','👐','🙏','✌️','🫶','👋','🙌','💪'],
}

const BLESSING_PRESETS = {
  he: { label: 'עברית', rtl: true, blessings: [
    'חג פסח שמח! שנזכה לשלום',
    'פסח של חירות ואהבה',
    'חג שמח מכל הלב',
    'שנזכה לחירות ולשלום אמיתי',
    'חג פסח כשר ושמח!',
    'שלום לכולם, חג שמח!',
  ]},
  en: { label: 'English', rtl: false, blessings: [
    'Happy Passover! Wishing you peace',
    'Freedom and love this Pesach',
    'Peace to all, Happy Passover!',
    'May this Pesach bring freedom',
  ]},
  fa: { label: 'فارسی', rtl: true, blessings: [
    'عید پسح مبارک! آرزوی صلح برای همه',
    'صلح و آزادی برای همه مردم',
    'عید مبارک! با آرزوی صلح جهانی',
  ]},
  ar: { label: 'العربية', rtl: true, blessings: [
    'عيد فصح سعيد! نتمنى السلام للجميع',
    'السلام والحرية للجميع',
    'كل عام وأنتم بخير، عيد سعيد',
  ]},
  yi: { label: 'ייִדיש', rtl: true, blessings: [
    'אַ פֿרייליכן פּסח! שלום אויף דער וועלט',
    'אַ כּשרן און פֿרייליכן פּסח',
    'זאָל זײַן שלום פֿאַר אַלעמען',
  ]},
}

// ---- State ----
let matzaState = {
  videoId: 'matza-1',
  emojis: [],
  texts: [],          // [{text, lang, x, y, size, color}]
  activeTextIdx: -1,  // index of currently selected text for editing
  currentLang: 'he',  // language tab for adding new text
  isRecording: false,
  dragging: null,
  dragOffset: { x: 0, y: 0 },
}

let _matzaCanvas = null
let _matzaCtx = null
let _matzaVideo = null
let _matzaAnimFrame = null

// ---- Canvas ----

function initMatzaCanvas() {
  _matzaCanvas = document.getElementById('matza-canvas')
  _matzaCtx = _matzaCanvas.getContext('2d')
  _matzaVideo = document.getElementById('matza-video')

  resizeMatzaCanvas()
  window.addEventListener('resize', resizeMatzaCanvas)

  _matzaVideo.addEventListener('canplay', () => {
    _matzaVideo.play().catch(() => {})
    if (!_matzaAnimFrame) drawMatzaFrame()
  })

  _matzaVideo.addEventListener('loadeddata', () => {
    _matzaVideo.play().catch(() => {})
    if (!_matzaAnimFrame) drawMatzaFrame()
  })

  // Touch/mouse events for emoji dragging
  _matzaCanvas.addEventListener('pointerdown', onMatzaPointerDown)
  _matzaCanvas.addEventListener('pointermove', onMatzaPointerMove)
  _matzaCanvas.addEventListener('pointerup', onMatzaPointerUp)
  _matzaCanvas.addEventListener('dblclick', onMatzaDblClick)
  _matzaCanvas.style.touchAction = 'none'

  _matzaVideo.load()
}

function resizeMatzaCanvas() {
  if (!_matzaCanvas) return
  const container = _matzaCanvas.parentElement
  const w = Math.min(container.clientWidth, 360)
  // Story aspect ratio 9:16
  _matzaCanvas.width = w
  _matzaCanvas.height = Math.round(w * (16 / 9))
}

function drawMatzaFrame() {
  if (!_matzaCtx || !_matzaCanvas) return
  const ctx = _matzaCtx
  const w = _matzaCanvas.width
  const h = _matzaCanvas.height

  // Draw video frame (cover mode — preserve aspect ratio, crop to fill)
  if (_matzaVideo && _matzaVideo.readyState >= 2) {
    const vw = _matzaVideo.videoWidth
    const vh = _matzaVideo.videoHeight
    const canvasRatio = w / h
    const videoRatio = vw / vh
    let sx = 0, sy = 0, sw = vw, sh = vh
    if (videoRatio > canvasRatio) {
      sw = vh * canvasRatio
      sx = (vw - sw) / 2
    } else {
      sh = vw / canvasRatio
      sy = (vh - sh) / 2
    }
    ctx.drawImage(_matzaVideo, sx, sy, sw, sh, 0, 0, w, h)
  } else {
    ctx.fillStyle = '#F5E6C8'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#8B7355'
    ctx.font = '48px Rubik'
    ctx.textAlign = 'center'
    ctx.fillText('🫓', w / 2, h / 2)
  }

  // Draw emojis
  matzaState.emojis.forEach(e => {
    ctx.font = e.size + 'px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(e.emoji, e.x * w, e.y * h)
  })

  // Draw all texts
  matzaState.texts.forEach((t, idx) => {
    if (!t.text) return
    const lang = BLESSING_PRESETS[t.lang]
    const isRtl = lang ? lang.rtl : true
    const fontSize = t.size * (w / 540)
    ctx.font = '700 ' + fontSize + 'px Rubik, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction = isRtl ? 'rtl' : 'ltr'

    const tx = t.x * w
    const ty = t.y * h

    ctx.strokeStyle = 'rgba(0,0,0,0.7)'
    ctx.lineWidth = Math.max(3, fontSize / 8)
    ctx.lineJoin = 'round'

    const lines = wrapText(ctx, t.text, w * 0.85)
    const lineH = fontSize * 1.3
    const startY = ty - ((lines.length - 1) * lineH) / 2

    lines.forEach((line, i) => {
      const ly = startY + i * lineH
      ctx.strokeText(line, tx, ly)
      ctx.fillStyle = t.color
      ctx.fillText(line, tx, ly)
    })

    // Draw selection indicator for active text in edit mode
    if (idx === matzaState.activeTextIdx) {
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      const boxW = Math.max(...lines.map(l => ctx.measureText(l).width)) + 16
      const boxH = lines.length * lineH + 12
      ctx.strokeRect(tx - boxW / 2, startY - lineH / 2 - 6, boxW, boxH)
      ctx.setLineDash([])
    }

    ctx.direction = 'ltr'
  })

  _matzaAnimFrame = requestAnimationFrame(drawMatzaFrame)
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

// ---- Pointer events (drag emojis) ----

function canvasCoords(e) {
  const rect = _matzaCanvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) / rect.width,
    y: (e.clientY - rect.top) / rect.height,
  }
}

function hitTestEmoji(px, py) {
  const w = _matzaCanvas.width
  for (let i = matzaState.emojis.length - 1; i >= 0; i--) {
    const e = matzaState.emojis[i]
    const r = (e.size / w) * 0.6
    if (Math.abs(px - e.x) < r && Math.abs(py - e.y) < r) return i
  }
  return -1
}

function hitTestText(px, py) {
  const w = _matzaCanvas.width
  const h = _matzaCanvas.height
  for (let i = matzaState.texts.length - 1; i >= 0; i--) {
    const t = matzaState.texts[i]
    if (!t.text) continue
    const fontSize = t.size * (w / 540)
    const textW = Math.min(0.85, t.text.length * fontSize * 0.6 / w)
    const textH = fontSize * 1.5 / h
    if (Math.abs(px - t.x) < Math.max(0.15, textW / 2) && Math.abs(py - t.y) < Math.max(0.05, textH)) {
      return i
    }
  }
  return -1
}

function onMatzaPointerDown(e) {
  const p = canvasCoords(e)
  // Check emojis first (on top), then texts
  const eidx = hitTestEmoji(p.x, p.y)
  if (eidx >= 0) {
    matzaState.dragging = { type: 'emoji', idx: eidx }
    matzaState.dragOffset = {
      x: p.x - matzaState.emojis[eidx].x,
      y: p.y - matzaState.emojis[eidx].y,
    }
    _matzaCanvas.setPointerCapture(e.pointerId)
    e.preventDefault()
    return
  }
  const tidx = hitTestText(p.x, p.y)
  if (tidx >= 0) {
    matzaState.dragging = { type: 'text', idx: tidx }
    matzaState.activeTextIdx = tidx
    matzaState.dragOffset = {
      x: p.x - matzaState.texts[tidx].x,
      y: p.y - matzaState.texts[tidx].y,
    }
    matzaUpdateTextUI()
    _matzaCanvas.setPointerCapture(e.pointerId)
    e.preventDefault()
  }
}

function onMatzaPointerMove(e) {
  if (matzaState.dragging === null) return
  const p = canvasCoords(e)
  const d = matzaState.dragging
  if (d.type === 'text') {
    const t = matzaState.texts[d.idx]
    t.x = Math.max(0.1, Math.min(0.9, p.x - matzaState.dragOffset.x))
    t.y = Math.max(0.05, Math.min(0.95, p.y - matzaState.dragOffset.y))
  } else {
    const em = matzaState.emojis[d.idx]
    em.x = Math.max(0.05, Math.min(0.95, p.x - matzaState.dragOffset.x))
    em.y = Math.max(0.05, Math.min(0.95, p.y - matzaState.dragOffset.y))
  }
  e.preventDefault()
}

function onMatzaPointerUp(e) {
  matzaState.dragging = null
}

function onMatzaDblClick(e) {
  const p = canvasCoords(e)
  const eidx = hitTestEmoji(p.x, p.y)
  if (eidx >= 0) {
    matzaState.emojis.splice(eidx, 1)
    track('matza_emoji_remove')
    return
  }
  const tidx = hitTestText(p.x, p.y)
  if (tidx >= 0) {
    matzaState.texts.splice(tidx, 1)
    if (matzaState.activeTextIdx >= matzaState.texts.length) {
      matzaState.activeTextIdx = matzaState.texts.length - 1
    }
    matzaUpdateTextUI()
    renderMatzaTextList()
    track('matza_text_remove')
  }
}

// ---- Emoji picker ----

function matzaAddEmoji(emoji) {
  matzaState.emojis.push({
    emoji,
    x: 0.3 + Math.random() * 0.4,
    y: 0.2 + Math.random() * 0.4,
    size: 48,
  })
  track('matza_emoji_add', { emoji })
}

function matzaChangeEmojiSize(delta) {
  // Change size of last added emoji
  if (matzaState.emojis.length === 0) return
  const last = matzaState.emojis[matzaState.emojis.length - 1]
  last.size = Math.max(20, Math.min(120, last.size + delta))
}

function matzaClearEmojis() {
  matzaState.emojis = []
}

// ---- Text (multi-text support) ----

function matzaAddText(text, lang) {
  lang = lang || matzaState.currentLang
  // Position each new text at a different y
  const yPositions = [0.85, 0.15, 0.50, 0.30, 0.70]
  const y = yPositions[matzaState.texts.length % yPositions.length]
  matzaState.texts.push({
    text: text,
    lang: lang,
    x: 0.5,
    y: y,
    size: 28,
    color: '#FFFFFF',
  })
  matzaState.activeTextIdx = matzaState.texts.length - 1
  matzaUpdateTextUI()
  renderMatzaTextList()
  track('matza_text_add', { lang })
}

function matzaUpdateActiveText(text) {
  const idx = matzaState.activeTextIdx
  if (idx >= 0 && idx < matzaState.texts.length) {
    matzaState.texts[idx].text = text
  }
}

function matzaSelectText(idx) {
  matzaState.activeTextIdx = idx
  matzaUpdateTextUI()
}

function matzaUpdateTextUI() {
  const idx = matzaState.activeTextIdx
  const input = document.getElementById('matza-text-input')
  const colorInput = document.getElementById('matza-text-color')
  const sizeInput = document.getElementById('matza-text-size')
  if (idx >= 0 && idx < matzaState.texts.length) {
    const t = matzaState.texts[idx]
    if (input) input.value = t.text
    if (colorInput) colorInput.value = t.color
    if (sizeInput) sizeInput.value = t.size
  } else {
    if (input) input.value = ''
    if (colorInput) colorInput.value = '#FFFFFF'
    if (sizeInput) sizeInput.value = 28
  }
}

function matzaSetActiveColor(color) {
  const idx = matzaState.activeTextIdx
  if (idx >= 0 && idx < matzaState.texts.length) {
    matzaState.texts[idx].color = color
  }
}

function matzaSetActiveSize(size) {
  const idx = matzaState.activeTextIdx
  if (idx >= 0 && idx < matzaState.texts.length) {
    matzaState.texts[idx].size = parseInt(size)
  }
}

function matzaRemoveText(idx) {
  matzaState.texts.splice(idx, 1)
  if (matzaState.activeTextIdx >= matzaState.texts.length) {
    matzaState.activeTextIdx = matzaState.texts.length - 1
  }
  matzaUpdateTextUI()
  renderMatzaTextList()
}

function matzaSetLang(lang) {
  matzaState.currentLang = lang
  renderMatzaPresets()
}

function renderMatzaPresets() {
  const container = document.getElementById('matza-presets')
  if (!container) return
  const lang = BLESSING_PRESETS[matzaState.currentLang]
  if (!lang) return

  document.querySelectorAll('.matza-lang-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.lang === matzaState.currentLang)
  })

  container.innerHTML = lang.blessings.map(b =>
    `<button class="matza-preset-btn" onclick="matzaAddText('${b.replace(/'/g, "\\'")}', '${matzaState.currentLang}')">${b}</button>`
  ).join('')
}

function renderMatzaTextList() {
  const container = document.getElementById('matza-text-list')
  if (!container) return
  if (matzaState.texts.length === 0) {
    container.innerHTML = '<p style="font-size:.8rem;color:#999;text-align:center;">לחצו על ברכה או כתבו משלכם</p>'
    return
  }
  container.innerHTML = matzaState.texts.map((t, i) => {
    const langLabel = BLESSING_PRESETS[t.lang] ? BLESSING_PRESETS[t.lang].label : t.lang
    const isActive = i === matzaState.activeTextIdx
    return `<div class="matza-text-item ${isActive ? 'matza-text-item--active' : ''}" onclick="matzaSelectText(${i})">
      <span class="matza-text-item__lang">${langLabel}</span>
      <span class="matza-text-item__text">${t.text.length > 30 ? t.text.slice(0, 30) + '...' : t.text}</span>
      <button class="matza-text-item__remove" onclick="event.stopPropagation();matzaRemoveText(${i})">✕</button>
    </div>`
  }).join('')
}

// ---- Video export ----

async function matzaRecord() {
  if (matzaState.isRecording) return
  if (!_matzaCanvas || !HTMLCanvasElement.prototype.captureStream) {
    matzaDownloadImage()
    return
  }

  matzaState.isRecording = true
  const btn = document.getElementById('matza-record-btn')
  if (btn) { btn.textContent = '🔴 מקליט...'; btn.disabled = true }

  track('matza_record_start')

  const stream = _matzaCanvas.captureStream(30)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 })
  const chunks = []

  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'matzat-shalom.webm'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    matzaState.isRecording = false
    if (btn) { btn.textContent = '🎬 הורד סרטון'; btn.disabled = false }
    track('matza_record_complete')
  }

  // Reset video to start for clean loop
  if (_matzaVideo) { _matzaVideo.currentTime = 0 }
  recorder.start()
  setTimeout(() => recorder.stop(), 6000)
}

function matzaSwitchVideo(videoId) {
  const vid = MATZA_VIDEOS.find(v => v.id === videoId)
  if (!vid || !_matzaVideo) return
  matzaState.videoId = videoId
  _matzaVideo.src = vid.src
  _matzaVideo.load()
  _matzaVideo.play().catch(() => {})
  // Update picker UI
  document.querySelectorAll('.matza-video-thumb').forEach(t => {
    t.classList.toggle('active', t.dataset.id === videoId)
  })
  track('matza_video_switch', { video: videoId })
}

function matzaDownloadImage() {
  if (!_matzaCanvas) return
  const url = _matzaCanvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'matzat-shalom.png'
  a.click()
  track('matza_download_image')
}

// ---- Shareable link ----

function matzaEncodeTexts() {
  // Format: text|lang|x|y|size|color;text|lang|x|y|size|color
  return matzaState.texts.map(t =>
    encodeURIComponent(t.text) + '|' + t.lang + '|' + t.x.toFixed(2) + '|' + t.y.toFixed(2) + '|' + t.size + '|' + encodeURIComponent(t.color)
  ).join(';')
}

function matzaDecodeTexts(str) {
  return str.split(';').map(s => {
    const [text, lang, x, y, size, color] = s.split('|')
    return {
      text: decodeURIComponent(text),
      lang: lang || 'he',
      x: parseFloat(x) || 0.5,
      y: parseFloat(y) || 0.85,
      size: parseInt(size) || 28,
      color: color ? decodeURIComponent(color) : '#FFFFFF',
    }
  }).filter(t => t.text)
}

function matzaGenerateViewLink() {
  const params = new URLSearchParams()
  params.set('m', 'view')
  params.set('v', matzaState.videoId)
  if (matzaState.texts.length) {
    params.set('txt', matzaEncodeTexts())
  }
  if (matzaState.emojis.length) {
    const enc = matzaState.emojis.map(e =>
      e.emoji + ',' + e.x.toFixed(2) + ',' + e.y.toFixed(2) + ',' + e.size
    ).join(';')
    params.set('e', enc)
  }
  return location.origin + location.pathname + '#/shalom-matza?' + params.toString()
}

function matzaParseParams() {
  const hash = location.hash
  const qIdx = hash.indexOf('?')
  if (qIdx === -1) return false
  const params = new URLSearchParams(hash.slice(qIdx + 1))

  if (params.get('v')) matzaState.videoId = params.get('v')

  // New multi-text format
  if (params.get('txt')) {
    matzaState.texts = matzaDecodeTexts(params.get('txt'))
  }
  // Backwards compat: old single-text format
  else if (params.get('t')) {
    matzaState.texts = [{
      text: params.get('t'),
      lang: params.get('tl') || 'he',
      x: parseFloat(params.get('tx')) || 0.5,
      y: parseFloat(params.get('ty')) || 0.85,
      size: parseInt(params.get('ts')) || 28,
      color: params.get('tc') || '#FFFFFF',
    }]
  }

  if (params.get('e')) {
    matzaState.emojis = params.get('e').split(';').map(s => {
      const [emoji, x, y, size] = s.split(',')
      return { emoji, x: parseFloat(x), y: parseFloat(y), size: parseInt(size) }
    }).filter(e => e.emoji && !isNaN(e.x))
  }
  return params.get('m') === 'view'
}

// ---- Save to localStorage for admin ----

function matzaSaveCreation() {
  const creations = JSON.parse(localStorage.getItem('matza_creations') || '[]')
  const allTexts = matzaState.texts.map(t => t.text).join(' | ')
  const langs = [...new Set(matzaState.texts.map(t => t.lang))].join(',')
  creations.push({
    date: new Date().toISOString(),
    videoId: matzaState.videoId,
    text: allTexts,
    textLang: langs,
    emojis: matzaState.emojis.length,
    link: matzaGenerateViewLink(),
  })
  localStorage.setItem('matza_creations', JSON.stringify(creations))
}

function matzaCopyLink() {
  const url = matzaGenerateViewLink()
  matzaSaveCreation()
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('matza-copy-btn')
    if (btn) { btn.textContent = '✅ הועתק!'; setTimeout(() => btn.textContent = '🔗 העתק לינק', 2000) }
  })
  track('matza_share_link')
}

// ---- Sharing ----

async function matzaShareNative() {
  const url = matzaGenerateViewLink()
  matzaSaveCreation()
  track('matza_share_native')
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'מצת שלום! 🫓🕊️',
        text: (matzaState.texts.length ? matzaState.texts[0].text : '') || 'מצת שלום בין העמים — חג פסח שמח!',
        url,
      })
    } catch (e) { /* user cancelled */ }
  } else {
    matzaCopyLink()
  }
}

function matzaShareWhatsApp() {
  const url = matzaGenerateViewLink()
  matzaSaveCreation()
  const shareText = matzaState.texts.length ? matzaState.texts[0].text : 'מצת שלום בין העמים! 🫓🕊️'
  const text = encodeURIComponent(shareText + '\n' + url)
  window.open('https://wa.me/?text=' + text, '_blank')
  track('matza_share_whatsapp')
}

// ---- Render ----

function renderMatzaPage() {
  track('matza_page_view')
  document.title = 'מצת שלום 🫓🕊️ | הבלוג של ירין'

  // Stop previous animation if any
  if (_matzaAnimFrame) { cancelAnimationFrame(_matzaAnimFrame); _matzaAnimFrame = null }

  // Reset state for fresh page
  matzaState.texts = []
  matzaState.emojis = []
  matzaState.activeTextIdx = -1

  // Parse shared params — returns true if view mode
  const isViewMode = matzaParseParams()
  if (isViewMode) { renderMatzaViewPage(); return }

  const videoSrc = (MATZA_VIDEOS.find(v => v.id === matzaState.videoId) || MATZA_VIDEOS[0]).src

  // Emoji picker HTML
  let emojiPickerHTML = ''
  for (const [cat, emojis] of Object.entries(EMOJI_CATEGORIES)) {
    emojiPickerHTML += `<div class="matza-emoji-cat">
      <h4 class="matza-emoji-cat__title">${cat}</h4>
      <div class="matza-emoji-cat__grid">${emojis.map(e =>
        `<button class="matza-emoji-btn" onclick="matzaAddEmoji('${e}')">${e}</button>`
      ).join('')}</div>
    </div>`
  }

  // Language tabs
  const langTabsHTML = Object.entries(BLESSING_PRESETS).map(([code, lang]) =>
    `<button class="matza-lang-tab ${code === matzaState.currentLang ? 'active' : ''}" data-lang="${code}" onclick="matzaSetLang('${code}')">${lang.label}</button>`
  ).join('')

  document.getElementById('main-content').innerHTML = `
    <div class="matza-page">
      <header class="matza-hero">
        <div class="container">
          <h1 class="matza-hero__title">🫓 מצת שלום 🕊️</h1>
          <p class="matza-hero__sub">מצת שלום בין העמים ובין היהודים — כי מצה היא הדרך לשלום. מי לא מסכים על לחם?!<br/>
          <small>שלחו מצת שלום לחברים בעברית, אנגלית, פרסית, ערבית, ויידיש</small></p>
        </div>
      </header>

      <div class="container matza-workspace">
        <div class="matza-canvas-wrap">
          <canvas id="matza-canvas" class="matza-canvas"></canvas>
          <video id="matza-video" src="${videoSrc}" muted loop playsinline preload="auto" style="display:none"></video>
          <div class="matza-canvas-hint" id="matza-hint">
            <span>גררו אימוג׳ים וטקסטים על המצה</span>
            <small>לחצו פעמיים למחיקה</small>
          </div>
        </div>

        <div class="matza-controls">

          <div class="matza-section">
            <h3 class="matza-section__title">🎥 בחרו סרטון</h3>
            <div class="matza-video-picker">${MATZA_VIDEOS.map(v =>
              `<button class="matza-video-thumb ${v.id === matzaState.videoId ? 'active' : ''}" data-id="${v.id}" onclick="matzaSwitchVideo('${v.id}')">
                <video src="${v.src}" muted playsinline preload="metadata" class="matza-video-thumb__vid"></video>
                <span class="matza-video-thumb__label">${v.label}</span>
              </button>`
            ).join('')}</div>
          </div>

          <div class="matza-section">
            <h3 class="matza-section__title">🎨 הוסיפו אימוג׳ים</h3>
            <div class="matza-emoji-picker">${emojiPickerHTML}</div>
            <div class="matza-emoji-actions">
              <button class="matza-small-btn" onclick="matzaChangeEmojiSize(8)">🔍+ גדול</button>
              <button class="matza-small-btn" onclick="matzaChangeEmojiSize(-8)">🔍- קטן</button>
              <button class="matza-small-btn matza-small-btn--danger" onclick="matzaClearEmojis()">🗑️ נקה</button>
            </div>
          </div>

          <div class="matza-section">
            <h3 class="matza-section__title">✍️ כתבו ברכות (אפשר כמה שפות!)</h3>
            <div class="matza-lang-tabs">${langTabsHTML}</div>
            <div class="matza-presets" id="matza-presets"></div>
            <div style="display:flex;gap:6px;">
              <textarea id="matza-text-input" class="matza-text-input"
                placeholder="כתבו ברכה ולחצו +"
                oninput="matzaUpdateActiveText(this.value)"
                rows="2"></textarea>
              <button class="matza-small-btn" style="font-size:1.2rem;padding:8px 14px;align-self:stretch;background:#F59E0B;color:#fff;font-weight:700;"
                onclick="const inp=document.getElementById('matza-text-input');if(inp.value.trim()){matzaAddText(inp.value.trim());inp.value=''}">+</button>
            </div>
            <div id="matza-text-list" style="margin-top:.5rem;"></div>
            <div class="matza-text-options" id="matza-text-options">
              <label class="matza-color-label">צבע:
                <input type="color" id="matza-text-color" value="#FFFFFF"
                  onchange="matzaSetActiveColor(this.value)" class="matza-color-input" />
              </label>
              <label class="matza-size-label">גודל:
                <input type="range" id="matza-text-size" min="16" max="48" value="28"
                  oninput="matzaSetActiveSize(this.value)" class="matza-size-input" />
              </label>
            </div>
          </div>

          <div class="matza-section matza-actions">
            <h3 class="matza-section__title">📤 שתפו את המצה</h3>
            <div class="matza-action-btns">
              <button class="matza-action-btn matza-action-btn--record" id="matza-record-btn" onclick="matzaRecord()">
                🎬 הורד סרטון
              </button>
              <button class="matza-action-btn matza-action-btn--whatsapp" onclick="matzaShareWhatsApp()">
                💬 שלח בוואטסאפ
              </button>
              <button class="matza-action-btn matza-action-btn--share" onclick="matzaShareNative()">
                📱 שתף
              </button>
              <button class="matza-action-btn matza-action-btn--link" id="matza-copy-btn" onclick="matzaCopyLink()">
                🔗 העתק לינק
              </button>
            </div>
          </div>

        </div>
      </div>

      <div class="container matza-footer-note">
        <p>🕊️ מיזם שלום של <strong>ירין</strong> ו<strong>אלברטו מוסקטו</strong> — מצת שלום בין העמים, כי מי לא מסכים על לחם?!</p>
      </div>
    </div>`

  window.scrollTo(0, 0)
  initMatzaCanvas()
  renderMatzaPresets()
  renderMatzaTextList()

  // Hide hint after first emoji add
  const origAdd = matzaAddEmoji
  matzaAddEmoji = function(emoji) {
    const hint = document.getElementById('matza-hint')
    if (hint) hint.style.display = 'none'
    origAdd(emoji)
  }
}

function renderMatzaViewPage() {
  track('matza_view_page')
  document.title = 'מצת שלום 🫓🕊️ | הבלוג של ירין'
  matzaState.activeTextIdx = -1  // no selection in view mode

  const videoSrc = (MATZA_VIDEOS.find(v => v.id === matzaState.videoId) || MATZA_VIDEOS[0]).src

  document.getElementById('main-content').innerHTML = `
    <div class="matza-page">
      <header class="matza-hero">
        <div class="container">
          <h1 class="matza-hero__title">🫓 מצת שלום 🕊️</h1>
          <p class="matza-hero__sub">מישהו שלח לכם מצת שלום!</p>
        </div>
      </header>

      <div class="container" style="max-width:420px;margin:0 auto;padding:2rem 1rem;text-align:center;">
        <div class="matza-canvas-wrap" style="margin:0 auto;">
          <canvas id="matza-canvas" class="matza-canvas"></canvas>
          <video id="matza-video" src="${videoSrc}" muted loop playsinline preload="auto" style="display:none"></video>
        </div>

        ${matzaState.texts.length ? matzaState.texts.map(t =>
          `<p style="font-size:1.1rem;color:#92400E;font-weight:700;margin:.75rem 0 0;">״${t.text}״</p>`
        ).join('') : ''}

        <div style="display:flex;flex-direction:column;gap:10px;margin-top:1.5rem;">
          <button class="matza-action-btn matza-action-btn--record" onclick="matzaRecord()">🎬 הורד סרטון</button>
          <button class="matza-action-btn matza-action-btn--whatsapp" onclick="matzaShareWhatsApp()">💬 שתף בוואטסאפ</button>
          <a class="matza-action-btn" href="#/shalom-matza"
            style="background:linear-gradient(135deg,#F59E0B,#D97706);display:block;text-decoration:none;padding:14px 8px;border-radius:12px;font-size:1rem;font-weight:700;color:#fff;text-align:center;"
            onclick="track('matza_create_own_click')">
            🫓 צרו מצת שלום משלכם!
          </a>
        </div>

        <div class="matza-footer-note">
          <p>🕊️ מיזם שלום של <strong>ירין</strong> ו<strong>אלברטו מוסקטו</strong> — מצת שלום בין העמים, כי מי לא מסכים על לחם?!</p>
        </div>
      </div>
    </div>`

  window.scrollTo(0, 0)
  initMatzaCanvas()
}

function renderMatzaBanner() {
  return `
    <div class="matza-banner" role="button" tabindex="0"
      onclick="track('matza_banner_click');window.location.hash='#/shalom-matza'"
      onkeydown="if(event.key==='Enter')window.location.hash='#/shalom-matza'"
      aria-label="מצת שלום — שלחו מצת שלום בין העמים">
      <div class="matza-banner__emojis" aria-hidden="true">🫓 🕊️ ☮️ ❤️ 🫒 🌸 🕊️ 🫓</div>
      <div class="matza-banner__center">
        <p class="matza-banner__title">🫓 מצת שלום 🕊️</p>
        <p class="matza-banner__sub">מצת שלום בין העמים ובין היהודים — מי לא מסכים על לחם?!</p>
      </div>
      <div class="matza-banner__cta" aria-hidden="true">← צרו מצה</div>
    </div>`
}
