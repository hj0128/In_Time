const kakao = document.querySelector('#kakao');
const nhn = document.querySelector('#nhn');
const paymentClickHandler = async (pay) => {
  const point = document.querySelector('#point');
  if (!point.value) return alert('금액을 입력해 주세요.');

  let pg;
  if (pay === 'kakao') {
    pg = 'kakaopay';
  } else if (pay === 'nhn') {
    pg = 'kcp.AO09C';
  }

  const IMP = window.IMP;
  IMP.init('imp41767864');

  try {
    IMP.request_pay(
      {
        pg: pg,
        pay_method: 'card',
        name: `${point.value}원 충전`,
        amount: point.value,
        m_redirect_url: 'http://localhost:3000/mypage',
      },
      async (rsp) => {
        if (rsp.success) {
          console.log(rsp);
          await axios.post('/point/pointFill', {
            impUid: rsp.imp_uid,
            amount: rsp.paid_amount,
          });

          alert('결제에 성공하였습니다.');
          window.location.href = '/mypage';
        } else {
          alert('결제에 실패하였습니다.');
        }
      },
    );
  } catch (error) {
    if (error.response.data.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else if (error.response.status === 422 || error.response.status === 409) {
      alert(error.response.data.message);
    } else {
      alert('결제를 처리하던 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  }
};
kakao.addEventListener('click', () => paymentClickHandler('kakao'));
nhn.addEventListener('click', () => paymentClickHandler('nhn'));
