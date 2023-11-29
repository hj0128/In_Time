const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const planID = urlParams.get('id');

const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 3,
};
const map = new kakao.maps.Map(mapContainer, mapOptions);


const setPlanInfo = ({ planName, placeName, date, fine, fineType }) => {
  document.querySelector('#plan_name').innerText = planName;
  document.querySelector('#place_name').innerText = placeName;
  document.querySelector('#date').innerText = date.replace('T', ' ');
  document.querySelector('#fine').innerText = `${fine}원`;
  document.querySelector('#fine_type').innerText = fineType;
};


const setPlaceMarker = ({ placeName, placeAddress, placeLat, placeLng }) => {
  const latlng = new kakao.maps.LatLng(placeLat, placeLng);

  map.setCenter(latlng);

  const marker = new kakao.maps.Marker({
    map,
    position: latlng,
    clickable: true,
  });
  marker.setMap(map);

  const content = `
    <div class="infoWindow_place">
      <div class="infoWindow_place_name">${placeName}</div>
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
};


const getUserLocation = async ({ usersName }) => {
  const usersLocation = await axios.get('/user/userGetRedis', {
    params: { usersName },
  });

  return usersLocation;
};


const setUsersLocation = ({ usersName, usersImage }) => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const date = new Date(position.timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const time = `${hours}:${minutes}:${seconds}`;
      console.log('==================');


      await axios.post('/user/userSetRedis', { lat, lng, time });

      const res = await getUserLocation({ usersName });
      const usersLocation = res.data;

      const markerList = [];
      const infoWindowList = [];

      for (let i in usersLocation) {
        const target = usersLocation[i];

        const marker = new kakao.maps.Marker({
          map,
          position: new kakao.maps.LatLng(target.lat, target.lng),
          image: new kakao.maps.MarkerImage(usersImage[i], new kakao.maps.Size(24, 35)),
          clickable: true,
        });

        const content = `
          <div class="infoWindow_user">
            <div class="infoWindow_user_name">${target.userName}</div>
            <div class="infoWindow_user_time">${target.time}</div>
          </div>`;
        const infoWindow = new kakao.maps.InfoWindow({
          content,
        });

        markerList.push(marker);
        infoWindowList.push(infoWindow);
      }

      for (let i = 0; i < markerList.length; i++) {
        kakao.maps.event.addListener(markerList[i], 'click', () => {
          if (infoWindowList[i].getMap()) {
            infoWindowList[i].close();
          } else {
            infoWindowList[i].open(map, markerList[i]);
          }
        });

        kakao.maps.event.addListener(map, 'click', () => {
          infoWindowList[i].close();
        });
      }
    });
  }
};


const getPlan = async () => {
  try {
    const plan = await axios.get('/plan/planFindOneWithPlanID', { params: { planID } });
    const { planName, placeName, placeAddress, placeLat, placeLng, date, fine, fineType, party } = plan.data;

    const partyUser = await axios.get('/party_user/partyUserFindAllWithPartyID', {
      params: { partyID: party.id },
    });

    const usersName = [];
    const usersImage = [];
    partyUser.data.forEach((el) => {
      usersName.push(el.user.name);
      usersImage.push(el.user.profileUrl);
    });

    setPlanInfo({ planName, placeName, date, fine, fineType });

    setPlaceMarker({ placeName, placeAddress, placeLat, placeLng });

    const targetDate = new Date(date);
    const targetMinus30Minutes = new Date(targetDate.getTime() - 30 * 60 * 1000);

    if (new Date() >= targetMinus30Minutes) {
      const timeDiff = targetMinus30Minutes.getTime() - new Date().getTime();
      setTimeout(() => setUsersLocation({ usersName, usersImage }), timeDiff);
    }
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


// const myLocation = document.querySelector('#my_location');
// let myLocationUse = true;
// const myLocationClickHandler = () => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition((position) => {
//       console.log('=====내위치=====')
//       const latlng = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
//       if (myLocationUse) {
//         const marker = new kakao.maps.Marker({
//           map,
//           position: latlng,
//           image: new kakao.maps.MarkerImage(
//             'https://storage.googleapis.com/in-time-bucket/default/my_location.png',
//             new kakao.maps.Size(24, 35),
//           ),
//           clickable: true,
//         });
//         myLocationUse = false;
//         marker.setMap(map);
//         map.setCenter(latlng);
//       }
//     });
//   } else {
//     alert('위치 사용이 불가능합니다.');
//   }
// };
// myLocation.addEventListener('click', myLocationClickHandler);
