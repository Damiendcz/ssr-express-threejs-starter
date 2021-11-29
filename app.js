require('dotenv').config()
const errorHandler = require('errorhandler')
const logger = require('morgan')
const methodOverride = require('method-override')
const express = require('express')
const path = require('path')
const app = express()
const port = 3000

// MiddleWare
app.use(logger('dev'))
app.use(errorHandler())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride())
app.use(express.static(path.join(__dirname, 'public')))

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

// Link Resolver
const handleLinkResolver = (doc) => {
  // Define the url depending on the document type
  // if (doc.type === 'page') {
  //   return '/page/' + doc.uid;
  // } else if (doc.type === 'blog_post') {
  //   return '/blog/' + doc.uid;
  // }

  // Default to homepage
  return '/'
}

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver
  }
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/about', (req, res) => {
  initApi(req).then(api => {
    api.query(
      Prismic.Predicates.any('document.type', ['about', 'meta'])
    ).then(response => {
      const { results } = response
      const [about, meta] = results
      res.render('pages/about', {
        about,
        meta
      })
    })
  })

  // res.render('pages/about')
})

app.get('/collection', (req, res) => {
  res.render('pages/collection')
})

app.get('/detail/:id', (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`)
})
