let socket = null;
let promptBox = document.getElementById("promptBox");
let timer = document.getElementById("timer")

const tracks = [
    new Audio('/assets/sounds/scp3008-sunday.mp3')
]

tracks.forEach(element => {
    element.loop = true
})
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function changeTrack(index) { // surely there's a better way right
    tracks.forEach(element => {
        element.pause()
        element.currentTime = 0
    })
    if (tracks[index]) {
        tracks[index].volume = (settings && settings.value != undefined) ? settings.volume / 100 : 1
        tracks[index].play()
    }
}
function stopTracks() {
    tracks.forEach(element => {
        element.pause()
    })  
}

function leaveGame() {
    if (socket != null) socket.emit("leave");
    const oldUsername = localStorage.getItem("username");
    localStorage.removeItem("secret");
    localStorage.removeItem("host");
    localStorage.removeItem("tempData")
    window.location.href = "/"
}

let featuredPosts = []

function setIcon(hash, className) {
    const getIcon = document.getElementById(`user-icon-${hash}`);
    if (getIcon) {
        //getIcon.classList.remove("fa-user");
        getIcon.classList.remove("fa-circle-check")
        getIcon.classList.remove("fa-pencil");
        if (className == "fa-user") return;
        getIcon.classList.add(className);
    }
}

function createUser(username, points, isHost, hash, equipped) {
    /*
<div class="lobbyListItem host">
                        <div class="usericon">
                            <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                            <div style="background-image: url('../assets/icons/bases/red_neck_base.gif');"></div>
                            <div class="outline" style="background-image: url('../assets/icons/bases/triangle_outline.gif');"></div>
                            <div style="background-image: url('../assets/icons/bases/red_triangle_base.gif');"></div>

                            <div class="outline" style="background-image: url('../assets/icons/faces/mouth/smile.gif');"></div>
                            <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/bucket_hat.gif');"></div>
                            <div class="state"><i class="fa-solid fa-hourglass-half"></i></div>
                        </div>
                        <span class="user-item">MMMMMMMMMM (HOST)<br></span>
                        <span class="points">100 <i class="fa-solid fa-coins"></i></span>
                    </div>

/*
        
*/
    const userDiv = document.createElement("div");
    userDiv.id = `user-${hash}`
    if (isHost) userDiv.classList.add("host");
    if (equipped && equipped.length) {
        const userIcon = generateIcon(equipped, equipped.filter(item => item.type == "bases")[0].filename, equipped.filter(item => item.type == "shape")[0].value);
        userIcon.innerHTML += `<div class="state"><i id="user-icon-${hash}" class="fa-solid"></i></div>`
        userDiv.appendChild(userIcon);
        userDiv.innerHTML += "\n "
    } else {
        userDiv.innerHTML += `<div class="state"><i id="user-icon-${hash}" class="fa-solid"></i></div>`
    }
    if (username == localStorage.getItem("username")) userDiv.classList.add("you");
    //userDiv.innerHTML += `<div class="state"><i class="fa-solid ${(username == localStorage.getItem("username")) ? "fa-circle-check" : "fa-hourglass-half"}"></i></div>`
    const usernameSpan = document.createElement("span");
    usernameSpan.innerText = `${username}`;
    usernameSpan.classList.add("user-item");
    if (isHost) usernameSpan.innerText += " (HOST)";
    userDiv.appendChild(usernameSpan);
    userDiv.appendChild(document.createElement("br"));
    const pointsSpan = document.createElement("span");
    pointsSpan.classList.add("points");
    pointsSpan.id = `user-points-${hash}`
    pointsSpan.innerText = points;
    userDiv.appendChild(pointsSpan)
    return userDiv;
}

