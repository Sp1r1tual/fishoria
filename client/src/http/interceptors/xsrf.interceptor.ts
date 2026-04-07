import type { AxiosInstance } from 'axios';

const xsrfInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use((config) => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    if (match && match[1]) {
      config.headers['x-xsrf-token'] = decodeURIComponent(match[1]);
    }

    return config;
  });
};

export { xsrfInterceptors };
