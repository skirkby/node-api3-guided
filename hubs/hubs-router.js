const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

//----------------------------------------------------------------------------//
//    ERROR HANDLING MIDDLEWARE
//----------------------------------------------------------------------------//

// You might expect that, like other middleware, you would see a router.use()
// with error handling middleware in it up here at the top of the file.
//
// However, the order in which middleware is registered *matters*, because once
// the "middleware stack pointer" is past a middleware function in the stack, it
// will not ever go back to run any middleware function. It only goes forward.
//
// Transferring control to an error handling middleware function is done by
// passing a value to next() (eg next(new Error('error!')) ). *BUT* control is
// not passed to the "first middleware method in the stadck"... rather, it is
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
// very end of the file, so the error handling middleware will be registered
// *after* all other middleware, ensuring that any errors are likely to be
// passed to it.

//----------------------------------------------------------------------------//
//    BASIC EXAMPLE OF MIDDLEWARE
//----------------------------------------------------------------------------//
// this is a basic middleware method that just calls next()
//
router.use((req, res, next) => {
  console.log('hubs router!');
  next();
});


//----------------------------------------------------------------------------//
//    ROUTE HANDLER MIDDLEWARE COMES NEXT
//----------------------------------------------------------------------------//


// this only runs if the url has /api/hubs in it
router.get('/', (req, res) => {
  Hubs.find(req.query)
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving the hubs',
      });
    });
});


//----------------------------------------------------------------------------//
//    USING VALIDATEID() AS MIDDLEWARE...
//----------------------------------------------------------------------------//

// because this router is bound (in server.js) to the /api/hubs root url, the
// effective METHOD/url that will trigger this middleware is /api/hubs/:id.
//
// note that this method not only supplies the typical arrow function as
// middleware for the METHOD/url, but it also specifies *another* middleware
// method (this time by just supplying its name, validateId), as a parameter to
// .get().
//
// validateId() looks up the hub with the id, and if it finds it, it adds the
// hub object to the req object.
//
// That way, we don't have to do another lookup here... we can just use the hub
// object on req.
//
// Compare the contents of this streamlined middleware with what it was
// before... using middleware allows us to consolidate a lot of repetitive
// validation and database management. 
router.get('/:id', validateId, (req, res) => {
  res.status(200).json(req.hub);
});


router.post('/', (req, res) => {
  Hubs.add(req.body)
    .then(hub => {
      res.status(201).json(hub);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error adding the hub',
      });
    });
});

router.delete('/:id', validateId, (req, res) => {
  Hubs.remove(req.params.id)
    .then(count => {
      if (count > 0) {
        res.status(200).json({ message: 'The hub has been nuked' });
      } else {
        res.status(404).json({ message: 'The hub could not be found' });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: 'Error removing the hub', error });
    });
});

//----------------------------------------------------------------------------//
//    PUT HANDLER... NEEDS VALIDATEID() AND VALIDATEBODY()!
//----------------------------------------------------------------------------//
router.put('/:id', validateId, (req, res) => {
  Hubs.update(req.params.id, req.body)
    .then(hub => {
      if (hub) {
        res.status(200).json(hub);
      } else {
        res.status(404).json({ message: 'The hub could not be found' });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: 'Error updating the hub', error });
    });
});

// add an endpoint that returns all the messages for a hub
// this is a sub-route or sub-resource
router.get('/:id/messages', validateId, (req, res) => {
  Hubs.findHubMessages(req.params.id)
    .then(messages => {
      res.status(200).json(messages);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error getting the messages for the hub',
      });
    });
});

//----------------------------------------------------------------------------//
//    ROUTER.POST('/id/messages',...)
//----------------------------------------------------------------------------//
// here is an example of a POST handler that needs both a valid id *and* a
// message body.
//
// add an endpoint for adding new message to a hub
//
// note the use of the "rest" operator/syntax "..." (again, not to be confused
// with REST API's - totally unrelated. Google-fu it.)
router.post('/:id/messages', validateId, (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
    .then(message => {
      res.status(210).json(message);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error getting the messages for the hub',
      });
    });
});

//----------------------------------------------------------------------------//
//    VALIDATEID() MIDDLEWARE
//----------------------------------------------------------------------------//
// this is our validate() middleware. note that this middleware is not required
// for *all* HTTP requests - only those that have an :id parameter.
//
// You can add middleware to the chain by calling a .METHOD method on server()
// or Router(), or you can add it to the chain by adding it to the list of
// methods to be run when a specific METHOD with a specific url is called (as
// seen above)
//
function validateId(req, res, next) {
  const { id } = req.params;
  Hubs.findById(id)
    .then(hub => {
      if (hub) {
        req.hub = hub;
        next();
      } else {
        // res.status(404).json({ message: 'does not exist' });
        next(new Error('does not exist'));
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'exception', err });
    });
}

//----------------------------------------------------------------------------//
//    SSSTTTRRREEETTTCCCHHH...... REQUIREBODY() MIDDLEWARE
//----------------------------------------------------------------------------//
function requireBody(req, res, next) {
  // implement a validation middleware method that ensures that the request has
  // a body. If there is no body, end the request/response lifecycle by
  // responding with an error code. If there is a body, pass control on to the
  // next middleware method.
  //
  // Be sure to add this middleware wherever it is needed!
}

//----------------------------------------------------------------------------//
//    ERROR HANDLING MIDDLEWARE...
//----------------------------------------------------------------------------//

// Middleware that accpets *4* parameters is specially tagged as "error handling
// middleware" by expressjs. The first parameter is the error parameter... when
// an error is "thrown" using express(), the error object or content is passed
// to error handlign middleware in the first parameter. It is usually named
// "error" by convention. Also, by convention, this is usually an instance of
// the Error() class (or something inherited from it.)
//
// Note that this function can be *defined* anywhere (JavaScript hoisting will
// make it like it was defined at the top of the file anyway...). However, you
// should be sure to *use* it at the end of the router or server file.
//
// If you .use() it at or near the top of the file, like other middleware (eg
// express.json()), this error handler will be early in the middleware chain.
// And once you have passed a middleware function in the chain, no amount of
// "next()'ing" will allow you to go back to it. 
//
// With error handling middleware, next() will skip it. If you intend for the
// "next error handler" to be called, you must pass a value to next(), and it
// will go to the *next* error handler in the chain. If we .use() this error
// handler at the top of the file, it will be before the other middleware
// functions that may need to "next()" to it.
//
// So we want to .use() this error handling middleware at the *end* of the file.
//
// If we don't do that, then next(error) will pass to the *very last middleware
// error handler* in the chain: the default expressjs error handler. This error
// handler will respond with HTML, containing the error message or data, and
// with a 500 result code.
function errorHandler(error, req, res, next) {
  console.log('error: ', error.message);
  res.status(400).json({ message: error.message });
}

//----------------------------------------------------------------------------//
//    ERROR HANDLING MIDDLEWARE .USE()
//----------------------------------------------------------------------------//
router.use(errorHandler);

module.exports = router;