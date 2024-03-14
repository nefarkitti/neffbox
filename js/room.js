let socket = null;
function leaveGame() {
    if (socket != null) socket.emit("leave");
    const oldUsername = localStorage.getItem("username");
    localStorage.clear();
    localStorage.setItem("username", oldUsername);
    window.location.href = "/"
}

function loadMessage(username, content) {
    const messages = document.getElementById('messages')
    const div = document.createElement('div');
    /*<div class="chat-message">
                            <span class="username">patrick</span>
                            <span>: How are you my dear friend Oswald?</span>
                        </div>*/
    div.classList.add('chat-message');
    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerText = username;
    const contentSpan = document.createElement("span");
    contentSpan.innerText = `: ${content}`;
    if (username == "SERVER" || username == localStorage.getItem("username")) {
        usernameSpan.classList.add("you")
    }
    div.appendChild(usernameSpan);
    div.appendChild(contentSpan);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function createUser(username, points, isHost, hash) {
    /*
<div class="host">
    <div class="state">
        <i class="fa-solid fa-hourglass-half"></i>
    </div>
    MMMMMMMMMM (HOST)<br>
    <span class="points">100</span>
</div>
    */
    const userDiv = document.createElement("div");
    userDiv.id = `user-${hash}`
    if (isHost) userDiv.classList.add("host");
    if (username == localStorage.getItem("username")) userDiv.classList.add("you");
    //userDiv.innerHTML += `<div class="state"><i class="fa-solid ${(username == localStorage.getItem("username")) ? "fa-circle-check" : "fa-hourglass-half"}"></i></div>`
    userDiv.innerHTML += `<div class="state"><i class="fa-solid fa-user"></i></div>`
    const usernameSpan = document.createElement("span");
    usernameSpan.innerText = username;
    if (isHost) usernameSpan.innerText += " (HOST)";
    userDiv.appendChild(usernameSpan);
    userDiv.appendChild(document.createElement("br"));
    const pointsSpan = document.createElement("span");
    pointsSpan.classList.add("points");
    pointsSpan.innertext = points;
    userDiv.appendChild(pointsSpan)
    return userDiv;
}

const roomID = location.pathname.split("/")[2]
const roomData = {
    host: null,
    id: roomID,
    isHost: (localStorage.getItem("host") != null),
    users: []
}
if (roomID) {
    document.title = `${roomID} - Survive The Neffinet`
    const userList = document.getElementById("lobbyList");
    if (userList) {
        if (localStorage.getItem("tempData") != null && localStorage.getItem("host") == null) {
            const tempData = JSON.parse(localStorage.getItem("tempData"));
            localStorage.removeItem("tempData");
            roomData.users = tempData.users
            roomData.host = tempData.host;
            tempData.users.forEach(user => {
                userList.appendChild(createUser(user.name, user.points, tempData.host == user.name, user.idHash))
            })
        } else {
            if (localStorage.getItem("host") != null) {
                userList.appendChild(createUser(localStorage.getItem("username"), 0, true, "me"))
            }
        }
    } else {
        roomData.users.push({ name: localStorage.getItem("username"), points: 0 });
    }
    socket = io.connect(URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
    });
    socket.emit("join", {
        id: roomData.id,
        token: localStorage.getItem("secret")
    });
    /*if (roomData.isHost) {
        socket.on('reconnect', () => {
            socket.emit("refresh", {
                data: roomData,
                token: localStorage.getItem("secret")
            })
        })
    }*/
    socket.on('disconnect', () => {
        loadMessage("SERVER", "Lost connection!")
        alert("You have been disconnected.")
        socket = null;
        leaveGame();
    })
    // troll
    socket.on('forceDisconnect', (reason) => {
        loadMessage("SERVER", "You have been disconnected.");
        if (reason) {
            alert(reason)
        }
        socket = null;
        setTimeout(function () {
            leaveGame();
        }, 2000)
    })
    socket.on('error', (error) => {
        console.error(error);
        alert(`Error: ${error}`)
    })
    socket.on('message', (content) => {
        console.debug(content)
        loadMessage(content.username, content.content)
    })
    socket.on('join', (data) => {
        if (data.username == localStorage.getItem("username") && roomData.isHost && !data.reconnect) return;
        console.debug(data)
        if (data.host) {
            userList.appendChild(createUser(data.username, 0, data.host, data.idHash))
        } else {
            userList.appendChild(createUser(data.username, 0, false, data.idHash))
        }
    })
    socket.on('leave', (data) => {
        console.debug(`leave ${data}`)
        const getUserDiv = document.getElementById(`user-${data}`)
        userList.removeChild(getUserDiv);
    })
    const chatForm = document.getElementById('message-form');
    if (chatForm) {
        chatForm.addEventListener('submit', async event => {
            event.preventDefault();
            let content = document.getElementById('message-input').value;
            if (!content.length) return;
            if (content.length > 512) return;
            //if (content.startsWith(" ")) return;
            content = content.trim();
            socket.emit('user_message', content);
            document.getElementById('message-input').value = ''
        })
    }
}
