// ============================================================
// צ'יקי-קנטיקי — מערכת מדומה להעברת כסף לאסירים
// ============================================================

// ============================================================
// בסיס נתונים — אסירים (מומצאים לחלוטין)
// ============================================================

const PRISONERS = [
  // א
  { name: 'אברהם פרץ',       accusation: 'גנב פלאפל ממטבח הכלא ואמר שזה נפל לכיסו לבד' },
  { name: 'אסתר חדד',        accusation: 'ממשיכה לשלם בכרטיס האשראי של שותפתה לתא גם אחרי שנתפסה' },
  { name: 'אריאל מזרחי',     accusation: 'טוען שהוא צמחוני אבל אוכל שניצל בלילה כשאף אחד לא רואה' },
  { name: 'אילן ברקוביץ\'',   accusation: 'הוציא מנוי נטפליקס על חשבון הכלא ולא שיתף אף אחד' },
  { name: 'אורית שפירא',     accusation: 'הוציאה ספר מספריית הכלא לפני ארבע שנים ועדיין לא החזירה' },
  { name: 'אביגיל חזן',      accusation: 'אחראית לכך שמכונת הכביסה בכלא תמיד תפוסה בשעות השיא' },
  // ב
  { name: 'בנימין כהן',      accusation: 'הפסיד 200 שקל בקלפים לשותפו לתא ולא שילם. אומר שיסדר את זה.' },
  { name: 'ברוך אוחנה',      accusation: 'שולט בשלט הרחוק ועובר לחדשות בדיוק כשמישהו אחר רצה לראות משהו' },
  { name: 'בלה ניסים',       accusation: 'אוכלת בקול רם מאוד. ממש מאוד. כולם ביקשו ממנה. היא לא מקשיבה.' },
  // ג
  { name: 'גיא אלבז',        accusation: 'עדיין לא ברור מה הוא עשה. גם לו לא ברור.', blocked: true },
  { name: 'גדי עמר',         accusation: 'אחראי לריח המסתורי בתא 7 ועדיין מסרב להודות' },
  { name: 'גבריאל חדד',      accusation: 'גנב את הסבון של כולם ואמר שהוא חשב שזה שלו' },
  { name: 'גיורא ביטון',     accusation: 'הפסיק לשלם את חלקו בארנונה המשותפת ואומר שהוא בקשיים' },
  // ד
  { name: 'דוד לוי',         accusation: 'שר בקול רם כל בוקר ב-6. לא שירה יפה. ממש לא.' },
  { name: 'דינה קדוש',       accusation: 'מוסרת על כולם לסוהרים ואחר כך אומרת שלא היא' },
  { name: 'דן שלום',         accusation: 'פותח חלון בחורף ואומר שהוא צריך אוויר צח. כולם קפואים.' },
  // ה
  { name: 'הרצל פינטו',      accusation: 'תבע את הכלא על כך שהמזרן לא נוח. הפסיד. עדיין מתלונן.' },
  { name: 'הילה אבוקסיס',    accusation: 'מבלה שעות מול המראה בבוקר ועוצרת את כל התור לשירותים' },
  // ו
  { name: 'ולדימיר גרוסמן',  accusation: 'מסרב לדבר עברית ואומר שהוא שוכח. כולם יודעים שהוא לא שוכח.' },
  { name: 'ורד כץ',          accusation: 'אוספת בגדים שכולם שכחו במכונת הכביסה ולא מחזירה' },
  // ז
  { name: 'זאב שמיר',        accusation: 'טוען שהוא לא ישן טוב ולכן מותר לו לנחור. לא מותר.' },
  { name: 'זהבה פרידמן',     accusation: 'גרמה לכך שהסוכר בחדר האוכל נגמר כל פעם. לא ברור איך.' },
  // ח
  { name: 'חיים בוזגלו',     accusation: 'הציג עצמו כרב הכלא אך לא ברור אם הוא באמת רב' },
  { name: 'חנה סיטבון',      accusation: 'לקחה את המקום הכי טוב ליד החלון ואומרת שהיא שם מאז תמיד' },
  { name: 'חנוך דהן',        accusation: 'שבר את מכונת הכביסה ולא הודה. חקירה פנימית עדיין בעיצומה.' },
  // ט
  { name: 'טובה מלכה',       accusation: 'לא מחזירה ספרים שאולים. ספציפית את הובי חלק שני שכולם מחפשים.' },
  { name: 'טלי ג\'אנגו',      accusation: 'ביקשה שיחה פרטית עם עו"ד וסיפרה לו את עסקי כולם' },
  // י
  { name: 'יוסף אמסלם',      accusation: 'אוכל את הארוחה של כולם כשהם לא מסתכלים ואומר שזה לא היה טוב ממילא' },
  { name: 'יעל רוזנברג',     accusation: 'מנהלת קבוצת וואטסאפ של הכלא ומוסיפה אנשים ללא רשות' },
  { name: 'ירמיהו בנאי',     accusation: 'ניסה למכור את חדר האוכל של הכלא לאדם זר. לא ברור איך.' },
  { name: 'יצחק חיון',       accusation: 'אחראי לכך שחדר הכושר תמיד מסריח. טוען שזה ריח של הצלחה.' },
  { name: 'יהודה מיארה',     accusation: 'גרם לשלושה סוהרים להתפטר בשבוע אחד. לא ברור מה הוא עשה.' },
  // כ
  { name: 'כרמלה אזולאי',    accusation: 'מספרת בדיחות ישנות ולא מפסיקה גם כשאף אחד לא צוחק' },
  { name: 'כליל גבאי',       accusation: 'פתח עסק של מכירת ממתקים בתוך הכלא ולא הצהיר על הכנסות' },
  // ל
  { name: 'לאה ממן',         accusation: 'גנבה שלוש כריות ואמרה שהיא צריכה תמיכת צוואר. הרופא אמר שלא.' },
  { name: 'לוי דיין',        accusation: 'הגיש 14 עררים על איכות האוכל. 13 נדחו. הוא עדיין עם ה-14.' },
  // מ
  { name: 'משה כהן',         accusation: 'פעם סתם את האסלה בקאנטרי בכוונה ולא הודה בכך עד היום' },
  { name: 'מרים חמו',        accusation: 'מספרת לכולם שהיא כמעט בחוץ כבר שלוש שנים. עדיין בפנים.' },
  { name: 'מיכאל גרינשטיין', accusation: 'הפעיל מדיח כלים על הרזרבה ועדיין לא שילם את חשבון החשמל' },
  { name: 'מנחם אסרף',       accusation: 'ביקר את הקצין הממונה בפניו ואחר כך הכחיש שאמר משהו' },
  { name: 'מרגלית פנחסי',    accusation: 'מפיצה שמועות על אסירים אחרים. כולן שקר. לפחות 80%.' },
  // נ
  { name: 'נחמן שוורץ',      accusation: 'ניסה ללמד יוגה בחצר הכלא ללא רישיון ובלי לשאול' },
  { name: 'נחום וקנין',      accusation: 'שר שירי ניגון כל שישי בערב בקול, עד שהסוהרים ביקשו עוד' },
  { name: 'נורית בן-שושן',   accusation: 'לקחה את מקום החניה של מנהלת הכלא. פעמיים.' },
  // ס
  { name: 'סמי אלבז',        accusation: 'שידך שלושה זוגות בתוך הכלא. כולם התחרטו. סמי לא מבין למה.' },
  { name: 'סיגל טוויג',      accusation: 'הקימה חנות מקוונת מתא הכלא. אמזון סירבה לשתף פעולה.' },
  // ע
  { name: 'עמוס שגב',        accusation: 'כתב ספר זיכרונות על חבריו בכלא ולא שאל אף אחד מהם' },
  { name: 'עליזה בר-לב',     accusation: 'גררה עשרה כיסאות למשרד הממונה כדי לשבת בנוח. כן, עשרה.' },
  { name: 'עוזי חפץ',        accusation: 'פתח פרקטיקת פסיכולוגיה בכלא ללא תואר. הרבה אנשים פנו אליו.' },
  // פ
  { name: 'פנינה שטרית',     accusation: 'הפכה את חדר הטיפולים לסלון מסיבות. הרופא גילה כשחזר מחופשה.' },
  { name: 'פרץ בלנגה',       accusation: 'ייסד מפלגה פוליטית מהכלא. יש לה שלושה חברים. אחד מהם הוא.' },
  { name: 'פליקס שאולי',     accusation: 'ניסה לשנות את שם הכלא ל"מלון פליקס". הנהלה סירבה בנימוס.' },
  // צ
  { name: 'ציפי אוגרובסקי',  accusation: 'הגישה תביעה על כך שהאוכל לא כשר מהדרין מהדרין מהדרין. עדיין ממתינה.' },
  { name: 'צבי וייסמן',      accusation: 'נאנח בקול כל הלילה ואומר שזה בגלל הגב. בדקו. הגב בסדר.' },
  // ק
  { name: 'קובי אלקיים',     accusation: 'שיחק שחמט בעצמו ארבע שעות ולא אפשר לאחרים לשבת ליד השולחן' },
  { name: 'קרן רייכמן',      accusation: 'הדפיסה 300 עמודים של מתכונים מהאינטרנט על מדפסת הכלא' },
  // ר
  { name: 'ראובן גלעד',      accusation: 'הצביע לעצמו בבחירות לוועד האסירים ואמר לכולם שהוא לא עשה את זה' },
  { name: 'רחל מוסקוביץ\'',   accusation: 'סירבה להחזיר מספריים שאולות ואמרה שאלה שלה. הן לא שלה.' },
  { name: 'רינה שיין',       accusation: 'ניסתה להכשיר את כלב הכלא ככלב שירות רגשי. הצליחה חלקית.' },
  // ש
  { name: 'שמואל בוקרה',     accusation: 'הפך את מחסן הספרים ל"חדר בריחה" לא מורשה. בתשלום.' },
  { name: 'שרה גולן',        accusation: 'הקימה גן ירק על גג הכלא. הצמחים גדלו. לא ברור מה עשתה בהם.' },
  { name: 'שלמה אביב',       accusation: 'ניסה לאמן קבוצת כדורגל בחצר. שלושה אנשים נפצעו. לא חמור.' },
  { name: 'שלי כנרת',        accusation: 'עיצבה מחדש את תא הכלא בלי לשאול ואמרה שזה שיפוץ עצמי' },
  // ת
  { name: 'תמר גפן',         accusation: 'הקימה חוג עיסוי לא רשמי. 12 אנשים הצטרפו. הנהלה לא ידעה.' },
  { name: 'תומר פרחי',       accusation: 'קיים מסיבת יום הולדת לעצמו ללא אישור. היה די מוצלח, בכל זאת.' },
  { name: 'תמי הורוביץ\'',    accusation: 'אמרה שהיא שופטת מטעם בית המשפט. היא לא. ניסיון יצירתי.' },
]

