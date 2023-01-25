const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { signinHandler, registerUser, logoutHandler } = require('./sessionManager.js')
const { getActivities,getActivity, putActivity, deleteActivity, addActivity } = require('./activityManager.js')
const { getPlans, addPlan, deletePlan, addAct2Plan, editPlan, editActFromPlan, delActFromPlan } = require('./planManager.js')

// import { signinHandler } from 'sessionManajer.js';

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())



const logController = (req, res, next) => {
  console.log('req.method = ' + req.method);
  console.log('req.URL = ' + req.originalUrl);
  console.log('req.body = ' + JSON.stringify(req.body));
  console.log("======================");
  next(); 
};
const headersController = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, PATCH, DELETE');
  next(); // make sure we go to the next routes and don't stop here
};

// ROUTER
app.use('*',                   logController);
app.use   ('*',                 headersController);

// SESSION
app.post('/login', signinHandler);
app.post('/register', registerUser);
app.post('/logout/:sesId', logoutHandler);
// ACTIVITIES
app.post('/activities/:parentId/:sesId', addActivity);
app.get('/activities/:sesId', getActivities);
app.put('/activities/:actId/:sesId', putActivity)
app.delete('/activities/:actId/:sesId', deleteActivity);
app.get('/activity/:actId/:sesId', getActivity);
// PLANS
app.get('/plans/:sesId', getPlans);
app.post('/plans/:sesId', addPlan);
app.put('/plans/addAct/:planId/:actId/:sesId', addAct2Plan);
app.put('/plans/:planId/:actId/:sesId', editActFromPlan);
app.put('/plans/:planId/:sesId', editPlan);
app.delete('/plans/:planId/:actId/:sesId', delActFromPlan);
app.delete('/plans/:planId/:sesId', deletePlan);


const PORT = 3003;
app.listen(PORT,
  () => {console.log(`Server running on port ${PORT}`);}
  );
