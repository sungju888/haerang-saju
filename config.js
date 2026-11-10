/* 배포마다 바꾸는 값. PIXEL_ID 를 넣으면 메타 픽셀이 켜진다.
 * BIZ 는 전자상거래법·PG 심사에 필요한 사업자 표시(넥시스). */
window.CFG = {
  PIXEL_ID: '',
  API: 'https://haerang-api.sayblackday.workers.dev',   // 계산·결제 워커(로컬 미리보기도 이걸 쓴다, CORS 로 github.io·localhost 만 허용)
  MEDIA_V: 4,           // 그림·영상을 갈아 끼우면 올린다(/m/* 는 일주일 캐시)
  BIZ: {
    name: '넥시스', ceo: '조성주', no: '482-26-02122', tel: '010-7224-4668',
    mail: 'contact@soody.date', addr: '대전광역시 유성구 대학로155번길 30, 103호', ecom: '',   // 통신판매업 신고번호: 받으면 넣는다(비어 있으면 안 보임)
  },};
