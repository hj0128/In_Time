const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const planID = urlParams.get('id');


const setPlanInfo = ({ planName, placeName, date, fine, fineType }) => {
  document.querySelector('#plan_name').innerText = planName;
  document.querySelector('#place_name').innerText = placeName;
  document.querySelector('#date').innerText = date;
  document.querySelector('#fine').innerText = fine;
  document.querySelector('#fine_type').innerText = fineType;
};


const setPlaceMarker = ({ placeName, placeAddress, placeLat, placeLng }) => {
  const latlng = new kakao.maps.LatLng(placeLat, placeLng);

  const mapContainer = document.querySelector('#map');
  const mapOptions = {
    center: latlng,
    level: 3,
  };
  const map = new kakao.maps.Map(mapContainer, mapOptions);

  const marker = new kakao.maps.Marker({
    position: latlng,
    clickable: true,
  });
  marker.setMap(map);

  const content = `
    <div class="infoWindow">
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
  await axios.get
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setRedis({ usersName, lat, lng })
      //////////////////
    })
  }
}


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

    getUserLocation({ usersName });
  } catch (err) {
    console.log(err);
    console.error('plan을 불러오던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
  }
};
getPlan();
