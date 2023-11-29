const createFriend = document.querySelector('#create_friend');
const search = async () => {
  try {
    const toUserName = prompt('요청을 보낼 친구의 별명을 입력해 주세요.', '철수');
    if (toUserName === null) return;

    await axios.post('/friend/friendCreate', {
      toUserName,
    });
    alert(`${toUserName}님에게 친구 요청을 보냈습니다. \n상대방이 수락하면 친구가 됩니다.`);
  } catch (error) {
    if (error.response.data.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else if (error.response.status === 404 || error.response.status === 400 || error.response.status === 409) {
      alert(error.response.data.message);
    } else {
      alert('친구 요청을 보내던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};
createFriend.addEventListener('click', search);


const accept = async (id, fromUserID) => {
  try {
    await axios.post('/friend/friendUpdate', {
      friendID: id,
      fromUserID,
    });
    alert('서로 친구가 되었습니다.');
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('친구를 맺던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};

const refuse = async (id) => {
  try {
    await axios.delete('/friend/friendDelete', {
      params: { friendID: id },
    });
    alert('친구 요청을 거절하였습니다.');
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('친구 요청을 거절하던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};

const getFriendList = async () => {
  try {
    const friends = await axios.get('/friend/friendFindWithUserID');

    const listel = document.querySelector('#friend_list');
    for (let i = 0; i < friends.data.length; i++) {
      const { friendID, fromUserID, name, profileUrl, badgeUrl, status } = friends.data[i];

      let statusInfo;
      if (status === 'received') {
        statusInfo = `
        <button class="friend_list_info_status" onClick="accept('${friendID}', '${fromUserID}')">수락</button>
        <button class="friend_list_info_status" onClick="refuse('${friendID}')">거절</button>`;
      } else if (status === 'sent') {
        statusInfo = `
        <span class="friend_list_info_status">수락 대기 중...</span>`;
      } else {
        statusInfo = '';
      }

      const el = document.createElement('div');
      el.className = 'friend_list_info';
      const itemStr = `
        <img class="friend_list_info_profileUrl" src="${profileUrl}"></img>
        <span class="friend_list_info_name">${name}</span>
        <img class="friend_list_info_badgeUrl" src="${badgeUrl}"></img>
        ${statusInfo}`;
      el.innerHTML = itemStr;

      listel.appendChild(el);
    }
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('친구 요청을 불러오던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};
getFriendList();
