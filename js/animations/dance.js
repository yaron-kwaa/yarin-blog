// ============================================================
// ריטריט תנועה — אנימציית Canvas
// ============================================================

function initDanceAnimation() {
  const canvas = document.getElementById('dance-canvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let W, H

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect()
    W = canvas.width  = Math.floor(rect.width || 700)
    H = canvas.height = Math.round(W * 0.52)
  }
  resize()
  const onResize = () => resize()
  window.addEventListener('resize', onResize)

  // ---- polyfill for roundRect ----
  function rRect(x, y, w, h, r) {
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r) }
    else {
      ctx.moveTo(x + r, y)
      ctx.arcTo(x+w, y,   x+w, y+h, r)
      ctx.arcTo(x+w, y+h, x,   y+h, r)
      ctx.arcTo(x,   y+h, x,   y,   r)
      ctx.arcTo(x,   y,   x+w, y,   r)
      ctx.closePath()
    }
  }

  let t = 0
  const FLOOR = 0.40  // fraction of height where wall meets floor

  // ---- דמויות ----
  // x,y: 0–1 norm; s: scale; ph: phase; delay: beat-delay;
  // belly / pain / glasses / teacher
  const FIGURES = [
    // מדריכה יעל — קדמה, מרכז
    { x:.50, y:.39, s:1.15, col:'#ff6b35', ph:0,   delay:0,   belly:false, pain:false, glasses:false, teacher:true  },
    // שורה 1
    { x:.18, y:.58, s:.95,  col:'#90caf9', ph:.5,  delay:.8,  belly:true,  pain:false, glasses:true,  teacher:false },
    { x:.32, y:.61, s:1.0,  col:'#a5d6a7', ph:.9,  delay:1.3, belly:false, pain:false, glasses:false, teacher:false },
    { x:.68, y:.60, s:.90,  col:'#ffcc80', ph:1.3, delay:.5,  belly:true,  pain:false, glasses:true,  teacher:false },
    { x:.82, y:.58, s:1.0,  col:'#f48fb1', ph:.6,  delay:1.0, belly:false, pain:true,  glasses:false, teacher:false },
    // שורה 2
    { x:.10, y:.77, s:.88,  col:'#80cbc4', ph:1.7, delay:.4,  belly:true,  pain:false, glasses:false, teacher:false },
    { x:.28, y:.79, s:.93,  col:'#ce93d8', ph:.3,  delay:1.4, belly:false, pain:false, glasses:true,  teacher:false },
    { x:.50, y:.78, s:.90,  col:'#ffab91', ph:1.1, delay:.7,  belly:false, pain:true,  glasses:false, teacher:false },
    { x:.72, y:.77, s:.88,  col:'#81d4fa', ph:.8,  delay:.6,  belly:true,  pain:false, glasses:true,  teacher:false },
    { x:.90, y:.76, s:.92,  col:'#c5e1a5', ph:1.5, delay:1.1, belly:false, pain:false, glasses:false, teacher:false },
  ]

  // ---- נקודות אור מהדיסקו-בול ----
  const SPOTS = [
    { angle:0.00, r:.22, col:'ff6b35' },
    { angle:1.26, r:.18, col:'90caf9' },
    { angle:2.51, r:.25, col:'f48fb1' },
    { angle:3.77, r:.20, col:'a5d6a7' },
    { angle:5.03, r:.19, col:'ffcc80' },
    { angle:4.40, r:.23, col:'ce93d8' },
  ]

  // ---- תווים מוזיקליים ----
  const notes = []
  function spawnNote() {
    notes.push({
      x: (.08 + Math.random() * .84) * W,
      y: H * .85,
      vy: -(0.4 + Math.random() * .8),
      char: ['♩','♪','♫','♬'][0 | Math.random()*4],
      alpha: 1,
      size: W * .022 + Math.random() * W * .01,
      col: ['#ff6b35','#ffe066','#90caf9','#f48fb1','#a5d6a7'][0 | Math.random()*5],
    })
  }

  // ============================================================
  // רקע
  // ============================================================
  function drawBG() {
    const floorY = H * FLOOR

    // תקרה / קיר
    ctx.fillStyle = '#1c1c1c'
    ctx.fillRect(0, 0, W, floorY + 2)

    // לבנים
    const bW = W / 20, bH = bW * .45
    for (let row = 0; row * bH < floorY + bH; row++) {
      for (let col = -1; col <= W / bW + 1; col++) {
        const ox = (row % 2) * bW * .5
        const bx = col * bW + ox
        const by = row * bH
        ctx.fillStyle = row % 3 === 2 ? '#3a2828' : '#2e2020'
        ctx.fillRect(bx + 1, by + 1, bW - 2, bH - 2)
      }
    }

    // קורת תקרה
    ctx.fillStyle = '#111'
    ctx.fillRect(0, floorY - 16, W, 18)

    // צינורות אנכיים
    for (let px = W * .12; px < W; px += W * .22) {
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(px - 5, 0, 10, floorY)
      ctx.fillStyle = '#4a4a4a'
      ctx.fillRect(px - 3, 0, 4, floorY)
    }

    // רצפה
    ctx.fillStyle = '#242424'
    ctx.fillRect(0, floorY, W, H - floorY)

    // כרזה על הקיר
    const pW = W * .20, pH = pW * .52
    const pX = W * .78 - pW / 2, pY = H * .05
    ctx.fillStyle = '#120a24'
    ctx.beginPath(); rRect(pX, pY, pW, pH, 5*W/700); ctx.fill()
    ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2
    ctx.beginPath(); rRect(pX + 3, pY + 3, pW - 6, pH - 6, 3*W/700); ctx.stroke()
    ctx.fillStyle = '#c4b5fd'
    ctx.font = `bold ${pW * .13}px Rubik,sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('התכנית להכשרת', pX + pW / 2, pY + pH * .36)
    ctx.fillText('רקדנים', pX + pW / 2, pY + pH * .66)
    ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pX + pW*.1, pY + pH*.5); ctx.lineTo(pX + pW*.9, pY + pH*.5)
    ctx.stroke()

    // ריצוף
    ctx.strokeStyle = '#2e2e2e'
    ctx.lineWidth = .8
    const tW = W / 12
    for (let x = 0; x < W; x += tW) {
      ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, H); ctx.stroke()
    }
    const tH = (H - floorY) / 5
    for (let y = floorY; y < H; y += tH) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // ברק על הרצפה
    const shine = ctx.createLinearGradient(0, floorY, 0, floorY + H * .08)
    shine.addColorStop(0, 'rgba(255,255,255,.05)')
    shine.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shine
    ctx.fillRect(0, floorY, W, H * .08)
  }

  // ============================================================
  // כדור דיסקו
  // ============================================================
  function drawDiscoBall(t) {
    const bx = W * .5, by = H * .07, br = W * .038

    // נקודות אור על הרצפה
    SPOTS.forEach((sp) => {
      const a = sp.angle + t * .008
      const fx = W * .5 + Math.cos(a) * W * sp.r * 2.2
      const fy = H * FLOOR + 10 + Math.abs(Math.sin(a)) * (H - H * FLOOR) * .65
      const rg = ctx.createRadialGradient(fx, fy, 0, fx, fy, W * .07)
      rg.addColorStop(0, '#' + sp.col + '55')
      rg.addColorStop(1, '#' + sp.col + '00')
      ctx.fillStyle = rg
      ctx.beginPath()
      ctx.ellipse(fx, fy, W * .065, W * .032, 0, 0, Math.PI * 2)
      ctx.fill()
    })

    // חוט
    ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, by - br); ctx.stroke()

    // גוף הכדור
    const bg = ctx.createRadialGradient(bx - br*.3, by - br*.3, br*.08, bx, by, br)
    bg.addColorStop(0, '#fff')
    bg.addColorStop(.35, '#999')
    bg.addColorStop(1, '#222')
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2); ctx.fill()

    // מראות
    ctx.save(); ctx.translate(bx, by); ctx.rotate(t * .018)
    for (let i = 0; i < 14; i++) {
      const a = i * Math.PI / 7
      const tx = Math.cos(a) * br * .72, ty = Math.sin(a) * br * .72
      ctx.fillStyle = `hsl(${(i*26 + t*2) % 360},85%,68%)`
      ctx.beginPath(); ctx.arc(tx, ty, br * .18, 0, Math.PI*2); ctx.fill()
    }
    ctx.restore()
  }

  // ============================================================
  // דמות
  // ============================================================
  function drawFigure(fig, t) {
    const cx = fig.x * W
    const cy = fig.y * H
    const sc = fig.s * W / 650

    // כאב גב נכנס אחרי ~7 שניות
    const painActive = fig.pain && t > 420

    const speed = fig.teacher ? 1.0 : 0.72
    const beat  = ((t * .022 * speed) + fig.ph) % (Math.PI * 2)
    const b     = Math.sin(beat)        // -1 → 1
    const b2    = Math.abs(b)           // 0 → 1

    const hs  = 13 * sc   // רדיוס ראש
    const bh  = 30 * sc   // גוף
    const la  = 22 * sc   // גפיים
    const lw  = 3.2 * sc  // עובי קו

    const armSwing = painActive ? 0  : b * 32
    const legSwing = painActive ? 8  : b * 20
    const bob      = painActive ? 0  : b2 * 3 * sc
    const tilt     = painActive ? .60 : 0

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(tilt)

    ctx.strokeStyle = fig.col
    ctx.fillStyle   = fig.col
    ctx.lineWidth   = lw
    ctx.lineCap     = 'round'

    // --- רגליים ---
    ctx.save()
    ctx.rotate( legSwing * Math.PI / 180)
    ctx.beginPath(); ctx.moveTo(0, bh*.45); ctx.lineTo(-7*sc, bh*.45 + la); ctx.stroke()
    ctx.restore()
    ctx.save()
    ctx.rotate(-legSwing * Math.PI / 180)
    ctx.beginPath(); ctx.moveTo(0, bh*.45); ctx.lineTo( 7*sc, bh*.45 + la); ctx.stroke()
    ctx.restore()

    // --- גוף ---
    if (fig.belly) {
      ctx.beginPath(); ctx.arc(0, bh*.1, 11*sc, 0, Math.PI*2)
      ctx.fillStyle = fig.col + 'aa'; ctx.fill()
      ctx.strokeStyle = fig.col; ctx.stroke()
    } else {
      ctx.beginPath(); ctx.moveTo(0, -bh*.5 + bob); ctx.lineTo(0, bh*.45); ctx.stroke()
    }

    // --- ידיים ---
    const armY    = -bh * .05
    const armTopY = fig.teacher
      ? (-hs - b2 * 18 * sc)
      : painActive ? armY + 8*sc : (armY - b2 * 14 * sc)

    ctx.save()
    ctx.rotate(-armSwing * Math.PI / 180)
    ctx.beginPath(); ctx.moveTo(0, armY); ctx.lineTo(-la, armTopY); ctx.stroke()
    ctx.restore()
    ctx.save()
    ctx.rotate( armSwing * Math.PI / 180)
    ctx.beginPath(); ctx.moveTo(0, armY); ctx.lineTo( la, armTopY); ctx.stroke()
    ctx.restore()

    // --- ראש ---
    const headY = -bh*.5 - hs + bob
    ctx.beginPath(); ctx.arc(0, headY, hs, 0, Math.PI*2)
    ctx.fillStyle = fig.col; ctx.fill()

    // --- משקפיים ---
    if (fig.glasses) {
      ctx.save()
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5*sc
      ctx.beginPath(); ctx.arc(-5.5*sc, headY, 3.5*sc, 0, Math.PI*2); ctx.stroke()
      ctx.beginPath(); ctx.arc( 5.5*sc, headY, 3.5*sc, 0, Math.PI*2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(-2*sc, headY); ctx.lineTo(2*sc, headY); ctx.stroke()
      ctx.restore()
    }

    // --- תווית מדריך ---
    if (fig.teacher) {
      ctx.fillStyle = 'rgba(0,0,0,.65)'
      ctx.beginPath(); rRect(-24*sc, bh*.45+la+2*sc, 48*sc, 17*sc, 4*sc); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${9*sc}px Rubik,sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
      ctx.fillText('מדריכה יעל', 0, bh*.45+la+14*sc)
    }

    // --- בלון כאב גב ---
    if (painActive) {
      const msgs = ['הגב... 😩', 'אאאוץ', 'שנייה שנייה', 'כאאאב']
      const mi   = (0 | (t - 420) / 160) % msgs.length
      const show = (t - 420) % 160 < 110
      if (show) {
        ctx.font = `${11*sc}px Rubik,sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
        const tw = ctx.measureText(msgs[mi]).width + 14*sc
        ctx.fillStyle = 'rgba(255,255,255,.92)'
        ctx.beginPath(); rRect(-tw/2, headY-hs-22*sc, tw, 17*sc, 5*sc); ctx.fill()
        ctx.fillStyle = '#333'
        ctx.fillText(msgs[mi], 0, headY-hs-8*sc)
      }
    }

    ctx.restore()
  }

  // ============================================================
  // בלוני דיבור של יעל
  // ============================================================
  const YAEL_PHRASES = ['אני לא מבינה!', 'מה קורה כאן???']
  const YAEL_PERIOD  = 290   // כל כמה פריימים מופיעה הודעה
  const YAEL_SHOW    = 115   // כמה פריימים היא מוצגת

  function drawYaelBubble(t) {
    const teacher = FIGURES[0]
    const sc  = teacher.s * W / 650
    const cx  = teacher.x * W
    // גובה הראש מעל cy
    const headAbsY = teacher.y * H - (30*sc*.5 + 13*sc)

    // שתי הודעות: אחת ב-0, אחת ב-PERIOD
    const totalCycle = YAEL_PERIOD * 2
    const pos        = t % totalCycle

    let phrase = null
    let cyclePos = 0
    if (pos < YAEL_SHOW) {
      phrase = YAEL_PHRASES[0]; cyclePos = pos
    } else if (pos >= YAEL_PERIOD && pos < YAEL_PERIOD + YAEL_SHOW) {
      phrase = YAEL_PHRASES[1]; cyclePos = pos - YAEL_PERIOD
    }
    if (!phrase) return

    // fade in/out
    const alpha = cyclePos < 12
      ? cyclePos / 12
      : cyclePos > YAEL_SHOW - 12
        ? (YAEL_SHOW - cyclePos) / 12
        : 1

    ctx.save()
    ctx.globalAlpha = Math.max(0, alpha)
    ctx.font = `bold ${W * .024}px Rubik,sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    const tw  = ctx.measureText(phrase).width
    const bw  = tw + W * .03
    const bh  = W * .036
    const bx  = cx - bw / 2
    const by  = headAbsY - bh - W * .025

    // רקע בועה
    ctx.fillStyle   = '#fff3'
    ctx.strokeStyle = '#ff6b35'
    ctx.lineWidth   = 2.5
    ctx.beginPath(); rRect(bx, by, bw, bh, 6); ctx.fill()
    ctx.beginPath(); rRect(bx, by, bw, bh, 6); ctx.stroke()

    // זנב הבועה
    ctx.fillStyle = '#ff6b35'
    ctx.beginPath()
    ctx.moveTo(cx - W*.012, by + bh)
    ctx.lineTo(cx + W*.012, by + bh)
    ctx.lineTo(cx,          by + bh + W*.018)
    ctx.closePath(); ctx.fill()

    // טקסט
    ctx.fillStyle = '#fff'
    ctx.fillText(phrase, cx, by + bh - bh * .2)

    ctx.globalAlpha = 1
    ctx.restore()
  }

  // ============================================================
  // ספירת מדריכה  5-6-7-8-1-2-3-4
  // ============================================================
  const COUNT = ['5','6','7','8','1','2','3','4']
  function drawCount(t) {
    const idx  = (0 | t / 38) % 8
    const frac = (t % 38) / 38
    if (frac < .35) {
      ctx.globalAlpha = 1 - frac / .35
      ctx.fillStyle  = '#ff6b35'
      ctx.font       = `bold ${W*.05}px Rubik,sans-serif`
      ctx.textAlign  = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(COUNT[idx], W*.5, H*(FLOOR - .03))
      ctx.globalAlpha = 1
    }
  }

  // ============================================================
  // תווים מוזיקליים
  // ============================================================
  function updateNotes() {
    if (t % 44 === 0) spawnNote()
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i]
      n.y += n.vy
      n.x += Math.sin(t * .05 + i) * .3
      n.alpha -= .005
      if (n.alpha <= 0) { notes.splice(i, 1); continue }
      ctx.globalAlpha = n.alpha
      ctx.fillStyle  = n.col
      ctx.font       = `${n.size}px serif`
      ctx.textAlign  = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(n.char, n.x, n.y)
    }
    ctx.globalAlpha = 1
  }

  // ============================================================
  // לולאה ראשית
  // ============================================================
  function loop() {
    if (!document.getElementById('dance-canvas')) {
      window.removeEventListener('resize', onResize)
      return
    }
    ctx.clearRect(0, 0, W, H)
    drawBG()
    drawDiscoBall(t)
    ;[...FIGURES].sort((a,b) => a.y - b.y).forEach(f => drawFigure(f, t))
    drawYaelBubble(t)
    updateNotes()
    drawCount(t)
    t++
    requestAnimationFrame(loop)
  }

  loop()
}