// ============================================================
// State
// ============================================================

let chikiState = {
  prisoner:    null,   // { name, accusation }
  amount:      null,   // number
  step:        1,      // 1 | 2 | 3 | 4
  searchQuery: ''
}

function chikiReset() {
  chikiState = { prisoner: null, amount: null, step: 1, searchQuery: '' }
}

// ============================================================
// חיפוש אסירים (עד 3 אותיות)
// ============================================================

function filterPrisoners(q) {
  if (!q || !q.trim() || q.trim().length > 3) return []
  const query = q.trim()
  return PRISONERS.filter(p =>
    p.name.split(' ').some(word => word.startsWith(query))
  ).slice(0, 6)
}

// ============================================================
// מחוון שלבים
// ============================================================

function chikiStepHTML() {
  const steps = ['🔍 בחר אסיר', '💰 בחר סכום', '💳 פרטי תשלום']
  const cur = Math.min(chikiState.step, 3)
  return `<div class="chiki-step-indicator">${steps.map((s, i) => `
    <div class="chiki-step-item ${i + 1 < cur ? 'done' : ''} ${i + 1 === cur ? 'active' : ''}">
      <div class="chiki-step-num">${i + 1 < cur ? '✓' : i + 1}</div>
      <div class="chiki-step-label">${s}</div>
    </div>${i < 2 ? '<div class="chiki-step-sep"></div>' : ''}`).join('')}
  </div>`
}

