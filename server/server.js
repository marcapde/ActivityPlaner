const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { signinHandler } = require('./sessionManager.js')
const { getActivities, putActivity, deleteActivity } = require('./activityManager.js')

// import { signinHandler } from 'sessionManajer.js';

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())

// app.post('/login', window.location.href = '/login.html')
app.post('/login', signinHandler);
app.get('/activities/:sesId', getActivities);
app.put('/activities/:actId/:sesId', putActivity)
app.delete('/activities/:actId/:sesId', deleteActivity)
const PORT = 3003;
app.listen(PORT,
  () => {console.log(`Server running on port ${PORT}`);}
  );
