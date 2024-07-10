const fs = require("fs");
const pg = require("pg");

const config = {
  connectionString:
    "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("/home/runner/.postgresql/root.crt").toString(),
  },
};

const conn = new pg.Client(config);

const tableName = "Beka01247";

async function checkDatabase() {
  await conn.connect();

  try {
    const res = await conn.query(`SELECT * FROM ${tableName} LIMIT 10;`);
    console.log(`Инфо с таблицы ${tableName}:`);
    console.table(res.rows);
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await conn.end();
  }
}

checkDatabase();
