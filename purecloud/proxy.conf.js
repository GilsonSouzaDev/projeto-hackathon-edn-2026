module.exports = {
  '/api-aws': {
    target: 'https://lb34ug5vfk.execute-api.us-east-1.amazonaws.com',
    secure: true,
    changeOrigin: true,
    pathRewrite: {
      '^/api-aws': '',
    },
    logLevel: 'debug',
    onProxyReq: function (proxyReq, req, res) {
      // Remove headers que podem causar o 403 no AWS
      proxyReq.removeHeader('Origin');
      proxyReq.removeHeader('Referer');

      // Se a sua API exigir uma API Key, descomente a linha abaixo e coloque a chave:
      // proxyReq.setHeader('x-api-key', 'SUA_CHAVE_AQUI');
    },
  },
};
