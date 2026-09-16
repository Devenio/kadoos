process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL =
  'postgresql://kadoos:kadoos@127.0.0.1:5432/kadoos?schema=public';
process.env.FRONTEND_URL = 'http://localhost:3000';
