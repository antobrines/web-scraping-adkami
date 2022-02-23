const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  });
});

app.post('/getAnime', async (req, res) => {
  const {
    url
  } = req.body;
  const options = {
    headers: {
      Referer: 'www.adkami.com',
      authority: 'www.adkami.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
    }
  };
  const result = await fetch(url, options);
  const html = await result.text();
  console.log({
    url,
    html
  });
  const $ = cheerio.load(html);

  // ! TITLE
  const titleVideo = $('.title-header-video');
  const title = titleVideo.contents().first().text().split(' -')[0];

  // ! SAISON
  const saison = $('.saison');
  const nbSaison = saison.contents().length;
  const saisons = saison.map((i, e) => $(e).text()).get();

  // ! SYNOPSIS
  const synopsisElement = $('.description.justify.m-hidden');
  const synopsis = synopsisElement.map((i, e) => $(e).text().split(' <a')[0]).get();

  // ! GENRES
  const genresElement = synopsisElement.find('span[itemprop=genre]');
  const genres = genresElement.map((i, e) => $(e).text()).get();
  console.warn({
    title,
    saisons,
    nbSaison,
    synopsis,
    genres
  });
  res.json({
    title,
    saisons,
    nbSaison,
    synopsis,
    genres
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;