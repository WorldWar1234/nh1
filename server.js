#!/usr/bin/env node
'use strict';
const app = require('express')();
const authenticate = require('./src/authenticate');
const params = require('./src/params');
const fetchAndServe = require('./src/proxy');

const PORT = process.env.PORT || 8080;

app.get('/', authenticate, params, fetchAndServe);
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
