const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');
const Controller = require('./hubs-controller.js');

const router = express.Router();

//----------------------------------------------------------------------------//
//    ERROR HANDLING MIDDLEWARE
//----------------------------------------------------------------------------//

// You might expect that, like other middleware, you would see a router.use()
// with error handling middleware in it up here at the top of the file.
//
// However, the order in which middleware is registered *matters*, because once
// the "middleware stack pointer" is past a middleware function in the stack, it
// will not ever go back to run any middleware function for the current request.
// It only goes forward.
//
// Transferring control to an error handling middleware function is done by
// passing a value to next() (eg next(new Error('error!')) ). *BUT* control is
// not passed to the "first middleware method in the stack"... rather, it is
// passed to the "next error handling middleware method in the stack that
// appears after the current middleware function."
//
// So if you register an error handling middleware function at the top of the
// stack (i.e. at the top of the file), the pointer will be past it very
// quickly, and no errors that occur later will be handled by it... because it
// will never be "the next error handling middleware function in the stack that
// appears after the current middleware function."
//
// So, no, there is no router.use(errorHandler) up here... it is found at the
// very end of the server.js file, so the error handling middleware will be
// registered *after* all other middleware, ensuring that any errors are likely
// to be passed to it.

//----------------------------------------------------------------------------//
//    BASIC EXAMPLE OF MIDDLEWARE
//----------------------------------------------------------------------------//
// this is a basic middleware method that just calls next()
// 
// This middleware is added to the Router.stack array, and so is local to the
// router. All of the middleware functions registered to the router object with
// a call to Router.METHOD() (like .get(), .post(), .use()) are specific to the
// router and will not be given a chance to process the request unless the path
// matches the path that the router is mounted to in the Application (server). 
// 
// This means that the following middleware, although at the top of the router
// stack, won't run unless the path begins with '/api/hubs' (since that's the
// mount point for the router in the server.js file.)
//----------------------------------------------------------------------------//
router.use((req, res, next) => {
  console.log('hubs router!');
  next();
});

//----------------------------------------------------------------------------//
// USING A CONTROLLER MODULE
//----------------------------------------------------------------------------//
// the following route handlers are defined in the Controller module. 
// 
// be sure to document in the Controller module when a handler will be preceded
// by another middleware function. 
// 
// alternatively, the controller can create an array of middleware handlers that
// can be exported and used here. 
//----------------------------------------------------------------------------//
router.get('/', Controller.getHubs);
router.get('/:id', Controller.validateId, Controller.getHubById);

//----------------------------------------------------------------------------//
// USING VALIDATION MIDDLEWARE AND CENTRALIZED ERROR HANDLING
//----------------------------------------------------------------------------//
// in the following middleware handlers, some use validating middleware that is
// defined in the Controller module. 
// 
// all of these examples use a call to next() with an error object, so we can
// centralize handling of errors (like logging, formatting, etc.)
//----------------------------------------------------------------------------//
router.post('/', Controller.requireBody, async (req, res, next) => {
  try {
    const hub = await Hubs.add(req.body);
    res.status(201).json(hub);
  } catch (err) {
    next({ error: err, message: err.message, status: 500 });
  }
});

router.delete('/:id', Controller.validateId, async (req, res, next) => {
  try {
    await Hubs.remove(req.hub.id);
    res.status(200).json({ message: `hub #${req.hub.id} removed` });
  } catch (err) {
    next({ error: err, message: 'error removing the hub', status: 500 });
  }
});

router.put('/:id', Controller.validateId, Controller.requireBody,
  async (req, res, next) => {
    try {
      const hub = await Hubs.update(req.hub.id, req.body);
      res.status(200).json(hub);
    } catch (err) {
      next({ error: err, message: 'error updating the hub', status: 500 });
    }
  });

router.get('/:id/messages', Controller.validateId, async (req, res, next) => {
  try {
    const messages = await Hubs.findHubMessages(req.hub.id);
    res.status(200).json(messages);
  } catch (err) {
    next({ error: err, message: 'error getting messages', status: 500 })
  }
});

router.post('/:id/messages', Controller.validateId, Controller.requireBody,
  async (req, res, next) => {
    try {
      const messageInfo = { ...req.body, hub_id: req.params.id };
      const message = await Messages.add(messageInfo);
      res.status(210).json(message);
    } catch (err) {
      next({ error: err, message: 'error adding message', status: 500 });
    }
  });


//----------------------------------------------------------------------------//
// these validation middleware functions have been moved to the Controller
// module. 
//----------------------------------------------------------------------------//
// async function validateId(req, res, next) {
//   const { id } = req.params;
//   try {
//     const hub = await Hubs.findById(id);
//     if (hub) {
//       req.hub = hub;
//       next();
//     } else {
//       next({ message: 'invalid id', status: 404 });
//     }
//   } catch (err) {
//     next({ error: err, message: err.message, status: 500 });
//   }

// }

// function requireBody(req, res, next) {
//   if (req.body && Object.keys(req.body).length > 0) {
//     next();
//   } else {
//     next({ message: 'body is required', status: 400 });
//   }
// }

module.exports = router;
