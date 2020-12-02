require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const cors = require('cors');
const helmet = require('helmet');
const MOVIEDEX = require('./MOVIEDEX.json');

const app = express()
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validationToken (req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ Error: 'Unauthorized Request'})
    }

    next()

})

app.get('/movie', function getMovieInfo (req, res) {
    let movies = MOVIEDEX.movies;

    if(req.query.genre) {
        movies = movies.filter(movie =>
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase()));
    }

    if(req.query.country) {
        movies = movies.filter(movie => 
            movie.country.toLowerCase().includes(req.query.country.toLowerCase()));
    }

    if(req.query.avg_vote) {
        movies = movies.filter(movie =>
            movie.avg_vote >= req.query.avg_vote)
    }

    res.json(movies)

})

app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        response = {error}
    }
    res.status(500).json(response)
})


const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})


