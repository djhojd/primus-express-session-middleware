# primus-express-session-middleware
Share a user session between Express 4.x and Primus 3.0.x using middleware.

This is a fork of [primus express middleware example](https://github.com/primus/primus/tree/master/examples/middleware), where they show us how to use a middleware to add the session data in the requests captured by Primus. That data is read-only and sometimes you need to make changes and save them using a `spark`. With this fork, inspired from [express-session](https://github.com/expressjs/session/blob/master/session/store.js#L76), you can!

## Installation

```
npm i git://github.com/djhojd/primus-express-session-middleware.git
```

## How to use
...