// ============================================================
// שלב 1 — חיפוש אסיר
// ============================================================

function chikiStep1HTML() {
  return `
    <div class="chiki-card">
      <h2 class="chiki-card-title">🔍 שלב 1: מי האסיר?</h2>
      <p class="chiki-card-desc">הקלד/י שם פרטי או שם משפחה (1 עד 3 אותיות)</p>
      <div class="chiki-search-wrap">
        <input
          type="text" id="prisoner-input" class="chiki-input"
          placeholder="לדוגמה: מש, ב, כה..."
          maxlength="3" autocomplete="off" dir="rtl"
          value="${esc(chikiState.searchQuery)}"
        />
        <div id="prisoner-dropdown" class="chiki-dropdown" style="display:none"></div>
      </div>
      <p class="chiki-hint">💡 הקלד/י 1–3 אותיות ויופיעו שמות</p>
    </div>`
}

// ============================================================
// שלב 2 — בחירת סכום
// ============================================================

function chikiStep2HTML() {
  const FIXED = [1, 18, 200]
  const isCustom = chikiState.amount && !FIXED.includes(chikiState.amount)
  return `
    <div class="chiki-card">
      <div class="chiki-badge-row">
        <span class="chiki-badge">✅ אסיר: <strong>${esc(chikiState.prisoner.name)}</strong></span>
        <button class="chiki-change-btn" onclick="chikiGoStep(1)">שנה</button>
      </div>
      <h2 class="chiki-card-title">💰 שלב 2: כמה להעביר?</h2>
      <p class="chiki-card-desc">בחר/י סכום לאסיר ${esc(chikiState.prisoner.name)}</p>
      <div class="chiki-amounts">
        <button class="chiki-amount-btn ${chikiState.amount === 1   ? 'selected' : ''}" onclick="chikiSelectAmount(1)">
          <span class="chiki-amount-val">1 ₪</span><span class="chiki-amount-tag">🐢 סמלי</span>
        </button>
        <button class="chiki-amount-btn ${chikiState.amount === 18  ? 'selected' : ''}" onclick="chikiSelectAmount(18)">
          <span class="chiki-amount-val">18 ₪</span><span class="chiki-amount-tag">✡️ חי</span>
        </button>
        <button class="chiki-amount-btn ${chikiState.amount === 200 ? 'selected' : ''}" onclick="chikiSelectAmount(200)">
          <span class="chiki-amount-val">200 ₪</span><span class="chiki-amount-tag">💪 גדיל</span>
        </button>
        <button class="chiki-amount-btn chiki-amount-other ${isCustom ? 'selected' : ''}" onclick="chikiToggleCustom()">
          <span class="chiki-amount-val">${isCustom ? chikiState.amount + ' ₪' : 'סכום אחר'}</span>
          <span class="chiki-amount-tag">✏️</span>
        </button>
      </div>
      <div id="custom-amount-wrap" class="chiki-custom-row" style="display:none">
        <input type="number" id="custom-amount-input" class="chiki-input chiki-input--sm"
          placeholder="הכנס סכום" min="1" max="99999" dir="rtl" />
        <button class="chiki-confirm-btn" onclick="chikiConfirmCustom()">אשר ←</button>
      </div>
    </div>`
}

