const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,  // Load PostgreSQL connection URL from .env
});

client.connect()
  .then(() => console.log('PostgreSQL connected successfully'))
  .catch(err => {
    console.error('Error connecting to PostgreSQL:', err.message);
    process.exit(1);
  });

module.exports = client;
