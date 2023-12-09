const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ5NzMyZTE3LWY2YTQtNGRmMC1iMzkwLTJjNjM5YTg3MWQ2YSIsImVtYWlsIjoiYkBiLmNvbSIsIm5hbWUiOiLssqDsiJgiLCJpYXQiOjE3MDE5Mzg3MzAsImV4cCI6MTcwMTk0MjMzMH0.sEwxCjXnPwn7GIw-lbmPs_jz6yIkUc8-qpZxEnn6Fuo';

// socket.io로 서버에 연결
const socket = io('http://localhost:3000', {
  query: { token: accessToken },
});

const partyID = 'f6dca6c6-7a23-425d-9354-3fe98284de1a';
const userName = '철수';

// DOM에서 메시지 입력 필드 가져오기
const message = document.querySelector('#room1-messageInput');

// document.getElementById('random-animal-name').innerHTML = userName;

// socket.emit('setUserNick', userName);

const animalNames = ['곰', '호랑이', '사자', '원숭이', '기린'];

const randomAnimalName =
  animalNames[Math.floor(Math.random() * animalNames.length)] +
  Math.floor(Math.random() * 100).toString();

// 랜덤 동물 이름을 HTML 엘리먼트에 적용
document.getElementById('random-animal-name').innerHTML =
  randomAnimalName;

// 서버에 사용자 이름 설정 요청 보내기
socket.emit('setUserNick', randomAnimalName);

// 채팅 방과 사용자 목록, 채팅 기록을 관리할 객체들
const roomUsers = {
  room1: document.getElementById('room1Users'),
};
const roomChatList = {
  room1: document.getElementById('room1-chat-list'),
};
const roomChatContainer = {
  room1: document.getElementById('room1-chat-container'),
};
const roomMessageInput = {
  room1: document.getElementById('room1-messageInput'),
};

// 메시지 입력 필드 이벤트 리스너 등록
const inputMessageRoom1 = document.getElementById('room1-messageInput');
inputMessageRoom1.addEventListener('keyup', function (event) {
  if (event.key === 'Enter') {
    sendRoomMessage('room1');
  }
});

// 서버에 방 참여 요청 보내기
function joinRoom(room) {
  socket.emit('join', room);
}
joinRoom('room1');

function exitRoom(room) {
  if (!room) return;

  roomUsers[room].innerHTML = '';
  roomChatList[room].innerHTML = '';
  socket.emit('exit', room);
}

// 채팅 메시지 전송 함수
function sendRoomMessage(room) {
  const message = roomMessageInput[room].value;


  if (message.trim() !== '') {
    socket.emit('chatMessage', { message, room, randomAnimalName });

    // 메시지 전송 후 입력 필드 비우기
    roomMessageInput[room].value = '';
  }
}

socket.on('userList', ({ room, userList }) => {
  if (!room) return;

  const usersElement = roomUsers[room];
  usersElement.innerHTML = '';

  console.log({ room, userList });
  userList.forEach((userId) => {
    const p = document.createElement('p');
    p.textContent = userId;
    usersElement.appendChild(p);
  });
});

// 서버에서 받은 채팅 기록 표시
socket.on('chatHistory', ({ room, history }) => {
  appendMessage(room, history);
  displayChatHistory(room, history);
});

// 새로운 사용자 참여 알림
socket.on('userJoined', ({ userId, room }) => {
  const message = `${userId} 들어옴`;
  appendMessage(room, message);
});

// 사용자 퇴장 알림
socket.on('userLeft', ({ userId, room }) => {
  const message = `${userId} 나감`;
  appendMessage(room, message);
});

// 채팅 메시지 수신
socket.on('chatMessage', ({ userId, message, room }) => {
  appendMessage(room, `${userId} : ${message}`);
});

// 채팅 기록 표시 함수
function displayChatHistory(room, history) {
  const chatList = roomChatList[room];

  // 기존 채팅 메시지를 표시하는데 사용할 ul 엘리먼트 초기화
  chatList.innerHTML = '';

  // history 배열을 순회하면서 각 채팅 메시지를 표시
  history.forEach((chat) => {
    const li = document.createElement('li');
    li.className = 'chat-item';
    const p = document.createElement('p');
    p.textContent = `${chat.userName}: ${chat.message}`;
    li.appendChild(p);
    chatList.appendChild(li);
  });

  // 채팅 컨테이너의 스크롤을 아래로 이동
  roomChatContainer[room].scrollTop = roomChatContainer[room].scrollHeight;
}

// 메시지를 채팅 리스트에 추가하는 함수
function appendMessage(room, message) {
  // 해당 방의 채팅 메시지를 표시할 리스트 엘리먼트를 가져옴
  const chatList = roomChatList[room];

  // li 엘리먼트 생성 및 클래스 추가
  const li = document.createElement('li');
  li.className = 'chat-item';

  // p 엘리먼트 생성 및 메시지 설정
  const p = document.createElement('p');
  p.textContent = message;

  // p 엘리먼트를 li 엘리먼트에 추가
  li.appendChild(p);

  // li 엘리먼트를 채팅 리스트에 추가
  chatList.appendChild(li);

  // 채팅 컨테이너의 스크롤을 아래로 이동
  roomChatContainer[room].scrollTop = roomChatContainer[room].scrollHeight;
}

