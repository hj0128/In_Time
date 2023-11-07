const getPartyList = async () => {
  const data = await axios.get('/party/get_party_list');

  const listel = document.querySelector('#party_list');
  for (let i = 0; i < data.data.length; i++) {
    const { name, members, point } = data.data[i];

    const el = document.createElement('div');
    el.className = 'party_list_info';
    el.setAttribute('onclick', 'location.href="/"');
    const itemStr = `
      <div class="party_list_info_name">${name}</div>
      <div class="party_list_info_members">${members}</div>
      <div class="party_list_info_point">${point}</div>`;
    el.innerHTML = itemStr;

    listel.appendChild(el);
  }
};
getPartyList();
