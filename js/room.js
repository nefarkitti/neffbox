function leaveGame() {

}

function createUser(username, isHost) {
    /*
<div class="host">
                        <div class="state"><i class="fa-solid fa-hourglass-half"></i></div>MMMMMMMMMM (HOST)<br><span
                            class="points">100</span>
                    </div>
    */
    const userDiv = document.createElement("div");
    userDiv.id = `user-${username}`
    if (isHost) userDiv.classList.add("host");
    if (username == localStorage.getItem("username")) userDiv.classList.add("you");
    
}
const userList = document.getElementById("lobbyList");
if (userList) {
    if (localStorage.getItem("tempData") != null) {
        const tempData = JSON.parse(localStorage.getItem("tempData"));
        localStorage.removeItem("tempData");

    }
}