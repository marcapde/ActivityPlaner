const fs = require('fs');

const { Session, checkSession, getActData, getActivityList } = require('./activityManager.js')

function getAllPlans(){
    var filedata = fs.readFileSync("./data/plans.json");
    var plans = JSON.parse(filedata);
    return plans.plans;
}

const getPlans = (req, res) => {
    const sesId = req.params.sesId;
    // console.log(sesId);
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
    // console.log(sesId);
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
    // console.log("sesId: "+sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    }

    let username = checkSession(sesId,res);
    if (!username) return;
    let plans = getAllPlans();
    
    plans.forEach(element => {        
        if (element.id == planId && element.username == username){
            plans.splice(plans.indexOf(element),1);
        }else if (element.id == planId && element.username != username){
            res.status(400).json({ error: "Plan does not belong to user"});	
            return ;
        }
    });
    fs.writeFileSync("./data/plans.json", JSON.stringify({"plans":plans}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json({success : "Plan deleted succesfully"});
    return;
}

const editPlan = (req, res) => {
    const sesId = req.params.sesId;
    const planId = req.params.planId;

    // console.log(sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    } 
    let username = checkSession(sesId);
    if (!username) return;
    let plans = getAllPlans();

    plans.every(plan=>{        
        if(plan.id == parseInt(planId)){
            if (plan.username != username) {
                res.status(400).json({ error: "Plan does not belong to user"});	
                username = undefined;
                return false;
            }
            plan.name = req.body.name;
            plan.desc =  req.body.desc;
            plan.startDate = req.body.startDate;
            return false;
        }else {
            return true;
        }
    });
    if (username == undefined) return;
    fs.writeFileSync("./data/plans.json", JSON.stringify({"plans":plans}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json({success : "Plan edited succesfully"});
    return;
}

const addAct2Plan = (req, res) => {
    const sesId = req.params.sesId;
    const actId = req.params.actId;
    const planId = req.params.planId;  

    const date = req.body.date;
    const time = req.body.time;

    // console.log("sesId: "+sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    }

    let username = checkSession(sesId,res);
    if (!username) return;
    let act = getActData(getActivityList(), actId);
    if (!act || act.username != username) {
        res.status(400).json({ error: "activity not valid" });
        return;
    }
    let plans = getAllPlans();
    let newAct = {
        id : actId,
        comment: "",
        time: time,
        date: date
    }
    plans.every(plan=>{
        if (plan.id == parseInt(planId)){           
            let newActList = [];
            if (plan.actList.length > 0){
                plan.actList.forEach( act => {
                    if (act.id == actId){
                        res.status(400).json({ error: "Activity already in plan" });
                        username = null;
                        return false;
                    }
                    if (isGreater(act.time,time)) {
                        newActList.push(newAct);
                        if (plan.actList.length == (newActList.length)){
                            newActList.push(act)
                        }
                    }                     
                    else {
                        newActList.push(act);
                        if (plan.actList.length == (newActList.length)){
                            newActList.push(newAct)
                        }
                    }
                })
            }else {
                newActList.push(newAct);
            }
            plan.actList = newActList;
            return false;
        }
        return true;
    });
    if (username == null) return;
    fs.writeFileSync("./data/plans.json", JSON.stringify({"plans":plans}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json( {success : "Activity added succesfully"});
    return;

}
// RETURN true if h1 is greater than h2
function isGreater(hour1, hour2) {
    let h1 = hour1.split(':');
    let h2 = hour2.split(':');
    if (h1[0] > h2 [0]) return true;
    else if (h1[0] == h2[0] && h1[1] > h2[1]) return true;
    else return false;
}

const editActFromPlan = (req, res) => {
    const sesId = req.params.sesId;
    const actId = req.params.actId;
    const planId = req.params.planId;  

    const date = req.body.date;
    const time = req.body.time;

    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    }

    let username = checkSession(sesId,res);
    if (!username) return;
    let act = getActData(getActivityList(), actId);
    if (!act || act.username != username) {
        res.status(400).json({ error: "activity not valid" });
        return;
    }
    let plans = getAllPlans();
    let newAct = {
        id : actId,
        comment: "",
        time: time,
        date: date
    }
    plans.every(plan=>{
        if (plan.id == parseInt(planId)){
            let newActList = [];
            plan.actList.forEach( act => {
                if(act.id != actId) {
                    // console.log("diff id ", act.id, " ", actId)
                    if (isGreater(act.time,time)) {
                        // console.log("is greater")
                        newActList.push(newAct);
                        // console.log(plan.actList.length, " ", newActList.length -1)
                        if ((plan.actList.length-1) == (newActList.length )){
                            // console.log("adding second")
                            newActList.push(act)
                        }
                    }                     
                    else {
                        // console.log("not greater")
                        newActList.push(act);
                        if ((plan.actList.length-1) == (newActList.length)){
                            newActList.push(newAct)
                        }
                    }
                }else if (act.id == actId && (plan.actList.length-1) == (newActList.length )){
                    // console.log("same id ", act.id, " ", actId)

                    newActList.push(newAct);
                }                  
            });
            
            plan.actList = newActList;
            return false;
        }
        return true;
    });
    fs.writeFileSync("./data/plans.json", JSON.stringify({"plans":plans}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json( {success : "Activity edited succesfully"});
    return;
}

const delActFromPlan = (req, res) => {
    const sesId = req.params.sesId;
    const actId = req.params.actId;
    const planId = req.params.planId;  

    // console.log("sesId: "+sesId);
    if (!sesId){
        res.status(400).json({ error: "missing session token" });
        return;
    }

    let username = checkSession(sesId,res);
    if (!username) return;
    let act = getActData(getActivityList(), actId);
    if (!act || act.username != username) {
        res.status(400).json({ error: "activity not valid" });
        return;
    }
    let plans = getAllPlans();
    
    plans.every(plan=>{
        if (plan.id == parseInt(planId)){
            let newActList = [];
            plan.actList.forEach( act => {
                if(act.id != actId) {
                    newActList.push(act);
                }              
            });            
            plan.actList = newActList;
            return false;
        }
        return true;
    });
    fs.writeFileSync("./data/plans.json", JSON.stringify({"plans":plans}), (err)=>{
        if (err) {
            res.status(400).json({ error: err });
            return;  
        } 
    }); 
    res.status(200).json({success : "Activity deleted succesfully"});
    return;
}

module.exports = {
    getPlans,
    addPlan,
    deletePlan,
    addAct2Plan,
    editPlan,
    editActFromPlan, 
    delActFromPlan
}
