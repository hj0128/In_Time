const email = document.querySelector('#email');
const password = document.querySelector('#password');

const nextPasswordBox = (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    password.focus();
  }
};
email.addEventListener('keydown', nextPasswordBox);


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

    const accessToken = res.data;

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    alert('로그인 되었습니다.');
    window.location.href = '/';
  } catch (error) {
    if (error.response.status === 401) {
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
