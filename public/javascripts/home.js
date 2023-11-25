const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 3,
};

const map = new kakao.maps.Map(mapContainer, mapOptions);

// const getPlanList = async () => {
//   // 로그인 유저의 플랜 모두 가져오기
//   try {
//     const partiesID = await axios.get('/plan/planFindWithUserIDAndPartyID');
//     console.log(partiesID)

//     const listel = document.querySelector('#plan_list');

//     for (let i = 0; i < parties.data.length; i++) {
//       const { id, name, members, point } = parties.data[i];

//       const el = document.createElement('div');
//       el.className = 'party_list_info';
//       const itemStr = `
//       <div class="party_list_info_name">${name}</div>
//       <div class="party_list_info_members">${members}</div>
//       <div class="party_list_info_point">${point}</div>`;
//       el.innerHTML = itemStr;
//       el.setAttribute('onclick', `location.href="/party?id=${id}"`);

//       listel.appendChild(el);
//     }
//   } catch (err) {
//     console.log(err)
//   }

// };
// getPlanList();