// ============================================================
// שלב 3 — טופס תשלום
// ============================================================

function chikiStep3HTML() {
  const p = chikiState.prisoner
  const a = chikiState.amount
  const label = `${a} ₪ ל${esc(p.name)}`
  return `
    <div class="chiki-card">
      <div class="chiki-badge-row">
        <span class="chiki-badge">✅ אסיר: <strong>${esc(p.name)}</strong></span>
        <button class="chiki-change-btn" onclick="chikiGoStep(1)">שנה</button>
        <span class="chiki-badge">✅ סכום: <strong>${a} ₪</strong></span>
        <button class="chiki-change-btn" onclick="chikiGoStep(2)">שנה</button>
      </div>
      <h2 class="chiki-card-title">💳 שלב 3: פרטי תשלום</h2>
      <p class="chiki-card-desc">מלא/י את הפרטים ונעביר את הכסף. אולי.</p>

      <form id="chiki-form" class="chiki-form" onsubmit="chikiSubmit(event)" novalidate>
        <div class="chiki-form-grid">
          <div class="chiki-form-group">
            <label class="chiki-label">שם מלא</label>
            <input type="text" class="chiki-input chiki-pf" placeholder="ישראל ישראלי" required />
          </div>
          <div class="chiki-form-group">
            <label class="chiki-label">כתובת מייל</label>
            <input type="email" class="chiki-input chiki-pf" placeholder="israel@example.com" required />
          </div>
          <div class="chiki-form-group">
            <label class="chiki-label">טלפון</label>
            <input type="tel" class="chiki-input chiki-pf" placeholder="050-0000000" required />
          </div>
          <div class="chiki-form-group">
            <label class="chiki-label">מה הקשר שלך לאסיר?</label>
            <select class="chiki-input chiki-pf" required>
              <option value="">בחר/י...</option>
              <option>בן / בת משפחה</option>
              <option>חבר / חברה</option>
              <option>שכן / שכנה</option>
              <option>עורך / עורכת דין</option>
              <option>חוקר / חוקרת פרטי</option>
              <option>פשוט אוהד / אוהדת</option>
              <option>לא יודע / לא יודעת בדיוק</option>
            </select>
          </div>
        </div>

        <div class="chiki-form-divider">🔐 פרטי כרטיס אשראי</div>

        <div class="chiki-form-grid">
          <div class="chiki-form-group chiki-form-group--full">
            <label class="chiki-label">מספר כרטיס</label>
            <input type="text" class="chiki-input chiki-pf" placeholder="XXXX  XXXX  XXXX  XXXX"
              maxlength="19" inputmode="numeric" required />
          </div>
          <div class="chiki-form-group">
            <label class="chiki-label">תוקף</label>
            <input type="text" class="chiki-input chiki-pf" placeholder="MM/YY" maxlength="5" required />
          </div>
          <div class="chiki-form-group">
            <label class="chiki-label">CVV</label>
            <input type="text" class="chiki-input chiki-pf" placeholder="XXX" maxlength="3" inputmode="numeric" required />
          </div>
        </div>

        <button type="submit" class="chiki-submit-btn">
          💸 העבר ${label} עכשיו!!!
        </button>
        <p class="chiki-disclaimer">
          * המידע שלך מאובטח בהצפנה בינלאומית מסוג ROT13. אולי.
          לצ'יקי-קנטיקי אין אחריות על כסף שהועבר, לא הועבר, או שאבד בדרך.
        </p>
      </form>
    </div>`
}

