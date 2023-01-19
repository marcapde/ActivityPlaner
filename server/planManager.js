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

const addPlan = (req, res) => {
    const sesId = req.params.sesId;
    console.log(sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    } 
    let username = checkSession(sesId);
    if (!username) return;
    let plans = getAllPlans();

    let newId = plans[plans.length - 1].id + 1;
    let newPlan = {
        username: username,
        id: newId,
        name: req.body.name,
        desc: req.body.desc,
        startDate: req.body.startDate,
        actList: []

    }
    plans.push(newPlan);   
    fs.writeFileSync("./data/plans.json", JSON.stringify({"plans":plans}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json({success : "Plan added succesfully"});
    return;
}



const deletePlan = (req, res) => {
    // console.log(req);
    const sesId = req.params.sesId;
    const planId = req.params.planId;
    console.log("sesId: "+sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    }

    let username = checkSession(sesId,res);
    if (!username) return;
    let plans = getAllPlans();
    
    plans.forEach(element => {
        // if (element.children.includes(parseInt(actId))){
        //     console.log("INCLUDES!")
        //     element.children.splice(element.children.indexOf(parseInt(actId),1));
        // }
        if (element.id == planId && element.username == username){
            plans.splice(plans.indexOf(element),1);
        }
    });
    fs.writeFileSync("./data/plans.json", JSON.stringify({"plans":plans}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json(plans);
    return;
}

module.exports = {
    getPlans,
    addPlan,
    deletePlan,
}
