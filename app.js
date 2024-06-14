const {open} = require('sqlite')
const express = require('express')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
let dbpath = path.join(__dirname, 'moviesData.db')

let db = null

let serverinstaliser = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
serverinstaliser()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movie_id: dbObject.movie_id,
    director_id: dbObject.director_id,
    movie_name: dbObject.movie_name,
    lead_actor: dbObject.lead_actor,
  }
}
const convertDbObjectToResponseObject1 = dbObject => {
  return {
    director_id: dbObject.director_id,
    director_name: dbObject.director_name,
  }
}
const convertDbObjectToResponseObject2 = dbObject => {
  return {
    movie_name: dbObject.movie_name,
  }
}
// get method

app.get('/movies/', async (request, response) => {
  const getmoviesQuery = `
 SELECT
 *
 FROM
 movie;`
  const playersArray = await db.all(getmoviesQuery)
  response.send(
    playersArray.map(eachmovie => convertDbObjectToResponseObject2(eachmovie)),
  )
})
// post method

app.post('/movies/', async (request, response) => {
  const moviedetails = request.body
  const {directorId, movieName, leadActor} = moviedetails
  const moviequery = `INSERT INTO movie(director_id, movie_name, lead_actor)
  VALUES ( ${directorId},'${movieName}','${leadActor}')`
  await db.run(moviequery)
  response.send('Movie Successfully Added')
})

//GET method

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const moviequery = `SELECT * FROM movie WHERE movie_id = ${movieId}`
  const movieresponse = await db.get(moviequery)
  response.send(convertDbObjectToResponseObject(movieresponse))
})
// put method

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const moviedetails = request.body
  const {directorId, movieName, leadActor} = moviedetails
  const moviequery = `UPDATE movie SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`
  await db.run(moviequery)
  response.send('Movie Details Updated')
})

// delete method

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const query = `DELETE FROM movie WHERE movie_id = ${movieId}`
  await db.run(query)
  response.send('Movie Removed')
})

//getmethod//

app.get('/directors/', async (request, response) => {
  const getmoviesQuery = `
 SELECT
 *
 FROM
 director;`
  const directorArray = await db.all(getmoviesQuery)
  response.send(
    directorArray.map(eachmovie => convertDbObjectToResponseObject1(eachmovie)),
  )
})
//get directormethod//

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const moviequery = `SELECT
  *
FROM
  movie
WHERE
  director_id = ${directorId}`
  const directorArray = await db.all(moviequery)
  response.send(
    directorArray.map(eachmovie => convertDbObjectToResponseObject2(eachmovie)),
  )
})

module.exports = app
