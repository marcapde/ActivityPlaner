// TODO cant acces if not logged in
// let url = 'http://127.0.0.1:3003'
let planList = [];
let activities = [];
let planPath = Cookie.get('planPath') ? Cookie.get('planPpath') : [];

$(document).ready(async function() {
    console.log("loading plans")
    let sesId = Cookie.get("sessionToken");
    let response = await fetch(url + `/plans/${sesId}`);
    let data = await response.json();
    if (response.status !== 200) {
        alert(data.error);
    }else{
        // console.log(data)
        let content = `<ul id="actul">`
        data.forEach(element => {
            console.log(element);
            content += `<li id="${element.id}" onclick="openPlan(${element.id})"><h6>${element.name}</h6></li>`
            planList[element.id] = element;
        });
        content += `</ul>`;
        $("#planItems").append(content);
        console.log(planList)
        // if (path.length !=0 ) openItem(path[path.length-1]);
        // console.log("loading " + path[0])
    }
});



function openPlan(planId, startdate = false){
    console.log("opening " + planId, startdate);
    let planData = planList[planId];
    let planDate = startdate!=false ? reverseDate(startdate) : reverseDate(planData.startDate);
    let content = ``;
    content += `<div id="itemHeader"> 
                    <h3>${planData.name}</h3> 
                    <div class="dropdown">
                    <button class="btn  dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        <img  src="./client/src/dots.png">
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li><a class="dropdown-item" id="editAct" onclick="editAct(${planId})">Edit Plan</a></li>
                      <li><a class="dropdown-item" id="delAct" onclick="delPlan(${planId})">Delete Plan</a></li>
                    </ul>
                  </div>
                </div>`;
    content += `<div id="descCard" class="card">
                    <div class="card-header"> Description:</div>
                    <div class="card-body">	${planData.desc}</div>
                </div>
                `
    content += `<div id="actCard" class="card">
                    <div class="card-header"> 
                        <div class="sublistHeader">
                            <h3>Activities for ${planDate}</h3>
                            `// <img onclick="addAct(${planId})" src="./client/src/dark-plus.png">
                        +`</div> 
                    </div>
                    <div class="card-body">	
                        <div class="arrow"><img src="./client/src/left-arrow.png"  onclick="previousDay('${planId}','${planDate}','${startdate}')"></div>
                        <div id="day-activities"></div>
                        <div class="arrow"><img src="./client/src/right-arrow.png" onclick="nextDay('${planId}','${planDate}','${startdate}')"></div>
                    </div>
                </div>
                `
    content += `</div></div>`;
    document.getElementById('main').innerHTML = content;
        
    let sesId = Cookie.get("sessionToken");
    planData.actList.forEach(async act => {
        if (new Date(reverseDate(act.date)).getTime() === new Date (reverseDate(planDate)).getTime()) {
            let response = await fetch(url + `/activity/${act.id}/${sesId}`);
            let data = await response.json();
            if (response.status !== 200) {
                alert(data.error);
            }else{ 
                let actContent = '';
                console.log(data);
                actContent += `<div id="${act.id}" class="card"  >
                                <div class="card-header">
                                    <div>${data.name}</div>
                                    <div> ${act.time} </div>
                                </div>
                                <div class="card-body">	${data.desc}</div>
                            </div>`
                document.getElementById('day-activities').innerHTML += actContent;
            }
        }
    });

}

function reverseDate(startDate){
    let newDate = startDate.split('-');
    let month = newDate[1];
    month = month.length == 2 ? month : '0'+month;
    let day = newDate[2].length == 2 ? newDate[2] : '0'+newDate[2];
    return day + '-' + month + '-' + newDate[0];
}
function nextDay(planId,planDate,reverse){
    let newDate = reverse == false ? new Date(reverseDate(planDate)) : new Date(reverseDate(planDate));
    newDate.setDate(newDate.getDate() + 1);
    let month = newDate.getMonth() + 1;
    openPlan(planId,'' +  newDate.getFullYear() + '-' + month + '-' + newDate.getDate());
}
function previousDay(planId,planDate,reverse){
    let newDate = reverse == false ? new Date(reverseDate(planDate)) : new Date(reverseDate(planDate));
    newDate.setDate(newDate.getDate() - 1);
    let month = newDate.getMonth() + 1;
    openPlan(planId,'' +  newDate.getFullYear() + '-' + month + '-' + newDate.getDate());
}



function addPlan(){
    console.log("Adding new Plan...")
    let content = ``;
    content = `
        <div id="addPlanModal" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="myLargeModalLabel">Add new activity</h5>
                        <button  type="button" class="btn closeModal" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                        <div class="form-group">
                            <label for="itemName" class="col-form-label">Plan Name:</label>
                            <input type="text" class="form-control" id="itemName" placeholder="Plan Name">
                        </div>
                        <div class="form-group">
                            <label for="descText" class="col-form-label">Description:</label>
                            <textarea class="form-control" id="descText" placeholder="Some kind of description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="startDate" class="col-form-label">Start Date:</label>
                            <input type="date" class="form-control" id="startDate" >
                        </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="closeModal btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" id="saveModal" class="btn btn-primary">Save</button>
                    </div>
                </div>
            </div>
        </div>    
        `    
    document.getElementById('main').innerHTML += content;
    $('#addPlanModal').modal('show'); 
        
    // MODAL LISTENERS
    $('#saveModal').click(async function(){
        let desc = $('#descText').val();
        let name = $('#itemName').val();
        let startDate = $('#startDate').val();
        let sesId = Cookie.get("sessionToken");
        let response = await fetch(url + `/plans/${sesId}`,
            {
                method: 'POST',
                body: JSON.stringify({"name": name, "desc": desc, "startDate": startDate}),
                headers: {'Content-Type': 'application/json'}
            }
        );
        let data = await response.json();
        if (response.status !== 200) {
            alert(data.error);
        }       
    }); 

    $('.closeModal').click(function(){
        $('#addPlanModal').modal('hide');
    });
}



