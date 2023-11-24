const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 3,
};

const map = new kakao.maps.Map(mapContainer, mapOptions);

// const getDBMarker = async () => {
//   try {
//     // 맛집 정보등이 담긴 마커 불러오기


//     const cluster1 = {
//       content: '<div class="cluster1"></div>',
//     };
//     const cluster2 = {
//       content: '<div class="cluster2"></div>',
//     };
//     const cluster3 = {
//       content: '<div class="cluster3"></div>',
//     };

//     const markerClustering = new markerClustering({
//       minClusterSize: 2,
//       maxZoom: 12,
//       map: map,
//       markers: markerList,
//       disableClickZoom: false,
//       gridSize: 20,
//       icons: [cluster1, cluster2, cluster3],
//       indexGenerator: [2, 5, 10],
//       stylingFunction: (clusterMarker, count) => {
//         const firstChildDiv = clusterMarker.getElement().quertySelector('div:first-child');
//         if (firstChildDiv) {
//           firstChildDiv.textContent = count.toString();
//         }
//       },
//     });
//   } catch (err) {
//     console.err('등록된 좌표를 가져오지 못했습니다');
//   }
// };
// getDBMarker();


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const partyID = urlParams.get('id');

const createPlans = document.querySelector('#plane_create');
createPlans.setAttribute('href', `/plan/create?id=${partyID}`);

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
        <div class="plan_list_info_name">${planName}</div>
        <div class="plan_list_info_place">${placeName}</div>
        <div class="plan_list_info_date">${date}</div>
        <div class="plan_list_info_fine">${fine}</div>
      `;
      el.innerHTML = itemStr;
      el.setAttribute('onclick', `location.href="/plan?id=${id}"`);

      listel.appendChild(el);
    }
  } catch (err) {
    alert('잘못된 접근입니다. \n다시 시도해 주세요.');
  }
};
getPlanList();
