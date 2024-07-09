"use strict";
const fs = require("fs");
const pg = require("pg");
const axios = require("axios");

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

const createTableQuery = `
CREATE TABLE IF NOT EXISTS ${tableName} (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    species VARCHAR(50),
    type VARCHAR(50),
    gender VARCHAR(50),
    origin VARCHAR(255),
    location VARCHAR(255),
    image VARCHAR(255),
    url VARCHAR(255),
    created TIMESTAMP
);
`;

async function fetchAndInsertData() {
  try {
    await conn.connect();
    console.log("Connected to the database");

    await conn.query(createTableQuery);
    console.log("Table created or already exists");

    let nextUrl = "https://rickandmortyapi.com/api/character";
    while (nextUrl) {
      console.log(`Fetching data from ${nextUrl}`);
      const response = await axios.get(nextUrl);
      const characters = response.data.results;

      const insertQuery = `
        INSERT INTO ${tableName} (name, status, species, type, gender, origin, location, image, url, created)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `;

      const insertPromises = characters.map((character) =>
        conn.query(insertQuery, [
          character.name,
          character.status,
          character.species,
          character.type,
          character.gender,
          character.origin.name,
          character.location.name,
          character.image,
          character.url,
          character.created,
        ])
      );

      await Promise.all(insertPromises);
      console.log(`Inserted ${characters.length} characters`);

      nextUrl = response.data.info.next;
    }

    console.log(
      "Data inserted successfully! To see the content of the table, run 'node checkDb.js'"
    );
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await conn.end();
    console.log("Database connection closed");
  }
}

fetchAndInsertData();
