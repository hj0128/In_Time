const getPartyList = async () => {
  const parties = await axios.get('/party/partyFindAll');
  const listel = document.querySelector('#party_list');

  for (let i = 0; i < parties.data.length; i++) {
    const { id, name, members, point } = parties.data[i];

    const el = document.createElement('div');
    el.className = 'party_list_info';
    const itemStr = `
    <div class="party_list_info_name">${name}</div>
    <div class="party_list_info_members">${members}</div>
    <div class="party_list_info_point">${point}</div>`;
    el.innerHTML = itemStr;
    el.setAttribute('onclick', `location.href="/party?id=${id}"`);

    listel.appendChild(el);
  }
};
getPartyList();
