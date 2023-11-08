const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const partyID = urlParams.get('id');

const createPlans = document.querySelector('#plane_create');
createPlans.setAttribute('href', `/plan/create?id=${partyID}`);

const getPlanList = async () => {
  const plans = await axios.get('/plan/planFindWithPartyID', {
    params: { partyID },
  });

  const listel = document.querySelector('#plan_list');
  for (let i = 0; i < plans.data.length; i++) {
    const { id, name, place, date, time } = plans.data[i];

    const el = document.createElement('div');
    el.className = 'plan_list_info';
    const itemStr = `
      <div class="plan_list_info_name">${name}</div>
      <div class="plan_list_info_place">${place}</div>
      <div class="plan_list_info_date">${date}</div>
      <div class="plan_list_info_time">${time}</div>
    `;
    el.innerHTML = itemStr;
    el.setAttribute('onclick', `location.href="/plan?id=${id}"`);

    listel.appendChild(el);
  }
};
getPlanList();
