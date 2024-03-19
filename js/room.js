let socket = null;
const promptBox = document.getElementById("promptBox");
const timer = document.getElementById("timer")
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

function setIcon(hash, className) {
    const getIcon = document.getElementById(`user-icon-${hash}`);
    if (getIcon) {
        getIcon.classList.remove("fa-user");
        getIcon.classList.remove("fa-circle-check")
        getIcon.classList.remove("fa-hourglass-half");
        getIcon.classList.add(className);
    }
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
    userDiv.innerHTML += `<div class="state"><i id="user-icon-${hash}" class="fa-solid fa-user"></i></div>`
    const usernameSpan = document.createElement("span");
    usernameSpan.innerText = username;
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
const root = document.getElementById("root");
if (roomID) {
    root.innerHTML = `
<span onclick="leaveGame()" class="leavebtn"><i class="fa-solid fa-right-to-bracket"></i></span>
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
                <span class="timer"><i class="fa-solid fa-clock"></i> <span id="timer">Waiting...</span></span>
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
        </div>
    </main>
`
    document.title = `${roomID} - Survive The Neffinet`
    const userList = document.getElementById("lobbyList");
    if (userList) {
        if (localStorage.getItem("tempData") != null && localStorage.getItem("host") == null) {
            const tempData = JSON.parse(localStorage.getItem("tempData"));
            localStorage.removeItem("tempData");
            roomData.users = tempData.users
            roomData.host = tempData.host;
            tempData.users.forEach(user => {
                if (user.name != localStorage.getItem("username")) userList.appendChild(createUser(user.name, user.points, tempData.host == user.name, user.idHash))
            })
        } else {
            if (localStorage.getItem("host") != null) {
                //userList.appendChild(createUser(localStorage.getItem("username"), 0, true, "me"))
            }
        }
    }
    socket = io.connect(URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
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
    socket.on('roomState', (data) => {
        roomData.started = data.started;
        if (!roomData.started) {
            if (roomData.isHost) {
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
            timer.innerText = "Waiting..."
        }
    })

    let timers;
    let countdown = 60;
    function handleRound(topic, round, player, resp) { // last 2 are for round 2
        roomData.users.forEach(user => {
            setIcon(user.idHash, "fa-hourglass-half");
        })
        clearTimeout(timers)
        countdown = 60;
        timer.innerText = "60s left"
        if (topic == "IMAGE") {
            countdown = 120
            timer.innerText = "120s left"
        }
        timers = setInterval(() => {
            countdown--;
            timer.innerText = `${countdown}s left`
            if (countdown < 0) clearTimeout(timers);
        }, 1000)
        promptBox.classList.remove("show")
        if (round == 1) {
            if (roomData.roundName == "IMAGE") {
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
                submitBtn.onclick = function() {
                    if (!inputDesc.value.length) return;
                    hiddenUploading.innerText = "Uploading..."
                    // something with input yada yada
                    const input = document.getElementById("photo");
                    if (input.files && input.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const imageData = event.target.result;
                            axios.post(`${URL}/upload?roomID=${roomData.id}`, {
                                file: imageData,
                                ext: input.files[0].type,
                                username: localStorage.getItem("username")
                            }).then(() => {
                                hiddenUploading.innerText = "Uploaded!"
                                roomData.waiting = true;
                                socket.emit("topicFinish", inputDesc.value);
                            }).catch(error => {
                                hiddenUploading.innerText = "Error, please check console for info."
                                console.error('There was a problem with the upload:', error);
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
        switch (data.event) {
            case "start":
                roomData.waiting = false;
                roomData.users.forEach(user => {
                    const points = document.getElementById(`user-points-${user.idHash}`)
                    if (points) {
                        points.innerText = "0"
                    }
                })
                roomData.started = true;
                timer.innerText = "Starting...";
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
                <h2 class="round-topic">${roomData.roundName}</h2>
                `
                document.getElementById("roundnameth").innerText = `- GAME (${roomData.roundName}) -`
                setTimeout(() => {
                    promptBox.classList.add("show")
                }, 50)
                setTimeout(function() {
                    setTimeout(function() {
                        timer.innerText = "3..."
                    }, 1000)
                    setTimeout(function() {
                        timer.innerText = "2..."
                    }, 2000)
                    setTimeout(function() {
                        timer.innerText = "1..."
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
                    case "IMAGE":
                        handleRound("The perfect accompanying caption would be...", 2, data.user, data.prompt)
                        break;
                }
                break;
            case "results":
                clearTimeout(timers)
                roomData.users.forEach(user => {
                    setIcon(user.idHash, "fa-user");
                })
                promptBox.innerHTML = "<h3>Now for the results!</h3>";
                timer.innerText = "Waiting...";
                function createTopic(submission, animate) {
                    const resultDiv = document.createElement("div");
                    resultDiv.classList.add("result", "news");
                    switch (roomData.roundName) {
                        case "NEWS": {
                            resultDiv.innerHTML = `<span class="header"><i class="fa-solid fa-newspaper"></i>TOP NEWS TODAY</span>`
                            const titleDiv = document.createElement("div");
                            titleDiv.classList.add("title");
                            const titleSpan = document.createElement("span");
                            titleSpan.innerText = submission.desc;
                            titleDiv.appendChild(titleSpan);
                            setTimeout(() => {
                                if (animate) titleDiv.classList.add("response-animate");
                            }, 51)
                            
                            const messageDiv = document.createElement("div");
                            messageDiv.classList.add("message");
                            const usernameSpan = document.createElement("span");
                            usernameSpan.classList.add("username");
                            usernameSpan.innerText = submission.username
                            const contentSpan = document.createElement("span");
                            contentSpan.classList.add("contents");
                            contentSpan.innerText = submission.title;
                            messageDiv.appendChild(usernameSpan);
                            messageDiv.appendChild(document.createElement("br"));
                            messageDiv.appendChild(contentSpan);
                            resultDiv.appendChild(titleDiv);
                            resultDiv.appendChild(messageDiv);
                            break;
                        }
                        case "RATINGS": {
                            resultDiv.innerHTML = `<span class="header"><i class="fa-solid fa-star-half-stroke"></i>RATINGS</span>`
                            const titleDiv = document.createElement("div");
                            titleDiv.classList.add("title");
                            const usernameSpan = document.createElement("span");
                            usernameSpan.classList.add("username");
                            usernameSpan.innerText = submission.username
                            titleDiv.appendChild(usernameSpan);
                            titleDiv.appendChild(document.createElement("br"));
                            titleDiv.innerHTML += `<span class="opinion">Recommends</span><br>`
                            const recommendSpan = document.createElement("span");
                            recommendSpan.classList.add("recommendation");
                            recommendSpan.innerText = submission.desc //submission.desc
                            titleDiv.appendChild(recommendSpan);
                            
                            const messageDiv = document.createElement("div");
                            messageDiv.classList.add("message");
                            const contentSpan = document.createElement("span");
                            contentSpan.classList.add("contents");
                            contentSpan.innerText = `"${submission.title}"`;
                            messageDiv.appendChild(contentSpan);
                            setTimeout(() => {
                                if (animate) messageDiv.classList.add("response-animate");
                            }, 51)
                            resultDiv.appendChild(titleDiv);
                            resultDiv.appendChild(messageDiv);
                            break;
                        }
                        case "TRAVELLING": {
                            resultDiv.innerHTML = `<span class="header"><i class="fa-solid fa-location-dot"></i>HOT TOURIST LOCATIONS</span>`
                            const titleDiv = document.createElement("div");
                            titleDiv.classList.add("title");
                            const usernameSpan = document.createElement("span");
                            usernameSpan.classList.add("username");
                            usernameSpan.innerText = submission.username
                            titleDiv.appendChild(usernameSpan);
                            titleDiv.appendChild(document.createElement("br"));
                            const opinionSpan = document.createElement("span");
                            opinionSpan.classList.add("opinion");
                            opinionSpan.innerText = submission.title
                            titleDiv.appendChild(opinionSpan);
                            
                            const messageDiv = document.createElement("span");
                            messageDiv.classList.add("place");
                            messageDiv.innerHTML = `<i class="fa-solid fa-location-dot"></i>`
                            const contentSpan = document.createElement("span");
                            contentSpan.innerText = submission.desc;
                            messageDiv.appendChild(contentSpan);
                            setTimeout(() => {
                                if (animate) messageDiv.classList.add("response-animate");
                            }, 51)
                            resultDiv.appendChild(titleDiv);
                            resultDiv.appendChild(messageDiv);
                            break;
                        }
                        case "IMAGE": {
                            /*
                       <div class="result news">
                            <span class="header"><i class="fa-solid fa-image"></i>IMAGE SHOWCASE</span>
                            <div class="title">
                                <img src="../assets/RED SNAPO.jpeg" alt="">
                                <span class="username">Jeremiah</span><br>
                                <span class="opinion">It sucked there. Never again.</span>
                            </div>
                      </div>
                            */
                            resultDiv.innerHTML = `<span class="header"><i class="fa-solid fa-image"></i>IMAGE SHOWCASE</span>`
                            const titleDiv = document.createElement("div");
                            titleDiv.classList.add("title");
                            const img = document.createElement("img");
                            img.alt = "Image Loading...";
                            img.src = `${URL}/imgs/${roomData.id}/${submission.file}`
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
                    return resultDiv;
                }
                setTimeout(function() {
                    const submissions = data.submissions;
                    if (submissions) {
                        // submission forEach
                        for (let i = 0; i < submissions.length; i++) {
                            setTimeout(function() {
                                clearTimeout(timers)
                                countdown = 10;
                                timer.innerText = "10s left"
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
                            }, i * 10000)
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
                                    // fire
                                    // i know what yuou forgot
                                    // im tryna think how i can phrase this
                                    // all the results are wrapped under a "finals" div that's under the promptbox
                                    resultDiv.innerHTML = `<div class="tick"><i class="fa-solid fa-circle-check"></i></div>` + resultDiv.innerHTML
                                }
                                finalsWrapDiv.appendChild(resultDiv)
                            }
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
                                if (countdown < 0) clearTimeout(timers);
                            }, 1000)
                            if (roomData.isHost) {
                                socket.emit("roomEvent", {
                                    event: "votingtime"
                                })
                            }
                            setTimeout(function() {
                                timer.innerText = "Waiting..."
                                promptBox.innerHTML = ""
                            }, 30000)
                        }, submissions.length * 10000)
                    }
                }, 2000)
                break;
            case "waiting":
                //id="user-icon-${hash}"
                const usersNotWaiting = roomData.users.filter(user => data.users.find(use => use.username != user.name))
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
                promptBox.innerHTML = "<img class='loading-img' src='../assets/loop.gif'><h3>Waiting for other players...</h3>";
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
                    timer.innerText = "Waiting..."
                    promptBox.classList.remove("show")
                    promptBox.innerHTML = "<h3>The winner is...</h3>";
                    setTimeout(() => {
                        promptBox.classList.add("show")
                    }, 50)
                    setTimeout(function() {
                        console.debug("winneris", data)
                        if (data.noone) {
                            promptBox.innerHTML = "<h3>Nobody won, what.</h3>";
                        } else {
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
                setTimeout(function() {
                    document.getElementById("roundnameth").innerText = `- GAME -`
                    roomData.users.forEach(user => {
                        setIcon(user.idHash, "fa-user");
                    })
                    clearTimeout(timers)
                    timer.innerText = "Waiting..."
                    promptBox.classList.remove("show")
                    promptBox.innerHTML = "<h3>ROUND END!</h3>";
                    setTimeout(() => {
                        promptBox.classList.add("show")
                    }, 50)
                    setTimeout(function() {
                        console.debug("gameend", data)
                        promptBox.innerHTML = "";
                        const h3Win = document.createElement("h3");
                        const h3Sac = document.createElement("h3");
                        h3Win.innerText = `Winner - ${data.username}`;
                        h3Sac.innerText = `Won with ${data.points} points.`;
                        promptBox.appendChild(h3Win)
                        promptBox.appendChild(h3Sac)
                        roomData.started = false;
                        if (roomData.isHost) {
                            const startBtn = document.createElement("button");
                            startBtn.innerText = "Restart";
                            startBtn.onclick = function() {
                                //if (roomData.users.length < 3) return alert("You need 3 players to start the game!")
                                socket.emit("roomEvent", {
                                    event: "start"
                                })
                                roomData.started = true;
                            }
                            promptBox.appendChild(startBtn);
                            // do some "restart" button here
                        }
                    }, 1500)
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
            userList.appendChild(createUser(data.username, 0, data.host, data.idHash))
        } else {
            userList.appendChild(createUser(data.username, 0, false, data.idHash))
        }
    })
    socket.on('addme', (data) => {
        console.debug("add me", data)
        if (data.name == localStorage.getItem("username") && roomData.isHost) {
            userList.appendChild(createUser(localStorage.getItem("username"), data.points, true, data.idHash))
        }
        if (!roomData.users.find(user => user.name == data.name)) {
            roomData.users.push({ name: data.name, points: data.points, idHash: data.idHash })
        } else if (roomData.users.length == 1) {
            roomData.users = [{ name: data.name, points: data.points, idHash: data.idHash }]
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
} else {
    if (root) {
        root.innerText = "Page not found."
    }
}
