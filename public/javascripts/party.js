const back = document.querySelector('#back');
back.addEventListener('click', () => {
  window.history.back();
  window.location.reload(true);
});

window.onload = () => {
  const inputElements = document.querySelectorAll('input');
  inputElements.forEach((input) => {
    if (input.type !== 'button' && input.type !== 'submit' && input.type !== 'reset') {
      input.value = '';
    }
  });
};


const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 4,
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

const planCreate = document.querySelector('#plan_create');
planCreate.setAttribute('href', `/plan/create?id=${partyID}`);


const planDelete = async (planName, planID) => {
  const isDelete = confirm(`약속(${planName})을 삭제하시겠습니까?`);
  if (!isDelete) return;

  try {
    await axios.delete('/plan/planDelete', {
      params: { planID },
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
