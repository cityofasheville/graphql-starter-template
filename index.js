const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const parseurl = require('parseurl');
const cors = require('cors');

require('dotenv').config();
const CacheClient = require('coa-web-cache');
const { checkLogin } = require('coa-web-login');
const GRAPHQL_PORT = process.env.PORT || 4000;

cache = new CacheClient();
let sessionCache = null;
const cacheMethod = process.env.cache_method || 'memory';
if (cacheMethod === 'memory') {
  sessionCache = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
} else {
  throw new Error('Redis caching not yet implemented');
}
const server = new ApolloServer({ 
  typeDefs: require('./schema'),
  resolvers: require('./resolvers'),
  context: ({ req }) => ({
    session: req.session,
    req: req,
    cache,
  }),
});

const app = express();
app.use(session({
  name: process.env.sessionName,
  secret: process.env.sessionSecret, 
  resave: false,
  saveUninitialized: true,
  store: sessionCache,
  cookie: { 
    httpOnly: true,
    secure: 'auto',
    maxAge: 1000 * 60 * 60 * 24 * process.env.maxSessionDays,
  },
}));

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(function (req, res, next) { // Check logged in status
  checkLogin(req, cache.get(req.session.id), cache);
  next(); //
});

app.use(function (req, res, next) {
  if (!req.session) {
    req.session = {};
  }

  if (!req.session.views) {
    req.session.views = {};
  }
  const pathname = parseurl(req).pathname;
  console.log(`The email here is ${req.session.email}`);
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;
  console.log(`View count is ${JSON.stringify(req.session.views)} for ${req.session.id}`);
  next();
});

server.applyMiddleware({ app, cors: corsOptions });

app.listen({ port: GRAPHQL_PORT }, () => {
  console.log(`Server ready at http://localhost:${GRAPHQL_PORT}${server.graphqlPath}`);
});
