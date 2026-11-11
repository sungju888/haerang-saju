/* 배포마다 바꾸는 값. PIXEL_ID 를 넣으면 메타 픽셀이 켜진다.
 */
window.CFG = {
  PIXEL_ID: '',
  API: /^(127\.0\.0\.1|localhost)$/.test(location.hostname) ? 'https://haerang-api.sayblackday.workers.dev' : '',   // 화면과 API 가 같은 주소(로컬 미리보기만 워커를 부른다)
  MEDIA_V: 5,
  GOOGLE_CLIENT_ID: '203490548055-2i8icd6b1kle38k0tvhiku48p85brkal.apps.googleusercontent.com',   // 구글 로그인(모든 나라). wrangler.toml [vars] 와 같은 값
  KAKAO_JS_KEY: '',       // 카카오 로그인(한국판만). 카카오 디벨로퍼스 JavaScript 키           // 그림·영상을 갈아 끼우면 올린다(/m/* 는 일주일 캐시)
  // 판매자 표시(SOODY SDN. BHD.)와 화면 말은 i18n.js 에 있다.
};
