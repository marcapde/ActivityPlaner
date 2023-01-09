const fs = require('fs');
// import Session from './sessionManager';
class Session {
    constructor(sessionId, username, expiresAt) {
        this.username = username
        this.expiresAt = expiresAt
        this.sessionId = sessionId
    }
		// we'll use this method later to determine if the session has expired
    isExpired() {
        return this.expiresAt < Date.now()
    }
    toJSON(){
        return {
            sessionId: this.sessionId,
            username: this.username,
            expiresAt: this.expiresAt
        }
    }
}

function checkSession(sesId){
    var filedata = fs.readFileSync("./data/sessions.json");
    var sesions = JSON.parse(filedata);
    let username = "";
    sesions.sessions.forEach(element => {
        if (element.sessionId === sesId) {
            username = element.username;
            let session = new Session(element.sessionId,username, new Date (element.expiresAt));    
            console.log(session.expiresAt);        
            if (session.isExpired()) {
                username = false;                
            }
        }
    });
    return username;
}
/**
 * Function to check if the activity belongs to the user
 * @param string username 
 * @param string id 
 * @returns true if the activity belongs to the user, false otherwise
 */
function checkActId(username,id){
    var filedata = fs.readFileSync("./data/activities.json");
    var act = JSON.parse(filedata);
    let correct = false;
    act.activities.every(element => {
        console.log(element);
        console.log(parseInt(id));
        if (element.id === parseInt(id) && element.username === username) {
            correct = true;
            return false;
        }
        return true;
    });
    
    return correct;
}

function getActivityList(){
    var filedata = fs.readFileSync("./data/activities.json");
    var act = JSON.parse(filedata);
    return act.activities;
}

const getActivities = (req, res) => {
    // console.log(req);
    const sesId = req.params.sesId;
    console.log(sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    } 
    let username = checkSession(sesId);
    if (username === ""){
        res.status(400).json({ error: "session not valid, please login again" });
        return;
    } else if (username === false){
        res.status(400).json({ error: "session has expired, please login again" });
        return;
    }
    var data = fs.readFileSync("./data/activities.json");
    var activities = JSON.parse(data);
    let activityList = [];
    activities.activities.forEach(element =>{
        if (element.username === username){
            activityList.push(element);
        }
    });
    res.status(200).json(activityList);
    return;
}

const putActivity = (req, res) => {
    // console.log(req);
    const sesId = req.params.sesId;
    const actId = req.params.actId;
    const { name, desc } = req.body;
    console.log(sesId);
    console.log(name,desc);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    } else if(!actId){
        res.status(400).json({ error: "missing activity id" });
        return;
    }

    let username = checkSession(sesId);
    if (username === ""){
        res.status(400).json({ error: "session not valid, please login again" });
        return;
    } else if (username === false){
        res.status(400).json({ error: "session has expired, please login again" });
        return;
    }
    var data = fs.readFileSync("./data/activities.json");
    var activities = JSON.parse(data);
    let activityList = [];
    activities.activities.forEach(element =>{
        console.log(element.id == actId);
        if (element.id == actId){
            element.name = name;
            element.desc = desc;
        }
        activityList.push(element);        
    });
    fs.writeFileSync("./data/activities.json", JSON.stringify({"activities":activityList}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json(activityList);
    return;
}


const addActivity = (req, res) => {
    // console.log(req);
    const sesId = req.params.sesId;
    const parentId = req.params.parentId;
    console.log("sesId: "+sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    } else if(!parentId){
        res.status(400).json({ error: "missing parent activity id" });
        return;
    }

    let username = checkSession(sesId);
    if (username === ""){
        res.status(400).json({ error: "session not valid, please login again" });
        return;
    } else if (username === false){
        res.status(400).json({ error: "session has expired, please login again" });
        return;
    }

    let goodAct = parentId == -1 ? true : checkActId(username,parentId);
    if(!goodAct){
        res.status(400).json({ error: "Activity doesn't belong to user" });
        return;
    }

    let act = getActivityList();
    console.log(act[act.length - 1]);
    let newId = act[act.length - 1].id + 1;
    let newAct = {
        username: username,
        id: newId,
        mainlevel: parentId == -1,
        name: req.body.name,
        desc: req.body.desc,
        children: []

    }
    act.push(newAct);
    if (parseInt(parentId) != -1){
        act.every(element =>{
            if (element.id === parseInt(parentId)){
                element.children.push(newId);
                return false;
            }
            return true;                
        });
    }
    fs.writeFileSync("./data/activities.json", JSON.stringify({"activities":act}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json(act);
    return;
    // act.forEach(element =>{

    // });




}



const deleteActivity = (req, res) => {
    // console.log(req);
    const sesId = req.params.sesId;
    const actId = req.params.actId;
    console.log("sesId: "+sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    }

    let username = checkSession(sesId);
    if (username === ""){
        res.status(400).json({ error: "session not valid, please login again" });
        return;
    } else if (username === false){
        res.status(400).json({ error: "session has expired, please login again" });
        return;
    }
    var data = fs.readFileSync("./data/activities.json");
    var act = JSON.parse(data);
    act.activities.forEach(element => {
        if (element.children.includes(parseInt(actId))){
            console.log("INCLUDES!")
            element.children.splice(element.children.indexOf(parseInt(actId),1));
        }
        if (element.id == actId){
            if (element.children.length !== 0) deleteRecursive(element.children, act);
            act.activities.splice(act.activities.indexOf(element),1);
        }
    });
    fs.writeFileSync("./data/activities.json", JSON.stringify({"activities":act.activities}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json(act.activities);
    return;
}

function deleteRecursive(childArr = [], act){
    childArr.forEach(element => {
        console.log("Deleting act: "+ element)
        let data = getActData(act,parseInt(element));
        console.log(data);
        deleteRecursive(data.childList, act)
        act.activities.splice(data.index,1);
    });
}

function getActData(act, actId){
    let index = 0;
    let returnThis = {};
    act.activities.forEach(element =>{
        if (element.id == parseInt(actId)){
            returnThis =  {index : index, childList : element.children};
        }
        else index ++;
    });
    return returnThis;

}
module.exports = {
    getActivities,
    putActivity,
    deleteActivity,
    addActivity
}