/* 배포마다 바꾸는 값. PIXEL_ID 를 넣으면 메타 픽셀이 켜진다.
 */
window.CFG = {
  PIXEL_ID: '',
  API: 'https://haerang-api.sayblackday.workers.dev',   // 계산·결제 워커(로컬 미리보기도 이걸 쓴다, CORS 로 github.io·localhost 만 허용)
  MEDIA_V: 4,           // 그림·영상을 갈아 끼우면 올린다(/m/* 는 일주일 캐시)
  // 판매자 표시(SOODY SDN. BHD.)와 화면 말은 i18n.js 에 있다.
};
