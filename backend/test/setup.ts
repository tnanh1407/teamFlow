process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  "postgres://test:test@localhost:5432/test_db";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret";
process.env.PORT = "0";
