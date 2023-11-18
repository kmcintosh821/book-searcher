const express = require('express');
const path = require('path');
const db = require('./config/connection');
const cookieParser = require('cookie-parser')

const { ApolloServer } = require('@apollo/server');
const {expressMiddleware } = require('@apollo/server/express4');

const app = express();
const PORT = process.env.PORT || 3001;
const is_prod = process.env.NODE_ENV === 'production';

require('dotenv').config();

const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth.js')

const server = new ApolloServer({
  typeDefs,
  resolvers
});

async function startServer() {
  await server.start();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.use(cookieParser());
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  if (is_prod) {
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    })
  }

  db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
}

startServer();




