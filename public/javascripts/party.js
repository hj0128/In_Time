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
const partyID = urlParams.get('id');

const planCreate = document.querySelector('#plan_create');
planCreate.setAttribute('href', `/plan/create?id=${partyID}`);


const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 4,
};

const map = new kakao.maps.Map(mapContainer, mapOptions);

const infoWindow = new kakao.maps.InfoWindow({
  zIndex: 1,
});


const placeSubmit = async (name, address, lat, lng) => {
  const isSubmit = confirm(`마커(${name})를 지도에 등록하시겠습니까?`);
  if (!isSubmit) return;

  try {
    await axios.post('/marker/markerCreate', {
      name,
      address,
      lat,
      lng,
      partyID,
    });

    alert(`지도에 마커를 등록하였습니다.`);
    window.location.href = `/party?id=${partyID}`;
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else if (error.response.status === 409) {
      alert('이미 저장된 주소입니다.');
    } else {
      alert('마커를 등록하던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};


const placeDelete = async (name, lat, lng) => {
  const isDelete = confirm(`마커(${name})를 지도에서 해제하시겠습니까?`);
  if (!isDelete) return;

  try {
    await axios.delete('/marker/markerDelete', {
      data: {
        lat,
        lng,
        partyID,
      },
    });

    alert(`마커 등록을 해제하였습니다.`);
    window.location.href = `/party?id=${partyID}`;
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else if (error.response.status === 409) {
      alert('저장되지 않은 주소입니다.');
    } else {
      alert('마커를 삭제하던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};


const displayInfoWindow = (marker, place_name, address_name, y, x) => {
  const content = `
  <div class='infoWindow_info'>
  <div class='infoWindow_info_title'>${place_name}</div>
  <div class='infoWindow_info_address'>${address_name}</div>
  <button onClick="placeSubmit('${place_name}', '${address_name}', ${y}, ${x});">등록</button>
  </div>`;

  map.panTo(marker.getPosition());
  infoWindow.setContent(content);
  infoWindow.open(map, marker);
};

const removeMarker = () => {
  for (let i = 0; i < markerSearchList.length; i++) {
    markerSearchList[i].setMap(null);
  }
  markerSearchList = [];
};

let markerSearchList = [];
const displayPlaces = (data) => {
  removeMarker();
  const bounds = new kakao.maps.LatLngBounds();

  for (let i = 0; i < data.length; i++) {
    const { place_name, address_name, y, x } = data[i];

    const placePosition = new kakao.maps.LatLng(y, x);
    bounds.extend(placePosition);

    const marker = new kakao.maps.Marker({
      position: placePosition,
    });

    marker.setMap(map);
    markerSearchList.push(marker);

    kakao.maps.event.addListener(marker, 'click', () => {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        displayInfoWindow(marker, place_name, address_name, y, x);
      }
    });

    kakao.maps.event.addListener(map, 'click', () => {
      infoWindow.close();
    });
  }
  map.setBounds(bounds);
};

const placesSearchCB = (data, status) => {
  if (status === kakao.maps.services.Status.OK) {
    displayPlaces(data);
  } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
    alert('검색 결과가 존재하지 않습니다.');
    return;
  } else if (status === kakao.maps.services.Status.ERROR) {
    alert('검색 결과 중 오류가 발생하였습니다.');
    return;
  }
};

const ps = new kakao.maps.services.Places();
const searchPlaces = () => {
  const keyword = document.querySelector('#keyword').value;
  ps.keywordSearch(keyword, placesSearchCB);
};


const getMarker = async () => {
  try {
    const markers = await axios.get('/marker/markerFindAllWithPartyID', {
      params: { partyID },
    });

    const markerList = [];
    const infoWindowList = [];
    const bounds = new kakao.maps.LatLngBounds();

    for (let i in markers.data) {
      const target = markers.data[i];
      const latlng = new kakao.maps.LatLng(target.lat, target.lng);
      bounds.extend(latlng);

      const marker = new kakao.maps.Marker({
        position: latlng,
      });

      const content = `
        <div class="infoWindow_info">
          <div class="infoWindow_info_title">${target.name}</div>
          <div class="infoWindow_info_address">${target.address}</div>
          <button onClick="placeDelete('${target.name}', ${target.lat}, ${target.lng});">삭제</button>
        </div>
      `;

      const infoWindow = new kakao.maps.InfoWindow({
        content,
      });

      markerList.push(marker);
      infoWindowList.push(infoWindow);

      kakao.maps.event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
          map.setLevel(4);
          map.panTo(latlng);
        }
      });

      kakao.maps.event.addListener(map, 'click', () => {
        infoWindow.close();
      });
    }

    if (markerList.length > 0) {
      const clusterer = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 3,
      });
      clusterer.addMarkers(markerList);
      map.setBounds(bounds);
    }
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('등록된 좌표를 가져오던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};
getMarker();


const planDelete = async (planName, planID) => {
  const isDelete = confirm(`약속(${planName})을 삭제하시겠습니까?`);
  if (!isDelete) return;

  try {
    await axios.delete('/plan/planSoftDelete', {
      data: { planID },
    });
    alert(`약속(${planName})을 삭제하였습니다.`);
    window.location.href = `/party?id=${partyID}`;
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('약속을 삭제하던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};

const getPlanList = async () => {
  try {
    const plans = await axios.get('/plan/planFindWithPartyID', {
      params: { partyID },
    });

    const listel = document.querySelector('#plan_list');

    for (let i = 0; i < plans.data.length; i++) {
      const { id, planName, placeName, date, fine } = plans.data[i];

      const el = document.createElement('div');
      el.className = 'plan_list_info';
      const itemStr = `
        <div class="plan_list_info_title">
          <div class="plan_list_info_name" onClick="location.href='/plan?id=${id}'">${planName}</div>
          <img class="plan_delete" onClick="planDelete('${planName}', '${id}')" src="https://storage.googleapis.com/in-time-project-bucket/defaults/trash.png">
        </div>
        <div class="plan_list_info_body">
          <div class="plan_list_info_place">${placeName}</div>
          <div class="plan_list_info_date">${date.replace('T', ' ')}</div>
          <div class="plan_list_info_fine">${fine}원</div>      
        </div>
      `;
      el.innerHTML = itemStr;

      listel.appendChild(el);
    }
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('파티를 불러오던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요');
    }
  }
};
getPlanList();


const getPartyPoint = async ({ partyID }) => {
  try {
    const points = await axios.get('partyPoint/partyPointFindWithPartyID', {
      params: { partyID },
    });
    points.data.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const partyPointList = document.querySelector('#party_point_list');

    for (let i = 0; i < points.data.length; i++) {
      const { userName, amount, status, createdAt } = points.data[i];
      const dateTime = new Date(createdAt);
      const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
      const day = dateTime.getDate().toString().padStart(2, '0');
      const hours = dateTime.getHours().toString().padStart(2, '0');
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');
      const createDate = `${month}-${day} ${hours}:${minutes}`;

      const el = document.createElement('div');
      el.className = 'point_history';

      let point;
      if (status === 'FINE_RECEIVE') {
        point = `+${amount}`;
      } else if (status === 'USER_SEND') {
        point = amount;
      }

      itemStr = `
        <div class="point_history_left">
          <div class="point">${point}</div>
        </div>
        <div class="point_history_center">
          <div class="user">${userName}</div>
        </div>
        <div class="point_"></div>
        <div class="point_history_right">
          <div class="create_time">${createDate}</div>
        </div>
      `;

      el.innerHTML = itemStr;

      partyPointList.appendChild(el);
    }
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('파티 정보를 불러오던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};


const getParty = async () => {
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

    getPartyPoint({ partyID });
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('파티 정보를 불러오던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};
getParty();


const pointSend = document.querySelector('#point_send');
const pointSendClickHandler = async () => {
  try {
    const amount = prompt('보낼 금액을 입력해 주세요.', '5000');
    if (amount === null) return;
    if (amount <= 0) {
      alert('1원 이상부터 보낼 수 있습니다.');
      return;
    }

    await axios.post('/partyPoint/partyPointUserSend', {
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
