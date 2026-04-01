// ============================================================
// שלום-מצה — שלח מצה וירטואלית לחבר
// ============================================================

const MATZA_VIDEOS = [
  { id: 'matza-1', src: 'media/matza-1.mp4', label: 'מצה קלאסית' },
  { id: 'matza-2', src: 'media/matza-2.mp4', label: 'מצה באביב' },
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
  text: '',
  textLang: 'he',
  textSize: 28,
  textColor: '#FFFFFF',
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

  // Draw text
  if (matzaState.text) {
    const lang = BLESSING_PRESETS[matzaState.textLang]
    const isRtl = lang ? lang.rtl : true
    const fontSize = matzaState.textSize * (w / 540)
    ctx.font = '700 ' + fontSize + 'px Rubik, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction = isRtl ? 'rtl' : 'ltr'

    const tx = matzaState.textPosition.x * w
    const ty = matzaState.textPosition.y * h

    // Shadow/outline for readability
    ctx.strokeStyle = 'rgba(0,0,0,0.7)'
    ctx.lineWidth = Math.max(3, fontSize / 8)
    ctx.lineJoin = 'round'

    // Word wrap
    const lines = wrapText(ctx, matzaState.text, w * 0.85)
    const lineH = fontSize * 1.3
    const startY = ty - ((lines.length - 1) * lineH) / 2

    lines.forEach((line, i) => {
      const ly = startY + i * lineH
      ctx.strokeText(line, tx, ly)
      ctx.fillStyle = matzaState.textColor
      ctx.fillText(line, tx, ly)
    })

    ctx.direction = 'ltr' // reset
  }

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
  if (!matzaState.text) return false
  const tp = matzaState.textPosition
  const w = _matzaCanvas.width
  const h = _matzaCanvas.height
  const fontSize = matzaState.textSize * (w / 540)
  const textW = Math.min(0.85, matzaState.text.length * fontSize * 0.6 / w)
  const textH = fontSize * 1.5 / h
  return Math.abs(px - tp.x) < Math.max(0.15, textW / 2) && Math.abs(py - tp.y) < Math.max(0.05, textH)
}

function onMatzaPointerDown(e) {
  const p = canvasCoords(e)
  // Check emojis first (on top), then text
  const idx = hitTestEmoji(p.x, p.y)
  if (idx >= 0) {
    matzaState.dragging = idx
    matzaState.dragOffset = {
      x: p.x - matzaState.emojis[idx].x,
      y: p.y - matzaState.emojis[idx].y,
    }
    _matzaCanvas.setPointerCapture(e.pointerId)
    e.preventDefault()
  } else if (hitTestText(p.x, p.y)) {
    matzaState.dragging = 'text'
    matzaState.dragOffset = {
      x: p.x - matzaState.textPosition.x,
      y: p.y - matzaState.textPosition.y,
    }
    _matzaCanvas.setPointerCapture(e.pointerId)
    e.preventDefault()
  }
}

function onMatzaPointerMove(e) {
  if (matzaState.dragging === null) return
  const p = canvasCoords(e)
  if (matzaState.dragging === 'text') {
    matzaState.textPosition.x = Math.max(0.1, Math.min(0.9, p.x - matzaState.dragOffset.x))
    matzaState.textPosition.y = Math.max(0.05, Math.min(0.95, p.y - matzaState.dragOffset.y))
  } else {
    const em = matzaState.emojis[matzaState.dragging]
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
  const idx = hitTestEmoji(p.x, p.y)
  if (idx >= 0) {
    matzaState.emojis.splice(idx, 1)
    track('matza_emoji_remove')
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

// ---- Text ----

function matzaSetText(text) {
  matzaState.text = text
  const input = document.getElementById('matza-text-input')
  if (input && input.value !== text) input.value = text
  track('matza_text_set', { lang: matzaState.textLang })
}

function matzaSetLang(lang) {
  matzaState.textLang = lang
  renderMatzaPresets()
}

function renderMatzaPresets() {
  const container = document.getElementById('matza-presets')
  if (!container) return
  const lang = BLESSING_PRESETS[matzaState.textLang]
  if (!lang) return

  // Update tabs
  document.querySelectorAll('.matza-lang-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.lang === matzaState.textLang)
  })

  container.innerHTML = lang.blessings.map(b =>
    `<button class="matza-preset-btn" onclick="matzaSetText('${b.replace(/'/g, "\\'")}')">${b}</button>`
  ).join('')
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
    a.download = 'shalom-matza.webm'
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
  a.download = 'shalom-matza.png'
  a.click()
  track('matza_download_image')
}

// ---- Shareable link ----

function matzaGenerateLink() {
  const params = new URLSearchParams()
  params.set('v', matzaState.videoId)
  if (matzaState.text) {
    params.set('t', matzaState.text)
    params.set('tl', matzaState.textLang)
  }
  if (matzaState.textColor !== '#FFFFFF') params.set('tc', matzaState.textColor)
  if (matzaState.textSize !== 28) params.set('ts', matzaState.textSize)
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
  if (qIdx === -1) return
  const params = new URLSearchParams(hash.slice(qIdx + 1))

  if (params.get('v')) matzaState.videoId = params.get('v')
  if (params.get('t')) matzaState.text = params.get('t')
  if (params.get('tl')) matzaState.textLang = params.get('tl')
  if (params.get('tc')) matzaState.textColor = params.get('tc')
  if (params.get('ts')) matzaState.textSize = parseInt(params.get('ts'))
  if (params.get('e')) {
    matzaState.emojis = params.get('e').split(';').map(s => {
      const [emoji, x, y, size] = s.split(',')
      return { emoji, x: parseFloat(x), y: parseFloat(y), size: parseInt(size) }
    }).filter(e => e.emoji && !isNaN(e.x))
  }
}

function matzaCopyLink() {
  const url = matzaGenerateLink()
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('matza-copy-btn')
    if (btn) { btn.textContent = '✅ הועתק!'; setTimeout(() => btn.textContent = '🔗 העתק לינק', 2000) }
  })
  track('matza_share_link')
}

