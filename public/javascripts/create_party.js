const createParty = document.querySelector('#create_party');
const create = async () => {
  const name = document.querySelector('#name').value;
  const members = document.querySelector('#members').value;

  const res = await axios.post('/party/create_party', {
    name,
    members,
  });


  console.log('파티가 생성되었습니다.');
};
createParty.addEventListener('click', create);
