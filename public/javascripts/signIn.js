const email = document.querySelector('#email');
const password = document.querySelector('#password');
const JWT_EXPIRY_TIME = 10000 * 3600 * 1000;

const nextPasswordBox = (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    password.focus();
  }
};
email.addEventListener('keydown', nextPasswordBox);


// const restore = async () => {
//   const response = await axios.post('/auth/restoreAccessToken');

//   const accessToken = response.data;
//   axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
// };

const loginSuccess = (res) => {
  const accessToken = res.data;
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  // setTimeout(restore, JWT_EXPIRY_TIME - 15000);
};

const login = async () => {
  if (!email.value || !password.value) {
    alert('모든 항목을 입력해 주세요.');
    return;
  } else if (!email.value.includes('@')) {
    alert('이메일 형식을 올바르게 입력해 주세요.');
    return;
  }

  try {
    const res = await axios.post('/auth/authLogin', {
      email: email.value,
      password: password.value,
    });

    loginSuccess(res);

    alert('로그인 되었습니다.');
    // window.location.href = '/';
  } catch (err) {
    if (err.response.status === 401) {
      alert('이메일 또는 비밀번호를 잘못 입력했습니다.');
    } else {
      alert('로그인 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  }
};


const signIn = document.querySelector('#sign_in');
const loginClick = async () => {
  await login();
};
signIn.addEventListener('click', loginClick);

const loginKeydown = async (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    await login();
  }
};
password.addEventListener('keydown', loginKeydown);

const test2 = async () => {
  try {
    const a = await axios.get('/user/test')
    // const a = await axios.post('/auth/authRestoreAccessToken');
    console.log(axios.defaults.headers.common['Authorization'])
    console.log(a.data);
  } catch (err) {
    console.log(err.response);
  }
};
