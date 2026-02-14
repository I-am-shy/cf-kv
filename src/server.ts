import app from './index';

const port = parseInt(process.env.PORT || '9527');

console.log(`🚀 服务运行在 http://localhost:${port}`);
console.log(`📚 API 文档请查看 http://localhost:${port}/docs`);

export default {
  port,
  fetch: app.fetch,
};

