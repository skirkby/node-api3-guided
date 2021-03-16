//----------------------------------------------------------------------------//
// DEFINING A CONTROLLER MODULE
//----------------------------------------------------------------------------//
// As described in the notes for the previous class (Server-Side Routing with
// Express), you can use a Controller module to help organize your code. This is
// really important when you have dozens, hundreds, or even thousands of
// middleware handlers. 
// 
// Here we just define a few handlers and export them. As an exercise, you could
// move the remainder of the handlers in hubs-router.js to this file, and modify
// hubs-router.js to access them from the Controller module. 
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// The middleware handler methods in this Controller module need to have access
// to the database, so we import the Model module here.
//----------------------------------------------------------------------------//
const Hubs = require('./hubs-model.js');

//----------------------------------------------------------------------------//
// this is a simple definition of a middleware function. We just export it as a
// function, so it can be passed to a call to Router.get(). 
// 
// Below, we export an array of middleware functions that should be used
// together. This simplifies the use of multiple middleware functions in the
// Router module. 
//----------------------------------------------------------------------------//
async function getHubs(req, res, next) {
    try {
        const hubs = await Hubs.find(req.query);
        res.status(200).json(hubs);
    } catch (err) {
        next({ error: err, message: 'error retrieving hubs', status: 500 });
    }
}

//----------------------------------------------------------------------------//
// you can pass an array of middleware functions to a call to app.METHOD() or
// Router.METHOD(). Here, we define an array that includes the ID validation
// middleware, and an arrow-function definition of the route handler. 
// 
// in the router, just do this:
// 
//      router.get('/:id', Controller.getHubById);
// 
// This will pass the array that is exported here. 
//----------------------------------------------------------------------------//
const getHubById = [
    validateId,
    (req, res) => {
        res.json(req.hub);
    }
];


//----------------------------------------------------------------------------//
// VALIDATION MIDDLEWARE
// 
// This is where we define validation middleware. We export them also in case we
// need to use them elsewhere. 
// 
// Note the use of next() - without a parameter, it passes control to the next
// middleware method in the stack. 
// 
// With a parameter, it passes control to the next middleware method in the
// stack that can handle errors (i.e. that has 4 parameters). 
// 
// The object we pass to next() can be anything ... it doesn't have to be an
// instance of an Error() object. Passing anything tells Express that controll
// should be given to the next error handling middleware. And the parameter
// passed to next() is given to the error handling middleware, in the first
// parameter. 
//----------------------------------------------------------------------------//

async function validateId(req, res, next) {
    const { id } = req.params;
    try {
        const hub = await Hubs.findById(id);
        if (hub) {
            req.hub = hub;
            next();
        } else {
            next({ message: 'invalid id', status: 405 });
        }
    } catch (err) {
        next({ error: err, message: err.message, status: 500 });
    }

}

function requireBody(req, res, next) {
    if (req.body && Object.keys(req.body).length > 0) {
        next();
    } else {
        next({ message: 'body is required', status: 400 });
    }
}

//----------------------------------------------------------------------------//
// In Javascript, function definitions are "hoisted". This means that Javascript
// acts as if they have been defined at the top of the file. Therefore, they can
// be accessed at the top of the file, even if they are defined at the bottom of
// the file. 
// 
// Because of this, if all we were exporting were functions as property values,
// we could put module.exports at the top of the file. 
// 
// However, at least one of the properties is actually an array, not a function
// (see getHubById). Array definitions, along with other identifiers, are *not*
// hoisted. This means that they have to be defined in the module *before* they
// are accessed. 
// 
// So, since we are exporting the getHubById array as a property value in the
// object we are exporting in module.exports, we have to put module.exports at
// the bottom of the file.
//----------------------------------------------------------------------------//
module.exports = {
    getHubs: getHubs,
    getHubById: getHubById,
    validateId,
    requireBody
}