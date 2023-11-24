// const restoreAccessToken = async () => {
//   const response = await axios.post('/auth/restoreAccessToken');
//   return response.data;
// };

// axios.interceptors.request.use(
//   (config) => {
//     // 요청이 전달되기 전 작업할 것들
//     return config;
//   },
//   (requestError) => {
//     // 요청 오류가 있을 때 작업할 것들
//     return Promise.reject(requestError);
//   },
// );

// axios.interceptors.response.use(
//   (response) => {
//     if (axios.defaults.headers.common['Authorization']) {
//       response.config.headers['Authorization'] = axios.defaults.headers.common['Authorization'];
//     }
//     // 2xx 상태 코드일 때 동작하는 코드
//     return response;
//   },
//   async (responseError) => {
//     // 2xx 외의 상태 코드일 때 동작하는 코드
//     if (responseError.response?.status === 401) {
//       try {
//         const response = await axios.post('/auth/authRestoreAccessToken');

//         if (response) {
//           responseError.config.headers['Authorization'] = response;
//           const origin = await axios.request(reportError.config)
//           return origin;
//         } else {
//           responseError.config.headers['Authorization'] = '';
//           console.log('============')
//         }

//         // const newAccessToken = await restoreAccessToken(responseError);

//         // const response = await axios.request(newAccessToken);

//         // return response;
//       } catch (error) {
//         console.error(error);
//       }
//     }
//     return Promise.reject(error);
//   },
// );
