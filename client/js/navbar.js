// TODO cant acces if not logged in
let itemList = [];
$(document).ready(async function() {
    let sesId = Cookie.get("sessionToken");
    let response = await fetch("http://127.0.0.1:3003/activities/test");
    let data = await response.json();
    if (response.status !== 200) {
        alert(data.error);
    }else{
        let content = `<ul id="actul">`
        data.forEach(element => {
            console.log(element);
            if(element.mainlevel === true) content += `<li id="${element.id}" onclick="openItem(${element.id})"><h6>${element.name}</h6></li>`
            itemList[element.id] = element;
        });
        content += `</ul>`;
        $("#actItems").append(content);
    }
});

function editAct(itemId){
    let itemData = itemList[itemId];
    let content = ``;
    content = `
        <div id="editModal" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="myLargeModalLabel">Edit Item</h5>
                        <button  type="button" class="closeModal" data-dismiss="modal" aria-label="Close">
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
                        <button type="button" class="btn btn-primary">Save</button>
                    </div>
                </div>
            </div>
        </div>    
        `    
    document.getElementById('main').innerHTML += content;
    $('#editModal').modal('show'); 
        let desc = $('#descText').val();
        let name = $('#itemName').val();
    // MODAL LISTENERS
    $('#saveModal').click(async function(){
        let sesId = Cookie.get("sessionToken");
        let response = await fetch(`http://127.0.0.1:3003/activities/${itemId}/test`,
            {
                method: 'PUT',
                body: JSON.stringify({"name": name, "desc": desc}),
                headers: {'Content-Type': 'application/json'}
            }
        );
        let data = await response.json();
        if (response.status !== 200) {
            alert(data.error);
        }else{
            let content = `<ul id="actul">`
            data.forEach(element => {
                console.log(element);
                if(element.mainlevel === true) content += `<li id="${element.id}" onclick="openItem(${element.id})"><h6>${element.name}</h6></li>`
                itemList[element.id] = element;
            });
            content += `</ul>`;
            $("#actItems").append(content);
        }
    }); 

    $('.closeModal').click(function(){
        $('#editModal').modal('hide');
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
                        <button  type="button" class="closeModal" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h6>So you really want to delete this activity?</h6>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="closeModal btn btn-danger" data-dismiss="modal">Delete</button>
                        <button type="button" class="btn btn-primary">Keep</button>
                    </div>
                </div>
            </div>
        </div>    
        `    
    document.getElementById('main').innerHTML += content;
    $('#confirmDelModal').modal('show'); 
        
    // MODAL LISTENERS
    $('#confirmDel').click(function(){

    }); 

    $('.closeModal').click(function(){
        $('#confirmDelModal').modal('hide');
    });
}


function newAct(parentId = false){

}


function openItem(itemId) {
    let itemData = itemList[itemId];
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
    content += `<div id="subitemList"><h3>Children Activities:</h3> <div id="sublist">`
    itemData.children.forEach(function(childId) {
        console.log(childId);
        console.log(itemList)
        let data = itemList[childId];
        content += `<div id="${childId}" class="card subitem" onclick="openItem(${childId})" >
                        <div class="card-header">${data.name}</div>
                        <div class="card-body">	${data.desc}</div>
                    </div>`
    });
    content += `</div></div>`;
    document.getElementById('main').innerHTML = content;
    console.log(itemData.name);
}



$('#addAct').click(function(){
});

