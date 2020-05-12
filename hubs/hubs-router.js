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
router.use((req, res, next) => {
  console.log('hubs router!');
  next();
});


//----------------------------------------------------------------------------//
//    ROUTE HANDLER MIDDLEWARE COMES NEXT
//----------------------------------------------------------------------------//

// an example of defining middleware as a function so we can use it elsewhere. 
// Following this pattern can make unwieldy amounts of server.METHOD or
// router.METHOD() calls easier to handle... define your middleware in one or
// more modules, and mount them in another. So far, we have been defining our
// middleware as anonymous inline functions in our mounting calls, but with
// large numbers of API endpoints, this will lead to ugly code. 
function getHandler(req, res) {
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
}

// this only runs if the url has /api/hubs in it, because this router file is
// mounted to '/api/hubs' in the server.js file.
router.get('/', getHandler);


//----------------------------------------------------------------------------//
//    USING validateId() AS MIDDLEWARE...
//----------------------------------------------------------------------------//

// because this router is bound (in server.js) to the /api/hubs root url, the
// effective METHOD/url that will trigger this middleware is GET /api/hubs/:id.
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

//----------------------------------------------------------------------------//
// POST HANDLER ... NEEDS requiresBody()!
//----------------------------------------------------------------------------//

/**
 * because this router is bound (in server.js) to the /api/hubs root url, the
 * effective METHOD/url that will trigger this middleware is GET /api/hubs/:id.
 * <br><br>
 * ```js
 *    const thisthing = 'something';
 *    console.log(`i like ${thisthing}`);
 * ```
 * <br><br>
 * note that this method not only supplies the typical arrow function as
 * middleware for the METHOD/url, but it also specifies *another* middleware
 * method (this time by just supplying its name, validateId), as a parameter to
 * .get(). 
 * <br><br>
 * validateId() looks up the hub with the id, and if it finds it, it
 * adds the hub object to the req object.
 *<br><br>
 * That way, we don't have to do another lookup here... we can just use the hub
 * bject on req.
 * <br><br>
 * Compare the contents of this streamlined middleware with what it was
 * before... using middleware allows us to consolidate a lot of repetitive
 * validation and database management. 
 *         
 * @param  {} req
 * @param  {} res
 */
router.post('/', requireBody, (req, res) => {
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
//    PUT HANDLER... NEEDS validateId() AND requireBody()!
//----------------------------------------------------------------------------//
router.put('/:id', [validateId, requireBody], (req, res) => {
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
router.post('/:id/messages', validateId, requireBody, (req, res) => {
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
  const body = req.body;
  !body || body === {} ?
    res.status(400).json({ message: 'Please include request body' })
    :
    next();
}


module.exports = router;

//----------------------------------------------------------------------------//
// Other syntax options for defining the requireBody() function...
//----------------------------------------------------------------------------//
// function requiredBody(req, res, next) {
//   if (!req.body || req.body === {}) {
//     next({code:400, message:'please include a body});
//   } else {
//     next();
//   }
// }
//
//----------------------------------------------------------------------------//
//
// const requiredBody = ((req, res, next) => {
//   !req.body || req.body === { }
//      ? next({code:400, message:'please include a body});
//      : next ()
//   })
//
//----------------------------------------------------------------------------//
// 
// function requiredBody(req, res, next) {
//   const { body } = req;
//   if (!body || Object.keys(body).length === 0) {
//     next({code:400, message:'please include a body});;
//   } else {
//     next();
//   }
// }
// 
//----------------------------------------------------------------------------//
// 
// function requiredBody(req, res, next){
//   if (req.body || req.body !== {}) {
//     next();
//   } else {
//     res.status(400).json({message: 'Please include request body'})
//   }
// }
// 

