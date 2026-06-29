export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh',
  },
  services: {
    list: '/services',
    details: (id: string) => `/services/${id}`,
  },
  user: {
    profile: '/user/profile',
  }
};

export default ENDPOINTS;
