import { Pool } from 'pg';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Create the connection pool with SSL enabled
const pool = new Pool({
  user: process.env.PGUSER,          // PGUSER from Neon
  host: process.env.PGHOST,          // PGHOST from Neon
  database: process.env.PGDATABASE,  // PGDATABASE from Neon
  password: process.env.PGPASSWORD,  // PGPASSWORD from Neon
  port: 5432,                        // Default PostgreSQL port
  ssl: { rejectUnauthorized: false }, // Enable SSL and bypass certificate validation
});
export default pool;
