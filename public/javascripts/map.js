const mapOptions = {
  center: new naver.maps.LatLng(37.3595704, 127.105399),
  zoom: 10,
};

const map = new naver.maps.Map('map', mapOptions);

// 현재 위치 표시하기
const current = document.querySelector('#current');
let currentUse = true;
const currentClickHandler = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const latlng = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
      if (currentUse) {
        const marker = new naver.maps.Marker({
          map: map,
          position: latlng,
          icon: {
            content:
              '<img class="pulse" draggable="false" unselectable="on" src="/images/my_location.png">',
            anchor: new naver.maps.Point(11, 11),
          },
        });
        currentUse = false;
      }
      map.setZoom(15, false);
      map.panTo(latlng);
    });
  } else {
    alert('위치 사용 불가능');
  }
};
current.addEventListener('click', currentClickHandler);
