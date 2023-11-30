let accessToken;

axios.interceptors.request.use(
  async (config) => {
    // 요청이 전달되기 전 작업할 것들
    return config;
  },
  (requestError) => {
    // 요청 오류가 있을 때 작업할 것들

    return Promise.reject(requestError);
  },
);

axios.interceptors.response.use(
  (response) => {
    // 2xx 상태 코드일 때 동작하는 코드

    return response;
  },
  async (responseError) => {
    // 2xx 외의 상태 코드일 때 동작하는 코드
    if (responseError.response.config.url === '/auth/authRestoreAccessToken') {
      axios.defaults.headers.common['Authorization'] = ``;
      throw new Error('토큰 만료');
    }

    if (responseError.response.config.url === '/auth/authLogin') {
      return Promise.reject(responseError);
    }

    if (responseError.response?.status === 401) {
      try {
        const response = await axios.post('/auth/authRestoreAccessToken');
        accessToken = response.data;

        if (accessToken) {
          responseError.config.headers['Authorization'] = `Bearer ${accessToken}`;
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return axios.request(responseError.config);
        }
      } catch (error) {
        axios.defaults.headers.common['Authorization'] = ``;
        throw new Error('토큰 만료');
      }
    }

    return Promise.reject(responseError);
  },
);
