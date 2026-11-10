const config = {
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};

export default config;