// ---- Sharing ----

async function matzaShareNative() {
  const url = matzaGenerateLink()
  track('matza_share_native')
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'שלום מצה! 🫓🕊️',
        text: matzaState.text || 'חג פסח שמח! שלח/י מצת שלום',
        url,
      })
    } catch (e) { /* user cancelled */ }
  } else {
    matzaCopyLink()
  }
}

function matzaShareWhatsApp() {
  const url = matzaGenerateLink()
  const text = encodeURIComponent((matzaState.text || 'חג פסח שמח! 🫓🕊️') + '\n' + url)
  window.open('https://wa.me/?text=' + text, '_blank')
  track('matza_share_whatsapp')
}

// ---- Render ----

function renderMatzaPage() {
  track('matza_page_view')
  document.title = 'שלום-מצה 🫓🕊️ | הבלוג של ירין'

  // Parse shared params if present
  matzaParseParams()

  // Stop previous animation if any
  if (_matzaAnimFrame) { cancelAnimationFrame(_matzaAnimFrame); _matzaAnimFrame = null }

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
    `<button class="matza-lang-tab ${code === matzaState.textLang ? 'active' : ''}" data-lang="${code}" onclick="matzaSetLang('${code}')">${lang.label}</button>`
  ).join('')

  document.getElementById('main-content').innerHTML = `
    <div class="matza-page">
      <header class="matza-hero">
        <div class="container">
          <h1 class="matza-hero__title">🫓 שלום-מצה 🕊️</h1>
          <p class="matza-hero__sub">שלחו מצת שלום וירטואלית לחברים, למשפחה, ולכל העולם<br/>
          <small>בעברית, אנגלית, פרסית, ערבית, ויידיש — כי שלום זה בכל שפה</small></p>
        </div>
      </header>

      <div class="container matza-workspace">
        <div class="matza-canvas-wrap">
          <canvas id="matza-canvas" class="matza-canvas"></canvas>
          <video id="matza-video" src="${videoSrc}" muted loop playsinline preload="auto" style="display:none"></video>
          <div class="matza-canvas-hint" id="matza-hint">
            <span>גררו אימוג׳ים על המצה</span>
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
            <h3 class="matza-section__title">✍️ כתבו ברכה</h3>
            <div class="matza-lang-tabs">${langTabsHTML}</div>
            <div class="matza-presets" id="matza-presets"></div>
            <textarea id="matza-text-input" class="matza-text-input"
              placeholder="או כתבו ברכה משלכם..."
              oninput="matzaSetText(this.value)"
              rows="2">${matzaState.text}</textarea>
            <div class="matza-text-options">
              <label class="matza-color-label">צבע:
                <input type="color" value="${matzaState.textColor}"
                  onchange="matzaState.textColor=this.value" class="matza-color-input" />
              </label>
              <label class="matza-size-label">גודל:
                <input type="range" min="16" max="48" value="${matzaState.textSize}"
                  oninput="matzaState.textSize=parseInt(this.value)" class="matza-size-input" />
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
        <p>🕊️ מיזם שלום של <strong>ירין</strong> ו<strong>אלברטו מוסקטו</strong> — כי מצה זה משהו שכולם יכולים להסכים עליו</p>
      </div>
    </div>`

  window.scrollTo(0, 0)
  initMatzaCanvas()
  renderMatzaPresets()

  // Hide hint after first emoji add
  const origAdd = matzaAddEmoji
  matzaAddEmoji = function(emoji) {
    const hint = document.getElementById('matza-hint')
    if (hint) hint.style.display = 'none'
    origAdd(emoji)
  }
}

function renderMatzaBanner() {
  return `
    <div class="matza-banner" role="button" tabindex="0"
      onclick="track('matza_banner_click');window.location.hash='#/shalom-matza'"
      onkeydown="if(event.key==='Enter')window.location.hash='#/shalom-matza'"
      aria-label="שלום-מצה — שלחו מצת שלום וירטואלית">
      <div class="matza-banner__emojis" aria-hidden="true">🫓 🕊️ ☮️ ❤️ 🫒 🌸 🕊️ 🫓</div>
      <div class="matza-banner__center">
        <p class="matza-banner__title">🫓 שלום-מצה 🕊️</p>
        <p class="matza-banner__sub">שלחו מצת שלום וירטואלית לחברים — בעברית, אנגלית, פרסית, ערבית ויידיש</p>
      </div>
      <div class="matza-banner__cta" aria-hidden="true">← צרו מצה</div>
    </div>`
}
