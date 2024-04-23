const currentUser = document.getElementById("currentUser");
const username = document.getElementById("username");
function onSaveUser() {
    if (!username) return console.error("Could not find username");
    if (!currentUser) return console.error("Could not find current username");
    if (username.value.length > 10) return alert("Your username cannot be more than 10 characters!")
    if (!username.value.length) return alert("Please enter in a username!")
    currentUser.innerText = `username (currently ${username.value})`
    localStorage.setItem("username", username.value);
}
if (currentUser && localStorage.getItem("username") != null && username) {
    currentUser.innerText = `username (currently ${localStorage.getItem("username")})`
    username.value = localStorage.getItem("username")
}


async function onJoinRoom(roomIDActual) {
    if (localStorage.getItem("username") == null) return alert("set your username!")
    const errorText = document.getElementById("errortext");
    const roomID = (typeof roomIDActual != "undefined") ? roomIDActual : document.getElementById("roomidjoin").value;
    if (!roomID) return console.error("Could not find roomID");
    if (!errorText) return console.error("Could not find errorText");
    axios.get(`${URL}/rooms/${roomID}`).then(async res => {
        async function actuallyJoin(roomID, password) {
            try {
                /*
                const response = await axios.post(`${URL}/rooms/${roomID}/join`, {
                    username: localStorage.getItem("username"),
                    password
                })*/ 
                const response = await axios({
                    url: `${URL}/rooms/${roomID}/join`,
                    method: "POST",
                    headers: {
                        "authorization": session
                    },
                    data: {
                        password
                    },
                    timeout: 5000
                });
                localStorage.setItem("secret", response.data.token);
                localStorage.setItem("tempData", JSON.stringify(response.data))
                window.location.href = `/sti/${roomID}`
            } catch (e) {
                if (!e.response) {
                    console.error(e)
                    errorText.innerText = "a network problem occured"
                    axios({
                        url: `${URL}/crash`,
                        method: "POST",
                        headers: {
                            "authorization": session
                        },
                        data: {
                            response: JSON.stringify(e),
                            route: `/rooms/${roomID}/join`
                        },
                        timeout: 5000
                    })
                } else {
                    errorText.innerText = e.response.data
                }
                errorText.hidden = false;
                setTimeout(() => {
                    errorText.hidden = true;
                }, 1500)
            }
        }
        if (res.data && res.data.visibility == "private") {
            const popDiv = document.createElement("div")
            popDiv.innerHTML = `<h1>Room ${parseInt(roomID)}</h1>
            <p>enter the room password!</p><input type="password" name="password" id="popup-roompass" placeholder="password">`
            const joinBtn = document.createElement("button");
            joinBtn.innerText = "join";
            joinBtn.onclick = function() {
                const roomPass = document.getElementById("popup-roompass")
                actuallyJoin(roomID, roomPass.value);
            }
            popDiv.appendChild(joinBtn);
            createPopup(popDiv);
        } else {
            actuallyJoin(roomID, "none");
        }
    }).catch(e => {
        if (!e.response) {
            console.error(e)
            errorText.innerText = "a network problem occured"
            axios({
                url: `${URL}/crash`,
                method: "POST",
                headers: {
                    "authorization": session
                },
                data: {
                    response: JSON.stringify(e),
                    route: `/rooms/${roomID}`
                },
                timeout: 5000
            })
        } else {
            errorText.innerText = e.response.data
        }
        errorText.hidden = false;
        setTimeout(() => {
            errorText.hidden = true;
        }, 1500)
    })
}

let maximumPagesList = 1;

async function renderRoomsList(roomsTable, pageLabel, page) {
    axios.get(`${URL}/rooms?page=${page}`).then(async res => {
        const data = res.data;
        roomsTable.innerHTML = `<th>Host</th>
        <th>Room ID</th>
        <th class="room-players">Players</th>
        </tr>`
        if (data.rooms) {
            data.rooms.forEach(room => {
                /*
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                */
                const tr = document.createElement("tr");
                const hostTd = document.createElement("td");
                hostTd.classList.add("room-host");
                hostTd.innerText = room.host

                const codeTd = document.createElement("td");
                codeTd.classList.add("room-code");
                codeTd.innerText = room.code
                
                const playersTd = document.createElement("td");
                playersTd.classList.add("room-players");
                playersTd.innerText = room.players
                
                const btnTd = document.createElement("td");
                if (!(room.code.length > 5)) {
                    console.log(room.code)
                    btnTd.innerHTML = `<button onclick="onJoinRoom('${room.code}')">Join</button>`;
                };

                tr.appendChild(hostTd);
                tr.appendChild(codeTd);
                tr.appendChild(playersTd);
                tr.appendChild(btnTd);
                roomsTable.appendChild(tr);
            })
        }
        if (data.page && data.maxPages) {
            maximumPagesList = data.maxPages
            pageLabel.innerText = `page ${parseInt(data.page)} of ${parseInt(data.maxPages)}`
        }
    }).catch(e => {
        if (!e.response) {
            console.error(e);
            roomsTable.innerText = "a network problem occured"
        } else {
            roomsTable.innerText = e.response.data
        }
    })
    
}


