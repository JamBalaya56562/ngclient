export default {
  '/api': { target: 'http://localhost:8304', secure: false },
  '/notifications': { target: 'http://localhost:8304', secure: false, ws: true },
};
