# Node API 3 Guided Project

Guided project for **Node API** module 3.

In this project we will learn how to create a very simple Web API using `Node.js` and `Express`, and learn to use and create `Express Middleware`.

## Prerequisites

- A REST client like [Insomnia](https://insomnia.rest/download/) or [Postman](https://www.getpostman.com/downloads/) installed.

## Project Setup

- [ ] import this repository into your account.
- [ ] clone your version of the repository.
- [ ] **CD into the folder** where you cloned the repository.
- [ ] type `npm i` to download dependencies.

Please follow along as the instructor creates and adds `middleware` to the API
step by step.

## Notes:

Note that this repo was copied from the notes for the lecture on 4 Nov 2019.
There was no live lecture on 20 Jan 2020 because it is a holiday.
Instead, the students watched the recorded lecture from 4 Nov 2019.

The following code files have notes attached:

- ./server.js
    - Introduction
    - Third Party Middleware Imports
    - Use()'ing Middleware
    - Lockout()
    - Alternative Syntax for Use()'ing Middlewhere
    - Routers Are Middleware Too...
    - Our Lone Route Handler For The Root Document Path...
    - Function MethodLogger()
    - Function AddName()
    - Function Lockout()
    - A Great Example of the Ternary Operator

- ./hubs/hubs-router.js
    - Error Handling Middleware
    - Basic Example of Middleware
    - Route Handler Middleware Comes Next
    - Using ValidateId() As Middleware...
    - PUT Handler... Needs ValidateId() and ValidateBody()!
    - Router.POST('/id/messages', ...)
    - ValidateId() Middleware
    - SSSTTTRRREEETTTCCCHHH...... RequireBody() Middleware
    - Error Handling Middleware...
    - Error Handling Middleware .use()


