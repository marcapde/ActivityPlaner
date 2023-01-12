const fs = require('fs');

const { Session, checkSession } = require('./activityManager.js')

function getAllPlans(){
    var filedata = fs.readFileSync("./data/plans.json");
    var plans = JSON.parse(filedata);
    return plans.plans;
}

const getPlans = (req, res) => {
    const sesId = req.params.sesId;
    console.log(sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    } 
    let username = checkSession(sesId);
    if (!username) return;
    let plans = getAllPlans();
    let planList = [];
    plans.forEach(element =>{
        if (element.username === username){
            planList.push(element);
        }
    });
    res.status(200).json(planList);
    return;

}

module.exports = {
    getPlans
}
