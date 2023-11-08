const createParty = document.querySelector('#create_party');
const create = async () => {
  const name = document.querySelector('#name').value;
  const members = document.querySelector('#members').value;

  if (!name || !members) return alert('모든 항목을 입력해 주세요.');

  await axios.post('/party/partyCreate', {
    name,
    members,
  });

  alert('파티가 생성되었습니다.');
};
createParty.addEventListener('click', create);