async function onRoomList() {
    const roomDiv = document.createElement("div");
    roomDiv.innerHTML = `<h1>Rooms</h1>
    <input type="text" name="roomid" id="roomidjoinpopup" placeholder="room id">
    <button onclick="onJoinRoom(document.getElementById('roomidjoinpopup').value)">join directly</button>`
    const roomsTable = document.createElement("table");
    roomsTable.classList.add("rooms-tbl");
    let currentPage = 1;
    const prevPageBtn = document.createElement("button");
    const nextPageBtn = document.createElement("button");
    prevPageBtn.innerHTML = `<i class="fa-solid fa-caret-left"></i>`;
    prevPageBtn.classList.add("noshadow");
    prevPageBtn.onclick = function() {
        if (currentPage == 1) return;
        currentPage--;
        renderRoomsList(roomsTable, pageLabel, currentPage)
    }

    const pageLabel = document.createElement("span");
    pageLabel.style = "margin: 0px 10px;"
    pageLabel.innerText = "..."

    nextPageBtn.innerHTML = `<i class="fa-solid fa-caret-right"></i>`;
    nextPageBtn.classList.add("noshadow");
    nextPageBtn.onclick = function() {
        if (currentPage >= maximumPagesList) return;
        currentPage++;
        renderRoomsList(roomsTable, pageLabel, currentPage)
    }

    const page = `<button class="noshadow"><i class="fa-solid fa-caret-left"></i></button><span style="margin: 0px 10px;">page 1 of 1</span><button class="noshadow"><i class="fa-solid fa-caret-right"></i></button><br>`
    renderRoomsList(roomsTable, pageLabel, currentPage)


    const or = document.createElement("span");
    or.innerText = "or "
    roomDiv.appendChild(roomsTable)
    roomDiv.appendChild(prevPageBtn);
    roomDiv.appendChild(pageLabel);
    roomDiv.appendChild(nextPageBtn);
    roomDiv.appendChild(document.createElement("br"));
    roomDiv.appendChild(document.createElement("br"));
    roomDiv.appendChild(or);

    const createBtn = document.createElement("button");
    createBtn.innerText = "create one";
    createBtn.onclick = function() {
        const popDiv = document.createElement("div")
        popDiv.innerHTML = `<h1>Room Creation</h1>
        <p>set a room password!</p><input type="text" name="password" id="popup-roompasscreate" placeholder="password">`
        const joinBtn = document.createElement("button");
        joinBtn.innerText = "create";
        joinBtn.onclick = function() {
            const roomPass = document.getElementById("popup-roompasscreate")
            onCreateRoom(roomPass.value);
        }
        popDiv.appendChild(joinBtn)
        createPopup(popDiv);
    }

    roomDiv.appendChild(createBtn);
    const errorSpan = document.createElement("span");
    errorSpan.id = "errortextcreate";
    errorSpan.hidden = true;
    roomDiv.appendChild(errorSpan);
    
    /*
<h1>Rooms</h1>
            <input type="text" name="roomid" id="roomid" placeholder="room id">
            <button onclick="onJoinRoom()">join directly</button>
            <table class="rooms-tbl">
                <tr>
                    <th>Host</th>
                    <th>Room ID</th>
                    <th class="room-players">Players</th>
                    </tr>

                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <tr>
                        <td class="room-host">MMMMMMMMMM</td>
                        <td class="room-code">32432</td>
                        <td class="room-players">2/6</td>
                        <td><button onclick="onJoinRoom()">Join</button></td>
                    </tr>
                    <!-\-8 PER PAGE-\->
            </table>
            <button class="noshadow"><i class="fa-solid fa-caret-left"></i></button><span style="margin: 0px 10px;">page 1 of 1</span><button class="noshadow"><i class="fa-solid fa-caret-right"></i></button><br>
            <br>
            <span>or <button>create one</button></span>
    */
    createPopup(roomDiv)
}

