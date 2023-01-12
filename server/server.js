const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { signinHandler, registerUser } = require('./sessionManager.js')
const { getActivities, putActivity, deleteActivity, addActivity } = require('./activityManager.js')
const { getPlans } = require('./planManager.js')

// import { signinHandler } from 'sessionManajer.js';

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())

// app.post('/login', window.location.href = '/login.html')
app.post('/login', signinHandler);
app.post('/register', registerUser);

app.post('/activities/:parentId/:sesId', addActivity);
app.get('/activities/:sesId', getActivities);
app.put('/activities/:actId/:sesId', putActivity)
app.delete('/activities/:actId/:sesId', deleteActivity);

app.get('/plans/:sesId', getPlans);

const PORT = 3003;
app.listen(PORT,
  () => {console.log(`Server running on port ${PORT}`);}
  );