const roomID = location.pathname.split("/")[2]
const roomData = {
    host: null,
    id: roomID,
    isHost: (localStorage.getItem("host") != null),
    users: [{ name: localStorage.getItem("username"), points: 0 }],
    started: false,
    round: 0,
    waiting: false,
    topic: "Unknown.",
    selected: null,
    twistUser: null
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadMessage(username, content, equipped, isImage) {
    const messages = document.getElementById('messages')
    const div = document.createElement('div');
    /*<div class="chat-message">
                            <span class="username">patrick</span>
                            <span>: How are you my dear friend Oswald?</span>
                        </div>*/
    div.classList.add('chat-message');
    if (equipped && equipped.length) {
        const userIcon = generateIcon(equipped, equipped.filter(item => item.type == "bases")[0].filename, equipped.filter(item => item.type == "shape")[0].value);
        div.appendChild(userIcon);
        div.innerHTML += "\n"
    }
    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerText = username;
    const contentSpan = document.createElement("span");
    if (isImage) {
        const img = document.createElement("img");
        img.alt = "Image Loading...";
        img.src = `${apiURL}/rooms/${roomData.id}/imgs/${content}`
        contentSpan.appendChild(img);
    } else {
        contentSpan.innerText = `: ${content}`;
    }
    if (username == "SERVER" || username == localStorage.getItem("username")) {
        usernameSpan.classList.add("you")
    }
    div.appendChild(usernameSpan);
    div.appendChild(contentSpan);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function createErrorPopup(text) {
    const popDiv = document.createElement("div")
    popDiv.innerHTML = `<h1>Something went wrong!</h1>
    <p>${text}</p>`

    createPopup(popDiv, function() {
        window.location.href = "/"
    });
}

function onSaveUser() {
    const username = document.getElementById("username");
    if (!username) return console.error("Could not find username");
    if (username.value.length > 10) return createErrorPopup("Your username cannot be more than 10 characters!")
    if (!username.value.length) return alert("Please enter in a username!")
    localStorage.setItem("username", username.value);
    window.location.reload()
}

let receipt = []

function updateReceipt() {
    playAudio('/assets/sounds/cha-ching.mp3')
    const receiptDiv = document.getElementById("receiptDiv")
    const receiptLst = document.getElementById("receipt-list")
    const receiptTtl = document.getElementById("receipt-total")
    const receiptVisa = document.getElementById("receipt-visa")

    receiptDiv.classList.add("showReceipt")

    receiptLst.innerHTML = ``

    let total = 0

    receipt.forEach(item => {

        /* 
                    <span class="item">
                <span class="item-name">Bike</span>
                <span class="item-price">£30</span>
            </span>
        */

        if (document.getElementById(item.name)) {
            let thing = document.getElementById(item.name)
            thing.dataset.itemCount = Number(thing.dataset.itemCount) + 1

            thing.innerHTML = `
            <span class="item">
            <span class="item-name">${item.name} x ${thing.dataset.itemCount}</span>
            <span class="item-price">£${item.price * Number(thing.dataset.itemCount)}</span>
        </span>
            `
        } else {
            const itemDiv = document.createElement("span")
            itemDiv.id = item.name
            itemDiv.classList.add("item")
            itemDiv.dataset.itemCount = 1;
    
            const itemNameSpan = document.createElement("span")
            itemNameSpan.classList.add("item-name")
            itemNameSpan.innerText = item.name
    
            const itemPriceSpan = document.createElement("span")
            itemPriceSpan.classList.add("item-price")
            itemPriceSpan.innerText = `£${item.price}`
    
            receiptLst.appendChild(itemDiv)
            itemDiv.appendChild(itemNameSpan)
            itemDiv.appendChild(itemPriceSpan)
        }

        total += item.price
        receiptTtl.innerHTML = `£${total}`
        receiptVisa.innerHTML = `£${total}`
    })

}

const root = document.getElementById("root");
if (roomID) {
    if (localStorage.getItem("username") == null || localStorage.getItem("secret") == null) {
        if (localStorage.getItem("username") == null) {
            const popDiv = document.createElement("div")
            popDiv.innerHTML = `<h1>Room ${parseInt(roomID)}</h1>
            <p>please set a username before joining!</p><input type="text" name="username" id="username" placeholder="username">
            <button onclick="onSaveUser()">save</button>`
            
            setTimeout(function() {
                createPopup(popDiv, function() {
                    window.location.href = "/"
                });
            }, 500);
        } else {
            (async function() {
                if (localStorage.getItem("username") != null && localStorage.getItem("secret") == null) {
                    axios.get(`${apiURL}/rooms/${roomID}`).then(async res => {
                        async function actuallyJoin(roomID, password) {
                            try {
                                const response = await axios({
                                    url: `${apiURL}/rooms/${roomID}/join`,
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
                                window.location.reload()
                            } catch (e) {
                                console.error(e)
                                if (!e.response) {
                                    alert("a network problem occured")
                                } else {
                                    alert(e.response.data)
                                }
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
                            alert("a network problem occured")
                        } else {
                            alert(e.response.data)
                        }
                    })

                    /*
                    try {
                        const response = await axios({
                            url: `${apiURL}/rooms/${roomID}/join`,
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
                        window.location.reload()
                    } catch (e) {
                        console.error(e)
                        if (!e.response) {
                            alert("a network problem occured")
                        } else {
                            alert(e.response.data)
                        }
                    }*/
                }
            })();
        }
    } else {
        root.innerHTML = `<span onclick="leaveGame()" class="btn leavebtn"><i class="fa-solid fa-right-to-bracket"></i></span>
        <span class="btn" onclick="showSettings()"><i class="fa-solid fa-gear"></i></span>
        <span class="btn" onclick="showMarketPlace()"><i class="fa-solid fa-shopping-cart"></i></span>
        <span class="btn" onclick="showDebug()"><i class="fa-solid fa-screwdriver-wrench"></i></span> <!--debugging admin stuff?-->
    <main>
            <div class="roomLayout">
                <div class="roomItem hidemobile">
                    <h3>- LOBBY -</h3>
                    <div class="lobbyList" id="lobbyList">
                    </div>
                </div>
                <div class="roomItem gameItem">
                    <h3 id="roundnameth">- GAME -</h3>
                    <div class="game">
                        <div class="promptBox show" id="promptBox"> <!--dont comment the id part thingy ok thank you!-->
                        </div>
                    </div>
                    <span class="timer"><i class="fa-solid fa-clock"></i> <span id="timer">Waiting</span></span>
                </div>
                <div class="roomItem chatItem hidemobile">
                    <h3>- CHAT -</h3>
                    <div class="chat">
                        <div class="chat-list" id="messages">
                        </div>
                        <div class="chatbox">
                            <form id="message-form">
                                <input id="message-input" placeholder="Type a message here..." type="text">
                            </form>
                        </div>
                    </div>
                </div>
                <div id="promptBox-screenshot" style="display:none"><div>
            </div>
        </main>
        <div id="receiptDiv" onclick="document.getElementById('receiptDiv').classList.remove('showReceipt')" class="receipt hidemobile" style="display: none;">
        <img src="../assets/favicon.png" alt="" width="50"><br>
        <h3>NEFFMART<span class="tm">TM</span></h3>
        <p>
            Neffmart Supermarket Ltd<br>
            37 Neffington Road NE7 9FI<br>
            www.neffmart.nyaco.tk<br>
            Vat Number: 534 2394 32
        </p>
        <div id="receipt-list">
        </div>
        <hr>
        <span class="item">
            <span class="item-name">TOTAL</span>
            <span id="receipt-total" class="item-price">£30</span>
        </span>
        <span class="item">
            <span class="item-name">Visa Debit</span>
            <span id="receipt-visa" class="item-price">£30</span>
        </span>
        <span class="item">
            <span class="item-name">Contactless</span>
            <span class="item-price"></span>
        </span>
        <span class="item">
            <span class="item-name">Change Due</span>
            <span class="item-price">£0</span>
        </span>
        <br>
        <img src="/assets/bar.png" alt="" width="150">
    </div>
    `

        const receiptDiv = document.getElementById("receiptDiv")
        receiptDiv.style.display = "none"
        receiptDiv.onclick = function() {
            receiptDiv.classList.remove("receiptShow")
        }
        const receiptLst = document.getElementById("receipt-list")
        receiptLst.innerHTML = ``
        document.title = `${roomID} - Survive The Neffinet`
        promptBox = document.getElementById("promptBox");
        timer = document.getElementById("timer")
        const userList = document.getElementById("lobbyList");
        if (userList) {
            if (localStorage.getItem("tempData") != null && localStorage.getItem("host") == null) {
                const tempData = JSON.parse(localStorage.getItem("tempData"));
                localStorage.removeItem("tempData");
                roomData.users = tempData.users
                roomData.host = tempData.host;
                tempData.users.forEach(user => {
                    if (user.name != localStorage.getItem("username")) userList.appendChild(createUser(user.name, user.points, tempData.host == user.name, user.idHash, user.equipped))
                })
            } else {
                if (localStorage.getItem("host") != null) {
                    //userList.appendChild(createUser(localStorage.getItem("username"), 0, true, "me"))
                }
            }
        }
        socket = io.connect(apiURL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });
        socket.emit("join", {
            id: roomData.id,
            token: localStorage.getItem("secret")
            // tax time!
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
            }, 1000)
        })
        socket.on('error', (error) => {
            console.error(error);
            alert(`Error: ${error}`)
        })
        socket.on('message', (content) => {
            console.debug(content)
            loadMessage(content.username, content.content, content.equipped, content.image)
        })
        setTimeout(() => {
            tracks.push(new Audio('/assets/sounds/scp3008-friday.mp3'),
        new Audio('/assets/sounds/scp3008-thursday.mp3'),
        new Audio('/assets/sounds/super-bomb-survival-stinger6.mp3'),
        new Audio('/assets/sounds/nicos-nextbots-safezone.mp3'),
        new Audio('/assets/sounds/nicos-nextbots-8twelve.mp3'),
        new Audio('/assets/sounds/beemyu-cloud-chiptune.mp3'))
        }, 10000)
        socket.on('roomState', (data) => {
            roomData.started = data.started;
            if (!roomData.started) {
                if (roomData.isHost) {
                    changeTrack(0)
                    promptBox.innerHTML = `<p class="prompt">You're the host!</p><br><br>`
                    const startBtn = document.createElement("button");
                    startBtn.innerText = "Start the game";
                    startBtn.onclick = function() {
                        //if (roomData.users.length < 3) return alert("You need 3 players to start the game!")
                        socket.emit("roomEvent", {
                            event: "start"
                        })
                        roomData.started = true;
                    }
                    promptBox.appendChild(startBtn);
                    promptBox.classList.remove("show")
                    promptBox.classList.add("show")
                }
                timer.innerText = "Waiting"
            }
        })

        let timers;
        let votingTimer;
        let countdown = 60;
        function handleRound(topic, round, player, resp) { // last 2 are for round 2
            roomData.users.forEach(user => {
                setIcon(user.idHash, "fa-pencil");
            })
            clearTimeout(timers)
            countdown = 60;
            if (topic == "IMAGE") {
                countdown = 120
            }
            timer.innerText = `${countdown}s left`
            timers = setInterval(() => {
                countdown--;
                timer.innerText = `${countdown}s left`
                if (countdown < 0) clearTimeout(timers);
            }, 1000)
            promptBox.classList.remove("show")
            if (round == 1) {
                changeTrack(1)
                if (roomData.roundName == "IMAGE") {
                    changeTrack(5)
                    const prompt = document.createElement("p");
                    prompt.classList.add("prompt");
                    prompt.innerText = roomData.topic;
                    const input = document.createElement("input");
                    input.accept = "image/*"
                    input.name = "photo"
                    input.id = "photo";
                    input.type = "file";

                    const previewDiv = document.createElement("div");
                    previewDiv.classList.add("inputImage");
                    previewDiv.innerHTML = `<span>Preview</span><br>`;
                    const imgPreview = document.createElement("img");
                    imgPreview.id = "imagePreview";
                    previewDiv.appendChild(imgPreview);
                    const inputDesc = document.createElement("input");
                    inputDesc.placeholder = "This is an image of...";
                    inputDesc.type = "text";
                    inputDesc.maxLength = 50;
                    const submitBtn = document.createElement("button");
                    submitBtn.innerText = "SUBMIT";
                    const hiddenUploading = document.createElement("div");
                    inputDesc.addEventListener("keyup", function(event) {
                        event.preventDefault();
                        if (event.keyCode === 13) {
                            submitBtn.click();
                        }
                    });
                    submitBtn.onclick = function() {
                        if (!inputDesc.value.length) return;
                        hiddenUploading.innerText = "Uploading..."
                        // something with input yada yada
                        const input = document.getElementById("photo");
                        if (input.files && input.files[0]) {
                            const reader = new FileReader();
                            reader.onload = function(event) {
                                const imageData = event.target.result;
                                axios.post(`${apiURL}/rooms/${roomData.id}/upload`, {
                                    file: imageData,
                                    ext: input.files[0].type,
                                    username: localStorage.getItem("username")
                                }).then(() => {
                                    hiddenUploading.innerText = "Uploaded!"
                                    roomData.waiting = true;
                                    socket.emit("topicFinish", inputDesc.value);
                                }).catch(error => {
                                    console.error('There was a problem with the upload:', error);
                                    if (error.response && error.response.data) {
                                        hiddenUploading.innerText = "Error:" + error.response.data
                                    } else {
                                        hiddenUploading.innerText = "Error, please check console for info."
                                    }
                                    axios({
                                        url: `${apiURL}/crash`,
                                        method: "POST",
                                        headers: {
                                            "authorization": session
                                        },
                                        data: {
                                            response: JSON.stringify(error),
                                            route: `/rooms/${roomData.id}/upload`
                                        },
                                        timeout: 5000
                                    })
                                    // Handle error
                                });
                            }
                            reader.readAsDataURL(input.files[0]);
                        }
                    }
                    promptBox.innerHTML = "";
                    promptBox.appendChild(prompt);
                    promptBox.appendChild(input);
                    promptBox.appendChild(previewDiv);
                    promptBox.appendChild(document.createElement("br"))
                    promptBox.appendChild(document.createElement("br"));
                    promptBox.innerHTML += "<p>Now describe the image for the others!</p>"
                    promptBox.appendChild(inputDesc)
                    promptBox.appendChild(submitBtn)
                    promptBox.appendChild(hiddenUploading);
                    setTimeout(() => {
                        promptBox.classList.add("show")
                    }, 50)
                    document.getElementById("photo").onchange = function(e) {
                        const input = e.target;
                        if (input.files && input.files[0]) {
                            if (input.files[0].size > 100 * 1024 * 1024) {
                                input.value = '';
                                hiddenUploading.innerText = "You cannot upload a file that's larger than 100 MB."
                            } else {
                                const reader = new FileReader();
                                reader.onload = function(ef) {
                                    document.getElementById("imagePreview").src = ef.target.result;
                                };
                                reader.readAsDataURL(input.files[0]);
                            }
                        }
                    }
                } else {
                    const prompt = document.createElement("p");
                    prompt.classList.add("prompt");
                    prompt.innerText = roomData.topic // random based on topic, look above
                    const input = document.createElement("input");
                    input.placeholder = "Write your response here...";
                    input.type = "text";
                    input.maxLength = 50;
                    const submitBtn = document.createElement("button");
                    submitBtn.innerText = "SUBMIT";
                    input.addEventListener("keyup", function(event) {
                        event.preventDefault();
                        if (event.keyCode === 13) {
                            submitBtn.click();
                        }
                    });
                    submitBtn.onclick = function() {
                        if (!input.value.length) return;
                        // something with input yada yada
                        roomData.waiting = true;
                        socket.emit("topicFinish", input.value);
                    }
                    promptBox.innerHTML = "";
                    promptBox.appendChild(prompt);
                    promptBox.appendChild(input);
                    promptBox.appendChild(document.createElement("br"))
                    promptBox.appendChild(document.createElement("br"))
                    promptBox.appendChild(submitBtn)
                    setTimeout(() => {
                        promptBox.classList.add("show")
                    }, 50)
                }
            } else if (round == 2) {
                /*
                        <div class="message">
                                <span class="username">Jeremiah</span><br>
                                <span class="contents">I DO NOT HATE JEREMIAH ROWBOTTOM! I DO NOTTTT!!</span>
                            </div>
                            <p class="prompt">would be a HORRIBLE caption for something titled...</p>
                            <input placeholder="Write something funny..." type="text" name="" id=""><br><br>
                            <button>SUBMIT</button>
                            <div style="display: none;">something went wrong for whatever reason!</div>
                */
               changeTrack(1)
                if (roomData.roundName == "IMAGE") {
                    changeTrack(5)
                }

                const messageDiv = document.createElement("div");
                messageDiv.classList.add("message");
                const usernameSpan = document.createElement("span");
                usernameSpan.classList.add("username");
                usernameSpan.innerText = player;
                const contentSpan = document.createElement("span");
                contentSpan.innerText = resp;
                contentSpan.classList.add("contents");
                messageDiv.appendChild(usernameSpan);
                messageDiv.appendChild(document.createElement("br"));
                messageDiv.appendChild(contentSpan);
                const prompt = document.createElement("p");
                prompt.classList.add("prompt");
                prompt.innerText = topic;
                const input = document.createElement("input");
                input.placeholder = "Write something funny here...";
                input.type = "text";
                input.maxLength = 50;
                const submitBtn = document.createElement("button");
                submitBtn.innerText = "SUBMIT";
                input.addEventListener("keyup", function(event) {
                    event.preventDefault();
                    if (event.keyCode === 13) {
                        submitBtn.click();
                    }
                });
                submitBtn.onclick = function() {
                    if (!input.value.length) return;
                    roomData.waiting = true;
                    socket.emit("topicFinish", input.value);
                }
                promptBox.innerHTML = "";
                promptBox.appendChild(messageDiv);
                promptBox.appendChild(prompt);
                promptBox.appendChild(input);
                promptBox.appendChild(document.createElement("br"))
                promptBox.appendChild(document.createElement("br"))
                promptBox.appendChild(submitBtn)
                setTimeout(() => {
                    promptBox.classList.add("show")
                }, 50)
            } else {
                // what.
                alert("what.")
            }
        }

        socket.on('roomEvent', (data) => {
            clearTimeout(votingTimer);
            switch (data.event) {
                case "start":
                    promptBox.classList.remove("endingv2")
                    featuredPosts = []
                    roomData.waiting = false;
                    roomData.users.forEach(user => {
                        const points = document.getElementById(`user-points-${user.idHash}`)
                        if (points) {
                            points.innerText = "0"
                        }
                    })
                    roomData.started = true;
                    timer.innerText = "Starting";
                    promptBox.innerHTML = "<h3>5</h3>"
                    /*setTimeout(function() {
                        promptBox.innerHTML = "<h3>4</h3>"
                    }, 1000)
                    setTimeout(function() {
                        promptBox.innerHTML = "<h3>3</h3>"
                    }, 2000)
                    setTimeout(function() {
                        promptBox.innerHTML = "<h3>2</h3>"
                    }, 3000)
                    setTimeout(function() {
                        promptBox.innerHTML = "<h3>1</h3>"
                    }, 4000)
                    setTimeout(function() {
                        promptBox.innerHTML = "<h2>Start!</h3>"
                        setTimeout(function() {
                            // call event thingy
                            if (roomData.isHost) {
                                socket.emit("roomEvent", {
                                    event: "nexttopic"
                                })
                            }
                        }, 3000)
                    }, 5000)*/
                    // comment out after dev
                    if (roomData.isHost) {
                        socket.emit("roomEvent", {
                            event: "nexttopic"
                        })
                    }
                    break;
                case "nexttopic":
                    promptBox.classList.remove("endingv2")
                    let actualRoundTitle = "Unknown"
                    switch (data.roundName) {
                        case "NEWS": {
                            actualRoundTitle = "TOP NEWS"
                            break;
                        }
                        case "RATINGS": {
                            actualRoundTitle = "REVIEWS"
                            break;
                        }
                        case "TRAVELLING": {
                            actualRoundTitle = "WONDERS OF THE WORLD"
                            break;
                        }
                        case "VIDEO": {
                            actualRoundTitle = "NEFFTUBE"
                            break;
                        }
                        case "IMAGE": {
                            actualRoundTitle = "IMAGE SHOWCASE"
                            break;
                        }
                        case "SHOPPING": {
                            actualRoundTitle = "PRODUCT REVIEWS" // a bad reskin of reviews
                            break;
                        }
                        case "GOFUNDME": {
                            actualRoundTitle = "GONEFFME" // a bad reskin of news
                            break;
                        }
                        default: {
                            actualRoundTitle = data.roundName
                            break;
                        }
                    }
                    /*
                    <h1 class="round-number">Round (numbre)</h1>
                            <h2 class="round-topic">NEWS</h2>
                            */
                    roomData.round = data.round;
                    roomData.roundName = data.roundName;
                    roomData.waiting = false;
                    delete roomData.selected
                    // definitely not vulnerable to xss
                    promptBox.classList.remove("show")
                    promptBox.innerHTML = `
                    <h1 class="round-number">Round ${roomData.round}</h1>
                    <h2 class="round-topic">${actualRoundTitle}</h2>
                    ` // make border colour of game change to round specific colour
                    playAudio('/assets/sounds/trowel.mp3')
                    document.getElementById("roundnameth").innerText = `- GAME (${roomData.roundName}) -`
                    setTimeout(() => {
                        promptBox.classList.add("show")
                    }, 50)
                    setTimeout(function() {
                        setTimeout(function() {
                            playAudio('/assets/sounds/tick.mp3')
                            timer.innerText = "3."
                        }, 1000)
                        setTimeout(function() {
                            playAudio('/assets/sounds/tick.mp3')
                            timer.innerText = "2."
                        }, 2000)
                        setTimeout(function() {
                            playAudio('/assets/sounds/tick.mp3')
                            timer.innerText = "1."
                        }, 3000)
                        setTimeout(function() {
                            promptBox.classList.remove("show")
                            handleRound(roomData.roundName, 1);
                        }, 4000)
                    }, 1000)
                    break;
                case "yourtopic":
                    roomData.topic = data.topic;
                    break;
                case "nextround":
                    roomData.waiting = false;
                    roomData.twistUser = data.user
                    //const adjectives = ["HORRIBLE", "ACCURATE"]
                    switch (roomData.roundName) {
                        case "NEWS":
                            handleRound("would be a HORRIBLE comment for a news article titled...", 2, data.user, data.prompt)
                            break;
                        case "RATINGS":
                            handleRound("would be a HORRIBLE review for...", 2, data.user, data.prompt)
                            break;
                        case "TRAVELLING":
                            handleRound("would be an ACCURATE description for...", 2, data.user, data.prompt)
                            break;
                        case "SHOPPING":
                            handleRound("would be the PERFECT review for a product called...", 2, data.user, data.prompt)
                            break;
                        case "VIDEO":
                            handleRound("would be the PERFECT reply to a video titled...", 2, data.user, data.prompt)
                            break;
                        case "GOFUNDME":
                            handleRound("would be the PERFECT reply for a gofundme called...", 2, data.user, data.prompt)
                        case "IMAGE":
                            handleRound("The perfect accompanying caption would be...", 2, data.user, data.prompt)
                            break;
                    } // what's the point of the 2 if they're all the same anyway
                    break;
                case "results":
                    playAudio('/assets/sounds/trowel.mp3')
                    clearTimeout(timers)
                    roomData.users.forEach(user => {
                        setIcon(user.idHash, "fa-user");
                    })
                    changeTrack(3)
                    promptBox.innerHTML = "<h3>Now for the results!</h3>";
                    timer.innerText = "Waiting";
                    function createTopic(submission, animate, roundname) {
                        const resultDiv = document.createElement("div");
                        resultDiv.classList.add("result", "news");
                        if (!roundname) roundname = roomData.roundName
                        switch (roundname) {
                            case "NEWS": {

                                const headerSpan = document.createElement("span")
                                headerSpan.classList.add("header")
                                headerSpan.innerHTML = `<i class="fa-solid fa-newspaper"></i>THE NEW NEFFI TIMES`

                                const titleDiv = document.createElement("div")
                                titleDiv.classList.add("title")

                                const newsBox = document.createElement("div")
                                newsBox.classList.add("news-box")
                                
                                // SECOND INPUT
                                const newsBoxContent = document.createElement("span")
                                newsBoxContent.innerText = submission.desc

                                const newsBoxAddition = document.createElement("span")
                                newsBoxAddition.classList.add("news-box-addition")
                                newsBoxAddition.style.fontWeight = '500'
                                newsBoxAddition.innerText = `${submission.newsGenre} | ${submission.newsHours} hours ago` // make random later

                                const flavour = document.createElement("span")
                                flavour.classList.add("flavour")
                                flavour.innerText = "1 comment"

                                const messageDiv = document.createElement("div")
                                messageDiv.classList.add("message")

                                const usernameSpan = document.createElement("span")
                                usernameSpan.classList.add("username")
                                usernameSpan.innerText = submission.username

                                const contentsSpan = document.createElement("span")
                                contentsSpan.classList.add("contents")
                                contentsSpan.innerText = submission.title

                                resultDiv.appendChild(headerSpan)
                                resultDiv.appendChild(titleDiv)
                                titleDiv.appendChild(newsBox)
                                if (submission.newsBreaking == 1) {
                                    const live = document.createElement("span")
                                    live.classList.add("live")
                                    live.innerHTML = `<i class="fa-solid fa-circle"></i></span><span class="news-box-addition">BREAKING</span><br>`
                                    newsBox.appendChild(live)
                                }
                                //titleDiv.appendChild(br1)
                                newsBox.appendChild(newsBoxContent)
                                newsBox.appendChild(document.createElement("br"))
                                newsBox.appendChild(newsBoxAddition)
                                resultDiv.appendChild(flavour)
                                resultDiv.appendChild(messageDiv)
                                messageDiv.appendChild(usernameSpan)
                                messageDiv.appendChild(document.createElement("br"))
                                messageDiv.appendChild(contentsSpan)

                                setTimeout(() => {
                                    if (animate) newsBoxContent.classList.add("response-animate");
                                }, 51)
                                // this actually looks so good if it works i love it
                                // i just need to manually update it in the css for the finals wrapper
                                break;
                            }
                            case "RATINGS": { // might remove this maybe idk
                                
                                resultDiv.classList.add("ratings")

                                const headerSpan = document.createElement("span")
                                headerSpan.classList.add("header")
                                headerSpan.innerHTML = `<i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>NELP`

                                const ratingsBox = document.createElement("div")
                                ratingsBox.classList.add("ratings-box")

                                const titleDiv = document.createElement("div")
                                titleDiv.classList.add("title")

                                const usernameSpan = document.createElement("span")
                                usernameSpan.classList.add("username")
                                usernameSpan.innerText = submission.username

                                const flavour = document.createElement("span")
                                flavour.classList.add("flavour")
                                flavour.innerText = "recommends"

                                const recommendation = document.createElement("span")
                                recommendation.classList.add("recommendation")
                                recommendation.innerText = submission.desc

                                const shoppingBoxAdditionRating = document.createElement("span")
                                shoppingBoxAdditionRating.classList.add("ratings-box-addition")

                                const rollStars = submission.ratingsStars
                                for (let i = 1;i < 6;i++) {
                                    if (i <= rollStars) {
                                        const j = document.createElement("i")
                                        j.classList.add("fa-solid")
                                        j.classList.add("fa-star")
                                        shoppingBoxAdditionRating.appendChild(j)
                                    } else {
                                        const j = document.createElement("i")
                                        j.classList.add("fa-regular")
                                        j.classList.add("fa-star")
                                        shoppingBoxAdditionRating.appendChild(j)
                                    }
                                }

                                const messageDiv = document.createElement("div")
                                messageDiv.classList.add("message")

                                const contentsSpan = document.createElement("span")
                                contentsSpan.classList.add("contents")
                                contentsSpan.innerText = submission.title

                                resultDiv.appendChild(headerSpan)
                                resultDiv.appendChild(ratingsBox)
                                ratingsBox.appendChild(titleDiv)
                                titleDiv.appendChild(usernameSpan)
                                titleDiv.appendChild(document.createElement("br"))
                                titleDiv.appendChild(flavour)
                                titleDiv.appendChild(document.createElement("br"))
                                titleDiv.appendChild(recommendation)
                                titleDiv.appendChild(document.createElement("br"))
                                titleDiv.appendChild(shoppingBoxAdditionRating)
                                ratingsBox.appendChild(messageDiv)
                                messageDiv.appendChild(contentsSpan)

                                setTimeout(() => {
                                    if (animate) recommendation.classList.add("response-animate");
                                }, 51)


                                break;
                            }
                            case "TRAVELLING": {

                                resultDiv.classList.add("travelling")

                                const headerSpan = document.createElement("span")
                                headerSpan.classList.add("header")
                                headerSpan.innerHTML = `<i class="fa-solid fa-location-dot"></i>NEFFADVISOR`

                                const travellingBox = document.createElement("div")
                                travellingBox.classList.add("travelling-box")
                                
                                const titleDiv = document.createElement("div")
                                titleDiv.classList.add("title")

                                const usernameSpan = document.createElement("span")
                                usernameSpan.classList.add("username")
                                usernameSpan.innerText = submission.username

                                const opinionSpan = document.createElement("span")
                                opinionSpan.classList.add("opinion")
                                opinionSpan.innerText = submission.title

                                const flavour = document.createElement("span")
                                flavour.classList.add("flavour")
                                flavour.innerText = "checked in at"
                                
                                const place = document.createElement("span")
                                place.classList.add("place")

                                const i = document.createElement("i")
                                i.classList.add("fa-solid")
                                i.classList.add("fa-location-dot")

                                const placeContents = document.createElement("span")
                                placeContents.innerText = submission.desc

                                const travellingBoxAddition = document.createElement("span")
                                travellingBoxAddition.classList.add("travelling-box-addition")
                                travellingBoxAddition.innerText = `${submission.travellingUsers} users found this helpful`

                                const gofundmeBoxAddition = document.createElement("span")
                                gofundmeBoxAddition.classList.add("gofundme-box-addition")
                                gofundmeBoxAddition.style.fontStyle = "normal"

                                // make these clickable
                                const thumbUp = document.createElement("span")
                                thumbUp.innerHTML = `<i class="fa-solid fa-thumbs-up"></i>${submission.travellingLikes}`
                                
                                const thumbDown = document.createElement("span")
                                thumbDown.innerHTML = `<i class="fa-solid fa-thumbs-down"></i>${submission.travellingDislikes}`

                                resultDiv.appendChild(headerSpan)
                                resultDiv.appendChild(travellingBox)
                                travellingBox.appendChild(titleDiv)
                                titleDiv.appendChild(usernameSpan)
                                titleDiv.appendChild(document.createElement("br"))
                                titleDiv.appendChild(opinionSpan)
                                travellingBox.appendChild(flavour)
                                travellingBox.appendChild(document.createElement("br"))
                                travellingBox.appendChild(place)
                                place.appendChild(i)
                                place.appendChild(placeContents)
                                travellingBox.appendChild(travellingBoxAddition)
                                travellingBox.appendChild(gofundmeBoxAddition)
                                gofundmeBoxAddition.appendChild(thumbUp)
                                gofundmeBoxAddition.appendChild(thumbDown)

                                setTimeout(() => {
                                    if (animate) place.classList.add("response-animate");
                                }, 51)

                                break;
                            }
                            case "SHOPPING": { // bad reskin of reviews but we love feature bloat dont we hahahahahahahahahahahahahahahahhahahahahahahahahhahahahahahahahahahahhahahahhaha
                                
                                resultDiv.classList.add("shopping")

                                const headerSpan = document.createElement("span")
                                headerSpan.classList.add("header")
                                headerSpan.innerHTML = `<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>NEFFMART`

                                const shoppingBox = document.createElement("div")
                                shoppingBox.classList.add("shopping-box")

                                const titleDiv = document.createElement("div")
                                titleDiv.classList.add("title")

                                const place = document.createElement("span")
                                place.innerText = submission.desc

                                const shoppingBoxAdditionRating = document.createElement("span")
                                shoppingBoxAdditionRating.classList.add("shopping-box-addition")
                                shoppingBoxAdditionRating.classList.add("shopping-rating")

                                const rollStars = submission.shoppingStars
                                for (let i = 1;i < 6;i++) {
                                    if (i <= rollStars) {
                                        const j = document.createElement("i")
                                        j.classList.add("fa-solid")
                                        j.classList.add("fa-star")
                                        shoppingBoxAdditionRating.appendChild(j)
                                    } else {
                                        const j = document.createElement("i")
                                        j.classList.add("fa-regular")
                                        j.classList.add("fa-star")
                                        shoppingBoxAdditionRating.appendChild(j)
                                    }
                                }

                                const shoppingBoxPrice = document.createElement("span")
                                shoppingBoxPrice.classList.add("shopping-box-addition")
                                shoppingBoxPrice.classList.add("price")
                                let rollPrice = getRandomInt(5, 140)
                                shoppingBoxPrice.innerHTML = `£${rollPrice}`

                                const shoppingBoxCart = document.createElement("span")
                                shoppingBoxCart.classList.add("shopping-box-addition")
                                shoppingBoxCart.classList.add("cart")
                                shoppingBoxCart.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>add to cart`
                                
                                let shoppingItem = {
                                    name: submission.desc,
                                    price: rollPrice
                                }
                                shoppingBoxCart.onclick = function() {
                                    let shoppingItem = {
                                        name: submission.desc,
                                        price: rollPrice
                                    };
                                    const receiptDiv = document.getElementById("receiptDiv");
                                    receiptDiv.style.display = "flex";
                                    receipt.push(shoppingItem);
                                    updateReceipt();
                                }

                                // onclick easter egg

                                const flavour = document.createElement("span")
                                flavour.classList.add("flavour")
                                flavour.innerText = `1 review`

                                const messageDiv = document.createElement("div")
                                messageDiv.classList.add("message")

                                const usernameSpan = document.createElement("span")
                                usernameSpan.classList.add("username")
                                usernameSpan.innerText = submission.username

                                const contentsSpan = document.createElement("span")
                                contentsSpan.classList.add("contents")
                                contentsSpan.innerText = submission.title

                                resultDiv.appendChild(headerSpan)
                                resultDiv.appendChild(shoppingBox)
                                shoppingBox.appendChild(titleDiv)
                                titleDiv.appendChild(place)
                                titleDiv.appendChild(document.createElement("br"))
                                shoppingBox.appendChild(shoppingBoxAdditionRating)
                                shoppingBox.appendChild(shoppingBoxPrice)
                                shoppingBox.appendChild(shoppingBoxCart)
                                resultDiv.appendChild(flavour)
                                resultDiv.appendChild(messageDiv)
                                messageDiv.appendChild(usernameSpan)
                                messageDiv.appendChild(document.createElement("br"))
                                messageDiv.appendChild(contentsSpan)

                                setTimeout(() => {
                                    if (animate) place.classList.add("response-animate");
                                }, 51)


                                break;
                            }
                            case "GOFUNDME": { // feature bloat ahahahahhahahahaha

                                resultDiv.classList.add("gofundme")

                                const headerSpan = document.createElement("span")
                                headerSpan.classList.add("header")
                                headerSpan.innerHTML = `<i class="fa-solid fa-coins"></i>GONEFFME`

                                const titleDiv = document.createElement("div")
                                titleDiv.classList.add("title")

                                const newsBox = document.createElement("div")
                                newsBox.classList.add("news-box")

                                const newsBoxContent = document.createElement("span")
                                newsBoxContent.classList.add("news-box-content")
                                newsBoxContent.innerText = submission.desc

                                let fillPercent = submission.gofundmeFill
                                let moneyRaised = submission.gofundmeRaised

                                resultDiv.dataset.additive = 0

                                const barDiv = document.createElement("div")
                                barDiv.classList.add("bar")
                                const fillDiv = document.createElement("div")
                                fillDiv.classList.add("fill")
                                fillDiv.style.width = `${fillPercent}%`
                                barDiv.appendChild(fillDiv)

                                const raisedSpan = document.createElement("span")
                                raisedSpan.classList.add("gofundme-box-addition")
                                raisedSpan.classList.add("raised")
                                raisedSpan.innerHTML = `£${moneyRaised} raised`

                                const backingBtnSpan = document.createElement("span")
                                backingBtnSpan.classList.add("gofundme-box-addition")
                                backingBtnSpan.classList.add("ignore")
                                backingBtnSpan.classList.add("backing")

                                const backingBtn = document.createElement("button")
                                backingBtn.innerText = "Support"
                                backingBtn.classList.add("gofundme")
                                backingBtn.onclick = function() {
                                    resultDiv.dataset.additive = Number(resultDiv.dataset.additive) + 1
                                    let newFill = fillPercent + Number(resultDiv.dataset.additive)
                                    if (newFill >= 100) {
                                        newFill = 100
                                    } else {
                                        moneyRaised += getRandomInt(10, 100)
                                    };
                                    raisedSpan.innerHTML = `£${moneyRaised} raised`
                                    fillDiv.style.width = `${newFill}`
                                }

                                const backingSpan = document.createElement("span")
                                backingSpan.classList.add("gofundme-box-addition")
                                backingSpan.classList.add("backing")
                                backingSpan.innerHTML = `${submission.gofundmeBacking} backing`

                                const flavour = document.createElement("span")
                                flavour.classList.add("flavour")
                                flavour.innerText = "1 comment"

                                const messageDiv = document.createElement("div")
                                messageDiv.classList.add("message")

                                const usernameSpan = document.createElement("span")
                                usernameSpan.classList.add("username")
                                usernameSpan.innerText = submission.username

                                const contentsSpan = document.createElement("span")
                                contentsSpan.classList.add("contents")
                                contentsSpan.innerText = submission.title

                                resultDiv.appendChild(headerSpan)
                                resultDiv.appendChild(titleDiv)
                                titleDiv.appendChild(newsBox)
                                newsBox.appendChild(newsBoxContent)
                                newsBox.appendChild(document.createElement("br"))
                                newsBox.appendChild(barDiv)
                                newsBox.appendChild(raisedSpan)
                                newsBox.appendChild(backingBtnSpan)
                                backingBtnSpan.appendChild(backingBtn)
                                newsBox.appendChild(backingSpan)
                                resultDiv.appendChild(flavour)
                                resultDiv.appendChild(messageDiv)
                                messageDiv.appendChild(usernameSpan)
                                messageDiv.appendChild(document.createElement("br"))
                                messageDiv.appendChild(contentsSpan)

                                setTimeout(() => {
                                    if (animate) newsBoxContent.classList.add("response-animate");
                                }, 51)

                                break;
                            }
                            case "VIDEO": { // we love more news reskins
                                // yep you heard it here folks
                                resultDiv.classList.add("youtube")

                                const headerSpan = document.createElement("span")
                                headerSpan.classList.add("header")
                                headerSpan.innerHTML = `<i class="fa-solid fa-play"></i>NEFFTUBE`

                                const titleDiv = document.createElement("div")
                                titleDiv.classList.add("title")

                                const youtubeBox = document.createElement("div")
                                youtubeBox.classList.add("youtube-box")

                                const youtubeTimeline = document.createElement("div")
                                youtubeTimeline.classList.add("youtube-timeline")
                                youtubeTimeline.innerHTML = `
                                <i class="fa-solid fa-play"></i>
                                <div class="youtube-bar">
                                    <div class="youtube-fill" style="width:${Math.random() * 100}%;">
                                        <div class="youtube-thumb">
                                            <div class="youtube-inner-thumb"></div>
                                        </div>
                                    </div>
                                </div>
                                `

                                const contentSpan = document.createElement("span")
                                contentSpan.classList.add("youtube-box-content")
                                contentSpan.innerText = submission.desc

                                const youtubeBoxContent = document.createElement("span")
                                youtubeBoxContent.classList.add("youtube-box-content")
                                youtubeBoxContent.innerHTML = `
                                <span class="news-box-addition" style="font-weight: 500;">${"Business"} | ${2} hours ago</span><br>
                                <span class="gofundme-box-addition" style="font-style: normal;">
                                    <i class="fa-solid fa-thumbs-up"></i>${2}
                                    <i class="fa-solid fa-thumbs-down"></i>${2}
                                </span>
                                `

                                const flavour = document.createElement("span")
                                flavour.classList.add("flavour")
                                flavour.innerHTML = `1 comment`

                                const messageDiv = document.createElement("div")
                                messageDiv.classList.add("message")

                                const usernameSpan = document.createElement("span")
                                usernameSpan.classList.add("username")
                                usernameSpan.innerText = submission.username

                                const contentsSpan = document.createElement("span")
                                contentsSpan.classList.add("contents")
                                contentsSpan.innerText = submission.title

                                resultDiv.appendChild(headerSpan)
                                resultDiv.appendChild(titleDiv)
                                titleDiv.appendChild(youtubeBox)
                                youtubeBox.appendChild(youtubeTimeline)
                                youtubeBox.appendChild(contentSpan)
                                youtubeBox.appendChild(youtubeBoxContent)
                                resultDiv.appendChild(flavour)
                                resultDiv.appendChild(messageDiv)
                                messageDiv.appendChild(usernameSpan)
                                messageDiv.appendChild(document.createElement("br"))
                                messageDiv.appendChild(contentsSpan)

                                setTimeout(() => {
                                    if (animate) contentSpan.classList.add("response-animate");
                                }, 51)

                                break;
                            }
                            case "IMAGE": {
                                resultDiv.innerHTML = `<span class="header"><i class="fa-solid fa-image"></i>NEFFIGRAM</span>`
                                const titleDiv = document.createElement("div");
                                titleDiv.classList.add("title");
                                const img = document.createElement("img");
                                img.alt = "Image Loading...";
                                img.src = `${apiURL}/rooms/${roomData.id}/imgs/${submission.file}`
                                const usernameSpan = document.createElement("span");
                                usernameSpan.classList.add("username");
                                usernameSpan.innerText = submission.username
                                titleDiv.appendChild(img);
                                titleDiv.appendChild(usernameSpan);
                                titleDiv.appendChild(document.createElement("br"));
                                const opinionSpan = document.createElement("span");
                                opinionSpan.classList.add("opinion");
                                opinionSpan.innerText = submission.desc
                                titleDiv.appendChild(opinionSpan);
                                setTimeout(() => {
                                    if (animate) opinionSpan.classList.add("response-animate");
                                }, 51)
                                resultDiv.appendChild(titleDiv);
                                break;
                            }
                        }
                        const captureSpan = document.createElement("span")
                        captureSpan.classList.add("capture")
                        captureSpan.innerHTML = `<i class="fa-solid fa-camera"></i>Capture`
                        let uploaded = false;
                        resultDiv.appendChild(captureSpan)
                        resultDiv.id = "resultdiv"
                        captureSpan.onclick = function() {
                            if (uploaded) return;
                            if (!uploaded) uploaded = true;
                            const promptScreen = document.getElementById("promptBox-screenshot")
                            promptScreen.innerHTML = ""
                            promptScreen.style.display = ""
                            promptScreen.appendChild(createTopic(submission, false, roundname))
                            domtoimage.toPng(document.getElementById("promptBox-screenshot")).then(imageData => {
                                promptScreen.style.display = "none"
                                axios.post(`${apiURL}/rooms/${roomData.id}/capture`, {
                                    file: imageData,
                                    username: localStorage.getItem("username")
                                }).then(() => {
                                    console.debug("Capture sent!")
                                }).catch(error => {
                                    console.error('There was a problem with the upload:', error);
                                    if (error.response && error.response.data) {
                                        alert("Error: " + error.response.data)
                                    } else {
                                        alert("Error, please check console for info.")
                                    }
                                });
                            })
                        }
                        return resultDiv;
                    }
                    setTimeout(function() {
                        const submissions = data.submissions;
                        if (submissions) {
                            // submission forEach
                            for (let i = 0; i < submissions.length; i++) {
                                setTimeout(function() {
                                    clearTimeout(timers)
                                    countdown = 8;
                                    timer.innerText = `${countdown}s left` // why didnt you do this originally lol no hate just silly
                                    timers = setInterval(() => {
                                        countdown--;
                                        timer.innerText = `${countdown}s left`
                                        if (countdown < 0) clearTimeout(timers);
                                    }, 1000)
                                    const submission = submissions[i];
                                    promptBox.classList.remove("show")
                                    promptBox.innerHTML = "";
                                    promptBox.appendChild(createTopic(submission, true))
                                    setTimeout(() => {
                                        promptBox.classList.add("show")
                                    }, 50)
                                }, i * 8000)
                            }
                            setTimeout(function() {
                                clearTimeout(timers)
                                promptBox.innerHTML = ""
                                const finalsWrapDiv = document.createElement("div");
                                finalsWrapDiv.classList.add("finals-wrap");
                                let previouslySelected = -1;
                                let previousHTML = ""
                                for (let i = 0; i < submissions.length; i++) {
                                    if (submissions[i].username == roomData.twistUser) continue;
                                    const resultDiv = createTopic(submissions[i], false);
                                    resultDiv.id = `result-${i}`;
                                    resultDiv.onclick = function() {
                                        if (previouslySelected == i) return;
                                        if (submissions[i].username == roomData.twistUser) return;
                                        roomData.selected = submissions[i];
                                        resultDiv.classList.add("selected");
                                        socket.emit("vote", submissions[i]);
                                        if (previouslySelected != -1) {
                                            const findPrev = document.getElementById(`result-${previouslySelected}`)
                                            if (findPrev) {
                                                findPrev.classList.remove("selected");
                                                findPrev.innerHTML = previousHTML;
                                            }
                                        }
                                        previouslySelected = i;
                                        previousHTML =  resultDiv.innerHTML
                                        resultDiv.innerHTML = `<div class="tick"><i class="fa-solid fa-circle-check"></i></div>` + resultDiv.innerHTML
                                    }
                                    finalsWrapDiv.appendChild(resultDiv)
                                }
                                changeTrack(4)
                                const finalsDiv = document.createElement("div");
                                finalsDiv.classList.add("finals")
                                finalsDiv.innerHTML = `<p>CAST YOUR VOTES!</p>`;
                                finalsDiv.appendChild(finalsWrapDiv)
                                promptBox.appendChild(finalsDiv);
                                countdown = 30;
                                timer.innerText = "30s left"
                                timers = setInterval(() => {
                                    countdown--;
                                    timer.innerText = `${countdown}s left`
                                    if (countdown < 0) clearTimeout(timers); // wait im gonna try doing it based off context clues nvm how the hell
                                }, 1000)
                                if (roomData.isHost) {
                                    socket.emit("roomEvent", {
                                        event: "votingtime"
                                    })
                                }
                                votingTimer = setTimeout(function() {
                                    timer.innerText = "Waiting"
                                    promptBox.innerHTML = ""
                                }, 30000)
                            }, submissions.length * 8000)
                        }
                    }, 2000)
                    break;
                case "waiting":
                    //id="user-icon-${hash}"
                    const usersNotWaiting = roomData.users.filter(user => !data.users.find(use => use.username == user.name))
                    usersNotWaiting.forEach(user => {
                        setIcon(user.idHash, "fa-circle-check")
                    })
                    if (!roomData.waiting) return;
                    /*
    <h3>Waiting for other players...</h3>
                            <div class="waitingFor">
                                <span>jeremiah</span>
                                <span>oswald</span>
                                <span>patrick</span>
                            </div>
                    */
                    promptBox.innerHTML = "<img class='loading-img' src='../assets/loop.gif'><h3>Waiting for other players</h3>";
                    const waitingForDiv = document.createElement("div");
                    waitingForDiv.classList.add("waitingFor");
                    data.users.forEach(user => {
                        const userSpan = document.createElement("span");
                        userSpan.innerText = user.username;
                        waitingForDiv.appendChild(userSpan);
                    })
                    promptBox.appendChild(waitingForDiv);
                    break;
                case "winneris":
                    setTimeout(function() {
                        clearTimeout(timers)
                        timer.innerText = "Waiting"
                        promptBox.classList.remove("show")
                        promptBox.innerHTML = "<h3>The winner is</h3>";
                        setTimeout(() => {
                            promptBox.classList.add("show")
                        }, 50)
                        setTimeout(function() {
                            console.debug("winneris", data)
                            if (data.noone) {
                                promptBox.innerHTML = "<h3>Nobody won, what.</h3>";
                            } else {
                                data.roundname = roomData.roundName
                                featuredPosts.push(data);
                                const resultDiv = createTopic(data.submission, false);
                                // probably wont be xss, hahaha!
                                resultDiv.innerHTML += `<div class="finals-results"><span>${data.voteCount} votes</span></div>`
                                promptBox.innerHTML = "";
                                const h3Win = document.createElement("h3");
                                const h3Sac = document.createElement("h3");
                                h3Win.innerText = `Winner - ${data.winner} (+${data.winPoints.points})`;
                                h3Sac.innerText = `Sacrifice - ${data.submission.username} (+${data.sacPoints.points})`;
                                promptBox.appendChild(h3Win)
                                promptBox.appendChild(h3Sac)
                                promptBox.appendChild(resultDiv)
                                const winnerPoints = document.getElementById(`user-points-${data.winPoints.hash}`)
                                const sacPoints = document.getElementById(`user-points-${data.sacPoints.hash}`)
                                if (winnerPoints && sacPoints) {
                                    winnerPoints.innerText = parseInt(winnerPoints.innerText) + data.winPoints.points
                                    sacPoints.innerText = parseInt(sacPoints.innerText) + data.sacPoints.points
                                }
                                setTimeout(function() {
                                    if (roomData.isHost) {
                                        socket.emit("roomEvent", {
                                            event: "nexttopic"
                                        })
                                    }
                                }, 4000)
                            }
                        }, 1500)
                    }, 1000)
                    break;
                case "gameend":
                    // i see!
                    // NEFFFIII HIJACK THIS FUNCTION LATER
                    setTimeout(function() {
                        changeTrack(0)
                        document.getElementById("roundnameth").innerText = `- GAME (END) -`
                        roomData.users.forEach(user => {
                            setIcon(user.idHash, "fa-user");
                        })
                        clearTimeout(timers)
                        timer.innerText = "Waiting"
                        promptBox.classList.remove("show")
                        promptBox.innerHTML = "<h3>ROUND END!</h3>";
                        setTimeout(() => {
                            promptBox.classList.add("show")
                            promptBox.classList.add("endingv2")
                        }, 50)
                        setTimeout(function() {
                            promptBox.classList.remove("show")
                            promptBox.innerHTML = `<h1 id="winnerTitle">And the winner is...</h1>`
                            setTimeout(() => {
                                promptBox.classList.add("show")
                                playAudio('/assets/sounds/drumroll.mp3')
                            }, 50)
                            sleep(2000).then(() => {
                                promptBox.classList.remove("show")
                                promptBox.innerHTML = ""
                                const winnerName = document.createElement("h2");
                                winnerName.id = "winnerName";
                                winnerName.innerText = `${data.winner.username}!`
                                const pointsWon = document.createElement("h3");
                                pointsWon.id = "wonPoints";
                                pointsWon.innerText = `with ${data.winner.points} points`
                                const BURNINGGATESOFHELL = document.createElement("img");
                                BURNINGGATESOFHELL.id = "burninggatesofhell"
                                BURNINGGATESOFHELL.classList.add("burninggatesofhell")
                                BURNINGGATESOFHELL.src = "/assets/fire.gif"

                                const winnerReveal = document.createElement("div");
                                winnerReveal.classList.add("winnerReveal");
                                
                                const winnerIcon = generateIcon(data.winner.equipped, data.winner.equipped.filter(item => item.type == "bases")[0].filename, data.winner.equipped.filter(item => item.type == "shape")[0].value);
                                winnerIcon.classList.add("winnericon")
                                winnerIcon.id = "winnerIcon"
                                winnerReveal.appendChild(winnerIcon);
                                
                                winnerReveal.innerHTML += "\n "
                                const sacrificeIcon = generateIcon(data.second.equipped, data.second.equipped.filter(item => item.type == "bases")[0].filename, data.second.equipped.filter(item => item.type == "shape")[0].value);
                                sacrificeIcon.classList.add("winnericon", "sacrifice")
                                sacrificeIcon.id = "sacrificeIcon"
                                winnerReveal.appendChild(sacrificeIcon);
                                winnerReveal.innerHTML += "\n "

                                promptBox.appendChild(winnerReveal);
                                promptBox.appendChild(winnerName);
                                promptBox.appendChild(pointsWon);
                                promptBox.appendChild(BURNINGGATESOFHELL);

                                sacrificeIcon.style.display = `none`
                                // its not appended yet, therefore itll say its not known
                                document.getElementById("winnerIcon").style.display = `none`
                                pointsWon.style.display = `none`
                                winnerName.style.display = `none`
                                //boom

                                sleep(2000).then(() => {
                                    document.getElementById("winnerIcon").style.display = ``;
                                    document.getElementById("winnerIcon").classList.add("show");
                                });
                                sleep(2500).then(() => {
                                    winnerName.style.display = ``;
                                    winnerName.classList.add("show");
                                });
                                sleep(3500).then(() => {
                                    pointsWon.style.display = ``;
                                    pointsWon.classList.add("show");
                                });
                                // more readable for when you pull your hair out trying to debug the simple issue of having to id everything for god knows whatever reason
                                sleep(5000).then(() => { 
                                    document.getElementById("sacrificeIcon").style.display = ``;
                                    document.getElementById("sacrificeIcon").classList.add("revealSacrifice");
                                    document.getElementById("sacrificeIcon").style.animationName = "revealSacrifice"
                                });
                                sleep(5000).then(() => {
                                    winnerName.innerText = `and ${data.second.username}`
                                });
                                sleep(5000).then(() => { 
                                    pointsWon.innerText = `in 2nd place with ${data.second.points} points` 
                                });

                                sleep(7000).then(()=>{ 
                                    pointsWon.style.display = `none`;
                                    winnerName.style.display = `none`;
                                    document.getElementById("sacrificeIcon").style.animationName = `hideSacrifice`;
                                    BURNINGGATESOFHELL.classList.add(`showgates`)
                                });
                    
                                sleep(8200).then(()=> { 
                                    document.getElementById("winnerIcon").classList.remove("show");
                                    document.getElementById("winnerIcon").classList.add("thrown2hell") 
                                })

                                sleep(9000).then(()=> {
                                    BURNINGGATESOFHELL.classList.remove(`showgates`)
                                })

                                /*

                                */
                                
                                setTimeout(() => {
                                    promptBox.classList.add("show")
                                }, 50)
                                setTimeout(function() {
                                    changeTrack(6)
                                    playAudio('/assets/sounds/win.mp3')
                                    console.debug("gameend", data)
                                    promptBox.innerHTML = "";
                                    const h3Win = document.createElement("h3");
                                    const h3Sac = document.createElement("h3");
                                    h3Win.innerText = `Winner - ${data.winner.username}`;
                                    h3Sac.innerText = `Won with ${data.winner.points} points.`;
        
                                    const featuredMarquee = document.createElement("div") // for now
                                    featuredMarquee.classList.add("marquee")
        
                                    const finalsWrapDiv = document.createElement("div");
                                    const finalsDiv = document.createElement("div");
        
                                    finalsDiv.classList.add("finals");
        
                                    promptBox.appendChild(finalsDiv)
        
                                    featuredMarquee.appendChild(finalsDiv)
        
                                    featuredPosts.forEach(data => {
                                        const resultDiv = createTopic(data.submission, false, data.roundname);
                                        // probably wont be xss, hahaha!
                                        resultDiv.innerHTML += `<div class="finals-results"><span>${data.voteCount} votes</span></div>`
                                        finalsDiv.appendChild(resultDiv)
                                    })
        
                                    promptBox.appendChild(h3Win)
                                    promptBox.appendChild(h3Sac)
                                    promptBox.appendChild(featuredMarquee)
                                    roomData.started = false;
                                    if (roomData.isHost) {
                                        const startBtn = document.createElement("button");
                                        startBtn.innerText = "Restart";
                                        startBtn.onclick = function() {
                                            //if (roomData.users.length < 3) return createPopup("You need 3 players to start the game!")
                                            socket.emit("roomEvent", {
                                                event: "start"
                                            })
                                            roomData.started = true;
                                        }
                                        promptBox.appendChild(startBtn);
                                        // do some "restart" button here
                                    }
                                }, 11000)
                            })
                        }, 1500)
                        /*
                        const gates = document.getElementById('burninggatesofhell')
                        const winnerIcon = document.getElementById('winnericon')
                        const winnerName = document.getElementById('winnerName')
                        const sacrificeIcon = document.getElementById('sacrificeIcon')
                        const pointsWon = document.getElementById('wonPoints')
                        const winnerTitle = document.getElementById("winnerTitle")

                        sacrificeIcon.style.display = `none`
                        winnerIcon.style.display = `none`
                        pointsWon.style.display = `none`
                        winnerName.style.display = `none`

                        promptBox.classList.add("show")

                        sleep(2000).then(() => { winnerIcon.style.display = ``;winnerIcon.classList.add("show");winnerTitle.style.display = `none`});
                        sleep(2500).then(() => { winnerName.style.display = ``;winnerName.classList.add("show"); })

                        sleep(3500).then(() => { pointsWon.style.display = ``;pointsWon.classList.add("show");pointsWon.innerHTML = `with 4000 points` })

                        sleep(5000).then(() => { sacrificeIcon.style.display = ``;sacrificeIcon.style.animationName = `revealSacrifice` })
                        sleep(5000).then(() => { winnerName.innerHTML  = `and <b>Jeremy</b>` })
                        sleep(5000).then(() => { pointsWon.innerHTML  = `sacrificing for 200 points` })

                        sleep(7000).then(()=>{ pointsWon.style.display = `none`;winnerName.style.display = `none`;sacrificeIcon.style.animationName = `hideSacrifice`;gates.classList.add(`showgates`) })
                    
                        sleep(8200).then(()=> { winnerIcon.classList.remove("show");winnerIcon.classList.add("thrown2hell") })

                        sleep(9000).then(()=> {gates.classList.remove(`showgates`)})*/

                        /*

 <h1 id="winnerTitle">And the winner is...</h1>
                        <div class="winnerReveal">
                            <div>
                                <div id="winnericon" class="usericon winnericon">
                                    <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_neck_base.gif');"></div>
                                    <div class="outline" style="background-image: url('../assets/icons/bases/triangle_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_triangle_base.gif');"></div>
        
                                    <div class="outline" style="background-image: url('../assets/icons/faces/mouth/smile.gif');"></div>
                                    <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/bucket_hat.gif');"></div>
                                </div>
                            </div>
                            <div>
                                <div id="sacrificeIcon" class="usericon winnericon sacrifice revealSacrifice">
                                    <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_neck_base.gif');"></div>
                                    <div class="outline" style="background-image: url('../assets/icons/bases/triangle_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_triangle_base.gif');"></div>
        
                                    <div class="outline" style="background-image: url('../assets/icons/faces/mouth/smile.gif');"></div>
                                    <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/bucket_hat.gif');"></div>
                                </div>
                            </div>
                            
                        </div>
                        <h2 id="winnerName">Oswald!</h2>
                        <h3 id="wonPoints" class="show">with 3000 points</h3>

                        <img id="burninggatesofhell" class="burninggatesofhell" src="../assets/fire.gif" alt="">
                        */
                       /*
                       // FIX SOFT LOCK
                        setTimeout(function() {
                            playAudio('/assets/sounds/win.mp3')
                            console.debug("gameend", data)
                            promptBox.innerHTML = "";
                            const h3Win = document.createElement("h3");
                            const h3Sac = document.createElement("h3");
                            h3Win.innerText = `Winner - ${data.username}`;
                            h3Sac.innerText = `Won with ${data.points} points.`;

                            const featuredMarquee = document.createElement("div") // for now
                            featuredMarquee.classList.add("marquee")

                            const finalsWrapDiv = document.createElement("div");
                            const finalsDiv = document.createElement("div");

                            finalsDiv.classList.add("finals");

                            promptBox.appendChild(finalsDiv)

                            featuredMarquee.appendChild(finalsDiv)

                            featuredPosts.forEach(data => {
                                const resultDiv = createTopic(data.submission, false, data.roundname);
                                // probably wont be xss, hahaha!
                                resultDiv.innerHTML += `<div class="finals-results"><span>${data.voteCount} votes</span></div>`
                                finalsDiv.appendChild(resultDiv)
                            })

                            promptBox.appendChild(h3Win)
                            promptBox.appendChild(h3Sac)
                            promptBox.appendChild(featuredMarquee)
                            roomData.started = false;
                            if (roomData.isHost) {
                                const startBtn = document.createElement("button");
                                startBtn.innerText = "Restart";
                                startBtn.onclick = function() {
                                    //if (roomData.users.length < 3) return createPopup("You need 3 players to start the game!")
                                    socket.emit("roomEvent", {
                                        event: "start"
                                    })
                                    roomData.started = true;
                                }
                                promptBox.appendChild(startBtn);
                                // do some "restart" button here
                            }
                        }, 1500)
                        */
                    }, 1000)
                    break;
            }
        })
        socket.on('join', (data) => {
            if (!roomData.users.find(user => user.name == data.username)) {
                roomData.users.push({ name: data.username, points: 0, idHash: data.idHash})
            }
            if (data.username == localStorage.getItem("username") && roomData.isHost) return;
            console.debug(data)
            if (data.host) {
                userList.appendChild(createUser(data.username, 0, data.host, data.idHash, data.equipped))
            } else {
                userList.appendChild(createUser(data.username, 0, false, data.idHash, data.equipped))
            }
        })
        socket.on('addme', (data) => {
            console.debug("add me", data)
            if (data.name == localStorage.getItem("username") && roomData.isHost) {
                userList.appendChild(createUser(localStorage.getItem("username"), data.points, true, data.idHash, data.equipped))
            }
            if (!roomData.users.find(user => user.name == data.name)) {
                roomData.users.push({ name: data.name, points: data.points, idHash: data.idHash, equipped: data.equipped })
            } else if (roomData.users.length == 1) {
                roomData.users = [{ name: data.name, points: data.points, idHash: data.idHash, equipped: data.equipped }]
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
} else {
    if (root) {
        root.innerText = "Page not found."
    }
}
/*
⠀⠶⣶⣶⣶⠶⠰⣶⣶⣶⡶⠀⠀⢶⡶⠆⠀⠀⢰⣆⠀⠀⠀⠀⢶⣶⣶⣦⡀⠀⠀⠴⣦⣶⢶⣤⣶⣤⣤⣤⣴⣶⣴⡶⣶⣤⣤⣴⠦⢶⣤⡄⠴⣦⣤⣤⡤⣤⣤⣤⡀⠀⠀
⠀⠀⢹⣿⣿⡆⠀⠘⣿⣿⣧⠀⠀⣼⠁⠀⠀⢰⣿⣿⡆⠀⠀⠀⠀⢹⣿⣿⣿⡀⠀⠀⢿⠇⢸⠋⠀⢸⣿⣿⡇⠀⢹⡇⢸⣿⣿⡇⠀⠀⢹⡇⠀⣿⣿⣿⠀⠈⢿⣿⣿⡄⠀
⠀⠀⠘⣿⣿⣷⠀⣼⣿⣿⣿⡀⢠⡟⠀⠀⠀⣼⣿⣿⣧⠀⠀⠀⠀⣼⠹⣿⣿⣿⡄⠀⢹⠀⠈⠁⠀⢸⣿⣿⡇⠀⠀⠀⢸⣿⣿⡇⢀⡇⠈⠁⠀⢸⣿⣿⠀⠀⢸⣿⣿⣿⡀
⠀⠀⠀⢹⣿⣿⡄⣿⢸⣿⣿⣧⣾⠁⠀⠀⢰⡟⢹⣿⣿⡇⠀⠀⠀⣿⠀⠘⣿⣿⣿⣄⢸⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⢸⣿⣿⣧⣼⡇⠀⠀⠀⣸⣿⣿⠀⠀⢸⣿⣿⣿⡇
⠀⠀⠀⠘⣿⣿⣿⡇⠀⣿⣿⣿⡏⠀⠀⠀⣸⣧⣤⣿⣿⣿⡀⠀⠀⣿⠀⠀⠈⢿⣿⣿⣼⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⢸⣿⣿⡇⠸⡇⠀⠀⠀⣿⣿⣿⠀⠀⢸⣿⣿⣿⠃
⠀⠀⠀⠀⢻⣿⣿⠀⠀⢹⣿⣿⠁⠀⠀⢠⡏⠀⠈⠹⣿⣿⣇⠀⠀⣿⠀⠀⠀⠈⢿⣿⣿⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⢸⣿⣿⡇⠀⠃⠀⣾⠀⣿⣿⣿⠀⠀⢸⣿⣿⡏⠀
⠀⠀⠀⠀⠘⣿⡏⠀⠀⠈⣿⡏⠀⠀⢀⣾⣇⠀⠀⢀⣻⣿⣿⡄⣀⣿⣄⠀⠀⠀⠈⢿⣿⠀⠀⠀⢀⣼⣿⣿⣇⡀⠀⢀⣸⣿⣿⣇⣀⣠⣾⡿⣀⣿⣿⣿⣄⣰⣿⡿⠋⠀⠀
⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠉⠀⠀⠀⠈⠉⠉⠁⠀⠈⠉⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠉⠀⠀⠀⠈⠉⠉⠉⠉⠁⠀⠈⠉⠉⠉⠉⠉⠉⠉⠁⠉⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡔⠒⠒⠒⠒⠒⠒⠒⠒⠂⠐⣶⣶⣒⠶⣖⠖⠒⢐⠖⣒⣐⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⡖⠒⠒⡲⠶⠖⠐⡲⠂⠒⠒⠲⣒⠒⣒⠖⠒⡖⠒⠒⠒⢶⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠇⠀⠀⠀⠀⢀⣴⣦⣤⣤⣾⣿⡇⠑⢄⠀⠀⢠⡇⠘⢓⠜⢀⡠⠄⠒⣉⠭⠭⢩⣵⣒⠳⠤⣄⡑⠂⠀⠒⠁⠀⠀⠀⠀⠀⠀⠀⠀⠚⠁⠀⠀⠀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⢸⣟⠛⢟⣯⠿⣿⠁⠀⠀⠑⢄⠀⠉⢉⡥⠚⠁⠀⠠⠔⠒⠂⢠⣤⣄⣀⠈⠉⠑⠊⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠣⡀⠀⠀⠀⠈⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡷⠠⣄⠀⠀⠀⢳⠙⢤⡀⠀⡆⠀⠀⠀⠀⢀⣱⠎⠁⠀⠀⠀⠔⠚⠂⠚⠛⠒⠒⠒⠠⡉⠉⠉⠲⡀⢹⣆⠀⠀⠀⠀⢀⠤⠄⠤⣄⠀⠈⠳⡄⠀⢠⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠇⠀⠈⠢⠤⠖⠁⠀⡞⠉⠲⣅⠀⠀⠀⠀⠘⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠈⠓⢄⡀⠘⢆⠙⢧⡀⠀⢰⠁⠀⣀⠀⠀⠙⡄⠀⢸⠀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⢣⠀⠀⠈⠱⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⡖⠘⠛⠻⣁⣲⣤⣄⣀⠀⠈⢗⣲⣱⢼⡽⠀⠸⡄⠀⠉⡇⠀⠀⢹⣀⠞⠀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⢱⠀⢀⠠⠜⠑⡤⣀⣀⣀⡠⠴⠒⣩⠽⠟⢧⠄⠢⠀⠙⠻⢋⡉⠉⡙⢗⠶⣟⠿⣽⡇⠀⣠⠈⠀⠈⠀⠀⠀⡼⣁⢀⡀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⣀⠤⠖⠉⡔⠁⣐⢢⢸⠓⠲⢿⣿⡊⠀⠀⠀⠀⣀⣈⡀⠀⠀⠀⣀⣀⡉⠉⠻⠉⠛⠉⢀⠀⢇⣠⠃⠀⠀⢀⠴⠶⠩⠞⠁⠀⠉⣺⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⡆⠀⠀⣠⠋⠀⠀⠀⠀⠙⠤⠤⠎⡄⠀⢸⠢⢭⡥⠤⠒⠂⠉⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠒⠲⢶⢶⣹⡀⠀⠈⡆⠀⠀⠘⠀⠀⠀⠀⢀⡔⢋⣽⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⠹⡀⠀⢻⡀⠀⠀⠀⠀⠀⡰⣒⠢⡇⠀⠨⠌⣍⠁⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⠀⠀⠀⢀⣠⢞⠁⣧⣀⡀⣧⠒⠑⢢⠀⠀⠀⠀⢞⠀⡏⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⠀⣷⡀⠀⠙⠢⠤⣀⡀⢸⣱⠋⠇⡇⠀⠀⠀⣌⣓⣠⣤⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡉⠁⠀⡏⣿⠋⡇⡜⠙⡄⢧⠀⠀⠀⠈⣆⠀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⠀⠸⠳⡔⠒⠒⠠⢤⣀⠙⠏⠟⣧⣇⠀⢸⠀⣤⢴⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠓⢸⠇⡏⠸⠁⣷⢾⠇⣸⠀⠀⠀⢀⣿⠀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⠀⠀⠀⠙⣄⠀⠀⠈⢿⣷⣜⢞⢧⡘⡄⠈⢧⣤⣼⣿⣿⣿⣿⢝⡵⠟⢻⡯⣻⠝⡫⣽⠿⣿⣿⣿⣷⡾⠀⢠⣇⠤⢋⡼⢠⠃⡤⠒⡪⠝⠁⠀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡏⠀⠀⠀⠀⢯⢆⠀⠀⠀⠋⣿⠎⠑⠭⢹⡄⠘⣿⣿⡿⠛⢋⠤⠚⠉⠉⠉⠉⠉⠉⠑⠳⢍⡀⠙⢿⣿⠃⢠⡞⢒⣊⠡⠖⠁⠀⣷⠋⠀⠀⠀⠀⢨⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⢸⣆⠀⠀⠀⠘⢸⠢⡀⠀⠘⢄⠈⠻⣧⣖⡁⠤⠤⠔⠒⠒⠒⠒⢤⠤⠄⣀⠉⢲⡜⠁⡰⠃⠉⡡⠤⣤⠴⠒⠒⠁⠀⠀⠀⠀⣰⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡄⠀⠀⠀⠀⡀⠈⠸⠀⠀⠀⠀⢸⠀⢰⠀⠀⠈⠳⣤⡾⣷⣤⣀⡀⠀⠀⠀⠀⠀⠀⠉⣂⡠⠝⢉⡠⠊⣁⡠⢎⠔⠉⠀⠀⠀⠀⢀⣀⣴⣤⡺⠿⢻⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⣇⢳⠀⠀⡇⠀⠀⠀⡀⠀⢸⠀⠀⠀⠀⠘⣯⣾⣿⣏⣈⠉⠉⠁⠀⠈⠉⣉⣀⡤⠒⡿⠉⠉⠁⡔⠁⠀⠀⠀⢠⣿⢫⣿⣻⣟⠱⠲⢄⣸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⢩⢸⠀⠀⠃⠀⠀⠀⠀⢀⣮⠀⠀⢀⣠⢤⡷⢔⢽⣻⠹⣟⡿⢛⣋⡭⡟⣻⠥⣗⡻⠁⠀⠀⡜⠀⠀⠀⠀⢠⣿⣿⡿⠋⠁⠒⠋⠉⠄⢹⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⠀⡏⡸⢀⡞⠀⠀⠀⠀⢀⡎⠘⢤⠔⠁⢀⣰⠁⠀⠑⣄⠀⠂⡗⢋⠇⢺⣭⡟⠺⣷⠋⠙⢢⠐⡇⠀⠀⠀⢀⢯⠻⠃⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡇⠀⠀⡼⣠⢃⠞⠀⠀⠀⠀⠐⠃⢱⡰⠃⢀⡴⠫⠏⠀⠀⠀⠈⠳⣄⠀⠀⠉⠉⣠⠔⠊⢹⠢⡀⠀⠁⡇⠀⠀⠀⢸⡞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠓⠒⠚⠚⠓⠓⠒⠒⠂⠀⠐⠒⠒⠚⠒⠒⠚⠒⠒⠒⠂⠀⠒⠒⠒⠒⠛⠓⠚⠓⠒⠒⠒⠚⠒⠛⠒⠒⠚⠒⠒⠒⠒⠓⠒⠒⠒⠒⠒⠒⠒⠒⠒⠚⠀⠀⠀⠀
⠀⢀⣀⡀⠀⣤⢤⣄⠀⢤⡤⢤⡀⠀⢠⡄⠀⠰⣶⣤⡄⠀⠀⠀⠀⠀⣠⣶⣦⠀⢰⡤⣤⠀⠀⠀⠀⠀⠀⢰⣆⠀⠀⢶⡦⠀⠀⠰⣶⠄⠀⢶⡶⢶⠆⢶⡶⢶⡀⣠⣤⡀⠀
⠀⣿⣻⣇⠀⣿⠀⢻⡆⢸⡷⣞⠁⢀⣿⣿⡄⠀⣿⠈⣿⠀⠀⠀⠀⠸⣿⠀⣿⡆⢸⣷⣾⠀⠀⠀⠀⠀⠀⣼⣿⡄⠀⢸⡇⠀⠀⠀⣿⠀⠀⠈⣿⡟⠀⢸⡷⡟⠁⠿⢏⡷⠀
⠀⠸⣏⠁⠀⠿⠤⠿⠁⠼⠧⠴⠃⠾⠧⠽⠷⠠⠿⠶⠏⠀⠀⠀⠀⠀⠻⠶⠿⠀⠼⠷⠿⠆⠀⠀⠀⠀⠸⠧⠸⠷⠀⠾⠧⠾⠀⠠⠿⠄⠀⠀⠹⠁⠀⠼⠷⠶⠃⢀⣼⠃⠀
⠀⠀⢻⡇⠀⠀⣤⣤⠀⢀⣤⡄⣠⣶⡄⢤⣤⠠⣤⣤⣤⡄⣤⣤⣤⣤⣤⣤⣤⠄⣤⡄⢠⣤⣤⡀⠀⠀⠠⣤⣴⠀⣤⣤⠤⣤⢤⣤⣤⣤⣤⣤⣤⣤⡄⢤⣴⠀⠀⣾⠇⠀⠀
⠀⠀⢸⣿⠀⠀⢸⣿⠀⣿⣿⣰⡟⠙⣿⣼⣿⡇⢹⢰⣿⢀⡾⠁⣿⣇⣹⠘⣿⢀⡿⠀⠀⣿⠉⣿⡄⠀⠀⢸⡇⠀⢸⡇⠀⡇⢸⣿⢘⡇⣿⢈⣇⢿⡆⣸⠇⠀⢸⡏⣀⡀⠀
⠀⢠⣼⣿⠀⠀⢸⣿⡆⣿⣿⣿⠁⠀⣿⣿⣿⣷⣼⢸⣿⣾⠃⠀⣿⣿⡏⠀⣿⣾⠁⣤⠀⣿⠀⢹⡇⣤⡄⢸⡇⠀⢸⡇⢸⡇⢸⣿⣿⠩⣿⣾⠉⠸⣷⡿⠀⠀⠸⣧⣿⠇⠀
⠀⢈⣛⠁⠀⠀⢸⢸⣿⢿⣿⣿⠀⠀⣿⣿⡇⢿⣿⢸⣿⣿⡆⠀⣿⣿⡇⠀⢸⣿⠀⠛⠀⣿⠀⣸⡇⠘⠁⣿⡇⢀⣸⡇⢸⡇⢸⣿⣿⢸⣿⣿⠀⠀⣿⠇⠀⠀⠀⣠⣤⡀⠀
⠀⠿⢹⡇⠀⠀⣼⢸⣿⢸⣿⢹⣇⢀⣿⢿⡇⠸⣿⢸⣿⢻⣧⠀⣿⡟⣻⠁⢸⣿⠀⠀⠀⣿⠀⣿⠃⠀⠀⣿⡇⢸⣿⡇⢸⡇⢸⣿⠛⢸⣿⠙⠀⠀⣿⠀⠀⠀⢰⡟⠿⠃⠀
⠀⠀⠘⡿⠀⠀⣿⠆⠟⠾⠿⠄⠻⠿⠏⢼⡧⠀⠿⠸⠿⠼⠿⠦⠿⠿⠿⠀⠼⠿⠀⠀⠠⠿⠿⠃⠀⠀⠠⠿⠷⠿⠟⠿⠿⠃⠾⠿⠀⠼⠿⠄⠀⠠⠿⠦⠀⠀⢸⡇⠀⠀⠀
⠀⠀⢸⡧⠀⢀⠀⣶⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣷⡀⠀⠀
⠀⢀⣾⠃⠀⠘⢷⣿⣶⡄⠴⢶⠀⠀⠀⡴⠲⡄⢀⡴⠲⡄⢀⡖⢦⡀⠀⠀⣠⠖⢦⠀⡴⠲⣄⠀⡴⠲⣄⠀⠀⢀⡴⠲⡄⢀⡶⠲⡄⢀⠶⠦⡀⠀⠀⠀⠀⠀⠀⠸⣧⠀⠀
⠀⣼⠇⠀⠀⣤⣸⣿⣿⡇⢬⡽⢤⡄⠀⠳⠴⠃⠘⠧⡤⠇⠘⠦⠼⠃⢴⡄⠻⢤⠜⠀⠷⡠⠞⠀⠷⣤⠏⠠⣦⠈⠧⠤⠇⠘⠷⠴⠃⠘⢆⡴⠃⠈⠉⠉⠁⠀⠀⣴⣿⠀⠀
⢰⡏⠀⠀⠀⠈⠹⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⡀⡀⠀⠀⢀⠀⠀⠀⡀⢀⡀⠀⣀⣀⣀⣙⠛⠀⠀
⢸⡇⡀⠀⠀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣠⣀⣄⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⣿⣷⢸⣿⠁⣺⣇⠈⣿⢻⣧⣿⡏⣿⣷⣹⠉⣿⣽⠃⠀⠀
⢸⣟⢻⡆⠀⠶⠶⢶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠾⠶⠾⢶⠾⠶⠀⠀⠀⠀⠀⠀⠀⠀⢹⢿⡯⣿⢠⡿⣿⡀⣿⣿⡅⣿⡇⣿⠹⣿⠀⣿⠻⡄⠀⠀
⠀⠛⠛⠃⠀⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠚⠙⠛⠚⠃⠛⠛⠛⠘⠛⠛⠓⠛⠀⠙⠘⠛⠛⠃⠀⠀
⠀⣶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠉⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
*/
