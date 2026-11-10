/* 해랑사주 퍼널: 첫 화면 → 사랑방 장면 4개 → 입력 → 보는 중 → 맛보기 → 1,000원 결제(토스페이먼츠) → 전체 풀이 */
(function () {
  const $ = s => document.querySelector(s);
  const ui = $('#ui'), still = $('#still'), vid = $('#vid'), app = $('#app'), back = $('#back');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const josa = (w, a, b) => { const c = String(w).charCodeAt(String(w).length - 1) - 0xac00; return w + (c >= 0 && c <= 11171 && c % 28 ? a : b); };
  const C = 'haerang', NAME = '해랑 도령';
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
    if (window.fbq && e === 'paid') fbq('track', 'Purchase', { value: (extra && extra.v) || 0, currency: 'KRW' });
  }
  if (window.CFG.PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', window.CFG.PIXEL_ID); fbq('track', 'PageView');
  }
  const api = async (path, body) => {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
    try {
      const r = await fetch(API + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal } : { signal: ctl.signal });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.err || '잠깐 연결이 안 됐어.'), { code: j.code, status: r.status }); return j;
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
    render(`<h1 class="hook">"너 올 줄 알았어.<br>네 팔자, 다 보여."</h1>
      <p class="sub">만세력으로 뽑은 진짜 원국 · 내년 운 · 연애 상대가 오는 때까지.<br>맛보기는 무료, 더 깊은 풀이는 <b>1,000원부터</b>.</p>
      <button class="btn" id="go">신당 들어가기</button>
      <p class="fine">1분이면 돼 · 회원가입 없음</p>${bizFoot()}`);
    $('#go').onclick = () => { track('start'); go(scene, 0); };
  }

  /* ---- 2. 몰입 장면 ---- */
  const SCENES = [
    { media: 's1_enter', nar: ['창호지 문 틈으로 촛불이 흔들린다.', '방울 소리가 한 번… 누군가 이미 너를 기다리고 있다.'], ask: ['조심스럽게 들어간다'] },
    { media: 's2_appear', say: ['…왔네?', '뭐가 궁금해?'], ask: ['음… 이것저것요.', '제 사주 좀 봐 주세요.'],
      reply: ['그래, 하나씩 다 봐 줄게.', '좋아. 제대로 봐 줄게.'] },
    { media: 's3_sit', say: ['앉아. 안 잡아먹어.', '듣기 좋은 말은 안 해. 보이는 대로만 말해.'], ask: ['네… (조용히 앉는다)', '괜찮아요. 다 말해 주세요.'],
      reply: ['그래, 숨 좀 골라.', '오, 각오됐네. 그럼 안 봐준다.'] },
    { media: 's4_chart', say: ['태어난 날 대 봐.', '거짓말해도 소용없어. 팔자는 못 속여.'], ask: ['태어난 날을 말한다'] },
  ];
  function scene(i) {
    const s = SCENES[i];
    media(s.media); preload(SCENES[i + 1] ? SCENES[i + 1].media : 's5_reading');
    track('scene' + (i + 1));
    render('');
    setTimeout(() => {
      render(bubble(s.say || s.nar, !s.say) + s.ask.map((a, k) => `<button class="opt" data-k="${k}">${esc(a)}</button>`).join('')
        + (i === 0 ? `<button class="skip" id="skip">이야기 건너뛰기 ›</button>` : ''));
      ui.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (s.reply) { render(bubble([s.reply[k]]) + `<button class="opt" id="nx">계속 ›</button>`); $('#nx').onclick = () => next(i); return; }
        next(i);
      });
      const sk = $('#skip'); if (sk) sk.onclick = () => { track('skip'); go(ask, 'who'); };
    }, i === 0 ? 1500 : 1200);
  }
  function next(i) { if (i + 1 < SCENES.length) go(scene, i + 1); else go(ask, 'who'); }

  /* ---- 3. 입력 ---- */
  const B = { name: '', gender: null, cal: 'solar', leap: false, y: 1995, m: 1, d: 1, hh: null, mm: 0, place: 'seoul', focus: null };
  const PLACES = [['seoul', '서울'], ['incheon', '인천'], ['gyeonggi', '경기'], ['gangwon', '강원(춘천·원주)'], ['gangneung', '강원(강릉·동해)'], ['daejeon', '대전'], ['sejong', '세종'], ['chungbuk', '충북'], ['chungnam', '충남'], ['gwangju', '광주'], ['jeonbuk', '전북'], ['jeonnam', '전남'], ['daegu', '대구'], ['gyeongbuk', '경북'], ['busan', '부산'], ['ulsan', '울산'], ['gyeongnam', '경남'], ['jeju', '제주'], ['unknown', '해외·모름']];
  const opts = (a, b, v, f) => { let s = ''; for (let x = a; x <= b; x++) s += `<option value="${x}" ${x === v ? 'selected' : ''}>${f ? f(x) : x}</option>`; return s; };
  function ask(step) {
    media('s4_chart'); app.classList.add('blur');
    if (step === 'who') {
      render(`<h2 class="q">뭐라고 부를까?</h2><p class="qs">이름이나 별명. 비워 둬도 돼.</p>
        <input class="inp" id="nm" maxlength="10" placeholder="예: 지은" value="${esc(B.name)}" autocomplete="off">
        <div class="gap"></div><div class="seg" id="gd"><button data-g="f" class="${B.gender === 'f' ? 'sel' : ''}">여자</button><button data-g="m" class="${B.gender === 'm' ? 'sel' : ''}">남자</button></div>
        <div class="err" id="er"></div><button class="btn" id="ok">다음</button>`, true);
      ui.querySelectorAll('#gd button').forEach(b => b.onclick = () => { B.gender = b.dataset.g; ui.querySelectorAll('#gd button').forEach(x => x.classList.toggle('sel', x === b)); $('#ok').textContent = '다음'; });
      $('#ok').textContent = B.gender ? '다음' : '성별을 골라 줘';
      $('#ok').onclick = () => { if (!B.gender) { $('#er').textContent = '대운 방향이 성별로 갈려서 꼭 필요해.'; return; } B.name = $('#nm').value.trim().slice(0, 10); go(ask, 'date'); };
    }
    if (step === 'date') {
      const Y = new Date().getFullYear();
      render(`<h2 class="q">${B.name ? esc(josa(B.name, '이는', '는')) + ' ' : ''}언제 태어났어?</h2>
        <div class="seg" id="cal"><button data-c="solar" class="${B.cal === 'solar' ? 'sel' : ''}">양력</button><button data-c="lunar" class="${B.cal === 'lunar' ? 'sel' : ''}">음력</button></div>
        <div class="row"><select id="y">${opts(1930, Y, B.y, x => x + '년')}</select><select id="m">${opts(1, 12, B.m, x => x + '월')}</select><select id="d">${opts(1, 31, B.d, x => x + '일')}</select></div>
        <label class="chk" id="lp" style="${B.cal === 'lunar' ? '' : 'display:none'}"><input type="checkbox" id="leap" ${B.leap ? 'checked' : ''}> 윤달이야</label>
        <div class="err" id="er"></div><button class="btn" id="ok">다음</button>`, true);
      ui.querySelectorAll('#cal button').forEach(b => b.onclick = () => { B.cal = b.dataset.c; ui.querySelectorAll('#cal button').forEach(x => x.classList.toggle('sel', x === b)); $('#lp').style.display = B.cal === 'lunar' ? '' : 'none'; });
      $('#ok').onclick = () => {
        B.y = +$('#y').value; B.m = +$('#m').value; B.d = +$('#d').value; B.leap = B.cal === 'lunar' && $('#leap').checked;
        if (B.cal === 'solar' && new Date(B.y, B.m - 1, B.d).getDate() !== B.d) { $('#er').textContent = `${B.m}월에는 ${B.d}일이 없어.`; return; }
        if (B.cal === 'lunar' && B.d > 30) { $('#er').textContent = '음력은 30일까지야.'; return; }
        track('input_date'); go(ask, 'time');
      };
    }
    if (step === 'time') {
      const h = B.hh == null ? 12 : B.hh;
      render(`<h2 class="q">몇 시에 태어났어?</h2><p class="qs">시주는 그 두 시간 안에서 갈려. 대충이라도 알면 넣어.</p>
        <div class="row"><select id="hh">${opts(0, 23, h, x => (x < 12 ? '오전 ' : '오후 ') + (x % 12 === 0 ? 12 : x % 12) + '시')}</select><select id="mm">${opts(0, 59, B.mm, x => String(x).padStart(2, '0') + '분')}</select></div>
        <div class="gap"></div><select id="pl">${PLACES.map(([k, v]) => `<option value="${k}" ${k === B.place ? 'selected' : ''}>태어난 곳: ${v}</option>`).join('')}</select>
        <p class="qs" style="margin:8px 2px 0">태어난 곳 경도로 진태양시를 맞춰(서울은 표준시보다 약 32분 늦어).</p>
        <div class="gap"></div><button class="btn" id="ok">다음</button><button class="opt" id="no">시간은 몰라</button>`, true);
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
    const lines = ['흠…'];
    let n = 0, done = false, res = null, err = null;
    render(bubble([lines[0]]));
    api('/api/saju', Object.assign({}, B, { sid })).then(j => res = j).catch(e => err = e);
    const iv = setInterval(() => {
      n++;
      if (n < lines.length) { render(bubble([lines[n]])); return; }
      if (n < 2) return; // 「흠…」을 잠깐 보여 준다
      if (!res && !err) return;
      clearInterval(iv); if (done) return; done = true;
      if (err) { render(bubble([err.message || '먹이 번졌어. 다시 해 보자.']) + `<button class="btn" id="re">다시 하기</button>`); $('#re').onclick = () => go(ask, 'date'); return; }
      P = res.p; RID = res.rid; KEY = res.key; OFFERS = res.offers; TOCL = res.toc;
      ls.set('cw_last', JSON.stringify({ rid: RID, key: KEY, p: P, offers: OFFERS, toc: TOCL }));
      go(result);
    }, 1500);
  }

  /* ---- 원국표 ---- */
  function wonguk(p) {
    const cols = p.pillars.map(c => c.none ? `<div class="wg-col"><div class="wg-lab">${c.lab}주</div><div class="wg-none">시간<br>모름</div></div>`
      : `<div class="wg-col ${c.lab === '일' ? 'me' : ''}"><div class="wg-lab">${c.lab}주</div><div class="wg-ss">${esc(c.gs)}</div>
        <div class="wg-ch el-${c.ge}">${c.g}<small>${c.gk}·${c.ge}</small></div><div class="wg-ch el-${c.je}">${c.j}<small>${c.jk}·${c.je}</small></div><div class="wg-ss">${esc(c.js)}</div></div>`).join('');
    const max = Math.max(...Object.values(p.el), 1);
    const bar = Object.entries(p.el).map(([k, v]) => `<div><i><b class="el-${k}" style="width:${Math.round(v / max * 100)}%"></b></i>${k} ${v}</div>`).join('');
    const [y, m, d] = p.solar.split('-');
    return `<div class="wonguk">${cols}</div><div class="elbar">${bar}</div>
      <div class="meta">양력 ${+y}.${+m}.${+d} · 음력 ${esc(p.lunar.replace(/-/g, '.'))} · ${esc(p.tti)}띠${p.lmt ? ` · 진태양시 ${p.lmt}` : ''}</div>`;
  }

  /* ---- 5. 맛보기 + 단계별 결제 ---- */
  const won = n => n.toLocaleString('ko-KR') + '원';
  const TIER = {
    one: { tag: '가장 가볍게', pts: f => [`지금 고른 고민(${f}) 한 장만 깊게`, '링크로 언제든 다시 보기'] },
    love: { tag: '주제별', pts: () => ['그 사람을 만나는 곳·놓치는 이유', '내년 인연이 움직이는 달', '타고난 연애 패턴 + 내년 열두 달'] },
    money: { tag: '주제별', pts: () => ['내년 돈 달력 — 들어오는 달·새는 달', '돈 그릇과 모이는 구조', '맞는 일·재능 + 내년 열두 달'] },
    all: { tag: '전부 열기', pts: () => ['위 모든 장 + 오행 채우는 법', '평생 대운 — 10년마다 바뀌는 흐름 전부', '해랑 도령의 한마디'] },
  };
  function tierCards(offers, focusKo, cur) {
    return `<div class="tiers">${offers.filter(o => o.price != null).map(o => `
      <div class="tier ${o.id === 'all' ? 'tier-top' : ''}"><div class="tr-h"><span class="tr-tag">${TIER[o.id].tag}</span><b>${esc(o.name)}</b></div>
        <ul>${TIER[o.id].pts(focusKo).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="tr-p"><span class="now">${won(o.price)}</span>${o.price < o.list ? `<s>${won(o.list)}</s><span class="cred">이미 낸 ${won(o.list - o.price)} 빼 줌</span>` : ''}</div>
        <button class="${o.id === cur ? 'btn' : 'opt'} tr-b" data-buy="${o.id}">${won(o.price)}으로 열기</button></div>`).join('')}</div>`;
  }
  const lockLine = (c, offers) => { const o = offers.find(x => x.id === c.by); return o && o.price != null ? `${esc(o.name)}에서 열림` : ''; };
  const ONE_KEYS = ['self', 'love', 'money', 'year'];
  const PICKS = [['love', '연애·사람', '내 연애 패턴, 끌리는 사람과 꼬이는 지점'], ['money', '돈·일', '돈이 모이는 구조와 새는 구멍'], ['self', '나 자신', '타고난 본성과 숨은 무기'], ['next', '앞으로 뭐가 올지', '내년 열두 달, 달마다 할 일']];
  function result() {
    track('result');
    const p = P, nm = p.name ? p.name : '너';
    const call = p.name ? josa(p.name, '아', '야') : '';
    const one = OFFERS.find(o => o.id === 'one');
    render(`<div class="result">
      <section class="sec">${say([`${call ? call + ', ' : ''}이게 네 사주 원국이야.`])}
        ${wonguk(p)}
        <div class="bubble me-card"><div class="who">${NAME}</div><div class="h">${p.me.icon} ${esc(p.me.g)}(${esc(p.me.ko)}${esc(p.me.el)}) 일간 — 「${esc(p.me.tag)}」</div>
          <p>${esc(p.me.one)}. ${esc(p.me.season)}</p></div>
      </section>
      <section class="sec">${say(['이제부터는 좀 아플 수도 있어.'])}
        <div class="bubble cold"><div class="who">${NAME}</div>${p.cold.map(l => `<p>${esc(l)}</p>`).join('')}</div>
        ${say(['…맞지?'])}
      </section>
      <section class="sec" data-m="s5_reading">${say([`그리고 ${p.year.Y}년.`, `${esc(p.year.gzKo)}년이 ${esc(josa(nm, '이한테', '한테'))}는 이래.`])}
        <div class="big-year">${p.year.Y}</div>
        <div class="big-score">도령이 매긴 운 점수<b>${p.year.score}</b>/ 100</div>
        <div class="card"><div class="ck">${esc(p.year.gzKo)}년 · ${esc(p.year.ss)}의 해</div><div class="ch2">${esc(p.year.head)}</div>
          <p>${esc(p.year.first)}</p><p class="blurline">그해 제일 크게 바뀌는 달은 따로 있어. 그 달이 오기 전에 반드시 정리해야 할 게 하나 있는데</p></div>
        <div class="bubble"><div class="who">${NAME}</div><p>몇 월에 뭘 해야 하는지는… 여기서부터는 복채 받고 할게. 제일 가벼운 건 ${won(one.price)}.</p></div>
      </section>
      <section class="sec" data-m="s6_love">${say(['연애 얘기 궁금하지?'])}
        <div class="card love"><div class="ck">사주가 가리키는 그 사람</div>
          <dl><dt>오는 때</dt><dd class="when">${esc(p.love.when)}</dd>
          <dt>성향</dt><dd>${esc(p.love.vibe)}</dd>
          <dt>첫인상</dt><dd>${esc(p.love.look)}</dd>
          <dt>만나는 곳</dt><dd class="blurline">${esc(p.love.where)}</dd>
          <dt>놓치는 이유</dt><dd class="blurline">네가 먼저 마음을 접는 순간이 있는데 그게 바로</dd></dl></div>
        <div class="bubble"><div class="who">${NAME}</div><p>어디서 만나는지, 왜 놓치는지는 「연애·인연 풀이」에 적어 놨어.</p></div>
      </section>
      <section class="sec">${say(['나머지는 여기 다 있어.'])}
        <div class="toc">${TOCL.map((c, i) => `<div class="chx"><span class="cn">${i + 1}장</span><span class="ct">${esc(c.t)}<small>${ONE_KEYS.includes(c.k) ? `하나 고르면 ${won(one.price)}` : lockLine(c, OFFERS)}</small></span><span class="lk">🔒</span></div>`).join('')}</div>
      </section>
      <section class="sec" id="pick">${say(['그래서, 네가 지금 제일 궁금한 게 뭐야?', `하나만 골라. 그건 ${won(one.price)}에 깊게 봐 줄게.`])}
        <div class="picks">${PICKS.map(([k, w, d]) => `<button class="pick" data-one="${k}"><span><b>${w}</b><small>${d}</small></span><em>${won(one.price)}</em></button>`).join('')}</div>
        ${say(['아예 통째로 보고 싶으면 이것도 있어.'])}
        ${tierCards(OFFERS.filter(o => o.id !== 'one'), p.focusKo, 'all')}
        <p class="fine">한 번 결제 · 구독 아님 · 카카오페이 · 네이버페이 · 토스페이 · 카드</p>
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
    return new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://js.tosspayments.com/v2/standard'; s.onload = ok; s.onerror = () => no(new Error('결제 모듈을 못 불러왔어.')); document.head.appendChild(s); });
  }
  async function pay(prod, focus) {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="sheet"><div class="sh-h"><b>풀이 결제</b><button data-close aria-label="닫기">×</button></div>
      <div class="sh-sum"><span id="snm">…</span><b id="samt"></b></div>
      <div id="pm"><div class="loading" style="color:#8b95a1">결제 수단 불러오는 중…</div></div><div id="ag"></div>
      <p style="margin:10px 18px 0;font-size:12px;color:#8b95a1;line-height:1.5">결제하면 풀이가 바로 열리는 디지털 콘텐츠라, 열린 뒤에는 청약철회가 제한돼요. 풀이가 안 열리면 환불해 드려요. <a href="refund.html" target="_blank" style="color:#4e5968">환불 정책</a></p>
      <div class="err" id="per"></div><button class="btn" id="pgo" disabled>결제하기</button></div>`;
    document.body.appendChild(m);
    const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    const er = t => { const el = m.querySelector('#per'); if (el) el.textContent = t; };
    try {
      const [o] = await Promise.all([api('/api/order', { rid: RID, key: KEY, prod, focus }), loadSdk()]);
      if (o.owned) { close(); openFull(); return; }
      track('pay_open');
      m.querySelector('#snm').textContent = o.orderName; m.querySelector('#samt').textContent = won(o.amount);
      const tp = window.TossPayments(o.clientKey);
      const widgets = tp.widgets({ customerKey: window.TossPayments.ANONYMOUS || 'ANONYMOUS' });
      await widgets.setAmount({ currency: 'KRW', value: o.amount });
      m.querySelector('#pm').innerHTML = '';
      await Promise.all([widgets.renderPaymentMethods({ selector: '#pm', variantKey: 'DEFAULT' }), widgets.renderAgreement({ selector: '#ag', variantKey: 'AGREEMENT' })]);
      if (o.test) m.querySelector('.sh-sum').insertAdjacentHTML('afterend', '<div class="testbar" style="margin:0 18px 6px">테스트 모드 — 실제 돈이 나가지 않아요</div>');
      const btn = m.querySelector('#pgo'); btn.textContent = won(o.amount) + ' 결제하기'; btn.disabled = false;
      btn.onclick = async () => {
        btn.disabled = true; er('');
        ls.set('cw_pending', JSON.stringify({ rid: RID, key: KEY }));
        try {
          await widgets.requestPayment({ orderId: o.orderId, orderName: o.orderName, successUrl: BASE + '?pay=ok', failUrl: BASE + '?pay=fail' });
        } catch (e) { btn.disabled = false; er(e.code === 'USER_CANCEL' ? '' : (e.message || '결제를 못 열었어.')); }
      };
    } catch (e) { er(e.message || '결제창을 못 열었어. 잠시 뒤 다시 해 줘.'); }
  }

  /* ---- 결제에서 돌아왔을 때 ---- */
  async function payReturn() {
    media('s5_reading'); app.classList.remove('blur');
    render(bubble(['결제 확인하는 중이야. 잠깐만.']));
    try {
      const j = await api('/api/confirm', { paymentKey: qs.get('paymentKey'), orderId: qs.get('orderId'), amount: +qs.get('amount') });
      track('paid', { v: +qs.get('amount') || 0 }); if (j.just) track('paid_' + j.just); saveOwned(j.rid, j.key);
      RID = j.rid; KEY = j.key;
      history.replaceState(null, '', `${BASE}?r=${j.rid}&k=${j.key}`);
      showFull(j.f, j.offers);
    } catch (e) {
      render(bubble([e.message || '결제 확인이 안 됐어.', '돈이 빠져나갔는데 이 화면이 보이면, 아래 문의처로 주문번호를 보내 줘.']) + `<p class="fine">주문번호 ${esc(qs.get('orderId') || '')}</p><button class="btn" id="re">맛보기로 돌아가기</button>`);
      $('#re').onclick = backToPreview;
    }
  }
  function backToPreview() {
    try { const l = JSON.parse(ls.get('cw_last') || 'null'); if (l) { P = l.p; RID = l.rid; KEY = l.key; OFFERS = l.offers || OFFERS; TOCL = l.toc || TOCL; history.replaceState(null, '', BASE); go(result); return; } } catch (e) { }
    location.href = BASE;
  }
  function saveOwned(rid, key) { let a = []; try { a = JSON.parse(ls.get('cw_owned') || '[]'); } catch (e) { } if (!a.find(x => x.rid === rid)) a.unshift({ rid, key }); ls.set('cw_owned', JSON.stringify(a.slice(0, 20))); }
  async function openFull(rid, key) {
    media('s5_reading'); render(bubble(['풀이 꺼내는 중…']));
    try { const j = await api(`/api/full?rid=${rid || RID}&key=${key || KEY}`); RID = j.rid; KEY = j.key; showFull(j.f, j.offers); }
    catch (e) { render(bubble([e.status === 402 ? '아직 결제가 안 된 풀이야.' : (e.message || '풀이를 못 찾았어.')]) + `<button class="btn" id="re">처음으로</button>`); $('#re').onclick = () => location.href = BASE; }
  }

  /* ---- 6. 산 풀이 + 위 단계 ---- */
  function showFull(f, offers) {
    app.classList.add('blur'); media('key', true);
    hist.length = 0; back.classList.remove('on');
    const link = `${BASE}?r=${RID}&k=${KEY}`;
    const left = (offers || []).filter(o => o.price != null);
    const dyRow = (d, l, on) => `<div class="dy ${on ? 'on' : ''}"><div class="gz">${esc(d.ko)}<small>${l}${d.age}세~</small></div><p>${esc(d.txt)} <span style="color:var(--dim);font-size:13px">(${esc(d.ss)} 대운, ${d.year}년부터)</span></p></div>`;
    const chapter = (c, i) => {
      if (c.locked) return `<div class="chap lockd"><div class="cn">${i + 1}장 🔒</div><h3>${esc(c.t)}</h3><p class="blurline">이 장에는 네 원국으로 계산한 내용이 들어 있어. 열면 바로 보여.</p><div class="lk2">${lockLine(c, offers || [])}</div></div>`;
      let extra = '';
      if (c.months) extra = `<div class="months">${c.months.map(m => `<div class="mo"><b>${m.mo}월</b><div>${esc(m.line)}${m.note ? ` ${esc(m.note)}` : ''}<small>${esc(m.ko)}월 · ${esc(m.ss)}</small></div></div>`).join('')}</div>`;
      if (c.all) extra = c.all.map((d, k) => dyRow(d, k === c.nowIdx ? '지금 · ' : '', k === c.nowIdx)).join('');
      return `<div class="chap"><div class="cn">${i + 1}장</div><h3>${esc(c.t)}</h3>${c.p.map(x => `<p>${esc(x)}</p>`).join('')}${extra}</div>`;
    };
    const opened = f.ch.filter(c => !c.locked).length;
    render(`<div class="result">
      <section class="sec in">${say([`${f.name ? josa(f.name, '이', '') + '의' : '너의'} 풀이`, `${f.ch.length}장 중 ${opened}장 열림`])}
        ${wonguk(f)}
        ${homeBox()}
        ${f.ch.map((c, i) => [c, i]).sort((x, y) => (x[0].locked ? 1 : 0) - (y[0].locked ? 1 : 0)).map(([c, i]) => chapter(c, i)).join('')}
        ${left.length ? `${say(['잠긴 장도 마저 볼래?'])}${tierCards(left, f.focusKo, left.find(o => o.id === 'all') ? 'all' : left[0].id)}` : ''}
        <button class="opt" id="again">다른 사람 사주도 보기</button>
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
  window.addEventListener('appinstalled', () => { track('a2hs_done'); const h = document.getElementById('home'); if (h) h.innerHTML = '<p class="hk">홈 화면에 놨어. 이제 거기서 바로 열어.</p>'; });

  function manifestFor(url) {                       // 홈 아이콘이 이 풀이 주소로 바로 열리게(주소에 열쇠가 들어 있다)
    const m = { name: '해랑사주', short_name: '해랑사주', start_url: url + '&src=home', scope: BASE, display: 'standalone', background_color: '#0b0a10', theme_color: '#0b0a10',
      icons: [192, 512].map(z => ({ src: `${BASE}icon-${z}.png`, sizes: `${z}x${z}`, type: 'image/png', purpose: 'any' })) };
    let l = document.querySelector('link[rel=manifest]'); if (!l) { l = document.createElement('link'); l.rel = 'manifest'; document.head.appendChild(l); }
    l.href = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: 'application/manifest+json' }));
  }
  function homeBox() {
    if (isStandalone()) return '';
    const mobile = isAnd || isIOS;
    if (!mobile) return `<div class="savebox">이 주소를 저장해 두면 언제든 다시 볼 수 있어. 더 산 장도 같은 주소에 붙어.<button class="btn" id="cp">풀이 링크 복사</button></div>`;
    let how = '', btn = '';
    if (isKakao) { how = '카톡 안에서는 홈 화면에 못 놔. 바깥 브라우저로 먼저 열어.'; btn = `<button class="btn" id="hout">${isIOS ? 'Safari' : '크롬'}로 열기</button>`; }
    else if (inApp && isAnd) { how = '이 앱 안 화면에서는 홈 화면에 못 놔. 크롬으로 열면 버튼 한 번이야.'; btn = '<button class="btn" id="hout">크롬으로 열기</button>'; }
    else if (inApp && isIOS) {
      how = `<b>이 앱 안 화면에서는 홈 화면에 못 놔.</b><ol><li>오른쪽 위(또는 아래) <b>⋯</b> 누르기</li><li><b>「외부 브라우저에서 열기」</b> 또는 <b>「Safari로 열기」</b></li><li>Safari에서 이 상자가 다시 나오면 따라 하기</li></ol>`;
      btn = '<button class="opt" id="hcp">안 보이면: 링크 복사 → Safari에 붙여넣기</button>';
    }
    else if (iosOther) { how = '아이폰은 <b>Safari에서만</b> 홈 화면에 놓을 수 있어.'; btn = '<button class="btn" id="hout">Safari로 열기</button><p class="hk">안 열리면 링크를 복사해서 Safari에 붙여넣어.</p><button class="opt" id="hcp">링크 복사</button>'; }
    else if (isIOS) {
      const v26 = /Version\/(2[6-9]|[3-9]\d)/.test(UA);
      how = `<ol>${v26 ? '<li>주소창 왼쪽 <b>≡</b> 누르기 <span class="hk">(옛 모양이면 아래쪽 <b>⋯</b>)</span></li>' : '<li>아래쪽 <b>공유</b> 버튼(네모에 ↑) <span class="hk">(안 보이면 오른쪽 아래 <b>⋯</b> → 공유)</span></li>'}${v26 ? '<li><b>공유</b> 누르기</li>' : ''}<li>목록을 아래로 내려 <b>「홈 화면에 추가」</b></li><li>오른쪽 위 <b>추가</b></li></ol>`;
    }
    else { how = '버튼 한 번이면 앱처럼 홈 화면에 생겨.'; btn = `<button class="btn" id="hgo" ${bip ? '' : 'hidden'}>홈 화면에 추가</button><p class="hk" id="hman">${bip ? '' : '버튼이 안 보이면: 오른쪽 위 <b>⋮</b> → <b>「홈 화면에 추가」</b> (삼성 인터넷은 <b>≡</b> → <b>「현재 페이지 추가」</b>)'}</p>`; }
    return `<div class="homebox" id="home"><div class="hh"><img src="icon-192.png" alt=""><div><b>홈 화면에 해랑사주 두기</b><span>앱처럼 바로 열리고, 산 풀이가 그대로 붙어 있어.</span></div></div>
      <div class="hw">${how}</div>${btn}<button class="lnk" id="cp">풀이 링크만 복사</button></div>`;
  }
  function bindHome(link) {
    manifestFor(link);
    const copy = async b => { try { await navigator.clipboard.writeText(link); b.textContent = '복사했어 ✓'; } catch (e) { prompt('이 주소를 복사해 둬', link); } };
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
      if (c && c.outcome === 'accepted') { track('a2hs_done'); $('#home').innerHTML = '<p class="hk">홈 화면에 놨어. 이제 거기서 바로 열어.</p>'; }
    };
    if (qs.get('a2hs')) {                          // 앱 안 브라우저에서 넘어온 참: 바로 안내를 보여 준다
      const u = new URL(location.href); u.searchParams.delete('a2hs'); history.replaceState(null, '', u.pathname + u.search);
      setTimeout(() => $('#home') && $('#home').scrollIntoView({ block: 'center', behavior: 'smooth' }), 400);
    }
  }
  function bizFoot() {
    const b = window.CFG.BIZ;
    return `<div class="biz">${esc(b.name)} · 대표 ${esc(b.ceo)} · 사업자등록번호 ${esc(b.no)}<br>${b.ecom ? `통신판매업 ${esc(b.ecom)} · ` : ''}${esc(b.addr)}<br>고객센터 ${esc(b.tel)} · ${esc(b.mail)}<br>
      <a href="terms.html">이용약관</a> · <a href="refund.html">환불 정책</a> · <a href="privacy.html">개인정보처리방침</a></div>`;
  }

  /* ---- 시작 ---- */
  track('view');
  if (qs.get('pay') === 'ok' && qs.get('paymentKey')) payReturn();
  else if (qs.get('pay') === 'fail') {
    media('s5_reading'); const code = qs.get('code');
    render(bubble([code === 'PAY_PROCESS_CANCELED' || code === 'USER_CANCEL' ? '결제를 취소했네. 괜찮아, 맛보기는 그대로 있어.' : (qs.get('message') || '결제가 안 됐어.')]) + `<button class="btn" id="re">맛보기로 돌아가기</button>`);
    $('#re').onclick = backToPreview;
  }
  else if (/^[a-f0-9]{16}$/.test(qs.get('r') || '')) { if (qs.get('src') === 'home' || isStandalone()) track('home_open'); openFull(qs.get('r'), qs.get('k')); }
  else if (isStandalone() && (() => { try { return JSON.parse(ls.get('cw_owned') || '[]')[0]; } catch (e) { } })()) { const o = JSON.parse(ls.get('cw_owned'))[0]; track('home_open'); openFull(o.rid, o.key); }
  else go(intro);
})();
