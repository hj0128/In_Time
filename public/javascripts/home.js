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

const mapContainer = document.querySelector('#map');
const mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 4,
};

const map = new kakao.maps.Map(mapContainer, mapOptions);


const partyDelete = async (name, partyID, point) => {
  const isDelete = confirm(`파티(${name})를 삭제하시겠습니까?`);
  if (!isDelete) return;

  try {
    await axios.delete('/party/partyDelete', {
      params: { partyID, point },
    });

    alert(`파티(${name})를 삭제하였습니다.`);
    window.location.href = '/';
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else if (error.response.data.message === '포인트 보유') {
      alert('보유하신 포인트를 사용 후 삭제해 주세요.');
    } else {
      alert('파티를 삭제하던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};

const getPartyList = async () => {
  try {
    const partyList = await axios.get('/party/partyFindAll');

    const listel = document.querySelector('#party_list');

    for (let i = 0; i < partyList.data.length; i++) {
      const { partyID, name, point, members } = partyList.data[i];

      const el = document.createElement('div');
      el.className = 'party_list_info';
      const itemStr = `
        <div class="party_list_info_title">
          <div class="party_list_info_name" onClick="location.href='/party?id=${partyID}'">${name}</div>
          <img class="party_delete" onClick="partyDelete('${name}', '${partyID}', ${point})") src="https://storage.googleapis.com/in-time-project-bucket/defaults/trash.png">
        </div>
        <div class="party_list_info_body">
          <div class="party_list_info_members">${members}</div>
          <div class="party_list_info_point">${point}원</div>
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
      alert('파티 리스트를 불러오던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};
getPartyList();


const getUser = async () => {
  try {
    const user = await axios.get('/user/userFindOneWithUserID');
    const title = document.querySelector('#body_wrapper_left_title');

    title.innerText = user.data.name;
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('유저를 불러오던 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
    }
  }
};
getUser();
