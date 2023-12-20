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


const setPlanInfo = ({ planName, placeName, date, fine }) => {
  document.querySelector('#plan_name').innerText = planName;
  document.querySelector('#place_name').innerText = placeName;
  document.querySelector('#date').innerText = date.replace('T', ' ');
  document.querySelector('#fine').innerText = `${fine}원`;
};


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


const usersMarker = [];
const getUserLocation = async ({ usersName, usersImage }) => {
  usersMarker.forEach((marker) => marker.setMap(null));

  const res = await axios.get('/userLocation/userLocationFindWithUsersName', {
    params: { usersName, planID },
  });
  const usersLocation = res.data;

  for (let i in usersLocation) {
    const target = usersLocation[i];
    const latlng = new kakao.maps.LatLng(target.lat, target.lng);

    if (target.isArrive) {
      setArrive({ userName: target.name });
    }

    const marker = new kakao.maps.CustomOverlay({
      map,
      position: latlng,
      content: `<img class="user_marker" src="${usersImage[i]}">`,
    });
    usersMarker.push(marker);

    const userIconText = document.querySelector(`.${target.name}_text`);
    if (target.lat && target.lng) {
      userIconText.innerText = `${target.time}`;
    }

    const userIcon = document.querySelector(`.${target.name}_img`);
    userIcon.addEventListener('click', () => {
      if (target.lat && target.lng) {
        map.panTo(latlng);
      }
    });
  }
};


const userFine = async ({ usersName, partyID }) => {
  try {
    const plan = await axios.get('/plan/planFindOneWithPlanID', { params: { planID } });
    if (plan.data.isEnd) return;

    const res = await axios.get('/userLocation/userLocationFindWithUsersName', {
      params: { usersName, planID },
    });
    const users = res.data;

    const tardyUser = users.filter((user) => !user.isArrive).map((user) => user.name);

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


const distanceLocation = ({ placeLat, placeLng, lat, lng }) => {
  const earthRadius = 6371000;

  const _lat = Number(lat) * (Math.PI / 180);
  const _lng = Number(lng) * (Math.PI / 180);
  const _placeLat = Number(placeLat) * (Math.PI / 180);
  const _placeLng = Number(placeLng) * (Math.PI / 180);

  const dLat = _placeLat - _lat;
  const dLon = _placeLng - _lng;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(_lat) * Math.cos(_placeLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};


const setUsersLocation = async ({
  usersName,
  partyID,
  planID,
  endTimeDiff,
  placeLat,
  placeLng,
  intervalID,
}) => {
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      distanceFilter: 50,
    };

    const watchID = navigator.geolocation.watchPosition(
      async (position) => {
        setTimeout(async () => {
          navigator.geolocation.clearWatch(watchID);
          clearInterval(intervalID);

          await userFine({ usersName, partyID });

          alert('약속 시간이 종료되었습니다.');
        }, endTimeDiff);

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const date = new Date(position.timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;

        const distance = distanceLocation({ placeLat, placeLng, lat, lng });

        if (distance <= 50) {
          navigator.geolocation.clearWatch(watchID);
          await axios.post('/userLocation/userLocationCreate', {
            lat,
            lng,
            time,
            isArrive: true,
            planID,
          });
          alert('목적지에 도착하였습니다.');
        } else {
          await axios.post('/userLocation/userLocationCreate', {
            lat,
            lng,
            time,
            isArrive: false,
            planID,
          });
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

    socket = io('https://hyeonju.shop', {
      query: { token: accessToken },
    });

    if (messageInfo.value.trim() !== '') {
      socket.emit('chatMessage', { message: messageInfo.value, room: partyID });

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


const getPlan = async () => {
  try {
    const plan = await axios.get('/plan/planFindOneWithPlanID', { params: { planID } });
    const { planName, placeName, placeAddress, placeLat, placeLng, date, fine, party } = plan.data;
    const partyID = party.id;

    const partyUser = await axios.get('/partyUser/partyUserFindAllWithPartyID', {
      params: { partyID },
    });

    const usersName = [];
    const usersImage = [];
    partyUser.data.forEach((el) => {
      usersName.push(el.user.name);
      usersImage.push(el.user.profileUrl);
    });

    setPartyInfo({ partyID });

    setPlanInfo({ planName, placeName, date, fine });

    setPlaceMarker({ placeAddress, placeLat, placeLng });

    setUsersIcon({ usersName, usersImage });

    setChat({ partyID });

    const currentDate = new Date().getTime();
    const targetDate = new Date(date).getTime();
    const targetMinus30ms = new Date(targetDate - 30 * 60 * 1000).getTime();
    const startTimeDiff = targetMinus30ms - currentDate;
    const endTimeDiff = targetDate - currentDate;

    setTimeout(async () => {
      await getUserLocation({ usersName, usersImage });
      const intervalID = setInterval(async () => {
        await getUserLocation({ usersName, usersImage });
      }, 3000);

      await setUsersLocation({
        usersName,
        partyID,
        planID,
        endTimeDiff,
        placeLat,
        placeLng,
        intervalID,
      });
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