// ============================================================
// שלב 4 — אישור
// ============================================================

function chikiStep4HTML() {
  const p = chikiState.prisoner
  return `
    <div class="chiki-card chiki-card--done">
      <div class="chiki-done-icon">🎉</div>
      <h2 class="chiki-done-title">ההעברה בוצעה!<br/><small>(כנראה)</small></h2>
      <div class="chiki-done-body">
        <p>ביקשנו מ<strong>ירין</strong> לבצע את ההעברה של <strong>${chikiState.amount} ₪</strong>
          ל<strong>${esc(p.name)}</strong>.</p>
        <p>ירין אמר "בסדר, אני אטפל בזה" — ואז הלך לאכול חומוס.</p>
        <p>ההעברה <strong>אולי תבוצע בימים הקרובים</strong>. ואולי לא. ירין לא מבטיח כלום.</p>
        <p>אנא <strong>עקוב/י אחר חיובי האשראי שלך</strong>, ובמידה ומשהו לא תקין —
          פנה/י לבנקאי הקרוב אליך.</p>
        <p class="chiki-done-note">לידיעתך: ${esc(p.name)} ${esc(p.accusation)}. חשבנו שכדאי לדעת.</p>
      </div>
      <div class="chiki-done-btns">
        <button class="chiki-confirm-btn" onclick="chikiReset(); renderChikiPage()">
          העבר לאסיר אחר 🔄
        </button>
        <button class="chiki-back-home-btn" onclick="navigate(null)">
          חזרה לבלוג 🏠
        </button>
      </div>
    </div>`
}

