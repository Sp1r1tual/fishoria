import axios from 'axios';

import { authInterceptors } from './interceptors/auth.interceptor';
import { xsrfInterceptors } from './interceptors/xsrf.interceptor';
import { errorInterceptors } from './interceptors/error.interceptor';

const $mainApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'x-xsrf-token',
  withXSRFToken: true,
});

const $onlineApi = axios.create({
  baseURL: import.meta.env.VITE_ONLINE_SERVER_URL,
  withCredentials: true,
});

authInterceptors($mainApi);
xsrfInterceptors($mainApi);
errorInterceptors($mainApi);

export { $mainApi, $onlineApi };
