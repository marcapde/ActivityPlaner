// import users from '../users.json' assert { type: 'json' };
// const Cookie = require('./cookie')
const uuid = require('uuid');
const fs = require('fs');

// each session contains the username of the user and the time at which it expires
class Session {
    constructor(sessionId, username, expiresAt) {
        this.username = username
        this.expiresAt = expiresAt
        this.sessionId = sessionId
    }
		// we'll use this method later to determine if the session has expired
    isExpired() {
        this.expiresAt < (new Date())
    }
    toJSON(){
        return {
            sessionId: this.sessionId,
            username: this.username,
            expiresAt: this.expiresAt
        }
    }
}

let sessionToken = "";

const signinHandler = (req, res) => {
    console.log(req)
    const { uname, password } = req.body;
    console.log(uname, password);
    if (!uname){
        res.status(400).json({ error: "Please enter your username" });
        return;
    }
    var data = fs.readFileSync("./data/users.json");
    var myObject = JSON.parse(data); 
    let found = false;
    myObject.users.every(element => {
        if (element.uname === uname && element.password === password){
            found = true;
            return false;
        }
        return true;
    });
    if (!found){
        res.status(400).json({ error: "Invalid username or password" });
        return;
    }
    sessionToken = uuid.v4();
    let date = new Date();
    date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
    let session = new Session(sessionToken, uname, date.toGMTString());
    console.log((session.toJSON()))

    var session_data = fs.readFileSync("./data/sessions.json");
    var sessionObject = JSON.parse(session_data); 
    deleteDuplicates(sessionObject,uname);
    sessionObject.sessions.push(session.toJSON());
    console.log(sessionObject);
    fs.writeFileSync("./data/sessions.json", JSON.stringify(sessionObject), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json({ sesId : session.sessionId });
        return;  
}
function deleteDuplicates(sessionObject,uname){
    sessionObject.sessions.forEach(element => {
        if (element.username === uname){
            sessionObject.sessions.splice(sessionObject.sessions.indexOf(element),1);
        }
    });
}
// function newSession(newSession){
//     // DELETE EXPIRED AND DUPLICATES
//     fs.readFileSync('./data/sessions.json', (err, data) => {
//         if (err) {
//             console.log(err);
//             res.status(400).json({ error: err });    
//             return;
//         }
//         let sessions = JSON.parse(data);
//         sessions.sessions.forEach(element => {
//             if (element.username === newSession.username || element.isExpired()){
                
//             }
//         });
//     });
// }
module.exports = {
    signinHandler,
    Session
}

// TODO
// function that repeats evry 12h to delete expired sessions