// ============================================================
// פופאפ אזהרה — נימוקים מתחלפים
// ============================================================

let _chikiWarnIdx = 0

function _getChikiWarning() {
  const p = chikiState.prisoner
  const warnings = [
    {
      icon: '⚠️',
      title: 'רגע לפני שממשיכים...',
      text: `לידיעתך, <strong>${esc(p.name)}</strong> ${esc(p.accusation)}.`
    },
    {
      icon: '🕵️',
      title: 'התראת אבטחה',
      text: 'המערכת זיהתה פעילות חריגה בחשבונך.<br/>כל הפעולות מתועדות ומשודרות לגורם שלישי לא ידוע.<br/>המשך/י על אחריותך.'
    },
    {
      icon: '📋',
      title: 'טופס 17-ג נדרש',
      text: 'על פי תקנון משרד המשפטים סעיף 17-ג, כל העברה לאסיר מחייבת אישור בכתב מסוהרת ראשית.<br/>לא ידוע לנו שיש לך אישור כזה.'
    },
    {
      icon: '📱',
      title: 'הודעה נשלחה',
      text: 'שלחנו הודעת ווטסאפ לאנשי הקשר שלך ולשלושה גורמים לא מזוהים שאתה מנסה להעביר כסף לאסיר.<br/>הם כנראה בדרך.'
    },
    {
      icon: '🔍',
      title: 'בדיקת רקע בתהליך',
      text: 'אנחנו כרגע בודקים את הרקע שלך.<br/>זה אמור לקחת רגע.<br/>(זה לוקח קצת יותר מרגע.)<br/>נמשיך כשנסיים.'
    },
    {
      icon: '💸',
      title: 'האם ידעת?',
      text: `עד כה הועברו לאסירים בישראל ₪0 דרך צ'יקי-קנטיקי.<br/>אתה עומד להיות הראשון.<br/>זה מפחיד קצת.`
    },
    {
      icon: '🤝',
      title: 'הסכמה לתנאים',
      text: 'בהמשך מילוי הטופס אתה מסכים לתנאי השימוש של צ\'יקי-קנטיקי (127 עמודים, זמינים לעיון בסניף הראשי, אין סניף ראשי).'
    },
  ]
  const w = warnings[_chikiWarnIdx % warnings.length]
  _chikiWarnIdx++
  return w
}

