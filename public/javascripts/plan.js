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


let placeLatLng;
const setPlaceMarker = ({ placeName, placeAddress, placeLat, placeLng }) => {
  placeLatLng = new kakao.maps.LatLng(placeLat, placeLng);
  map.setCenter(placeLatLng);

  const marker = new kakao.maps.Marker({
    map,
    position: placeLatLng,
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

let myLatLng;
const setUsersLocation = ({ usersName, usersImage }) => {
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      distanceFilter: 50,
    };

    navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const date = new Date(position.timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        console.log('==================');

        myLatLng = new kakao.maps.LatLng(lat, lng);

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
      },
      null,
      options,
    );
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

    const currentTime = new Date();
    const targetDate = new Date(date);
    const targetMinus30Minutes = new Date(targetDate.getTime() - 30 * 60 * 1000);
    if (currentTime.getTime() >= targetMinus30Minutes.getTime()) {
      setUsersLocation({ usersName, usersImage });
    } else {
      const timeDiff = targetMinus30Minutes.getTime() - currentTime.getTime();
      setTimeout(() => {
        setUsersLocation({ usersName, usersImage });
      }, timeDiff);
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


const myLocation = document.querySelector('#my_location');
const myLocationClickHandler = () => {
  map.setCenter(myLatLng);
};
myLocation.addEventListener('click', myLocationClickHandler);


const placeLocation = document.querySelector('#place_location');
const placeLocationClickHandler = () => {
  map.setCenter(placeLatLng);
};
placeLocation.addEventListener('click', placeLocationClickHandler);
