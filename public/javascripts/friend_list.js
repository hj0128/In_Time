const searchFriend = document.querySelector('#search_friend');
const search = async () => {
  const nickName = document.querySelector('#nickname').value;

  if (!nickName) return alert('찾을 친구의 별명을 입력해 주세요.');

  await axios.get('/user/', { params: { nickName } });

}
searchFriend.addEventListener('click', search);
