let accessToken;

axios.interceptors.request.use(
  async (config) => {
    return config;
  },
  (requestError) => {
    return Promise.reject(requestError);
  },
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (responseError) => {
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