async function onCreateRoom(password) {
    if (localStorage.getItem("username") == null) return alert("set your username!")
    const errorText = document.getElementById("errortextcreate");
    if (!errorText) return console.error("Could not find errorText");
    try {
        const response = await axios({
            url: `${URL}/rooms/create`,
            method: "POST",
            headers: {
                "authorization": session
            },
            data: {
                password
            },
            timeout: 5000
        });
        /*const response = await axios.post(`${URL}/rooms/create`, {
            username: localStorage.getItem("username")
        })*/
        localStorage.setItem("host", 1)
        localStorage.setItem("secret", response.data.token);
        window.location.href = `/sti/${response.data.id}`
    } catch (e) {
        if (!e.response) {
            console.error(e)
            errorText.innerText = "a network problem occured"
        } else {
            errorText.innerText = e.response.data
        }
        errorText.hidden = false;
        setTimeout(() => {
            errorText.hidden = true;
        }, 1500)
    }
}

/*
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣯⣿⣭⣽⣷⡿⣿⣿⣻⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣖⡀⢆⠐⠠⠐⣬⣳⣟⣿⣻⡿⣿⣿⢟⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⢋⠡⣸⣿⣳⣿⣿⣽⣿⡟⣿⣿⣿⣿⣿⡽⣿⡾⣯⣷⣮⣵⣷⣜⢷⣿⣽⣷⡿⣫⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⢋⠅⡒⣈⢲⡿⣿⢿⣽⣯⣿⣿⠡⣿⣿⢻⣷⣿⠾⠹⣷⢹⣿⣿⣿⣿⣿⣷⡿⢿⣵⣿⣿⣿⡿⣿⣿⣿⢿⣻⣟⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣟⣿⣽⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣭⣭⣴⣌⣢⣬⡴⣆⢸⣿⣯⢿⣷⢫⣿⡏⡰⢸⣿⡹⣷⢹⡂⣯⢙⢾⣿⣏⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣯⣟⣯⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⠞⣉⢸⡿⣽⡾⣯⡿⢸⡇⣡⢃⢻⡅⢹⣜⡰⢿⡘⣾⡿⣯⢎⣻⣿⣿⣿⣿⣿⣿⣿⣯⢿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣽⡿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⣾⢋⡐⢀⢻⡇⣿⢗⣿⡇⠐⣷⡀⠦⢺⡇⠆⣽⢂⣿⡗⡿⣿⡼⣿⣖⣻⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣯⣿⣾⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⠉⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⠃⠂⢰⡆⢸⡇⢺⢸⢻⢢⠙⡏⢱⡏⣾⡇⠘⣼⠃⣿⣿⣵⣿⣿⣽⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣯⣿⡟⣿⣭⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣻⣿⡿⣟⣿⣿⣿⢿⡷⣿⣿⢿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⣐⣼⣿⡔⢸⡇⣸⢬⣼⢌⠸⣇⠂⣯⣿⣇⠃⣿⡏⣿⣿⣧⢿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⡿⡷⣿⣿⢿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⡟⣰⣿⣿⠿⠐⡾⢀⡟⠈⣇⠌⡐⡟⠰⣿⣯⣿⡐⣿⣗⣿⡷⣻⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣟⣿⣾⢿⣿⣛⣿⡿⣿⣿⣾⢿⣿⣿⣿⣿⣿⣿⣿⣿⣳⣿⣿⣿⢡⣾⠁⢦⣿⠠⢹⡆⢸⣿⠡⣿⣿⢻⣧⢾⣿⣿⢳⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣽⢿⣟⣯⣿⣻⣽⡳⣿⣟⣿⣳⣿⣻⡿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣣⣿⡷⣸⣾⣿⡄⢹⡇⣸⣿⡇⣿⣿⣿⣿⣾⣿⣿⡆⢧⣿⣿⣿⣿⡿⢋⠩⢶⡄⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠂⣼⣿⣿⣿⣿⣿⢿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣯⣿⢯⣟⡿⢾⡽⢾⣽⢳⡏⣿⡞⣷⣻⢶⣻⡽⣟⣿⢯⣿⣿⢿⣿⣿⣿⣿⣿⣿⣷⣿⣹⡿⣧⢸⣷⣽⣿⣷⡏⢡⣬⡉⢻⣿⠿⣿⡡⢻⣿⣿⣿⣅⠂⠌⡉⢡⣲⣿⣿⣿⣿⣿⡟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣅⣸⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡷⣟⡿⣞⡟⣾⡹⢯⣝⢯⡞⣽⡘⣧⢻⡵⣏⢾⡱⢿⣹⢞⣿⣻⢾⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⣿⡼⣏⣿⢿⣇⣿⠈⢛⠣⣰⣿⣶⠜⢿⡽⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣧⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣾⡽⣏⢷⡻⣜⢧⣛⡳⣎⢷⡹⣲⠍⡶⣋⡾⢡⢯⡹⢧⣛⢮⡳⣏⢿⡽⣷⢿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡜⣧⠻⠿⠳⡞⠿⢏⡙⡡⢊⠆⡒⣿⣿⣿⣿⢯⡹⣞⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣽⡳⢯⡝⣮⢳⣝⡺⣔⢫⡜⣮⢕⡣⠎⡵⢫⡕⣫⢶⡙⣧⡹⣎⢳⡝⣮⡻⡽⣯⢿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣦⣿⢠⢃⠎⡱⢨⡑⢊⠔⡡⢃⠜⣠⠻⣿⡏⢵⣊⠷⡿⣿⣿⣷⣿⣿⣿⣿⣿⡇⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣟⢯⢻⣧⢻⡜⣳⢎⡵⣙⣦⡽⢂⣋⣘⡁⣉⡛⠰⢧⣮⡙⢶⠹⢬⣳⡹⣖⡻⡵⢯⡿⣽⢿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣧⢊⠴⣁⠣⡘⠤⠚⡄⢣⠘⠳⠷⣋⠱⣊⠼⣩⢳⣽⣿⣟⣾⣿⣿⣿⣿⣿⣞⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣮⣛⢮⣳⣜⣷⣽⣦⣏⠶⢋⡵⣖⢯⢧⣽⠆⣽⠃⣼⢒⣦⡙⢧⣏⢳⠮⡵⣎⢷⣹⣛⢾⡽⣯⣟⣯⣿⣿⣿⡟⣿⣿⣿⣿⣧⠒⡤⢣⢑⡊⠱⡈⢆⠩⢒⠡⢂⡱⢌⠲⣥⢻⣿⣿⣟⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⡾⣱⡿⠚⡉⠤⠠⠄⠠⠘⣶⣻⢼⣹⡎⢷⣺⡃⡏⠰⣧⡟⢡⡻⢦⡹⣎⢷⢳⡹⣎⡵⣫⢞⣳⡟⣾⣻⣟⣿⣿⢹⣿⣿⣿⣿⣿⣿⣐⠣⢎⡌⡱⠘⡄⢣⣌⣲⣥⣶⠾⡷⢾⣥⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣳⠏⡠⠑⡠⠘⣀⠊⢁⠂⡘⢧⣏⢶⣻⠎⠛⠁⠄⠛⢃⡴⡯⣝⠧⢿⡘⣏⡳⣝⢮⡵⢫⡞⣵⣛⣷⣻⣯⣿⣿⡼⣿⣿⣿⣿⣿⣿⣿⣿⣦⡜⣡⢳⣿⡏⠿⠿⠿⠿⢟⡛⡴⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣞⣽⠲⣅⡘⠠⠁⠄⡈⠄⢲⠴⠋⣹⠛⠇⢀⠡⠈⠄⠡⠘⢛⣡⢭⡞⣭⣧⢻⡱⢏⡾⣜⡳⣝⢧⣻⣼⣳⢿⣽⣿⡏⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣆⠿⢣⡘⢬⠱⣉⠦⡹⣜⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣾⣸⣇⢿⣷⡈⠰⠈⡀⠈⢰⣶⠏⠁⠰⠀⠆⡀⢁⠈⡀⢁⠸⣇⢏⣸⣶⣹⣸⣹⡎⣱⡎⣷⢹⡎⣷⢷⣏⣿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡸⢆⠷⡈⣶⢱⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⡾⣽⢈⠳⠿⣿⣶⡁⠄⡁⢂⠠⢀⠁⢂⠁⢂⠐⡀⢂⠁⠂⠌⢳⣌⠡⠀⠄⠠⠉⡙⠓⠯⣍⡋⠙⠛⠛⠾⣥⣂⣰⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⢂⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⠏⡄⢊⠐⠠⢈⣿⢷⣄⠂⡐⠠⠈⠄⡈⠄⢂⠐⠠⠈⠄⡁⢂⢸⣆⠡⠈⡄⢡⣴⣤⣦⣬⣍⣓⠮⣴⣤⣤⣌⣭⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣧⠐⡈⠄⢃⣴⢿⡾⠛⡙⠲⠆⢁⠂⡐⠈⠄⡈⠄⡁⢂⠐⡀⢿⡿⣻⣶⣶⣟⠿⣿⣻⣿⣿⣿⣿⣷⣶⣭⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢾⡇⢂⢡⣾⡿⣻⠿⠃⡐⠠⢁⠐⡀⠂⡄⢁⠂⡐⠠⠐⡀⠂⠜⣡⣞⢿⣻⡽⣿⣿⣶⢯⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡯⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡗⣏⡞⠡⡈⢉⠓⢦⠄⢁⠂⡐⢠⣽⡗⢀⠂⠄⡁⠂⠄⠡⣸⣿⣿⣷⣙⢿⣳⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣡⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⡿⢁⠡⠐⢠⠈⠄⠂⠄⣢⡴⣿⣫⠄⠂⠌⠐⠠⠁⠌⢰⣿⣹⣿⣾⣻⢷⡽⢿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠆⡀⠃⢄⠈⠄⡁⣿⠁⠄⠛⠛⠛⢦⠈⠄⠡⢈⢰⣿⣯⢷⣹⣷⢿⣯⣿⣿⡽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⠋⠄⡉⢐⠠⢁⠂⠌⣐⡞⠁⠌⠠⠁⠌⡐⠠⠈⠄⡁⢂⣾⣿⣯⣿⣷⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⣠⡌⠰⠐⠠⢂⠂⠌⢰⡞⠠⠁⠌⠠⢁⠂⠄⠡⢈⠐⡀⡿⠟⠛⠛⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⣴⠏⢠⠑⡈⢁⠂⠌⢠⡟⠀⢄⡷⠈⡐⠠⢈⠐⡁⢂⠐⡼⢁⠂⠡⣈⠐⠄⡈⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⢛⠓⠾⣤⣂⠐⠡⢈⢰⡟⢀⣞⣞⠀⡂⠄⡁⠂⡌⠐⣈⡼⠁⢆⠨⢁⠤⡘⢠⢁⠃⢆⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⠻⠿⠟⢹⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢃⡜⠰⢀⠉⡄⢃⢐⡾⢀⣾⣼⠏⡐⢀⠒⠠⠡⠠⡁⣼⠃⠼⣄⠣⢌⠰⡈⠆⡌⠜⣠⠣⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠄⢊⣜⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢇⡘⢄⠃⡌⡐⢨⢸⠕⡋⡉⢙⠲⢦⠈⠄⢃⠡⢡⢐⣿⣌⣆⣉⣳⣎⣰⡁⡓⠬⡘⢤⡙⣦⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡛⠤⡘⢄⠣⣀⠣⠄⢻⠄⡠⠘⡠⠘⡀⡘⠸⠀⡜⢀⡿⢀⢄⡘⢃⠇⣘⢛⠻⢧⣇⠛⣄⡛⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⢣⣿⣿⣿⣿⣿⣿⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠳⢌⠢⡑⡄⢎⣐⣿⠂⡅⢢⠁⢆⠡⡐⢡⠃⡄⣻⡃⢎⠰⡈⠖⡘⠤⣊⡑⠦⣈⠳⣄⡛⣶⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡩⢎⡱⡘⢴⣾⣿⣏⠒⡌⢄⠣⠌⡂⠜⡠⢊⠔⣿⡝⢋⣛⡿⠟⢞⠲⢦⣜⣰⠡⣚⣤⣛⣴⢫⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣟⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣧⣙⣾⣿⣿⣇⠣⡜⢠⢣⠘⡄⠣⡔⢡⢺⡟⣴⠛⡡⢂⠍⢢⢉⠒⡌⣉⠳⢿⢿⣭⣫⢷⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣾⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢢⡑⢃⠦⢩⡐⠣⠜⣂⢾⣿⡁⢎⡰⢁⠎⡔⢊⠴⡐⢄⠣⡜⢢⢞⡹⣟⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢌⠣⡌⠥⡘⣡⣳⣴⣿⡿⣷⣦⣼⣌⡚⡜⢢⢆⠱⣊⠖⣩⢓⣮⢳⡝⣾⣹⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣽⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣦⣱⣼⣶⣿⣿⣻⢷⡿⣿⣿⣻⣿⣿⣮⣇⣎⣵⣘⢮⣱⢫⢖⣏⢾⡱⣎⢷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣽⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
IMAGINARY TECHNIQUE: HOLLOW PURPLE
*/