function chikiPopupHTML() {
  const w = _getChikiWarning()
  return `
    <div class="chiki-popup-overlay" id="chiki-popup" onclick="closeChikiPopup()">
      <div class="chiki-popup" onclick="event.stopPropagation()">
        <div class="chiki-popup-icon">${w.icon}</div>
        <h3 class="chiki-popup-title">${w.title}</h3>
        <p class="chiki-popup-text">${w.text}</p>
        <div class="chiki-popup-btns">
          <button class="chiki-popup-continue" onclick="closeChikiPopup()">המשך בכל זאת 😤</button>
          <button class="chiki-popup-cancel" onclick="chikiGoStep(1); closeChikiPopup()">בטל, חשבתי שוב 😅</button>
        </div>
      </div>
    </div>`
}

function showChikiPopup() {
  if (document.getElementById('chiki-popup')) return  // כבר פתוח
  document.body.insertAdjacentHTML('beforeend', chikiPopupHTML())
}

function closeChikiPopup() {
  document.getElementById('chiki-popup')?.remove()
}

function chikiBlockedPopupHTML(p) {
  return `
    <div class="chiki-popup-overlay chiki-blocked-overlay" id="chiki-popup" onclick="closeChikiPopup()">
      <div class="chiki-popup chiki-blocked-popup" onclick="event.stopPropagation()">
        <div class="chiki-blocked-sirens">🚨 🚨 🚨</div>
        <div class="chiki-blocked-code">[ SYSTEM ALERT — ERROR CODE: GA-7734 ]</div>
        <h3 class="chiki-popup-title chiki-blocked-title">גישה נדחתה</h3>
        <p class="chiki-popup-text chiki-blocked-text">
          <strong>⛔ המידע הקשור ל${esc(p.name)} מסווג ברמה 7.</strong><br/><br/>
          ניסיון הגישה שלך <strong>תועד, צולם, ושודר</strong> בשידור חי לגורמים הרלוונטיים.<br/><br/>
          מומלץ לסגור את הדפדפן, לנתק את הרשת, ולנסות לחיות את החיים כרגיל.<br/><br/>
          <small>בכל מקרה, כל אסיר אחר יעבוד ללא בעיה. באחריות.</small>
        </p>
        <div class="chiki-popup-btns">
          <button class="chiki-popup-cancel chiki-blocked-btn" onclick="closeChikiPopup()">הבנתי. בוחר אחר. 🏃💨</button>
        </div>
      </div>
    </div>`
}

// ============================================================
// פעולות
// ============================================================

function chikiPickPrisoner(name) {
  const found = PRISONERS.find(p => p.name === name) || null
  if (found && found.blocked) {
    document.body.insertAdjacentHTML('beforeend', chikiBlockedPopupHTML(found))
    return
  }
  chikiState.prisoner = found
  if (chikiState.prisoner) {
    chikiState.step = 2
    updateChikiContent()
  }
}

function chikiSelectAmount(amount) {
  chikiState.amount = amount
  chikiState.step = 3
  updateChikiContent()
}

function chikiToggleCustom() {
  const wrap = document.getElementById('custom-amount-wrap')
  if (!wrap) return
  const visible = wrap.style.display !== 'none'
  wrap.style.display = visible ? 'none' : 'flex'
  if (!visible) document.getElementById('custom-amount-input')?.focus()
}

function chikiConfirmCustom() {
  const val = parseInt(document.getElementById('custom-amount-input')?.value || '0')
  if (val > 0) {
    chikiState.amount = val
    chikiState.step = 3
    updateChikiContent()
  }
}

function chikiGoStep(step) {
  chikiState.step = step
  updateChikiContent()
}

function chikiSubmit(e) {
  e.preventDefault()
  chikiState.step = 4
  updateChikiContent()
}

// ============================================================
// עדכון UI
// ============================================================

function updateChikiContent() {
  document.querySelector('.chiki-steps').innerHTML = chikiStepHTML()
  document.getElementById('chiki-content').innerHTML = renderChikiStep()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  initChikiListeners()
}

