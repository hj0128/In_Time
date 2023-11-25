const getFriendList = async () => {
  try {
    const friends = await axios.get('/friend/friendFindWithUserID');

    for (let i = 0; i < friends.data.length; i++) {
      const { fromUserID, name, profileUrl, badgeUrl, status } = friends.data[i];

      if (status === 'friendship') {
        const listel = document.querySelector('#friend_list');
        const el = document.createElement('div');
        el.className = 'friend_list_info';

        const itemStr = `
          <input type="checkbox" name="members" value="${fromUserID}" class="friend_list_info_checkbox" />
          <img class="friend_list_info_profileUrl" src="${profileUrl}"></img>
          <span class="friend_list_info_name">${name}</span>
          <img class="friend_list_info_badgeUrl" src="${badgeUrl}"></img>`;
        el.innerHTML = itemStr;

        listel.appendChild(el);
      }
    }
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('친구 목록을 불러오던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요');
    }
  }
};
getFriendList();


const createParty = document.querySelector('#party_create');
const create = async () => {
  const name = document.querySelector('#name').value;
  const friends = document.querySelectorAll('input[name="members"]:checked');

  if (!name || friends.length === 0) return alert('모든 항목을 입력해 주세요.');

  const friendsID = [];
  friends.forEach((el) => friendsID.push(el.value));
  const stringFriendID = JSON.stringify(friendsID);

  try {
    await axios.post('/party/partyCreate', {
      name,
      friendsID: stringFriendID,
    });
    alert('파티가 생성되었습니다.');
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else if (error.response.status === 400) {
      alert('파티 생성 중 오류가 발생했습니다. \n입력하신 정보를 다시 확인해 주세요.');
      return;
    } else {
      alert('파티 생성 중 오류가 발생했습니다. \n나중에 다시 시도해주세요.');
      return;
    }
  }
};
createParty.addEventListener('click', create);
