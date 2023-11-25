const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 3,
};

const map = new kakao.maps.Map(mapContainer, mapOptions);

const placeChoice = (placeName) => {
  const place = document.querySelector('#place');
  place.value = placeName;
};

const infoWindow = new kakao.maps.InfoWindow({
  zIndex: 1,
});

let placeAddress, placeLat, placeLng;
const displayInfoWindow = (marker, place_name, address_name, lat, lng) => {
  const content = `
  <div class='infoWindow_info'>
  <div class='infoWindow_info_title'>${place_name}</div>
  <div class='infoWindow_info_address'>${address_name}</div>
  <button onClick='placeChoice("${place_name}");'>선택</button>
  </div>`;

  placeAddress = address_name;
  placeLat = lat;
  placeLng = lng;

  map.panTo(marker.getPosition());
  infoWindow.setContent(content);
  infoWindow.open(map, marker);
};

const removeMarker = () => {
  for (let i = 0; i < markerList.length; i++) {
    markerList[i].setMap(null);
  }
  markerList = [];
};

let markerList = [];
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
    markerList.push(marker);

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


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const partyID = urlParams.get('id');

const planCreate = document.querySelector('#plan_create');
const create = async () => {
  const planName = document.querySelector('#name').value;
  const placeName = document.querySelector('#place').value;
  const date = document.querySelector('#date').value;
  const fine = document.querySelector('#fine').value;
  const fineType = document.querySelector('input[name="fineType"]:checked');

  if (!planName || !placeName || !date || !fine || !fineType) {
    return alert('모든 항목을 입력해 주세요.');
  }

  try {
    await axios.post('/plan/planCreate', {
      planName,
      placeName,
      placeAddress,
      placeLat: Number(placeLat),
      placeLng: Number(placeLng),
      date,
      fine: Number(fine),
      fineType: fineType.value,
      partyID,
    });

    alert('약속이 생성되었습니다.');
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('약속을 생성하던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};
planCreate.addEventListener('click', create);
