const { Client } = require("pg");
const { createTenantTables } = require("./tenantDb");

async function createTenantDatabase(databaseName) {
  const adminClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    database: "postgres"
  });

  await adminClient.connect();

  try {
    await adminClient.query(
      `CREATE DATABASE "${databaseName}"`
    );

    console.log(`Database created: ${databaseName}`);
  } finally {
    await adminClient.end();
  }

  const baseUrl = new URL(process.env.DATABASE_URL);
  baseUrl.pathname = `/${databaseName}`;

  const tenantConnectionString = baseUrl.toString();

  await createTenantTables(tenantConnectionString);

  console.log(`Tenant tables created in: ${databaseName}`);

  return tenantConnectionString;
}

module.exports = { createTenantDatabase };