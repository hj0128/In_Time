const back = document.querySelector('#back');
back.addEventListener('click', () => {
  window.location = document.referrer;
});

window.onload = () => {
  const inputElements = document.querySelectorAll('input');
  inputElements.forEach((input) => {
    if (input.type !== 'button' && input.type !== 'submit' && input.type !== 'reset') {
      input.value = '';
    }
  });
};


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const planID = urlParams.get('id');


const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 4,
};
const map = new kakao.maps.Map(mapContainer, mapOptions);


// 파티 정보 세팅하기
const setPartyInfo = async ({ partyID }) => {
  try {
    const party = await axios.get('/party/partyFindOneWithPartyID', {
      params: { partyID },
    });

    const title = document.querySelector('#body_wrapper_left_title');

    const center = document.createElement('span');
    const right = document.createElement('span');

    center.className = 'body_wrapper_left_title_center';
    right.className = 'body_wrapper_left_title_right';

    center.innerText = party.data.name;
    right.innerText = `${party.data.point} 원`;

    title.appendChild(center);
    title.appendChild(right);
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('파티 정보를 불러오던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};


// 플랜 정보 세팅하기 (타이틀)
const setPlanInfo = ({ planName, placeName, date, fine }) => {
  document.querySelector('#plan_name').innerText = planName;
  document.querySelector('#place_name').innerText = placeName;
  document.querySelector('#date').innerText = date.replace('T', ' ');
  document.querySelector('#fine').innerText = `${fine}원`;
};


// 도착지 정보 세팅하기 (마커)
const setPlaceMarker = ({ placeAddress, placeLat, placeLng }) => {
  const placeLatLng = new kakao.maps.LatLng(placeLat, placeLng);

  map.panTo(placeLatLng);

  const marker = new kakao.maps.Marker({
    map,
    position: placeLatLng,
    clickable: true,
  });

  const content = `
    <div class="infoWindow_place">
      <div class="infoWindow_place_address">${placeAddress}</div>
    </div>`;
  const infoWindow = new kakao.maps.InfoWindow({
    content,
  });

  kakao.maps.event.addListener(marker, 'click', () => {
    if (infoWindow.getMap()) {
      infoWindow.close();
    } else {
      infoWindow.open(map, marker);
    }
  });

  kakao.maps.event.addListener(map, 'click', () => {
    infoWindow.close();
  });

  const placeLocation = document.querySelector('#place_location');

  placeLocation.addEventListener('click', () => {
    map.panTo(placeLatLng);
  });
};


// 멤버들 아이콘 세팅하기
const setUsersIcon = ({ usersName, usersImage }) => {
  for (let i in usersName) {
    // 멤버들 아이콘 표시
    const usersIconList = document.querySelector('#users_icon_list');

    const userIcon = document.createElement('div');
    const imgEl = document.createElement('img');
    const textEl = document.createElement('div');

    userIcon.className = 'user_icon';
    imgEl.className = `${usersName[i]}_img`;
    textEl.className = `${usersName[i]}_text`;

    imgEl.src = usersImage[i];
    textEl.innerText = '사용자 위치 찾는 중...';

    userIcon.appendChild(imgEl);
    userIcon.appendChild(textEl);
    usersIconList.appendChild(userIcon);
  }
};


const setArrive = ({ userName }) => {
  const userArriveList = document.querySelector('#user_arrive_list');

  const existingUserElement = userArriveList.querySelector(`.${userName}`);
  if (!existingUserElement) {
    const el = document.createElement('div');
    el.className = userName;
    el.innerHTML = userName;

    userArriveList.appendChild(el);
  }
};


// 멤버들 위치 업데이트
const getUserLocation = async ({ usersName, usersImage }) => {
  const res = await axios.get('/user/userGetRedis', {
    params: { usersName },
  });
  const usersLocation = res.data;
  // [ {userName: 철수, myLat: 35, myLng: 123, time, isArrive}, {userName: 행주, myLat: 35, myLng: 123}]

  for (let i in usersLocation) {
    const target = usersLocation[i];
    const latlng = new kakao.maps.LatLng(target.myLat, target.myLng);

    // 도착했으면 표시
    if (target.isArrive) {
      setArrive({ userName: target.userName });
    }

    // 멤버들 마커 표시
    const marker = new kakao.maps.CustomOverlay({
      map,
      position: latlng,
      content: `<img class="user_marker" src="${usersImage[i]}">`,
    });

    const userIconText = document.querySelector(`.${target.userName}_text`);
    if (target.myLat && target.myLng) {
      userIconText.innerText = `${target.time}`;
    }

    // 아이콘 클릭 시 해당 유저의 위치로 이동
    const userIcon = document.querySelector(`.${target.userName}_img`);
    userIcon.addEventListener('click', () => {
      if (target.myLat && target.myLng) {
        map.panTo(latlng);
      }
    });
  }
};


// 시간이 종료됐을 때 벌금 내기 (이미 냈는지 확인 후)
const userFine = async ({ usersName, partyID }) => {
  try {
    const plan = await axios.get('/plan/planFindOneWithPlanID', { params: { planID } });
    if (plan.data.isEnd) return;

    const res = await axios.get('/user/userGetRedis', {
      params: { usersName },
    });
    const users = res.data;

    const tardyUser = users.filter((user) => !user.isArrive).map((user) => user.userName);

    // 플랜 업데이트
    // 파티 업데이트
    // 유저 업데이트
    await axios.post('/party/partyUpdateAndUserAndPlan', {
      planID,
      partyID,
      users: tardyUser,
    });
  } catch (error) {
    if (error.response.status === 400 || error.response.status === 422) {
      alert(error.response.data.message);
    } else {
      alert('벌금 처리를 하던 중 오류가 발생하였습니다. \n새로고침을 눌러주세요.');
    }
  }
};


// 내 위치에서 목적지까지의 거리 구하기
const distanceLocation = ({ placeLat, placeLng, myLat, myLng }) => {
  const earthRadius = 6371000;

  const _myLat = Number(myLat) * (Math.PI / 180);
  const _myLng = Number(myLng) * (Math.PI / 180);
  const _placeLat = Number(placeLat) * (Math.PI / 180);
  const _placeLng = Number(placeLng) * (Math.PI / 180);

  const dLat = _placeLat - _myLat;
  const dLon = _placeLng - _myLng;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(_myLat) * Math.cos(_placeLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};


// 내 위치 저장하기
const setUsersLocation = async ({ usersName, partyID, endTimeDiff, placeLat, placeLng, intervalID }) => {
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true, // 높은 정확도
      timeout: 10000, // 10초내에 위치 정보 못가져오면 에러 발생
      maximumAge: 0, // 항상 새로운 위치 정보 요청
      distanceFilter: 50, // 50m 이상 이동 시에만 위치 정보 업데이트
    };

    // 주기적으로 내 위치 업데이트하기
    const watchID = navigator.geolocation.watchPosition(
      async (position) => {
        setTimeout(async () => {
          navigator.geolocation.clearWatch(watchID);
          clearInterval(intervalID);

          // 누가 지각했는지 보고 지각한 사람 돈 뺏기
          await userFine({ usersName, partyID });

          alert('약속 시간이 종료되었습니다.');
        }, endTimeDiff);

        const myLat = position.coords.latitude;
        const myLng = position.coords.longitude;

        const date = new Date(position.timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;

        // 현재 내 위치와 목적지 위치 거리 구하기
        const distance = distanceLocation({ placeLat, placeLng, myLat, myLng });

        // 내 위치 업데이트
        // 도착지 50m 안에 들어오면 도착했다는 표시하기
        if (distance <= 50) { // 50m 안이면 목적지 도착, 위치 저장 멈추기
          navigator.geolocation.clearWatch(watchID);
          await axios.post('/user/userSetRedis', { myLat, myLng, time, isArrive: true });
          alert('목적지에 도착하였습니다.');
        } else { // 50m 밖이면 계속 위치 저장하기
          await axios.post('/user/userSetRedis', { myLat, myLng, time, isArrive: false });
        }
      },
      (error) => {
        console.log(error);
      },
      options,
    );
  }
};


const setChat = ({ partyID }) => {
  let socket = io();

  const chatContainer = document.querySelector('#chat_container');
  const chatList = document.querySelector('#chat_list');
  const messageInfo = document.querySelector('#message_info');
  const messageSubmit = document.querySelector('#message_submit');

  const displayChatHistory = (history) => {
    chatList.innerHTML = '';

    history.forEach((chat) => {
      const li = document.createElement('li');
      li.className = 'chat_item';

      const p = document.createElement('p');
      p.textContent = `${chat.userName}: ${chat.message}`;

      li.appendChild(p);
      chatList.appendChild(li);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  const appendMessage = (message) => {
    const li = document.createElement('li');
    li.className = 'chat-item';

    const p = document.createElement('p');
    p.textContent = message;

    li.appendChild(p);
    chatList.appendChild(li);

    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  const joinRoom = () => {
    socket.emit('join', { room: partyID });
  };
  joinRoom();

  socket.on('chatHistory', ({ history }) => {
    displayChatHistory(history);
  });

  socket.on('chatMessage', ({ message, userName }) => {
    appendMessage(`${userName} : ${message}`);
  });

  const messageSubmitHandler = () => {
    const accessToken = axios.defaults.headers.common['Authorization'].split('Bearer ')[1];

    socket = io('http://localhost:3000', {
      query: { token: accessToken },
    });

    if (messageInfo.value.trim() !== '') {
      socket.emit('chatMessage', { message: messageInfo.value, room: partyID });

      // 메시지 전송 후 입력 필드 비우기
      messageInfo.value = '';
    }
  };
  messageInfo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      messageSubmitHandler();
    }
  });
  messageSubmit.addEventListener('click', messageSubmitHandler);

}


// 페이지에 필요한 모든 정보를 가져옴
const getPlan = async () => {
  try {
    // 플랜 정보 가져오기
    const plan = await axios.get('/plan/planFindOneWithPlanID', { params: { planID } });
    const { planName, placeName, placeAddress, placeLat, placeLng, date, fine, party } = plan.data;
    const partyID = party.id;

    // 플랜에 속한 멤버 정보 가져오기
    const partyUser = await axios.get('/partyUser/partyUserFindAllWithPartyID', {
      params: { partyID },
    });

    // 멤버들 이름과 이미지가 담긴 배열
    // [철수, 행주]
    // [철수사진, 행주사진]
    const usersName = [];
    const usersImage = [];
    partyUser.data.forEach((el) => {
      usersName.push(el.user.name);
      usersImage.push(el.user.profileUrl);
    });

    // 파티 정보 세팅하기 (맨 위 타이틀)
    setPartyInfo({ partyID });

    // 플랜 정보 세팅하기 (맨 위 타이틀)
    setPlanInfo({ planName, placeName, date, fine });

    // 도착지 마커 세팅하기
    setPlaceMarker({ placeAddress, placeLat, placeLng });

    // 멤버들 아이콘 세팅하기
    setUsersIcon({ usersName, usersImage });

    // 채팅 가져오기
    setChat({ partyID });

    // 약속 시간까지의 시간차 구하기
    const currentDate = new Date().getTime(); // 현재시간 2023 09:48
    const targetDate = new Date(date).getTime(); // 약속시간 2023 10:13
    const targetMinus30ms = new Date(targetDate - 30 * 60 * 1000).getTime(); // 약속시간 30분 전 2023 09:43
    const startTimeDiff = targetMinus30ms - currentDate; // 플러스: 30분 전 안된거, 마이너스: 30분 전 지난거(즉시 실행)
    const endTimeDiff = targetDate - currentDate; // 종료 시간까지 남은 시간

    setTimeout(async () => {
      // 멤버들 위치 업데이트
      await getUserLocation({ usersName, usersImage });
      const intervalID = setInterval(async () => {
        await getUserLocation({ usersName, usersImage });
      }, 3000);

      // 내 위치 저장하기
      await setUsersLocation({ usersName, partyID, endTimeDiff, placeLat, placeLng, intervalID });
    }, startTimeDiff);
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('약속을 불러오던 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  }
};
getPlan();


const pointSend = document.querySelector('#point_send');
const pointSendClickHandler = async () => {
  try {
    const amount = prompt('보낼 금액을 입력해 주세요.', '5000');
    if (amount === null) return;
    if (amount <= 0) {
      alert('1원 이상부터 보낼 수 있습니다.');
      return;
    }

    await axios.post('/point/pointPartyPointToUser', {
      partyID,
      amount: Number(amount),
    });

    alert(`${amount}원을 보냈습니다.`);
    window.location.href = `/party?id=${partyID}`;
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