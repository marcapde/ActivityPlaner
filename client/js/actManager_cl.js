// TODO cant acces if not logged in
let url = 'http://127.0.0.1:3003'
let itemList = [];
let path = Cookie.get('path') ? [].concat(Cookie.get('path').split(',')) : [];

$(document).ready(async function() {
    let sesId = Cookie.get("sessionToken");
    let response = await fetch(url + `/activities/${sesId}`);
    let data = await response.json();
    console.log(data);
    if (response.status !== 200) {
        alert(data.error);
    }else{
        let content = `<ul id="actul">`
        data.forEach(element => {
            // console.log(element);
            if(element.mainlevel == true) content += `<li id="${element.id}" onclick="openItem(${element.id})"><h6>${element.name}</h6></li>`
            itemList[element.id] = element;
        });
        content += `</ul>`;
        $("#actItems").append(content);
        if (path!=[]) openItem(path[path.length-1]);
        toggleSidebar('show');
        // console.log("loading " + path[0])
    }
});

async function logout(){
    let sesId = Cookie.get("sessionToken");
    let response = await fetch(url + "/logout/" + sesId, {
        method: "POST"
    });
    let data = await response.json();
    if (response.status !== 200) {
        alert(data.error);
    }else{
        window.location.href="../login.html";
    }
}

function openItem(itemId) {
     if($(window).width() <= 600)toggleSidebar('closeMenu');
    console.log("opening " + itemId)
    console.log(itemList)

    let itemData = itemList[itemId];
    console.log(itemData)
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
                    <div id="sublist" class="container-fluid">`
    let i = 0;
    itemData.children.forEach(function(childId) {
        // console.log(childId);
        // console.log(itemList)
        let data = itemList[childId];
        if (i%3 == 0) content += `<div class="row row-cols-sm">`
        content += `<div class="col-md-4 gx-2 gy-2">`
        content +=      `<div id="${childId}" class="card "  >
                            <div class="card-header subItemHeader">
                                <div>${data.name}</div>
                                <div class="dropdown">
                                    <button class="btn" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img  src="./client/src/dots.png">
                                    </button>
                                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                        <li><a class="dropdown-item" id="editAct" onclick="addActToPlan(${childId})">Add Activity to plan</a></li>
                                        <li><a class="dropdown-item" id="delAct" onclick="delAct(${childId})">Delete Activity</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="card-body" onclick="openItem(${childId})">${data.desc}</div>
                        </div>
                    </div>`
         if (i%3 == 2) content += `</div>`
        i+=1;
    });
    if (i%3 != 0) content += `</div>`
    content += `</div></div>`;
    document.getElementById('main').innerHTML = content;
    // console.log(itemData.name);
}






function addActToPlan(itemId){
    console.log("adding act to plan")
    let itemData = itemList[itemId];
    let planOptions = ``;
    planList.forEach(plan => {
        planOptions += `<option value="${plan.id}">${plan.name}</option>` 
    });
    let content = ``;
    content = `
        <div id="act2plan" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="myLargeModalLabel">Add activity to plan</h5>
                        <button  type="button" class="btn closeModal" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                        <div class="form-group">
                            <label for="planSelect" class="col-form-label">Plan:</label>
                            <select id="planSelect" class="form-select">
                            ${planOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="date" class="col-form-label">Date:</label>
                            <input type="date" class="form-control" id="dateInput">
                        </div>
                        <div class="form-group">
                            <label for="time" class="col-form-label">Time:</label>
                            <input type="time" class="form-control" id="timeInput">
                        </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="closeModal btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" id="addAct2plan" class="btn btn-primary">Save</button>
                    </div>
                </div>
            </div>
        </div>    
        `    
    document.getElementById('main').innerHTML += content;
    $('#act2plan').modal('show'); 
        
    // MODAL LISTENERS
    $('#addAct2plan').click(async function(){
        console.log(planList)
        let plan = $('#planSelect').val();
        let date = $('#dateInput').val().replaceAll('-','/');
        let time = $('#timeInput').val();
        if (plan == "" || date == "" || time == "" ) {
            alert("Empty fields")
            return;
        }
        console.log({plan: plan, date: date, time: time})
        let sesId = Cookie.get("sessionToken");
        let response = await fetch(url + `/plans/addAct/${plan}/${itemId}/${sesId}`,
            {
                method: 'PUT',
                body: JSON.stringify({"date": date, "time": time}),
                headers: {'Content-Type': 'application/json'}
            }
        );
        let data = await response.json();
        if (response.status !== 200) {
            alert(data.error);
        }
    });

    $('.closeModal').click(function(){
        $('#act2plan').modal('hide');
    });
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
        let response = await fetch(url + `/activities/${itemId}/${sesId}`,
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




function addAct(parentId = -1){
    console.log("Adding new element...")
    let content = ``;
    content = `
        <div id="addModal" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
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
                            <label for="itemName" class="col-form-label">Activity Name:</label>
                            <input type="text" class="form-control" id="itemName" placeholder="Activity Name">
                        </div>
                        <div class="form-group">
                            <label for="descText" class="col-form-label">Description:</label>
                            <textarea class="form-control" id="descText" placeholder="Some kind of description"></textarea>
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
    $('#addModal').modal('show'); 
        
    // MODAL LISTENERS
    $('#saveModal').click(async function(){
        let desc = $('#descText').val();
        let name = $('#itemName').val();
        let sesId = Cookie.get("sessionToken");
        let response = await fetch(url + `/activities/${parentId}/${sesId}`,
            {
                method: 'POST',
                body: JSON.stringify({"name": name, "desc": desc}),
                headers: {'Content-Type': 'application/json'}
            }
        );
        let data = await response.json();
        if (response.status !== 200) {
            alert(data.error);
        }       
    }); 

    $('.closeModal').click(function(){
        $('#addModal').modal('hide');
    });
}



function delAct(itemId){
    let content = ``;
    content = `
        <div id="confirmDelModal" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
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
                        <button type="button" id="confirmDel" class="closeModal btn btn-danger" data-dismiss="modal">Delete</button>
                        <button type="button" class="btn btn-primary closeModal">Keep</button>
                    </div>
                </div>
            </div>
        </div>    
        `    
    document.getElementById('main').innerHTML += content;
    $('#confirmDelModal').modal('show'); 
        
    // MODAL LISTENERS
    $('#confirmDel').click(async function(){
        let sesId = Cookie.get("sessionToken");
        let response = await fetch(url + `/activities/${itemId}/${sesId}`,
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
        $('#confirmDelModal').modal('hide');
    });
}

$(window).resize(function(){
    toggleSidebar('closeMenu');
});



function toggleSidebar(action){
    console.log(action);
    console.log($(window).width())
    if(action == 'hide'){
        $('nav').css('display','none');
        $('#threeLines').show();
        $('#main').show();
        $('#main').css('grid-column','1/5');
    }else if (action == 'show'){
        $('nav').show();
        if ($(window).width() <= 600){
            console.log("small")
            $('#main').hide();
            $('nav').css('grid-column','1/5')
            $('#threeLines').hide()

        }else {
            $('#main').css('grid-column','2/5');
            $('nav').css('grid-column','1')
           
            $('#threeLines').hide()
        }       
    }
    else if (action == 'closeMenu'){
        $('nav').css('display','none');
        $('#threeLines').show();
        $('#main').show();
        $('#main').css('grid-column','1/5');
    }
}
