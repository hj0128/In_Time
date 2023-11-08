const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(37.554477, 126.970419),
  level: 3,
};

const map = new kakao.maps.Map(mapContainer, mapOptions);

const onSubmit = (placeName) => {
  const place = document.querySelector('#place');
  place.value = placeName;
};

const infoWindow = new kakao.maps.InfoWindow({
  zIndex: 1,
});

let placeAddress, placeLat, placeLng;
const displayInfoWindow = (marker, place_name, address_name, lat, lng) => {
  placeAddress = address_name;
  placeLat = lat;
  placeLng = lng;

  const content = `
    <div class='infoWindow_info'>
      <div class='infoWindow_info_title'>${place_name}</div>
      <div class='infoWindow_info_address'>${address_name}</div>
      <button onClick='onSubmit("${place_name}");'>선택</button>
    </div>`;

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
      displayInfoWindow(marker, place_name, address_name, y, x);
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
  const name = document.querySelector('#name').value;
  const place = document.querySelector('#place').value;
  const date = document.querySelector('#date').value;
  const fine = document.querySelector('#fine').value;
  const fineType = document.querySelector('#fineType').value;

  if (!name || !place || !date || !fine || !fineType) {
    return alert('모든 항목을 입력해 주세요.');
  }

  await axios.post('/plan/planCreate', {
    partyID,
    name,
    place,
    date,
    fine,
    fineType,
    placeAddress,
    placeLat,
    placeLng,
  });

  alert('약속이 생성되었습니다.');
};
planCreate.addEventListener('click', create);
