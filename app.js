const express = require("express");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObj = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Get Movie Names API

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const movieNamesArray = await db.all(getMovieNamesQuery);
  response.send(
    movieNamesArray.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

//add movie API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addBookQuery = `
  INSERT INTO
    movie(director_id, movie_name, lead_actor)
  VALUES (
      ${directorId},
      "${movieName}",
      "${leadActor}");`;

  await db.run(addBookQuery);
  response.send("Movie Successfully Added");
});

//Get Movie Based On Movie Id API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getBookQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  const dbResponse = await db.get(getBookQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

//Update Movie Details API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = "${movieName}",
      lead_actor = "${leadActor}"
    WHERE
      movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
      *
    FROM
      director;`;

  const dbResponse = await db.all(getDirectorsQuery);
  response.send(
    dbResponse.map((eachDirector) => convertDbObjectToResponseObj(eachDirector))
  );
});

//Get Movie Names By Specific Director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMovieNameQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id = ${directorId};`;

  const dbResponse = await db.all(getMovieNameQuery);
  response.send(
    dbResponse.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
