const express = require('express'); // importing a CommonJS module

const hubsRouter = require('./hubs/hubs-router.js');
const helmet = require('helmet');
const morgan = require('morgan');
const server = express();

server.use(express.json());
server.use(helmet());
server.use(methodLogger);
server.use(addName);
server.use('/api/hubs', hubsRouter);
// server.use(morgan('dev'));
server.use(time);
server.use(lockout);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

server.delete('/', (req, res) => {
  res.send('deleted');
});

function methodLogger(req, res, next) {
  console.log(`${req.method} request`);
  next();
}

function addName(req, req, next) {
  req.name = req.name || req.header('x-name');
  next();
}

function lockout(req, res, next) {
  res.status(403).json({ message: 'api in maintenance mode' });
}

function time(req, res, next) {
  let d = new Date();
  let n = d.getSeconds();
  if (n % 3 === 0) {
    res.status(403).json({ message: 'you shall not pass', seconds: n });
  } else {
    next();
  }
}

module.exports = server;
