const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { signinHandler, registerUser, logoutHandler } = require('./sessionManager.js')
const { getActivities,getActivity, putActivity, deleteActivity, addActivity } = require('./activityManager.js')
const { getPlans, addPlan, deletePlan, addAct2Plan } = require('./planManager.js')

// import { signinHandler } from 'sessionManajer.js';

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())

// app.post('/login', window.location.href = '/login.html')
app.post('/login', signinHandler);
app.post('/register', registerUser);
app.post('/logout/:sesId', logoutHandler);

app.post('/activities/:parentId/:sesId', addActivity);
app.get('/activities/:sesId', getActivities);
app.put('/activities/:actId/:sesId', putActivity)
app.delete('/activities/:actId/:sesId', deleteActivity);
app.get('/activity/:actId/:sesId', getActivity);

app.get('/plans/:sesId', getPlans);
app.post('/plans/:sesId', addPlan);
app.put('/plans/addAct/:planId/:actId/:sesId', addAct2Plan);
app.delete('/plans/:planId/:sesId', deletePlan);


const PORT = 3003;
app.listen(PORT,
  () => {console.log(`Server running on port ${PORT}`);}
  );
