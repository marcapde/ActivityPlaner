// TODO cant acces if not logged in
let url = 'http://127.0.0.1:3003'
let itemList = [];
let path = Cookie.get('path') ? Cookie.get('path') : [];

$(document).ready(async function() {
    let sesId = Cookie.get("sessionToken");
    let response = await fetch(url + `/activities/${sesId}`);
    let data = await response.json();
    if (response.status !== 200) {
        alert(data.error);
    }else{
        let content = `<ul id="actul">`
        data.forEach(element => {
            // console.log(element);
            if(element.mainlevel === true) content += `<li id="${element.id}" onclick="openItem(${element.id})"><h6>${element.name}</h6></li>`
            itemList[element.id] = element;
        });
        content += `</ul>`;
        $("#actItems").append(content);
        if (path!=[]) openItem(path[path.length-1]);
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
        // console.log(childId);
        // console.log(itemList)
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
    // console.log(itemData.name);
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
        let response = await fetch(url + `/activities/${parentId}/test`,
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
        let response = await fetch(url + `/activities/${itemId}/test`,
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


function newAct(parentId = false){

}




$('#addAct').click(function(){
});

