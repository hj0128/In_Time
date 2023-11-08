const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const planID = urlParams.get('id');

const getPlan = async () => {
  const plan = await axios.get('/plan/planFindOneWithPlanID', {
    params: { planID },
  });
  const { name, place, date, fine, fineType } = plan.data;

  const planInfo = document.querySelector('#plan_info');
  planInfo.children.name.innerHTML = name;
  planInfo.children.place.innerHTML = place;
  planInfo.children.date.innerHTML = date;
  planInfo.children.fine.innerHTML = fine;
  planInfo.children.fineType.innerHTML = fineType;
};
getPlan();

const mapOptions = {
  center: new naver.maps.LatLng(37.3595704, 127.105399),
  zoom: 10,
};

const map = new naver.maps.Map('map', mapOptions);

