/* 해랑사주 퍼널: 첫 화면 → 사랑방 장면 4개 → 입력 → 보는 중 → 맛보기 → 6,900원 결제(토스페이먼츠) → 전체 풀이 */
(function () {
  const $ = s => document.querySelector(s);
  const ui = $('#ui'), still = $('#still'), vid = $('#vid'), app = $('#app'), back = $('#back');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const I = window.I18N, t = I.t, LG = I.LG, MK = I.MK;
  const C = 'haerang', NAME = t.NAME;
  const qs = new URLSearchParams(location.search);
  const BASE = location.origin + location.pathname.replace(/[^/]*$/, '');   // GitHub Pages 는 /haerang-saju/ 아래
  const API = window.CFG.API;                                              // 계산·결제는 워커
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };
  const sid = ls.get('cw_sid') || Math.random().toString(36).slice(2, 12); ls.set('cw_sid', sid);
  const utm = {}; ['utm_source', 'utm_campaign', 'utm_content', 'ch', 'cr'].forEach(k => { if (qs.get(k)) utm[k] = qs.get(k).slice(0, 80); });
  if (Object.keys(utm).length) ls.set('cw_utm', JSON.stringify(utm)); else try { Object.assign(utm, JSON.parse(ls.get('cw_utm') || '{}')); } catch (e) { }

  /* ---- 측정 ---- */
  const sent = {};
  function track(e, extra) {
    if (sent[e]) return; sent[e] = 1;
    const body = JSON.stringify(Object.assign({ e, c: C, sid, utm }, extra || {}));
    try { navigator.sendBeacon ? navigator.sendBeacon(API + '/api/ev', body) : fetch(API + '/api/ev', { method: 'POST', body, keepalive: true }); } catch (x) { }
    const map = { start: 'ViewContent', input_done: 'CompleteRegistration', checkout: 'InitiateCheckout' };
    if (window.fbq && map[e]) fbq('track', map[e]);
    if (window.fbq && e === 'paid') fbq('track', 'Purchase', { value: (extra && extra.v) || 0, currency: (extra && extra.cur) || I.cur });
  }
  if (window.CFG.PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', window.CFG.PIXEL_ID); fbq('track', 'PageView');
  }
  const api = async (path, body) => {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
    try {
      const r = await fetch(API + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal } : { signal: ctl.signal });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.err || t.netErr), { code: j.code, status: r.status }); return j;
    } finally { clearTimeout(t); }
  };

  /* ---- 배경: 영상 → 없으면 그림을 천천히 ---- */
  let curMedia = '';
  function media(name, loop) {
    if (curMedia === name) return; curMedia = name;
    const base = `m/${C}/${name}`, mv = '?v=' + (window.CFG.MEDIA_V || 1);
    still.src = base + '.jpg' + mv; still.classList.add('kb');
    vid.classList.remove('on'); vid.loop = !!loop;
    vid.onloadeddata = () => { vid.classList.add('on'); still.classList.remove('kb'); const p = vid.play(); if (p) p.catch(() => { }); };
    vid.onerror = () => vid.classList.remove('on');
    vid.src = base + '.mp4' + mv; vid.load();
  }
  function preload(name) { const l = document.createElement('link'); l.rel = 'preload'; l.as = 'image'; l.href = `m/${C}/${name}.jpg?v=${window.CFG.MEDIA_V || 1}`; document.head.appendChild(l); }

  function render(html, blur) { app.classList.toggle('blur', !!blur); ui.className = 'fade'; ui.innerHTML = html; void ui.offsetWidth; ui.scrollTop = 0; }
  const hist = [];
  function go(fn, ...a) { hist.push([fn, a]); back.classList.toggle('on', hist.length > 1); fn(...a); }
  back.onclick = () => { if (hist.length < 2) return; hist.pop(); const [fn, a] = hist[hist.length - 1]; back.classList.toggle('on', hist.length > 1); fn(...a); };
  const say = lines => `<div class="say">${lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>`;
  const bubble = (lines, nar) => `<div class="bubble ${nar ? 'nar' : ''}">${nar ? '' : `<div class="who">${NAME}</div>`}${lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>`;

  /* ---- 1. 첫 화면 ---- */
  function intro() {
    media('key', true); preload('s1_enter');
    render(`<div class="fold"><h1 class="hook">${t.hook}</h1>
      <p class="sub">${t.sub(I.money(I.FROM))}</p>
      <button class="btn" id="go">${t.enter}</button>
      <p class="fine">${t.fine1}</p></div>${bizFoot()}`);   // 회사 정보는 첫 화면 아래(스크롤하면 보임)
    $('#go').onclick = () => { track('start'); go(scene, 0); };
  }

  /* ---- 2. 몰입 장면 ---- */
  const SCENES = ['s1_enter', 's2_appear', 's3_sit', 's4_chart'].map((m, i) => Object.assign({ media: m }, t.SCENES[i]));
  function scene(i) {
    const s = SCENES[i];
    media(s.media); preload(SCENES[i + 1] ? SCENES[i + 1].media : 's5_reading');
    track('scene' + (i + 1));
    render('');
    setTimeout(() => {
      render(bubble(s.say || s.nar, !s.say) + s.ask.map((a, k) => `<button class="opt" data-k="${k}">${esc(a)}</button>`).join('')
        + (i === 0 ? `<button class="skip" id="skip">${t.skip}</button>` : ''));
      ui.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (s.reply) { render(bubble([s.reply[k]]) + `<button class="opt" id="nx">${t.cont}</button>`); $('#nx').onclick = () => next(i); return; }
        next(i);
      });
      const sk = $('#skip'); if (sk) sk.onclick = () => { track('skip'); go(ask, 'who'); };
    }, i === 0 ? 1500 : 1200);
  }
  function next(i) { if (i + 1 < SCENES.length) go(scene, i + 1); else go(ask, 'who'); }

  /* ---- 3. 입력 ---- */
  const B = { name: '', gender: null, cal: 'solar', leap: false, y: 1995, m: 1, d: 1, hh: null, mm: 0, place: I.place0, focus: null };
  const PLACES = I.places;
  const opts = (a, b, v, f) => { let s = ''; for (let x = a; x <= b; x++) s += `<option value="${x}" ${x === v ? 'selected' : ''}>${f ? f(x) : x}</option>`; return s; };
  function ask(step) {
    media('s4_chart'); app.classList.add('blur');
    if (step === 'who') {
      render(`<h2 class="q">${t.qWho}</h2><p class="qs">${t.qsWho}</p>
        <input class="inp" id="nm" maxlength="10" placeholder="${t.ph}" value="${esc(B.name)}" autocomplete="off">
        <div class="gap"></div><div class="seg" id="gd"><button data-g="f" class="${B.gender === 'f' ? 'sel' : ''}">${t.female}</button><button data-g="m" class="${B.gender === 'm' ? 'sel' : ''}">${t.male}</button></div>
        <div class="err" id="er"></div><button class="btn" id="ok">${t.next}</button>`, true);
      ui.querySelectorAll('#gd button').forEach(b => b.onclick = () => { B.gender = b.dataset.g; ui.querySelectorAll('#gd button').forEach(x => x.classList.toggle('sel', x === b)); $('#ok').textContent = t.next; });
      $('#ok').textContent = B.gender ? t.next : t.pickG;
      $('#ok').onclick = () => { if (!B.gender) { $('#er').textContent = t.needG; return; } B.name = $('#nm').value.trim().slice(0, 10); go(ask, 'date'); };
    }
    if (step === 'date') {
      const Y = new Date().getFullYear();
      render(`<h2 class="q">${esc(t.qDate(B.name))}</h2>
        <div class="seg" id="cal"><button data-c="solar" class="${B.cal === 'solar' ? 'sel' : ''}">${t.solar}</button><button data-c="lunar" class="${B.cal === 'lunar' ? 'sel' : ''}">${t.lunar}</button></div>
        <div class="row">${LG === 'en' ? `<select id="d">${opts(1, 31, B.d, t.d)}</select><select id="m">${opts(1, 12, B.m, t.m)}</select><select id="y">${opts(1930, Y, B.y, t.y)}</select>` : `<select id="y">${opts(1930, Y, B.y, t.y)}</select><select id="m">${opts(1, 12, B.m, t.m)}</select><select id="d">${opts(1, 31, B.d, t.d)}</select>`}</div>
        <label class="chk" id="lp" style="${B.cal === 'lunar' ? '' : 'display:none'}"><input type="checkbox" id="leap" ${B.leap ? 'checked' : ''}> ${t.leap}</label>
        <div class="err" id="er"></div><button class="btn" id="ok">${t.next}</button>`, true);
      ui.querySelectorAll('#cal button').forEach(b => b.onclick = () => { B.cal = b.dataset.c; ui.querySelectorAll('#cal button').forEach(x => x.classList.toggle('sel', x === b)); $('#lp').style.display = B.cal === 'lunar' ? '' : 'none'; });
      $('#ok').onclick = () => {
        B.y = +$('#y').value; B.m = +$('#m').value; B.d = +$('#d').value; B.leap = B.cal === 'lunar' && $('#leap').checked;
        if (B.cal === 'solar' && new Date(B.y, B.m - 1, B.d).getDate() !== B.d) { $('#er').textContent = t.noDay(B.m, B.d); return; }
        if (B.cal === 'lunar' && B.d > 30) { $('#er').textContent = t.lunar30; return; }
        track('input_date'); go(ask, 'time');
      };
    }
    if (step === 'time') {
      const h = B.hh == null ? 12 : B.hh;
      render(`<h2 class="q">${t.qTime}</h2><p class="qs">${t.qsTime}</p>
        <div class="row"><select id="hh">${opts(0, 23, h, t.hh)}</select><select id="mm">${opts(0, 59, B.mm, t.mm)}</select></div>
        ${B.place === I.place0 ? `<button class="lnk" id="plx">${t.otherPlace}</button>` : ''}
        <div id="plw" ${B.place === I.place0 ? 'hidden' : ''}><div class="gap"></div><select id="pl">${PLACES.map(([k, v]) => `<option value="${k}" ${k === B.place ? 'selected' : ''}>${t.placeL}${v}</option>`).join('')}</select>
        <p class="qs" style="margin:8px 2px 0">${t.placeNote}</p></div>
        <div class="gap"></div><button class="btn" id="ok">${t.next}</button><button class="opt" id="no">${t.noTime}</button>`, true);
      const plx = $('#plx'); if (plx) plx.onclick = () => { plx.remove(); $('#plw').hidden = false; };
      const save = () => { B.place = $('#pl').value; };
      const done = () => { track('input_done', { time: B.hh != null }); go(reading); };
      $('#ok').onclick = () => { B.hh = +$('#hh').value; B.mm = +$('#mm').value; save(); done(); };
      $('#no').onclick = () => { B.hh = null; save(); done(); };
    }
  }

  /* ---- 4. 보는 중 ---- */
  let P = null, RID = null, KEY = null, OFFERS = [], TOCL = [];
  function reading() {
    app.classList.remove('blur'); media('s5_reading');
    const lines = [t.hmm];
    let n = 0, done = false, res = null, err = null;
    render(bubble([lines[0]]));
    api('/api/saju', Object.assign({}, B, { sid, lang: LG, mk: MK })).then(j => res = j).catch(e => err = e);
    const iv = setInterval(() => {
      n++;
      if (n < lines.length) { render(bubble([lines[n]])); return; }
      if (n < 2) return; // 「흠…」을 잠깐 보여 준다
      if (!res && !err) return;
      clearInterval(iv); if (done) return; done = true;
      if (err) { render(bubble([err.message || t.inkErr]) + `<button class="btn" id="re">${t.retry}</button>`); $('#re').onclick = () => go(ask, 'date'); return; }
      P = res.p; RID = res.rid; KEY = res.key; OFFERS = res.offers; TOCL = res.toc;
      ls.set('cw_last', JSON.stringify({ rid: RID, key: KEY, p: P, offers: OFFERS, toc: TOCL }));
      go(result);
    }, 1500);
  }

  /* ---- 원국표 ---- */
  function wonguk(p) {
    const lab = c => c.k ? c.lab : c.lab + '주', sm = (a, b) => [a, b].filter(Boolean).join('·');
    const cols = p.pillars.map(c => c.none ? `<div class="wg-col"><div class="wg-lab">${esc(lab(c))}</div><div class="wg-none">${t.timeUnknown}</div></div>`
      : `<div class="wg-col ${c.k === 'day' || c.lab === '일' ? 'me' : ''}"><div class="wg-lab">${esc(lab(c))}</div><div class="wg-ss">${esc(c.gs)}</div>
        <div class="wg-ch el-${c.ge}">${c.g}<small>${esc(sm(c.gk, c.gel || c.ge))}</small></div><div class="wg-ch el-${c.je}">${c.j}<small>${esc(sm(c.jk, c.jel || c.je))}</small></div><div class="wg-ss">${esc(c.js)}</div></div>`).join('');
    const max = Math.max(...Object.values(p.el), 1);
    const bar = Object.entries(p.el).map(([k, v]) => `<div><i><b class="el-${k}" style="width:${Math.round(v / max * 100)}%"></b></i>${esc((p.elL || {})[k] || k)} ${v}</div>`).join('');
    const [y, m, d] = p.solar.split('-');
    return `<div class="wonguk">${cols}</div><div class="elbar">${bar}</div>
      <div class="meta">${esc(t.meta(p, +y, +m, +d))}</div>`;
  }

  /* ---- 5. 맛보기 + 단계별 결제 ---- */
  const won = (n, cur) => I.money(n, cur);
  const TIER = Object.fromEntries(Object.entries(t.TIER).map(([k, [tag, pts]]) => [k, { tag, pts }]));
  function tierCards(offers, focusKo, cur) {
    return `<div class="tiers">${offers.filter(o => o.price != null).map(o => `
      <div class="tier ${o.id === 'all' ? 'tier-top' : ''}"><div class="tr-h"><span class="tr-tag">${TIER[o.id].tag}</span><b>${esc(o.name)}</b></div>
        <ul>${TIER[o.id].pts(focusKo).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="tr-p"><span class="now">${won(o.price, o.cur)}</span>${o.price < o.list ? `<s>${won(o.list, o.cur)}</s><span class="cred">${esc(t.credit(won(o.list - o.price, o.cur)))}</span>` : ''}</div>
        <button class="${o.id === cur ? 'btn' : 'opt'} tr-b" data-buy="${o.id}">${esc(t.openFor(won(o.price, o.cur)))}</button></div>`).join('')}</div>`;
  }
  const lockLine = (c, offers) => { const o = offers.find(x => x.id === c.by); return o && o.price != null ? esc(t.lockAt(o.name)) : ''; };
  const ONE_KEYS = ['self', 'love', 'money', 'year'];
  const PICKS = t.PICKS;
  function result() {
    track('result');
    const p = P;
    const one = OFFERS.find(o => o.id === 'one'), oneP = won(one.price, one.cur), loveO = OFFERS.find(o => o.id === 'love');
    render(`<div class="result">
      <section class="sec">${say([t.thisChart(p.name)])}
        ${wonguk(p)}
        <div class="bubble me-card"><div class="who">${NAME}</div><div class="h">${esc(t.meH(p.me))}</div>
          <p>${esc(p.me.one)}${LG === 'zh' ? '。' : '. '}${esc(p.me.season)}</p></div>
      </section>
      <section class="sec">${say([t.sting])}
        <div class="bubble cold"><div class="who">${NAME}</div>${p.cold.map(l => `<p>${esc(l)}</p>`).join('')}</div>
        ${say([t.right])}
      </section>
      <section class="sec" data-m="s5_reading">${say(t.yearIntro(p.year.Y, p.year.gzKo, p.name))}
        <div class="big-year">${p.year.Y}</div>
        <div class="big-score">${t.score}<b>${p.year.score}</b>/ 100</div>
        <div class="card"><div class="ck">${esc(t.yearCk(p.year.gzKo, p.year.ss))}</div><div class="ch2">${esc(p.year.head)}</div>
          <p>${esc(p.year.first)}</p><p class="blurline">${t.yearBlur}</p></div>
        <div class="bubble"><div class="who">${NAME}</div><p>${esc(t.fee(oneP))}</p></div>
      </section>
      <section class="sec" data-m="s6_love">${say([t.loveQ])}
        <div class="card love"><div class="ck">${t.loveCk}</div>
          <dl><dt>${t.dtWhen}</dt><dd class="when">${esc(p.love.when)}</dd>
          <dt>${t.dtVibe}</dt><dd>${esc(p.love.vibe)}</dd>
          <dt>${t.dtLook}</dt><dd>${esc(p.love.look)}</dd>
          <dt>${t.dtWhere}</dt><dd class="blurline">${esc(p.love.where)}</dd>
          <dt>${t.dtMiss}</dt><dd class="blurline">${t.missBlur}</dd></dl></div>
        <div class="bubble"><div class="who">${NAME}</div><p>${esc(t.loveFee(loveO ? loveO.name : ''))}</p></div>
      </section>
      <section class="sec">${say([t.rest])}
        <div class="toc">${TOCL.map((c, i) => `<div class="chx"><span class="cn">${t.chN(i + 1)}</span><span class="ct">${esc(c.t)}<small>${ONE_KEYS.includes(c.k) ? esc(t.pickOne(oneP)) : lockLine(c, OFFERS)}</small></span><span class="lk">🔒</span></div>`).join('')}</div>
      </section>
      <section class="sec" id="pick">${say(t.pickQ(oneP))}
        <div class="picks">${PICKS.map(([k, w, d]) => `<button class="pick" data-one="${k}"><span><b>${w}</b><small>${d}</small></span><em>${oneP}</em></button>`).join('')}</div>
        ${say([t.whole])}
        ${tierCards(OFFERS.filter(o => o.id !== 'one'), p.focusKo, 'all')}
        <p class="fine">${t.payFine}</p>
        ${bizFoot()}
      </section>
    </div>`, true);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.dataset.m) media(e.target.dataset.m, true); } }), { root: ui, threshold: 0.25 });
    ui.querySelectorAll('.sec').forEach(s => io.observe(s));
    bindBuy();
    ui.querySelectorAll('[data-one]').forEach(b => b.onclick = () => { track('checkout'); track('checkout_one'); pay('one', b.dataset.one); });
    const pio = new IntersectionObserver(es => { if (es[0].isIntersecting) { track('pick_view'); pio.disconnect(); } }, { root: ui, threshold: 0.3 }); pio.observe($('#pick'));
    ui.addEventListener('scroll', () => { if (ui.scrollTop + ui.clientHeight > ui.scrollHeight - 400) track('scroll_end'); }, { passive: true });
  }
  function bindBuy() { ui.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { track('checkout'); track('checkout_' + b.dataset.buy); pay(b.dataset.buy); }); }

  /* ---- 결제: 토스페이먼츠 주문서형(결제위젯 v2) ---- */
  function loadSdk() {
    if (window.TossPayments) return Promise.resolve();
    return new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://js.tosspayments.com/v2/standard'; s.onload = ok; s.onerror = () => no(new Error(t.sdkErr)); document.head.appendChild(s); });
  }
  async function pay(prod, focus) {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="sheet"><div class="sh-h"><b>${t.payT}</b><button data-close aria-label="${t.close}">×</button></div>
      <div class="sh-sum"><span id="snm">…</span><b id="samt"></b></div>
      <div id="pm"><div class="loading" style="color:#8b95a1">${t.loadingPM}</div></div><div id="ag"></div>
      <p style="margin:10px 18px 0;font-size:12px;color:#8b95a1;line-height:1.5">${t.refundNote} <a href="${t.refundHref}" target="_blank" style="color:#4e5968">${t.refundL}</a></p>
      <div class="err" id="per"></div><button class="btn" id="pgo" disabled>…</button></div>`;
    document.body.appendChild(m);
    const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    const er = x => { const el = m.querySelector('#per'); if (el) el.textContent = x; };
    try {
      const o = await api('/api/order', { rid: RID, key: KEY, prod, focus, ret: BASE });
      if (o.owned) { close(); openFull(); return; }
      track('pay_open');
      m.querySelector('#snm').textContent = o.orderName; m.querySelector('#samt').textContent = won(o.amount, o.cur);
      if (o.test) m.querySelector('.sh-sum').insertAdjacentHTML('afterend', `<div class="testbar" style="margin:0 18px 6px">${t.testBar}</div>`);
      const btn = m.querySelector('#pgo');
      if (o.url) {                                                    // 히트페이: 결제창으로 넘겼다가 ?pay=hp&oid= 로 돌아온다
        m.querySelector('#pm').innerHTML = `<p class="pmx">${t.payMethods}</p>`;
        btn.textContent = t.goPay(won(o.amount, o.cur)); btn.disabled = false;
        btn.onclick = () => { btn.disabled = true; ls.set('cw_pending', JSON.stringify({ rid: RID, key: KEY, oid: o.orderId })); location.href = o.url; };
        return;
      }
      await loadSdk();                                                // 히트페이 키가 없을 때만: 토스 문서용 테스트(원화)
      const tp = window.TossPayments(o.clientKey);
      const widgets = tp.widgets({ customerKey: window.TossPayments.ANONYMOUS || 'ANONYMOUS' });
      await widgets.setAmount({ currency: 'KRW', value: o.amount });
      m.querySelector('#pm').innerHTML = '';
      await Promise.all([widgets.renderPaymentMethods({ selector: '#pm', variantKey: 'DEFAULT' }), widgets.renderAgreement({ selector: '#ag', variantKey: 'AGREEMENT' })]);
      btn.textContent = t.payBtn(won(o.amount, o.cur)); btn.disabled = false;
      btn.onclick = async () => {
        btn.disabled = true; er('');
        ls.set('cw_pending', JSON.stringify({ rid: RID, key: KEY }));
        try {
          await widgets.requestPayment({ orderId: o.orderId, orderName: o.orderName, successUrl: BASE + '?pay=ok', failUrl: BASE + '?pay=fail' });
        } catch (e) { btn.disabled = false; er(e.code === 'USER_CANCEL' ? '' : (e.message || t.openErr)); }
      };
    } catch (e) { er(e.message || t.openErr); }
  }

  /* ---- 결제에서 돌아왔을 때 ---- */
  async function payReturn(hp) {
    media('s5_reading'); app.classList.remove('blur');
    render(bubble([t.checking]));
    const oid = hp ? qs.get('oid') : qs.get('orderId');
    if (hp && /cancel/i.test(qs.get('status') || '')) { render(bubble([t.cancelled]) + `<button class="btn" id="re">${esc(t.backPrev)}</button>`); $('#re').onclick = backToPreview; return; }
    let tries = 0;
    const once = async () => {
      try {
        const j = await api('/api/confirm', hp ? { orderId: oid, hp: 1 } : { paymentKey: qs.get('paymentKey'), orderId: oid, amount: +qs.get('amount') });
        track('paid', { v: (j.cur === 'SGD' ? j.amount / 100 : j.amount) || 0, cur: j.cur }); if (j.just) track('paid_' + j.just); saveOwned(j.rid, j.key);
        RID = j.rid; KEY = j.key;
        history.replaceState(null, '', `${BASE}?r=${j.rid}&k=${j.key}`);
        showFull(j.f, j.offers);
      } catch (e) {
        if (hp && e.code === undefined && e.status === 402 && ++tries < 6) { setTimeout(once, 2500); return; }   // 결제사가 아직 완료로 안 바꿨으면 잠깐 기다린다
        render(bubble([e.message || t.notConfirmed, t.ifCharged]) + `<p class="fine">${t.orderNo} ${esc(oid || '')}</p><button class="btn" id="re">${esc(t.backPrev)}</button>`);
        $('#re').onclick = backToPreview;
      }
    };
    once();
  }
  function backToPreview() {
    try { const l = JSON.parse(ls.get('cw_last') || 'null'); if (l) { P = l.p; RID = l.rid; KEY = l.key; OFFERS = l.offers || OFFERS; TOCL = l.toc || TOCL; history.replaceState(null, '', BASE); go(result); return; } } catch (e) { }
    location.href = BASE;
  }
  function saveOwned(rid, key) { let a = []; try { a = JSON.parse(ls.get('cw_owned') || '[]'); } catch (e) { } if (!a.find(x => x.rid === rid)) a.unshift({ rid, key }); ls.set('cw_owned', JSON.stringify(a.slice(0, 20))); }
  async function openFull(rid, key) {
    media('s5_reading'); render(bubble([t.pulling]));
    try { const j = await api(`/api/full?rid=${rid || RID}&key=${key || KEY}&lang=${LG}`); RID = j.rid; KEY = j.key; showFull(j.f, j.offers); }
    catch (e) { render(bubble([e.status === 402 ? t.unpaid : (e.message || t.notFound)]) + `<button class="btn" id="re">${t.home}</button>`); $('#re').onclick = () => location.href = BASE; }
  }

  /* ---- 6. 산 풀이 + 위 단계 ---- */
  function showFull(f, offers) {
    app.classList.add('blur'); media('key', true);
    hist.length = 0; back.classList.remove('on');
    const link = `${BASE}?r=${RID}&k=${KEY}`;
    const left = (offers || []).filter(o => o.price != null);
    const dyRow = (d, l, on) => `<div class="dy ${on ? 'on' : ''}"><div class="gz">${esc(d.ko)}<small>${l}${t.age(d.age)}</small></div><p>${esc(d.txt)} <span style="color:var(--dim);font-size:13px">${esc(t.dyNote(d.ss, d.year))}</span></p></div>`;
    const chapter = (c, i) => {
      if (c.locked) return `<div class="chap lockd"><div class="cn">${t.chN(i + 1)} 🔒</div><h3>${esc(c.t)}</h3><p class="blurline">${t.lockedP}</p><div class="lk2">${lockLine(c, offers || [])}</div></div>`;
      let extra = '';
      if (c.months) extra = `<div class="months">${c.months.map(m => `<div class="mo"><b>${esc(m.mol || m.mo + '월')}</b><div>${esc(m.line)}${m.note ? ` ${esc(m.note)}` : ''}<small>${esc(t.moSmall(m.ko, m.ss))}</small></div></div>`).join('')}</div>`;
      if (c.all) extra = c.all.map((d, k) => dyRow(d, k === c.nowIdx ? t.now : '', k === c.nowIdx)).join('');
      return `<div class="chap"><div class="cn">${t.chN(i + 1)}</div><h3>${esc(c.t)}</h3>${c.p.map(x => `<p>${esc(x)}</p>`).join('')}${extra}</div>`;
    };
    const opened = f.ch.filter(c => !c.locked).length;
    render(`<div class="result">
      <section class="sec in">${say([t.fullT(f.name), t.opened(f.ch.length, opened)])}
        ${wonguk(f)}
        ${homeBox()}
        ${f.ch.map((c, i) => [c, i]).sort((x, y) => (x[0].locked ? 1 : 0) - (y[0].locked ? 1 : 0)).map(([c, i]) => chapter(c, i)).join('')}
        ${left.length ? `${say([t.more])}${tierCards(left, f.focusKo, left.find(o => o.id === 'all') ? 'all' : left[0].id)}` : ''}
        <button class="opt" id="again">${t.again}</button>
        ${bizFoot()}
      </section></div>`, true);
    if (left.length) track('upsell_view');
    bindBuy();
    bindHome(link);
    $('#again').onclick = () => { history.replaceState(null, '', BASE); Object.assign(B, { name: '', gender: null, focus: null }); hist.length = 0; go(ask, 'who'); };
  }

  /* ---- 홈 화면에 두기: 첫 결제 뒤에 권한다 ----
     안드로이드 크롬은 버튼 한 번(설치창), 아이폰은 사파리에서 손으로(애플이 API 를 안 연다).
     페북·인스타·카톡 앱 안 브라우저에서는 둘 다 안 된다 → 먼저 바깥 브라우저로 내보낸다. */
  const UA = navigator.userAgent;
  const isAnd = /Android/i.test(UA);
  const isIOS = !isAnd && (/iPhone|iPad|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isKakao = /KAKAOTALK/i.test(UA);
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|KAKAOTALK|Line\/|NAVER\(inapp|DaumApps|everytimeApp|Threads|Barcelona|; wv\)/i.test(UA) || (isIOS && !/Safari\//.test(UA));
  const iosOther = isIOS && !inApp && /CriOS|FxiOS|EdgiOS|OPiOS|Whale|DuckDuckGo/.test(UA);
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  let bip = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); bip = e; const b = document.getElementById('hgo'); if (b && !inApp) { b.hidden = false; const m = document.getElementById('hman'); if (m) m.textContent = ''; } });
  window.addEventListener('appinstalled', () => { track('a2hs_done'); const h = document.getElementById('home'); if (h) h.innerHTML = `<p class="hk">${t.homeDone}</p>`; });

  function manifestFor(url) {                       // 홈 아이콘이 이 풀이 주소로 바로 열리게(주소에 열쇠가 들어 있다)
    const m = { name: t.brand, short_name: t.brand, start_url: url + '&src=home', scope: BASE, display: 'standalone', background_color: '#0b0a10', theme_color: '#0b0a10',
      icons: [192, 512].map(z => ({ src: `${BASE}icon-${z}.png`, sizes: `${z}x${z}`, type: 'image/png', purpose: 'any' })) };
    let l = document.querySelector('link[rel=manifest]'); if (!l) { l = document.createElement('link'); l.rel = 'manifest'; document.head.appendChild(l); }
    l.href = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: 'application/manifest+json' }));
  }
  function homeBox() {
    if (isStandalone()) return '';
    const mobile = isAnd || isIOS;
    if (!mobile) return `<div class="savebox">${t.saveDesk}<button class="btn" id="cp">${t.copyLink}</button></div>`;
    let how = '', btn = '';
    if (isKakao) { how = t.kakaoHow; btn = `<button class="btn" id="hout">${t.openIn(isIOS ? 'Safari' : t.chrome)}</button>`; }
    else if (inApp && isAnd) { how = t.inAnd; btn = `<button class="btn" id="hout">${t.openIn(t.chrome)}</button>`; }
    else if (inApp && isIOS) {
      how = t.inIOS;
      btn = `<button class="opt" id="hcp">${t.copyPaste}</button>`;
    }
    else if (iosOther) { how = t.iosOther; btn = `<button class="btn" id="hout">${t.openIn('Safari')}</button><p class="hk">${t.ifNotOpen}</p><button class="opt" id="hcp">${t.copy}</button>`; }
    else if (isIOS) {
      const v26 = /Version\/(2[6-9]|[3-9]\d)/.test(UA);
      how = `<ol><li>${v26 ? t.ios26 : t.iosOld}</li>${v26 ? `<li>${t.iosShare}</li>` : ''}<li>${t.iosAdd}</li><li>${t.iosOk}</li></ol>`;
    }
    else { how = t.andHow; btn = `<button class="btn" id="hgo" ${bip ? '' : 'hidden'}>${t.addBtn}</button><p class="hk" id="hman">${bip ? '' : t.andMan}</p>`; }
    return `<div class="homebox" id="home"><div class="hh"><img src="icon-192.png" alt=""><div><b>${t.homeT}</b><span>${t.homeS}</span></div></div>
      <div class="hw">${how}</div>${btn}<button class="lnk" id="cp">${t.copyOnly}</button></div>`;
  }
  function bindHome(link) {
    manifestFor(link);
    const copy = async b => { try { await navigator.clipboard.writeText(link); b.textContent = t.copied; } catch (e) { prompt(t.promptCopy, link); } };
    const cp = $('#cp'); if (cp) cp.onclick = () => copy(cp);
    const hcp = $('#hcp'); if (hcp) hcp.onclick = () => copy(hcp);
    if (!$('#home')) return;
    track('a2hs_view');
    const out = link + (link.includes('?') ? '&' : '?') + 'a2hs=1';
    const ho = $('#hout'); if (ho) ho.onclick = () => {
      track('a2hs_out');
      if (isKakao) location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(out);
      else if (isAnd) location.href = `intent://${out.replace(/^https?:\/\//, '')}#Intent;scheme=${location.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(out)};end`;
      else location.href = 'x-safari-' + out;
    };
    const hg = $('#hgo'); if (hg) hg.onclick = async () => {
      track('a2hs_click'); if (!bip) return;
      bip.prompt(); const c = await bip.userChoice.catch(() => ({})); bip = null;
      if (c && c.outcome === 'accepted') { track('a2hs_done'); $('#home').innerHTML = `<p class="hk">${t.homeDone}</p>`; }
    };
    if (qs.get('a2hs')) {                          // 앱 안 브라우저에서 넘어온 참: 바로 안내를 보여 준다
      const u = new URL(location.href); u.searchParams.delete('a2hs'); history.replaceState(null, '', u.pathname + u.search);
      setTimeout(() => $('#home') && $('#home').scrollIntoView({ block: 'center', behavior: 'smooth' }), 400);
    }
  }
  function bizFoot() { return `<div class="biz">${t.biz()}</div>`; }

  /* ---- 말 바꾸기(오른쪽 위): 한·영·중. 나라(가격)는 그대로 둔다 ---- */
  (() => {
    const tr = document.querySelector('.topr'); if (!tr) return;
    const NX = { ko: ['en', 'EN'], en: ['zh', '中'], zh: ['ko', '한'] }[LG];
    tr.innerHTML = `<button class="lang" aria-label="language">${NX[1]}</button>`;
    tr.firstChild.onclick = () => { const u = new URL(location.href); u.searchParams.set('lang', NX[0]); u.searchParams.set('mk', MK); location.href = u.toString(); };
  })();
  document.querySelector('.brand').textContent = t.brand;

  /* ---- 시작 ---- */
  track('view');
  if (qs.get('pay') === 'hp' && qs.get('oid')) payReturn(true);
  else if (qs.get('pay') === 'ok' && qs.get('paymentKey')) payReturn();
  else if (qs.get('pay') === 'fail') {
    media('s5_reading'); const code = qs.get('code');
    render(bubble([code === 'PAY_PROCESS_CANCELED' || code === 'USER_CANCEL' ? t.cancelled : (qs.get('message') || t.payFail)]) + `<button class="btn" id="re">${t.backPrev}</button>`);
    $('#re').onclick = backToPreview;
  }
  else if (/^[a-f0-9]{16}$/.test(qs.get('r') || '')) { if (qs.get('src') === 'home' || isStandalone()) track('home_open'); openFull(qs.get('r'), qs.get('k')); }
  else if (isStandalone() && (() => { try { return JSON.parse(ls.get('cw_owned') || '[]')[0]; } catch (e) { } })()) { const o = JSON.parse(ls.get('cw_owned'))[0]; track('home_open'); openFull(o.rid, o.key); }
  else go(intro);
})();
