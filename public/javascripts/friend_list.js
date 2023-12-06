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


const createFriend = document.querySelector('#create_friend');
const friendInput = document.querySelector('#friend_input');
const search = async () => {
  if (!friendInput.value) {
    alert('요청을 보낼 친구의 별명을 입력해 주세요.');
    return;
  }

  const isRequest = confirm(`${friendInput.value}님에게 친구 요청을 보내시겠습니까?`);
  if (!isRequest) return;

  try {
    await axios.post('/friend/friendCreate', {
      toUserName: friendInput.value,
    });
    alert(`${friendInput.value}님에게 친구 요청을 보냈습니다. \n상대방이 수락하면 친구가 됩니다.`);
    window.location.href = '/friend/list';
  } catch (error) {
    if (error.message === '토큰 만료') {
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
friendInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    search();
  }
})


const accept = async (id, fromUserID) => {
  const isAccept = confirm(`친구 요청을 수락하시겠습니까?`);
  if (!isAccept) return;

  try {
    await axios.post('/friend/friendUpdate', {
      friendID: id,
      fromUserID,
    });
    alert('서로 친구가 되었습니다.');
    window.location.href = '/friend/list';
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
  const isRefuse = confirm(`친구 요청을 거절하시겠습니까?`);
  if (!isRefuse) return;

  try {
    await axios.delete('/friend/friendRefuse', {
      params: { friendID: id },
    });
    alert('친구 요청을 거절하였습니다.');
    window.location.href = '/friend/list';
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('친구 요청을 거절하던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};

const unFriend = async (fromUserID) => {
  const isUnFriend = confirm(`친구 관계를 끊으시겠습니까?`);
  if (!isUnFriend) return;

  try {
    await axios.delete('/friend/friendUnFriend', {
      params: { fromUserID },
    });
    alert('친구 관계를 끊습니다.');
    window.location.href = '/friend/list';
  } catch (error) {
    if (error.message === '토큰 만료') {
      alert('로그인 후 이용해 주세요.');
      window.location.href = '/signIn';
    } else {
      alert('친구 관계를 끊던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
}

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
          <button class="friend_list_info_status" onClick="refuse('${friendID}')">거절</button>
        `;
      } else if (status === 'sent') {
        statusInfo = `
          <span class="friend_list_info_status">수락 대기 중...</span>
        `;
      } else {
        statusInfo = `
          <button class="friend_list_info_status" onClick="unFriend('${fromUserID}')")>친구 끊기</button>
        `;
      }

      const el = document.createElement('div');
      el.className = 'friend_list_info';
      const itemStr = `
        <div class="friend_list_info_left">
          <img class="friend_list_info_profileUrl" src="${profileUrl}"></img>
          <div class="friend_list_info_name">${name}</div>
          <img class="friend_list_info_badgeUrl" src="${badgeUrl}"></img>
        </div>
        <div class="friend_list_info_right">
          ${statusInfo}
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
      alert('친구 요청을 불러오던 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  }
};
getFriendList();
