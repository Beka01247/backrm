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
    id SERIAL PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    data JSONB NOT NULL
);
`;

async function fetchAndInsertData() {
  try {
    await conn.connect();
    console.log("Подключено к БД");

    await conn.query(createTableQuery);
    console.log("Таблица создана или уже существует");

    let urlFetch = "https://rickandmortyapi.com/api/character";
    while (urlFetch) {
      const response = await axios.get(urlFetch);
      const characters = response.data.results;

      const insertQuery = `
        INSERT INTO ${tableName} (name, data)
        VALUES ($1, $2);
      `;

      const insertPromises = characters.map((character) => {
        const data = {
          status: character.status,
          species: character.species,
          type: character.type,
          gender: character.gender,
          origin: character.origin,
          location: character.location,
          image: character.image,
          episode: character.episode,
          url: character.url,
          created: character.created,
        };

        return conn.query(insertQuery, [character.name, data]);
      });

      await Promise.all(insertPromises);
      console.log(`Добавлено ${characters.length} персонажей`);

      urlFetch = response.data.info.next;
    }

    console.log(
      "Таблица заполнена успешно! Чтобы увидеть данные, можете запустить 'node checkDb.js'"
    );
  } catch (err) {
    console.error("Error occurred: ", err);
  } finally {
    await conn.end();
  }
}

fetchAndInsertData();
