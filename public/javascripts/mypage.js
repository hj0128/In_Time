const back = document.querySelector('#back');
back.addEventListener('click', () => {
  window.history.back();
  window.location.reload(true);
});

window.onload = () => {
  const inputElements = document.querySelectorAll('input');
  inputElements.forEach((input) => {
    if (input.type !== 'button' && input.type !== 'submit' && input.type !== 'reset') {
      input.value = '';
    }
  });
};


const getUser = async () => {
  try {
    const user = await axios.get('/user/userFindOneWithUserID');
    const { id, name, email, profileUrl, badgeUrl, point } = user.data;

    const points = await axios.get('point/pointFindWithUserID', {
      params: { userID: id },
    });
    points.data.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const profileImage = document.querySelector('#profile_image');
    const userName = document.querySelector('#name');
    const userBadge = document.querySelector('#badge_image');
    const userEmail = document.querySelector('#email');
    const userPoint = document.querySelector('#point');
    const pointBody = document.querySelector('#point_body');

    profileImage.src = profileUrl;
    userName.innerText = name;
    userBadge.src = badgeUrl;
    userEmail.innerText = email;
    userPoint.innerText = point;

    for (let i = 0; i < points.data.length; i++) {
      const { amount, status, createdAt } = points.data[i];

      const dateTime = new Date(createdAt);
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toISOString().split('T')[1].split('.')[0].slice(0, -3);
      const createDate = `${date}  ${time}`;

      const el = document.createElement('div');
      el.className = 'point_history';

      let history;
      if (status === 'POINT_FILL') {
        history = '포인트 채우기';
      } else if (status === 'POINT_SEND') {
        history = '포인트 보내기';
      } else if (status === 'FINE') {
        history = '벌금';
      }

      itemStr = `
        <div class="point_history_left">
          <div class="history">${history}</div>
        </div>
        <div class="point_history_center">
          <div class="point">${amount}</div>
        </div>
        <div class="point_history_right">
          <div class="create_time">${createDate}</div>
        </div>
      `;

      el.innerHTML = itemStr;

      pointBody.appendChild(el);
    }
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('내 정보를 불러오던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};
getUser();


const logout = document.querySelector('#logout');
const logoutClickHandler = async () => {
  try {
    const res = await axios.post('/auth/authLogout');
    alert(res.data);
    window.location.href = '/';
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('로그아웃을 하던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};
logout.addEventListener('click', logoutClickHandler);


const pointFill = document.querySelector('#point_fill');
const pointFillClickHandler = () => {
  window.location.href = '/point';
};
pointFill.addEventListener('click', pointFillClickHandler);


const pointSend = document.querySelector('#point_send');
const pointSendClickHandler = async () => {
  try {
    const amount = prompt('보낼 금액을 입력해 주세요.', '5000');
    if (amount === null) return;

    await axios.post('/point/pointSend', {
      amount: Number(amount),
    });

    alert(`${amount}원을 보냈습니다.`);
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else if (error.response.status === 422) {
      alert(error.response.data.message);
    } else {
      alert('포인트를 내보내던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};
pointSend.addEventListener('click', pointSendClickHandler);
