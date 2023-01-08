$('#submitBtn').click( async function(){
    let user = $("[name='uname'")[0].value
    // console.log(user);
    // alert(user[0].value);
    let password = $("[name='password']")[0].value
    let newLogin = {
        "uname": user,
        "password": password
    };
    console.log(newLogin);
    // $.ajax({
    //     dataType: "json",
    //     url : 'http://localhost:3003/login',
    //     method : "POST",
    //     contentType: "application/json",
    //     data: JSON.stringify(newLogin),
        
        
    // }).then((response) => {alert(response)})
    // .catch((error) => {alert(error.message);});
    let response = await fetch("http://127.0.0.1:3003/login", {
        method: 'POST',
        body: JSON.stringify(newLogin),
        headers: {'Content-Type': 'application/json'}
        });
    let data = await response.json();
    if (response.status !== 200) {
        alert(data.error);
    }else{
        Cookie.set("sessionToken", JSON.stringify(data.sesId), 1);
        window.location.href="../mainPage.html";
    }

    // Cookie.set("sessionToken", JSON.stringify(sesId), 1);
    // $.ajax("localhost:3003/login",{
    //     'type': "POST",
    //     'data': JSON.stringify(newLogin),
    //     'contentType': 'application/json'
    // }).then((response) => {Cookie.set("sessionToken", JSON.stringify(response), 1);})
    // .catch((error) => {alert(error.message);});

});

// $('#loginForm').submit(function(){
//     let user = $("[name='uname'")[0].value
//     // console.log(user);
//     // alert(user[0].value);
//     let password = $("[name='password']")[0].value
//     let newLogin = {
//         "uname": user,
//         "password": password
//     }
//     console.log(newLogin);
// });
//     $.getJSON("../users.json", function(data){
//         if (data.users[0].uname !== user || data.users[0].password !== password) {
//             alert("Invalid username or password")
//             location.reload();
//         }
//         else{
//             sessionToken = "98213746hpoijd123-8"; // TODO uuid.v4()
//             Cookie.set("sessionToken", JSON.stringify(sessionToken), 6);
//             // alert(sessionToken)
//             window.location.href="../mainPage.html";
//         }
//     })    
// });
// export function getSessionToken() {
//     return sessionToken;
//   } 
    // $.ajax({
    //     dataType: "json",
    //     url: "http://127.0.0.1:5500/login.html" + '/users?uname=' + "mks",
    //   }).then( us => {
    //     alert(us);
    //   })
    // let response = await fetch('users.json');
    // let data = await response.json();
    
    // console.log(data);

    // let content = `<pre>${JSON.stringify(data)}</pre>`
    // fetch('../users.json')
    // .then((response) => users = response.json)