function delPlan(planId){
    let content = ``;
    content = `
        <div id="confirmDelPlan" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="myLargeModalLabel">Are you sure?</h5>
                        <button  type="button" class="btn closeModal" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h6>So you really want to delete this activity?</h6>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="confirmDelBtn" class="closeModal btn btn-danger" data-dismiss="modal">Delete</button>
                        <button type="button" class="btn btn-primary closeModal">Keep</button>
                    </div>
                </div>
            </div>
        </div>    
        `  
    $('#confirmDelPlan').remove(); 
  
    document.getElementById('main').innerHTML += content;
    $('#confirmDelPlan').modal('show'); 
        
    // MODAL LISTENERS
    $('#confirmDelBtn').click(async function(){
        console.log("trying to delete")
        let sesId = Cookie.get("sessionToken");
        let response = await fetch(url + `/plans/${planId}/${sesId}`,
            {
                method: 'DELETE',                
            }
        );
        let data = await response.json();
        if (response.status !== 200) {
            alert(data.error);
        }
    }); 

    $('.closeModal').click(function(){
        $('#confirmDelPlan').modal('hide');
    });
}


function openItem(itemId) {
    console.log("opening " + itemId)
    let itemData = itemList[itemId];
    if (!path.includes(itemId) && itemData.mainlevel==false){
        path.push(itemId);
        Cookie.set('path', path, 1);
    }else if(itemData.mainlevel == true){
        path = [itemId];
        Cookie.set('path', path, 1);
    }
    else{
        path.length = path.indexOf(itemId) + 1;
        Cookie.set('path', path, 1);
    }
    
    console.log(itemData);
    let content = ``;
    content += `<div id="itemHeader"> 
                    <h3>${itemData.name}</h3> 
                    <div class="dropdown">
                    <button class="btn  dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        <img  src="./client/src/dots.png">
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li><a class="dropdown-item" id="editAct" onclick="editAct(${itemId})">Edit Activity</a></li>
                      <li><a class="dropdown-item" id="delAct" onclick="delAct(${itemId})">Delete Activity</a></li>
                    </ul>
                  </div>
                </div>`;
    content += `<div id="descCard" class="card">
                    <div class="card-header"> Description:</div>
                    <div class="card-body">	${itemData.desc}</div>
                </div>
                `
    content += `<div id="subitemList">
                    <div class="sublistHeader">
                        <h3>Children Activities:</h3>
                        <img onclick="addAct(${itemId})" src="./client/src/dark-plus.png">
                    </div> 
                    <div id="sublist">`
    itemData.children.forEach(function(childId) {
        console.log(childId);
        console.log(itemList)
        let data = itemList[childId];
        content += `<div id="${childId}" class="card subitem" onclick="openItem(${childId})" >
                        <div class="card-header subItemHeader">
                            <div>${data.name}</div>
                            <div><img src="./client/src/delete.png" onclick="delAct(${childId})"></div>
                        </div>
                        <div class="card-body">	${data.desc}</div>
                    </div>`
    });
    content += `</div></div>`;
    document.getElementById('main').innerHTML = content;
    console.log(itemData.name);
}



function editAct(itemId){
    let itemData = itemList[itemId];
    let content = ``;
    content = `
        <div id="editModal" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="myLargeModalLabel">Edit Item</h5>
                        <button  type="button" class="btn closeModal" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                        <div class="form-group">
                            <label for="itemName" class="col-form-label">Activity Name:</label>
                            <input type="text" class="form-control" id="itemName" value="${itemData.name}">
                        </div>
                        <div class="form-group">
                            <label for="descText" class="col-form-label">Description:</label>
                            <textarea class="form-control" id="descText">${itemData.desc}</textarea>
                        </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="closeModal btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" id="saveModal" class="btn btn-primary">Save</button>
                    </div>
                </div>
            </div>
        </div>    
        `    
    document.getElementById('main').innerHTML += content;
    $('#editModal').modal('show'); 
        
    // MODAL LISTENERS
    $('#saveModal').click(async function(){
        let desc = $('#descText').val();
        let name = $('#itemName').val();
        let sesId = Cookie.get("sessionToken");
        let response = await fetch(url + `/activities/${itemId}/test`,
            {
                method: 'PUT',
                body: JSON.stringify({"name": name, "desc": desc}),
                headers: {'Content-Type': 'application/json'}
            }
        );
        let data = await response.json();
        if (response.status !== 200) {
            alert(data.error);
        }
        // else{
        //     $('#editModal').modal('hide');
        //     $('#itemName').val(name);
        // }
    }); 

    $('.closeModal').click(function(){
        $('#editModal').modal('hide');
    });
    // window.addEventListener('beforeunload', (event) => {
    //     // Cancel the event as stated by the standard.
    //     event.preventDefault();
    //     // Chrome requires returnValue to be set.
    //     event.returnValue = '';
    //   });
}








function newAct(parentId = false){

}




$('#addAct').click(function(){
});