function renderChikiStep() {
  switch (chikiState.step) {
    case 1: return chikiStep1HTML()
    case 2: return chikiStep2HTML()
    case 3: return chikiStep3HTML()
    case 4: return chikiStep4HTML()
    default: return chikiStep1HTML()
  }
}

// ============================================================
// Listeners
// ============================================================

function initChikiListeners() {
  // שלב 1 — חיפוש
  const inp = document.getElementById('prisoner-input')
  if (inp) {
    inp.addEventListener('input', e => {
      chikiState.searchQuery = e.target.value
      updatePrisonerDropdown()
    })
    inp.addEventListener('focus', updatePrisonerDropdown)
    inp.focus()
  }

  // שלב 3 — פופאפ בכל פוקוס
  document.querySelectorAll('.chiki-pf').forEach(f => {
    f.addEventListener('focus', showChikiPopup)
  })
}

function updatePrisonerDropdown() {
  const inp = document.getElementById('prisoner-input')
  const dd  = document.getElementById('prisoner-dropdown')
  if (!inp || !dd) return

  const q = inp.value.trim()
  if (!q) { dd.style.display = 'none'; dd.innerHTML = ''; return }

  const results = filterPrisoners(q)
  if (!results.length) {
    dd.innerHTML = '<div class="chiki-dd-empty">לא נמצאו תוצאות — נסה אותיות אחרות</div>'
    dd.style.display = 'block'
    return
  }

  dd.innerHTML = results.map(p => `
    <button class="chiki-dd-item" onclick="chikiPickPrisoner('${p.name.replace(/'/g, "\\'")}')">
      🧑 ${esc(p.name)}
    </button>`).join('')
  dd.style.display = 'block'
}

// ============================================================
// דף ראשי
// ============================================================

function renderChikiPage() {
  document.title = 'צ\'יקי-קנטיקי | הבלוג של ירין'
  document.getElementById('nav-home').classList.remove('active')

  document.getElementById('main-content').innerHTML = `
    <div class="chiki-page">
      <!-- Hero -->
      <header class="chiki-hero">
        <div class="container">
          <div class="chiki-logo-icon">🏛️</div>
          <h1 class="chiki-title">צ'יקי-קנטיקי</h1>
          <p class="chiki-subtitle">
            המערכת הממשלתית-לא-ממשלתית להעברת כסף לאסירים<br/>
            <small>מהיר · פשוט · אולי יעבוד</small>
          </p>
          <div class="chiki-official-seal">✦ מאושר על ידי ירין ✦</div>
        </div>
      </header>

      <!-- תוכן -->
      <div class="container chiki-body">
        <div class="chiki-steps">${chikiStepHTML()}</div>
        <div id="chiki-content">${renderChikiStep()}</div>
      </div>
    </div>`

  window.scrollTo(0, 0)
  initChikiListeners()
}

// ============================================================
// באנר לדף הבית
// ============================================================

function renderChikiBanner() {
  return `
    <div class="chiki-banner" role="button" tabindex="0"
      onclick="window.location.hash='#/chiki-kantiki'"
      onkeydown="if(event.key==='Enter')window.location.hash='#/chiki-kantiki'"
      aria-label="מערכת צ'יקי-קנטיקי להעברת כסף לאסירים">
      <div class="chiki-banner-money" aria-hidden="true">💵 💴 💵 💶 💵 💷 💵</div>
      <div class="chiki-banner-center">
        <p class="chiki-banner-title">צריכים להעביר כסף לאסירים?</p>
        <p class="chiki-banner-sub">נסו את מערכת <strong>צ'יקי-קנטיקי</strong> — מהיר, פשוט, ואולי אפילו יעבוד</p>
      </div>
      <div class="chiki-banner-cta" aria-hidden="true">← כנסו עכשיו</div>
    </div>`
}
