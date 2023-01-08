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




module.exports = {
    getActivities,
    putActivity
}