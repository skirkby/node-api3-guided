const express = require('express'); // importing a CommonJS module

const hubsRouter = require('./hubs/hubs-router.js');
const helmet = require('helmet');
const morgan = require('morgan');
const server = express();

server.use(express.json());

server.use('/api/hubs', hubsRouter);
server.use(helmet());
// server.use(morgan('dev'));
server.use(methodLogger);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

server.delete('/', (req,res) => {
  res.send('deleted');
});

function methodLogger(req, res, next) {
  console.log(`${req.method} request`);
  next();
}


module.exports = server;
