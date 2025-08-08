let apiURL = "https://neffbox.firee.dev"
console.log(window.location.host)
if (window.location.host.startsWith("localhost")) {
    apiURL = "http://localhost:3000"
}
const session = localStorage.getItem("osuliterallysucks"); // i completely forgot about this

const shapes = ["circle", "square", "triangle"]
const colours = {
    "caribbeangreen": "#00D084",
    "crimson": "#EB144C",
    "dodgerblue": "#2196F3",
    "orange": "#FF5722",
    "pizazz": "#FF9307",
    "purpleheart": "#673AB7",
    "redorange": "#FF3A3A",
    "white": "#fff"
}

let settings = localStorage.getItem("settings");
if (settings == null) {
    settings = {
        "theme": "light",
        "volume": 100,
        "version": 0
    }
    localStorage.setItem("settings", JSON.stringify(settings));

} else {
    settings = JSON.parse(settings);
}

function playAudio(url) {
    const audio = new Audio(url);
    //audio.volume = (settings && settings.value != undefined) ? settings.volume / 100 : 1
    audio.play();
}

function checkValid(type, value) {
    let isValid = true;
    if (type == "username") {
        if (value.length < 3) isValid = "Please enter in a username that is longer than 2 characters!";
        if (value.length > 10) isValid = "Please enter in a username that is less than than 10 characters!";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) isValid = "Usernames cannot contain any special characters! They can only contain letters, numbers, and an underscore.";
    }
    if (typeof isValid != "boolean") {
        createPopup(createErrorDiv(isValid))
        return false;
    }
    return true;
}
function createErrorDiv(text) {
    const errorDiv = document.createElement("div");
    const h1 = document.createElement("h1");
    const span = document.createElement("span")
    h1.innerText = "Error";
    span.innerText = text;
    errorDiv.appendChild(h1);
    errorDiv.appendChild(span);
    return errorDiv;
}

function catPopup(errorcode) {
    const img = document.createElement("img")
    img.src = `https://http.cat/${errorcode}`
    createPopup(img);
}

function updateSettings(update) {
    if (update) localStorage.setItem("settings", JSON.stringify(settings));
    switch (settings.theme) {
        case "light":
            document.body.className = "";
            break;
        case "dark":
            document.body.classList.add("dark")
            break;
        case "green":
            document.body.classList.add("dark")
            break;
    }
}
let currentSetting = 0;

// not done, need to do user and cosmetics
function showDebug() {
    if (localStorage.getItem("admin") == null) return;
    axios({
        url: `${apiURL}/admin`,
        method: "GET",
        headers: {
            "authorization": session
        },
        timeout: 5000
    }).then(res => {
        const adminDiv = document.createElement("div");
        adminDiv.innerHTML = `<h1>Admin / Debug</h1>`
        const nav = document.createElement("nav");
        const ul = document.createElement("ul");
        const statsItem = document.createElement("li");
        const userItem = document.createElement("li");
        const cosmeticsItem = document.createElement("li"); // only room host can see
        const devItem = document.createElement("li");
        statsItem.innerText = "STATS";
        userItem.innerText = "USER";
        cosmeticsItem.innerText = "COSMETICS";
        devItem.innerText = "DEV";
        const content = document.createElement("div");
        content.id = "settings-main";
        content.classList.add("settingsPanel");
        function changeAllHighlighted() {
            statsItem.classList.remove("highlighted")
            userItem.classList.remove("highlighted")
            cosmeticsItem.classList.remove("highlighted")
            devItem.classList.remove("highlighted")
        }

        function renderContent(id) {
            changeAllHighlighted();
            const content = document.getElementById("settings-main");
            content.innerHTML = "";
            // for now doing innerhtml
            switch (id) {
                case 0: { // stats
                    statsItem.classList.add("highlighted")
                    return axios({
                        url: `${apiURL}/admin/stats`,
                        method: "GET",
                        headers: {
                            "authorization": session
                        },
                        timeout: 5000
                    }).then(resp => {
                        const data = resp.data;
                        content.innerHTML = `<p><b>STATISTICS</b></p>`
                        const settingsTab = document.createElement("div");
                        settingsTab.classList.add("general-settings", "settingsTab");
                        settingsTab.innerHTML = `<span>users: ${data.users}</span><br>
                        <span>rooms: ${data.rooms}</span><br>
                        <span>cosmetics: ${data.cosmetics}</span><br>`
                        const refreshBtn = document.createElement("button");
                        refreshBtn.innerText = "refresh";
                        refreshBtn.onclick = function() {
                            renderContent(0)
                        }
                        settingsTab.appendChild(refreshBtn);
                        content.appendChild(settingsTab);
                    }).catch((e) => {
                        catPopup(e.response.status)
                    })
                }
                case 1: { // user
                    userItem.classList.add("highlighted")
                    const popDiv = document.createElement("div")
                    popDiv.innerHTML = `<h1>User</h1>
                    <p>enter in a username!</p><input type="text" name="username" id="popup-e77ec23e5a01055fca14c8ddcb655b2e" placeholder="username">`
                    const joinBtn = document.createElement("button");
                    joinBtn.innerText = "search";
                    let popup;
                    joinBtn.onclick = function() {
                        const roomPass = document.getElementById("popup-e77ec23e5a01055fca14c8ddcb655b2e")
                        axios({
                            url: `${apiURL}/user/${encodeURI(roomPass.value)}`,
                            method: "GET",
                            headers: {
                                "authorization": session
                            },
                            timeout: 5000
                        }).then(resp => {
                            popup.remove();
                            const data = resp.data;
                            const userID = data.id;
                            
                            content.innerHTML = `<p><b>USER</b></p>`
                            const accSettDiv = document.createElement("div");
                            accSettDiv.classList.add("general-settings", "settingsTab");
                            
                            const spanA = document.createElement("span")
                            spanA.innerHTML = `
                            <span>User ID: ${userID}</span><br>
                            <span>Points: ${data.points}</span><br>
                            <span>Wins: ${data.wins}</span><br>
                            <span>Rounds: ${data.rounds}</span><br>
                            <label for="username">username:</label>
                            <input type="text" name="username" placeholder="currentusername" id="admin-changeusername" maxlength="10">`
                            
                            const saveBtn = document.createElement("button");
                            saveBtn.innerText = "save"; //no idea what causes this lmfao
                            //we love html js
                            saveBtn.id = "asavebtnidbecausehtmljssucks"
            
                            spanA.appendChild(saveBtn);
                            accSettDiv.appendChild(spanA);
                            accSettDiv.appendChild(document.createElement("br"))
                            accSettDiv.appendChild(document.createElement("br"))
                            accSettDiv.innerHTML += `<span>- danger zone -</span><br>`

                            const changePasswd = document.createElement("button");
                            changePasswd.innerText = "change password"
                            changePasswd.onclick = function() { // this works
                                const registerDiv = document.createElement("div")
                                registerDiv.innerHTML = `<h1>Change password</h1>
                                <label for="password">new password:</label>
                                <input type="password" name="password" id="s-pwd">
                                <br>
                                <label for="confirmpassword">confirm new password:</label>
                                <input type="password" name="confirmpassword" id="s-cpwd">
                                <br>
                                <p style="font-size: 10px;">*make sure to save your password somewhere!</p>`
                                const registerButton = document.createElement("button");
                                registerButton.innerText = "CHANGE";
                                let popup;
                                registerButton.onclick = async function() {
                                    const password = document.getElementById('s-pwd').value;
                                    const confirmPass = document.getElementById('s-cpwd').value;
                                    if ([password.length,confirmPass.length].includes(0)) return createPopup(createErrorDiv("One of the values is not provided!"));
                                    if (password != confirmPass) return createPopup(createErrorDiv("Password and Confirm Password don't share the same value!"));
                                    try {
                                        await axios({
                                            url: `${apiURL}/admin/user/${userID}/password`,
                                            method: "POST",
                                            headers: {
                                                "authorization": session
                                            },
                                            data: {
                                                password
                                            },
                                            timeout: 5000
                                        });
                                        alert("Your password has been changed.")
                                    } catch (e) {
                                        console.error(e);
                                        if (e.response.data && e.response.data.length > 10 && e.response.status < 500) {
                                            createPopup(createErrorDiv(e.response.data))
                                        } else {
                                            catPopup(e.response.status)
                                        }
                                    } finally {
                                        popup.remove();
                                    }
                                }
                                registerDiv.appendChild(registerButton);
                                registerDiv.appendChild(document.createElement("br"));
                                registerDiv.appendChild(document.createElement("br"));
                                popup = createPopup(registerDiv);
                            }
            
                            const deleteAcc = document.createElement("button");
                            deleteAcc.innerText = "delete account"
                            deleteAcc.classList.add("important");
                            deleteAcc.onclick = function() {
                                const popupDiv = document.createElement("div");
                                popupDiv.innerHTML = "<h1>ARE YOU SURE?</h1>" //ARE YOU??? ARE YOU FIREE/????????????????????? i dunno, AM I
                                const yesBtn = document.createElement("button");
                                const noBtn = document.createElement("button");
                                yesBtn.innerText = "yes"
                                noBtn.innerText = "no"
                                let popup;
                                yesBtn.onclick = async function() {
                                    try {
                                        await axios({
                                            url: `${apiURL}/admin/user/${userID}/delete`,
                                            method: "POST",
                                            headers: {
                                                "authorization": session
                                            },
                                            timeout: 5000
                                        });
                                        localStorage.removeItem("osuliterallysucks")
                                        localStorage.removeItem("username")
                                        window.location.href = "/"
                                    } catch (e) {
                                        console.error(e);
                                        catPopup(e.response.status)
                                    } finally {
                                        popup.remove();
                                    }
                                }
                                noBtn.onclick = function() {
                                    popup.remove();
                                }
                                popupDiv.appendChild(yesBtn)
                                popupDiv.appendChild(noBtn)
                                popup = createPopup(popupDiv);
                                
                            }
                            accSettDiv.appendChild(changePasswd)
                            accSettDiv.appendChild(document.createElement("br"))
                            accSettDiv.appendChild(deleteAcc)
            
                            content.appendChild(accSettDiv);
                            // THIS WORKS THOUGH, WHYYY WHY DOES THIS WORK, SOMEWONE PLEASE EXPLAIN
                            document.getElementById("asavebtnidbecausehtmljssucks").onclick = async function() { // this was the thing
                                const username = document.getElementById("admin-changeusername").value;
                                if (!username.length) return createPopup(createErrorDiv("enter a username!"))
                                if (!checkValid("username", username)) return;
                                try {
                                    await axios({
                                        url: `${apiURL}/admin/user/${userID}/username`,
                                        method: "POST",
                                        headers: {
                                            "authorization": session
                                        },
                                        timeout: 5000
                                    });
                                    alert("Changed username!")
                                } catch (e) {
                                    console.error(e);
                                    createPopup(createErrorDiv(e.response.data))
                                }
                            }
                            document.getElementById("admin-changeusername").value = data.username

                        }).catch((e) => {
                            if (e.response.status == 404) return alert("user not found")
                            catPopup(e.response.status)
                        })
                    }
                    popDiv.appendChild(joinBtn);
                    popup = createPopup(popDiv);
                    break;
                }
                case 2: { // cosmetics
                    cosmeticsItem.classList.add("highlighted")
                    break;
                }
                case 3: { // dev
                    devItem.classList.add("highlighted")
                    content.innerHTML = `<p><b>DEV</b></p>`
                    function renderDev(name, uri, keepAppending) {
                        const popupDiv = document.createElement("div");
                        //chat jippity
                        function displayResult(data) {
                            const result = data.result;
                            const resultLog = document.getElementById("dev-resultLog");
                            if (!keepAppending) resultLog.innerHTML = ""; // Clear previous results
                
                            if (result.error) {
                                resultLog.textContent = result.error;
                            } else if (!data.select && uri == "sql") {
                                resultLog.textContent = JSON.stringify(result)
                            } else {
                                if (uri == "sql") {
                                    // Display the result in a table (assuming the result is an array of objects)
                                    const table = document.createElement("table");
                                    const headers = Object.keys(result[0]);
                                    const headerRow = document.createElement("tr");
                    
                                    headers.forEach(header => {
                                        const th = document.createElement("th");
                                        th.textContent = header;
                                        headerRow.appendChild(th);
                                    });
                    
                                    table.appendChild(headerRow);
                    
                                    result.forEach(row => {
                                        const rowElement = document.createElement("tr");
                                        headers.forEach(header => {
                                            const td = document.createElement("td");
                                            td.textContent = row[header];
                                            rowElement.appendChild(td);
                                        });
                                        table.appendChild(rowElement);
                                    });
                    
                                    resultLog.appendChild(table);
                                } else if (uri == "shell") {
                                    if (result.error) {
                                        resultLog.textContent = result.error;
                                    } else {
                                        const stdout = result.stdout;
                                        const stderr = result.stderr;
                        
                                        if (stderr) {
                                            resultLog.innerHTML = "Error: " + stderr.replace(/\n/g, "<br>");
                                        } else {
                                            resultLog.innerHTML = "Output: " + stdout.replace(/\n/g, "<br>");
                                        }
                                    }
                                } else if (uri == "eval") {
                                    const stdout = result;
                                    const stderr = data.error;
                    
                                    if (result.error) {
                                        resultLog.innerHTML = "Error: " + stderr.replace(/\n/g, "<br>");
                                    } else {
                                        resultLog.innerHTML = "Output: " + stdout.replace(/\n/g, "<br>");
                                    }
                                }
                            }
                        }
                        popupDiv.innerHTML = `<h1>${name}</h1>
                        <div id="dev-resultLog"></div>
                        <label for="query">Command:</label><br>
                        <textarea id="dev-query" name="query" rows="4" cols="50"></textarea><br>`
                        const sendBtn = document.createElement("button");
                        sendBtn.innerText = "send";
                        sendBtn.onclick = function() {
                            const query = document.getElementById("dev-query").value;

                            axios({
                                url: `${apiURL}/admin/dev/${uri}`,
                                method: "POST",
                                headers: {
                                    "authorization": session
                                },
                                data: {
                                    query
                                },
                                timeout: 5000
                            }).then(response => {
                                displayResult(response.data);
                            }).catch(e => {
                                alert("something went wrong, check console")
                                console.error(e);
                            })
                        }
                        popupDiv.appendChild(sendBtn);
                        createPopup(popupDiv);
                    }
                    const settingsTab = document.createElement("div");
                    settingsTab.classList.add("general-settings", "settingsTab");
                    const btn1 = document.createElement("button");
                    btn1.innerText = "eval";
                    btn1.onclick = function() {
                        renderDev("EVAL", "eval", false)
                    }
                    const btn2 = document.createElement("button");
                    btn2.innerText = "sql";
                    btn2.onclick = function() {
                        renderDev("SQL", "sql", false)
                    }
                    const btn3 = document.createElement("button");
                    btn3.innerText = "shell";
                    btn3.onclick = function() {
                        renderDev("SHELL", "shell", false)
                    }
                    settingsTab.appendChild(btn1);
                    settingsTab.appendChild(document.createElement("br"));
                    settingsTab.appendChild(btn2);
                    settingsTab.appendChild(document.createElement("br"));
                    settingsTab.appendChild(btn3);
                    content.appendChild(settingsTab);
                    break;
                }
                /*
                case 2: { // ROOM
                    axios({
                        url: `${apiURL}/rooms/${roomData.id}?IClaimHost=1`,
                        method: "GET",
                        headers: {
                            "authorization": session
                        },
    
                        timeout: 5000
                    }).then(res => {
                        const data = res.data
                        roomItem.classList.add("highlighted")
                        content.innerHTML = `<p><b>ROOM</b></p>`
                        const roomSettDiv = document.createElement("div");
                        roomSettDiv.classList.add("general-settings", "settingsTab");
                        roomSettDiv.innerHTML = `
                        <span>
                            <label for="visibility">visibility:</label>
                            <select name="visibility" id="roomVisibility" class="themes">
                                <option value="public" ${(data.visibility == "public") && "selected"}>public</option>
                                <option value="unlisted" ${(data.visibility == "unlisted") && "selected"}>unlisted</option>
                                <option value="private" ${(data.visibility == "private") && "selected"}>private</option>
                            </select>
                            <br>
                            <label for="roompass">room password:</label>
                            <input type="text" id="roompass" name="roompass" placeholder="pass" value="${data.password}">
                            <span style="font-size: 10px;margin-bottom: 10px;">(applies if private)</span>
                        </span>
                        <br>
                        <span>
                            <label for="roundcount">rounds:</label>
                            <input type="range" name="roundcount" id="roundrangeval" min="1" max="10" value="${data.maxRounds}">
                            <span id="roundrangedisplay">${data.maxRounds}${(data.maxRounds == 10) ? " (max)" : ""}</span><span style="font-size: 10px;margin-bottom: 10px;">(excluding image round)</span>
                        </span>
                        <br>
                        <label for="roundtype">round type:</label>
                        <select name="roundtype" id="roomRoundType" class="themes">
                            <option value="classic">classic</option>
                            <option value="vote">vote (unimplemented)</option>
                        </select>
                        `;
                        content.appendChild(roomSettDiv);
                        const saveBtn = document.createElement("button");
                        saveBtn.innerText = "save";
                        saveBtn.onclick = async function() {
                            try {
                                await axios({
                                    url: `${apiURL}/rooms/${roomData.id}/settings`,
                                    method: "PATCH",
                                    headers: {
                                        "authorization": session
                                    },
                                    data: {
                                        visibility: document.getElementById("roomVisibility").value,
                                        password: document.getElementById("roompass").value,
                                        maxRounds: document.getElementById("roundrangeval").value,
                                        roundType: "classic"
                                    },
                                    timeout: 5000
                                });
                                alert("Updated Room Data.")
                            } catch (e) {
                                console.error(e);
                                if (e.response.data && e.response.data.length > 10 && e.response.status < 500) {
                                    createPopup(createErrorDiv(e.response.data))
                                } else {
                                    catPopup(e.response.status)
                                }
                            }
                        }
                        // do a GET request for the room, to retrieve data like visibility, room pass, rounds, round type
                        document.getElementById("roundrangeval").onchange = function() {
                            const value = document.getElementById("roundrangeval").value;
                            document.getElementById("roundrangedisplay").innerText = value
                            if (value >= 10) {
                                document.getElementById("roundrangedisplay").innerText += " (max)"
                            }
                        }
                        content.appendChild(saveBtn)
                    }).catch(e => {
    
                    })
                    break;
                }
                case 3: { // ACCOUNT
                    accountItem.classList.add("highlighted")
                    
                    break;
                }
                */
            }
        }

        statsItem.onclick = function() {
            renderContent(0)
        }
        userItem.onclick = function() {
            renderContent(1)
        }
        cosmeticsItem.onclick = function() {
            renderContent(2)
        }
        devItem.onclick = function() {
            renderContent(3)
        }
        ul.appendChild(statsItem);
        ul.appendChild(userItem);
        ul.appendChild(cosmeticsItem);
        ul.appendChild(devItem);
        nav.appendChild(ul);
        adminDiv.appendChild(nav);
        adminDiv.appendChild(content);
        createPopup(adminDiv);
        renderContent(0);
    }).catch((e) => {
        alert(e);
        location.reload()
    });
}

function showSettings() {
    const settingsDiv = document.createElement("div");
    settingsDiv.innerHTML = `<h1>Settings</h1>`
    const nav = document.createElement("nav");
    const ul = document.createElement("ul");
    const generalItem = document.createElement("li");
    const avatarItem = document.createElement("li");
    const roomItem = document.createElement("li"); // only room host can see
    const accountItem = document.createElement("li");
    generalItem.innerText = "GENERAL";
    avatarItem.innerText = "AVATAR";
    roomItem.innerText = "ROOM";
    accountItem.innerText = "ACCOUNT";
    

    const content = document.createElement("div");
    content.id = "settings-main";
    content.classList.add("settingsPanel");
    function changeAllHighlighted() {
        generalItem.classList.remove("highlighted")
        avatarItem.classList.remove("highlighted")
        roomItem.classList.remove("highlighted")
        accountItem.classList.remove("highlighted")
    }
    function renderContent(id) {
        changeAllHighlighted();
        const content = document.getElementById("settings-main");
        content.innerHTML = "";
        // for now doing innerhtml
        switch (id) {
            case 0: { // GENERAL
                generalItem.classList.add("highlighted")
                content.innerHTML = `<p><b>GENERAL</b></p>
                <div class="general-settings settingsTab">
                    <label for="themes">theme:</label>
                    <select name="themes" id="themes" class="themes">
                        <option value="light">light</option>
                        <option value="dark">dark</option>
                        <!--<option value="green">green</option>-->
                    </select>
                    <br>
                    <span>
                        <label for="volume">music:</label>
                        <input type="range" name="volume" id="volinput" min="0" max="100" value="${settings.volume}">
                        <span id="volspan">${settings.volume}%</span>
                    </span>
                </div>`
                document.getElementById("themes").value = settings.theme
                document.getElementById("themes").onchange = function() {
                    settings.theme = document.getElementById("themes").value;
                    updateSettings(true);
                }
                document.getElementById("volinput").onchange = function() {
                    settings.volume = document.getElementById("volinput").value;
                    document.getElementById("volspan").innerText = `${settings.volume}%`;
                    updateSettings(true);
                }
                break;
            }
            case 1: { // AVATAR
                avatarItem.classList.add("highlighted")
                showCustomiseAvatar(true).then(div => content.appendChild(div))
                break;
            }
            case 2: { // ROOM
                axios({
                    url: `${apiURL}/rooms/${roomData.id}?IClaimHost=1`,
                    method: "GET",
                    headers: {
                        "authorization": session
                    },

                    timeout: 5000
                }).then(res => {
                    const data = res.data
                    roomItem.classList.add("highlighted")
                    content.innerHTML = `<p><b>ROOM</b></p>`
                    const roomSettDiv = document.createElement("div");
                    roomSettDiv.classList.add("general-settings", "settingsTab");
                    roomSettDiv.innerHTML = `
                    <span>
                        <label for="visibility">visibility:</label>
                        <select name="visibility" id="roomVisibility" class="themes">
                            <option value="public" ${(data.visibility == "public") && "selected"}>public</option>
                            <option value="unlisted" ${(data.visibility == "unlisted") && "selected"}>unlisted</option>
                            <option value="private" ${(data.visibility == "private") && "selected"}>private</option>
                        </select>
                        <br>
                        <label for="roompass">room password:</label>
                        <input type="text" id="roompass" name="roompass" placeholder="pass" value="${data.password}">
                        <span style="font-size: 10px;margin-bottom: 10px;">(applies if private)</span>
                    </span>
                    <br>
                    <span>
                        <label for="roundcount">rounds:</label>
                        <input type="range" name="roundcount" id="roundrangeval" min="1" max="10" value="${data.maxRounds}">
                        <span id="roundrangedisplay">${data.maxRounds}${(data.maxRounds == 10) ? " (max)" : ""}</span><span style="font-size: 10px;margin-bottom: 10px;">(excluding image round)</span>
                    </span>
                    <br>
                    <label for="roundtype">round type:</label>
                    <select name="roundtype" id="roomRoundType" class="themes">
                        <option value="classic">classic</option>
                        <option value="vote">vote (unimplemented)</option>
                    </select>
                    `;
                    content.appendChild(roomSettDiv);
                    const saveBtn = document.createElement("button");
                    saveBtn.innerText = "save";
                    saveBtn.onclick = async function() {
                        try {
                            await axios({
                                url: `${apiURL}/rooms/${roomData.id}/settings`,
                                method: "PATCH",
                                headers: {
                                    "authorization": session
                                },
                                data: {
                                    visibility: document.getElementById("roomVisibility").value,
                                    password: document.getElementById("roompass").value,
                                    maxRounds: document.getElementById("roundrangeval").value,
                                    roundType: "classic"
                                },
                                timeout: 5000
                            });
                            alert("Updated Room Data.")
                        } catch (e) {
                            console.error(e);
                            if (e.response.data && e.response.data.length > 10 && e.response.status < 500) {
                                createPopup(createErrorDiv(e.response.data))
                            } else {
                                catPopup(e.response.status)
                            }
                        }
                    }
                    // do a GET request for the room, to retrieve data like visibility, room pass, rounds, round type
                    document.getElementById("roundrangeval").onchange = function() {
                        const value = document.getElementById("roundrangeval").value;
                        document.getElementById("roundrangedisplay").innerText = value
                        if (value >= 10) {
                            document.getElementById("roundrangedisplay").innerText += " (max)"
                        }
                    }
                    content.appendChild(saveBtn)
                }).catch(e => {

                })
                break;
            }
            case 3: { // ACCOUNT
                accountItem.classList.add("highlighted")
                content.innerHTML = `<p><b>ACCOUNT</b></p>`
                const accSettDiv = document.createElement("div");
                accSettDiv.classList.add("general-settings", "settingsTab");
                
                const spanA = document.createElement("span")
                spanA.innerHTML = `
                <label for="username">username:</label>
                <input type="text" name="username" placeholder="currentusername" id="changeusername" maxlength="10">`
                
                const saveBtn = document.createElement("button");
                saveBtn.innerText = "save"; //no idea what causes this lmfao
                //we love html js
                /*
                // for some reason, on firefox, this doesnt show the button as an event
                saveBtn.onclick = function() {
                    // do stuff
                    alert("e")
                }
                */
                saveBtn.id = "asavebtnidbecausehtmljssucks"

                spanA.appendChild(saveBtn);
                accSettDiv.appendChild(spanA);
                accSettDiv.appendChild(document.createElement("br"))
                accSettDiv.appendChild(document.createElement("br"))
                accSettDiv.innerHTML += `<span>- danger zone -</span><br>`

                const changePasswd = document.createElement("button");
                changePasswd.innerText = "change password"
                changePasswd.onclick = function() { // this works
                    const registerDiv = document.createElement("div")
                    registerDiv.innerHTML = `<h1>Change password</h1>
                    <label for="password">new password:</label>
                    <input type="password" name="password" id="s-pwd">
                    <br>
                    <label for="confirmpassword">confirm new password:</label>
                    <input type="password" name="confirmpassword" id="s-cpwd">
                    <br>
                    <p style="font-size: 10px;">*make sure to save your password somewhere!</p>`
                    const registerButton = document.createElement("button");
                    registerButton.innerText = "CHANGE";
                    let popup;
                    registerButton.onclick = async function() {
                        const password = document.getElementById('s-pwd').value;
                        const confirmPass = document.getElementById('s-cpwd').value;
                        if ([password.length,confirmPass.length].includes(0)) return createPopup(createErrorDiv("One of the values is not provided!"));
                        if (password != confirmPass) return createPopup(createErrorDiv("Password and Confirm Password don't share the same value!"));
                        try {
                            await axios({
                                url: `${apiURL}/user/@me/password`,
                                method: "POST",
                                headers: {
                                    "authorization": session
                                },
                                data: {
                                    password
                                },
                                timeout: 5000
                            });
                            alert("Your password has been changed.")
                        } catch (e) {
                            console.error(e);
                            if (e.response.data && e.response.data.length > 10 && e.response.status < 500) {
                                createPopup(createErrorDiv(e.response.data))
                            } else {
                                catPopup(e.response.status)
                            }
                        } finally {
                            popup.remove();
                        }
                    }
                    registerDiv.appendChild(registerButton);
                    registerDiv.appendChild(document.createElement("br"));
                    registerDiv.appendChild(document.createElement("br"));
                    popup = createPopup(registerDiv);
                }

                const logOut = document.createElement("button");
                logOut.innerText = "log out"
                logOut.onclick = function() { //it here!
                    logout();
                }

                const deleteAcc = document.createElement("button");
                deleteAcc.innerText = "delete account"
                deleteAcc.classList.add("important");
                deleteAcc.onclick = function() {
                    const popupDiv = document.createElement("div");
                    popupDiv.innerHTML = "<h1>ARE YOU SURE?</h1>" //ARE YOU??? ARE YOU FIREE/????????????????????? i dunno, AM I
                    const yesBtn = document.createElement("button");
                    const noBtn = document.createElement("button");
                    yesBtn.innerText = "yes"
                    noBtn.innerText = "no"
                    let popup;
                    yesBtn.onclick = async function() {
                        try {
                            await axios({
                                url: `${apiURL}/user/@me`,
                                method: "DELETE",
                                headers: {
                                    "authorization": session
                                },
                                timeout: 5000
                            });
                            localStorage.removeItem("osuliterallysucks")
                            localStorage.removeItem("username")
                            window.location.href = "/"
                        } catch (e) {
                            console.error(e);
                            catPopup(e.response.status)
                        } finally {
                            popup.remove();
                        }
                    }
                    noBtn.onclick = function() {
                        popup.remove();
                    }
                    popupDiv.appendChild(yesBtn)
                    popupDiv.appendChild(noBtn)
                    popup = createPopup(popupDiv);
                    
                }

                accSettDiv.appendChild(changePasswd)
                accSettDiv.appendChild(document.createElement("br"))
                accSettDiv.appendChild(logOut)
                accSettDiv.appendChild(document.createElement("br"))
                accSettDiv.appendChild(deleteAcc)

                content.appendChild(accSettDiv);
                // THIS WORKS THOUGH, WHYYY WHY DOES THIS WORK, SOMEWONE PLEASE EXPLAIN
                document.getElementById("asavebtnidbecausehtmljssucks").onclick = async function() { // this was the thing
                    const username = document.getElementById("changeusername").value;
                    if (!username.length) return createPopup(createErrorDiv("enter a username!"))
                    if (!checkValid("username", username)) return;
                    try {
                        await axios({
                            url: `${apiURL}/user/@me/username`,
                            method: "POST",
                            headers: {
                                "authorization": session
                            },
                            timeout: 5000
                        });
                        localStorage.setItem("username", username);
                        alert("Changed username!")
                    } catch (e) {
                        console.error(e);
                        createPopup(createErrorDiv(e.response.data))
                    }
                }
                document.getElementById("changeusername").value = localStorage.getItem("username");
                break;
            }
        }
    }
    generalItem.onclick = function() {
        currentSetting = 0;
        renderContent(currentSetting)
    }
    avatarItem.onclick = function() {
        currentSetting = 1;
        renderContent(currentSetting)
    }
    roomItem.onclick = function() {
        currentSetting = 2;
        renderContent(currentSetting)
    }
    accountItem.onclick = function() {
        currentSetting = 3;
        renderContent(currentSetting)
    }
    ul.appendChild(generalItem);
    ul.appendChild(avatarItem);
    if (typeof roomData != "undefined" && roomData.isHost) {
        ul.appendChild(roomItem);
    }
    if (localStorage.getItem("osuliterallysucks") != null) {
        ul.appendChild(accountItem);
    }
    nav.appendChild(ul);
    settingsDiv.appendChild(nav);
    settingsDiv.appendChild(content);
    createPopup(settingsDiv);
    renderContent(currentSetting)
    /*

    <div class="modal-overlay show-modal">
        <div class="modal">
            <span class="closebtn"><i class="fa-solid fa-x"></i></span>
            <h1>Settings</h1>
            <nav>
                <ul>
                    <li>GENERAL</li>
                    <li>AVATAR</li>
                    <li id="roomtab">ROOM</li> <!--only the room host can see this tab-->
                    <li>ACCOUNT</li>
                </ul>
            </nav>
            <div id="settings-main" class="settingsPanel">
stuff stuff stuff jinx joinker joinkers JOINEKR!
                <div id="settings-room" hidden>
                   
                </div>

                <div id="settings-avatar">
                    <p style="margin: 0;"><b>AVATAR</b></p>
                    <div class="avatar-settings settingsTab">
                        <div>
                            <nav>
                                <ul>
                                    <li>mouths</li>
                                    <li>cosmetics</li>
                                    <li>equipped</li>
                                </ul>
                            </nav>
                            <div id="inventory" class="inventoryContainer" style="display: none;">
                                <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/none.gif');"></div>
                                <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/mahoraga_wheel.gif');"></div>
                                <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/bucket_hat.gif');"></div>
                                <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/bunny_ears.gif');"></div>
                                <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/devil_horns.gif');"></div>
                                <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/geto_scars.gif');"></div>
                                <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/jinx_eyes.gif');"></div>
                            </div>
                            <div id="equipped" class="inventoryContainer">
                                <span class="equippedItem">
                                    <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/mahoraga_wheel.gif');"></div>
                                    <span>mahoraga wheel</span>
                                    <i class="fa-solid fa-caret-up dropdown"></i>
                                    <div id="cosmeticConfigidfkrenamethis" style="font-size: 12px;">
                                        <br>
                                        <label for="zindex">z index</label>
                                        <input type="range" name="zindex" min="-10" max="10">
                                        <span>value</span>
                                        <br>
                                        <label for="xpos">x offset</label>
                                        <input type="range" name="xpos" min="-10" max="10">
                                        <span>value</span>
                                        <br>
                                        <label for="ypos">y offset</label>
                                        <input type="range" name="ypos" min="-10" max="10">
                                        <span>value</span>
                                        <br>
                                        <label for="ypos">scale</label>
                                        <input type="range" name="ypos" min="-10" max="10">
                                        <span>value</span>
                                        <br>
                                        <label for="ypos">flip</label>
                                        <input class="chekmark" type="checkbox" name="ypos" min="0" max="1">
                                    </div>
                                    <div class="reset">
                                        <i class="fa-solid fa-rotate-right"></i>
                                    </div>
                                </span>
                            </div>
                            <button style="font-size: 10px;">BUY MORE</button>
                        </div>
                        <div>
                            <div class="usericon">
                                <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                                <div style="background-image: url('../assets/icons/bases/white_neck_base.gif');"></div>
                                <div class="outline" style="background-image: url('../assets/icons/bases/triangle_outline.gif');"></div>
                                <div style="background-image: url('../assets/icons/bases/white_triangle_base.gif');"></div>
    
                                <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/eyepatch.gif');transform: translateY(20%) translateX(15%);"></div>
                                <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/bandana.gif');transform: translateY(00%);"></div>
                                <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/tophat.gif');transform: translateY(00%);z-index: 999;"></div>
                                <!--scale(-1) for mirroring-->
                            </div>
                            <div class="colours"> <!--FOR SHAPES-->
                                <div data-shape-name="circle" class="colour" style="background-image: url('../assets/icons/bases/circle_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>
                                <div data-shape-name="square" class="colour" style="background-image: url('../assets/icons/bases/square_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>
                                <div data-shape-name="triangle" class="colour" style="background-image: url('../assets/icons/bases/triangle_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>
                                <!--<div data-shape-name="diamond" class="colour" style="background-image: url('../assets/icons/bases/diamond_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>-->
                            </div>
                            <hr>
                            <div class="colours">
                                <!--
                                    caribbeangreen
                                    crimson
                                    dodgerblue
                                    orange
                                    pizazz
                                    purpleheart
                                    redorange
                                    white
                                -->
                                <div data-colour-name="caribbeangreen" style="background-color: #00D084;" class="colour"></div>
                                <div data-colour-name="crimson" style="background-color: #EB144C;" class="colour"></div>
                                <div data-colour-name="dodgerblue" style="background-color: #2196F3;" class="colour"></div>
                                <div data-colour-name="orange" style="background-color: #FF5722;" class="colour"></div>
                                <div data-colour-name="pizazz" style="background-color: #FF9307;" class="colour"></div>
                                <div data-colour-name="purpleheart" style="background-color: #673AB7;" class="colour"></div>
                                <div data-colour-name="redorange" style="background-color: #FF3A3A;" class="colour"></div>
                                <div data-colour-name="white" style="background-color: #fff;" class="colour"></div>
                            </div>
                            <hr>
                            <div class="colours">
                                <!--
                                    BADGES
                                -->
                                <div data-badge-name="none" style="background-color: white;background-image: url('../assets/icons/cosmetics/none.gif');background-size: 100%;" class="colour"></div>
                                <div data-badge-name="verified" style="background-color: white;background-image: url('../assets/icons/badges/verified.gif');background-size: 100%;" class="colour"></div>
                                <div data-badge-name="artist" style="background-color: white;background-image: url('../assets/icons/badges/artist.gif');background-size: 100%;" class="colour unobtained">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat previewMessage">
                        <div class="chat-list">
                            <div class="chat-message">
                                <div class="usericon">
                                    <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_neck_base.gif');"></div>
                                    <div class="outline" style="background-image: url('../assets/icons/bases/circle_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_circle_base.gif');"></div>
        
                                    <div class="outline" style="background-image: url('../assets/icons/faces/mouth/smile.gif');"></div>
                                    <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/bucket_hat.gif');"></div>
                                </div>
                                <span class="username you">oswald</span>
                                <span style="background-image: url('../assets/icons/badges/verified.gif');" class="badge"></span>
                                <span>: preview!</span>
                            </div>
                        </div>
                    </div>
                    <button>save</button>
                </div>

            </div>
        </div>
    </div>
    */
}

function generateIconMarket(item) {
    const userIcon = document.createElement("div")
    let folder = "cosmetics"
    if (item.type == "mouth") folder = "faces/mouth"
    if (item.type == "eye") folder = "faces/eye" 
    userIcon.classList.add("usericon");
    if (item.type == "bases") {
        userIcon.innerHTML = `
        <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
        <div style="background-image: url('../assets/icons/bases/${item.colour}_neck_base.gif');z-index: 1;"></div>
        <div class="outline" style="background-image: url('../assets/icons/bases/circle_outline.gif');"></div>
        <div style="background-image: url('../assets/icons/bases/${item.colour}_circle_base.gif');z-index: 1;"></div>
        `
    } else if (item.type == "bundle") {
        const bundleItems = item.items;

        bundleItems.forEach((bundleItem) => {

            const bundleItemDiv = document.createElement("div")
            bundleItemDiv.classList.add("outline")
            bundleItemDiv.style.backgroundImage = `url('../assets/icons/cosmetics/${bundleItem}.gif')`

            userIcon.appendChild(bundleItemDiv)
        })

    } else {
        const inventoryItem = document.createElement("div"); // why no img tag
        
        inventoryItem.classList.add("inventoryItem");
        inventoryItem.style.backgroundImage = `url('../assets/icons/${folder}/${item.filename}.gif')`
        userIcon.appendChild(inventoryItem);

        if (item.rarity == "legendary" && item.class) {
            inventoryItem.classList.add(item.class)
        }
        
        if (item.defaultZIndex != 0) {
            if (item.defaultZIndex != null) {
                inventoryItem.style.zIndex = item.defaultZIndex
            } else {
                inventoryItem.style.zIndex = 0
            }
            // ITEM IS LOCKED FOR FUTURE!!!! REMEMBER THIS!!!
        }
        if (item.defaultScale != 0) {
            // xpos ypos mirror actualscale
            inventoryItem.style.transform = `translateX(0%) translateY(0%) scale(1) scale(${item.defaultScale}%)`
        }
    }
    return userIcon;
}

function generateIcon(items, colour, shape) {
    // items = equipped items
    /*
<div class="usericon">
                                    <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_neck_base.gif');"></div>
                                    <div class="outline" style="background-image: url('../assets/icons/bases/circle_outline.gif');"></div>
                                    <div style="background-image: url('../assets/icons/bases/red_circle_base.gif');"></div>
        
                                    <div class="outline" style="background-image: url('../assets/icons/faces/mouth/smile.gif');"></div>
                                    <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/bucket_hat.gif');"></div>
                                </div>
    */
    const userIcon = document.createElement("div");
    userIcon.classList.add("usericon");
    userIcon.innerHTML = `
        <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');z-index: 3;"></div>
        <div style="background-image: url('../assets/icons/bases/${colour}_neck_base.gif');z-index: 2;"></div>
        <div class="outline" style="background-image: url('../assets/icons/bases/${shapes[shape]}_outline.gif');z-index: 3;"></div>
        <div style="background-image: url('../assets/icons/bases/${colour}_${shapes[shape]}_base.gif');z-index: 2;"></div>
    `
    items = items.filter(item => !["bases","shape"].includes(item.type) && item.equip);
    for (let i = 0; i < items.length; i++) {

        const item = items[i];
        let folder = "cosmetics"

        const cosmetic = document.createElement("div");
        if (item.type == "mouth") folder = "faces/mouth"
        if (item.type == "eye") folder = "faces/eye" 
        if (item.type == "cosmetics") folder = "cosmetics"

        cosmetic.zIndex = 999

        /*
        if (item.rarity == "legendary") cosmetic.classList.add(item.class);
        if (item.defaultZIndex != 0) {
            if (item.defaultZIndex != null) {
                cosmetic.style.zIndex = item.defaultZIndex
            } else {
                cosmetic.style.zIndex = ``
            }
            // ITEM IS LOCKED FOR FUTURE!!!! REMEMBER THIS!!!
        }
        if (item.defaultScale != 0) {
            // xpos ypos mirror actualscale
            cosmetic.style.transform = `translateX(0%) translateY(0%) scale(1) scale(${item.defaultScale}%)`
        }
        this works when cosmetic settings r added, for now ill hardcode it
        */
        if (item.filename == "mahoraga_wheel") {
            cosmetic.style.zIndex = 0
            cosmetic.classList.add("mahoraga")
           }
       if (item.filename == "world_slash") {
        cosmetic.style.zIndex = 99999
       }

        cosmetic.classList.add("accessory"); // oh i thought accessory cuz of oh  wowza
        cosmetic.style.backgroundImage = `url('../assets/icons/${folder}/${item.filename}.gif')`

        userIcon.appendChild(cosmetic)
    }
    return userIcon;
    // a one an d a two and a to w the
}

let myPoints = 0;

async function purchaseItem(item) {
    const div = document.createElement("div")
    let cartContents = ""
    let insufficient = "hidden"
    let sufficient = ""
    let popup;
    //but this is literally it
    //its supposed to display all the items separately
    // its a bundle..... they're separate items paired together.. oka nvm then ig!
    //just watch
    // use generateIconMarket for the icon btw oh but for bundle...
    //ok
    //speaking of whats the value for the user's data ill do that later, for now ill just add myPoints use that to base it off of the users current points ok
    if (item.type == "bundle") {
        div.innerHTML += `<span style="filter: opacity(75%);font-size: 12px;margin-top: 5px;font-style: italic;">Items included within this bundle:</span>`

        item.items.forEach((bundleItem) => {
            cartContents += `
            <div class="usericon">
                <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/${bundleItem}.gif')"></div>
            </div>
            `
        })
    } else {
        // returns a div btw! yes div.appendChild() that func
        // the full usericon div?
        cartContents = generateIconMarket(item).outerHTML //gg proof? can i test it rn or is it stgill brokenwtf
    }
    // its not user input
    // ill change this later, ok. i think xss could happen but does it even matter!? true...


    div.innerHTML += `<div class="marketplacecart">
    ${cartContents}
</div>
<h3>Are you sure you'd like to purchase the <b>${item.name}</b>?</h3>
<span>for <b>${item.price} <i class="fa-solid fa-coins"></i></b></span>`

    // uhh cant i just... not add it?
    if (myPoints < item.price) { // insufficient funds
        const insuffDiv = document.createElement("div");
        insuffDiv.innerHTML = `<h3><i>Insufficient funds.</i></h3>`
        const backToButton = document.createElement("button");
        backToButton.innerText = "BACK TO MARKETPLACE";
        backToButton.onclick = function() {
            popup.remove();
        }
        insuffDiv.appendChild(backToButton)
        div.appendChild(insuffDiv)
    } else {
        const suffDiv1 = document.createElement("div");
        suffDiv1.classList.add("options");

        const purchaseBtn = document.createElement("button");
        purchaseBtn.innerText = "PURCHASE";
        purchaseBtn.onclick = function() {
            axios({
                url: `${apiURL}/marketplace/buy/${item.filename}`,
                method: "POST",
                headers: {
                    "authorization": session
                },
                timeout: 5000
            }).then(res => {
                document.getElementById(`marketplaceitem-${item.filename}-btn`).classList.add("alreadyOwned")
                document.getElementById(`marketplaceitem-${item.filename}-btn`).innerText = "already owned"
                document.getElementById(`marketplaceitem-${item.filename}-btn`).onclick = function() {}
                myPoints -= item.price
                document.getElementById("marketpoints").innerHTML = `${parseInt(myPoints)} <i class="fa-solid fa-coins"></i>`
                popup.remove();
            }).catch(e => {
                alert("something went wrong when buying")
                console.error(e);
            })
            
        }
        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "CANCEL";
        cancelBtn.classList.add("alt")
        cancelBtn.onclick = function() {
            popup.remove();
        }
        suffDiv1.appendChild(purchaseBtn);
        suffDiv1.appendChild(cancelBtn);

        const suffDiv2 = document.createElement("div");
        suffDiv2.classList.add("extra");
        suffDiv2.innerHTML = `<span style="filter: opacity(50%);font-size: 12px;margin-top: 5px;">Your balance after this purchase will be <b>${myPoints-item.price}</b> <i class="fa-solid fa-coins"></i>.</span><br>
        <span style="filter: opacity(50%);font-size: 12px;margin-top: 5px;">You currently have <b>${myPoints}</b> <i class="fa-solid fa-coins"></i>.</span>`
        div.appendChild(suffDiv1)
        div.appendChild(suffDiv2)
    }
    div.classList.add("flexcenter", "confirmPurchase"); // oh my lord

    popup = createPopup(div, false, ["marketplaceConfirm"]);

} //did you remove createicon lol i moved it

let timeWEFLOPWFLloop;

function showCustomiseAvatar(dontDoPopup, contentDiv) {
    return new Promise((resolve, reject) => {
        axios({
            url: `${apiURL}/user/@me?inventory=1`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        }).then(res => {
            const userData = res.data;
            const inventory = userData.inventory
            
            const div = document.createElement("div");
            div.innerHTML = `<p style="margin: 0;"><b>AVATAR</b></p>`
            div.classList.add("settings-avatar")
            const nav = document.createElement("nav");
            const ul = document.createElement("ul");
            const mouthsItem = document.createElement("li");
            const eyesItem = document.createElement("li");
            const cosmeticsItem = document.createElement("li");
            const equippedItem = document.createElement("li");
            mouthsItem.innerText = "mouths";
            eyesItem.innerText = "eyes";
            cosmeticsItem.innerText = "misc";
            equippedItem.innerText = "equipped";
            const igEverythingQuestionMark = document.createElement("div");
            igEverythingQuestionMark.classList.add("avatar-settings", "settingsTab");
            const content = document.createElement("div");
            content.id = "settings-customise";
            const asideDiv = document.createElement("div");
            /*inventory.push({
                type: "cosmetics",
                filename: "jinx_eyes",
                equip: 1
            })*/
            const userIcon = generateIcon(inventory, inventory.filter(item => item.type == "bases" && item.equip == 1)[0].filename, userData.shape);
            userIcon.id = "config-user-icon"
            asideDiv.appendChild(userIcon);
            const shapesDiv = document.createElement("div");
            shapesDiv.classList.add("colours");
            function updateUserIcon() {
                console.log(`update user icon with ${userData.shape} shape`)
                document.getElementById("config-user-icon").innerHTML = generateIcon(inventory.filter(item => item.equip), inventory.filter(item => item.type == "bases" && item.equip == 1)[0].filename, userData.shape).innerHTML;
                const chatPreview = document.getElementById("chatPreview");
                chatPreview.innerHTML = ""
                chatPreview.appendChild(generateIcon(inventory.filter(item => item.equip), inventory.filter(item => item.type == "bases" && item.equip == 1)[0].filename, userData.shape));
                chatPreview.innerHTML += "\n"
                const userSpan = document.createElement("span");
                userSpan.classList.add("username", "you")
                userSpan.innerText = ` ${localStorage.getItem("username")}`;
                chatPreview.appendChild(userSpan);
                chatPreview.innerHTML += `<span>: preview!</span>`
    
                /*
                <div class="chat-message">
                    <div class="usericon">
                        <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                        <div style="background-image: url('../assets/icons/bases/red_neck_base.gif');"></div>
                        <div class="outline" style="background-image: url('../assets/icons/bases/circle_outline.gif');"></div>
                        <div style="background-image: url('../assets/icons/bases/red_circle_base.gif');"></div>
    
                        <div class="outline" style="background-image: url('../assets/icons/faces/mouth/smile.gif');"></div>
                        <div class="outline accessory" style="background-image: url('../assets/icons/cosmetics/bucket_hat.gif');"></div>
                    </div>
                    <span class="username you">oswald</span>
                    <span style="background-image: url('../assets/icons/badges/verified.gif');" class="badge"></span>
                    <span>: preview!</span>
                </div>
                */
            }
            shapes.forEach(shape => {
                //<div data-shape-name="circle" class="colour" style="background-image: url('../assets/icons/bases/circle_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>
                const shapeDiv = document.createElement("div");
                shapeDiv.style.backgroundImage = `url('/assets/icons/bases/${shape}_outline.gif')`
                shapeDiv.style.backgroundSize = `100%`
                shapeDiv.style.imageRendering = "pixelated";
                shapeDiv.classList.add("colour");
                shapeDiv.onclick = function() {
                    userData.shape = shapes.indexOf(shape);
                    axios({
                        url: `${apiURL}/marketplace/shape`,
                        method: "POST",
                        headers: {
                            "authorization": session
                        },
                        data: {
                            shape: parseInt(userData.shape)
                        },
                        timeout: 5000
                    }).then(res => {
                        updateUserIcon()
                    }).catch(e => {
                        alert("something went wrong when updating")
                        console.error(e)
                    })
                }
                shapesDiv.appendChild(shapeDiv);
            })
            asideDiv.appendChild(shapesDiv);
            asideDiv.appendChild(document.createElement("hr"))
            const coloursDiv = document.createElement("div");
            coloursDiv.classList.add("colours");
            Object.keys(colours).forEach(colour => {
                const colourDiv = document.createElement("div");
                colourDiv.style.background = `${colours[colour]}`
                colourDiv.classList.add("colour");
                colourDiv.onclick = function() {
                    inventory.filter(item => {
                        if (item.type == "bases") {
                            if (item.filename != colour) {
                                item.equip = 0
                            } else {
                                item.equip = 1
                            }
                        }
                        return item;
                    })
                    axios({
                        url: `${apiURL}/marketplace/colour`,
                        method: "POST",
                        headers: {
                            "authorization": session
                        },
                        data: {
                            name: colour
                        },
                        timeout: 5000
                    }).then(res => {
                        updateUserIcon()
                    }).catch(e => {
                        alert("something went wrong when updating")
                        console.error(e)
                    })
                }
                coloursDiv.appendChild(colourDiv);
            })
            const boughtColours = inventory.filter(item => item.type == "bases" && !Object.keys(colours).includes(item.filename));
            boughtColours.forEach(item => {
                //<div data-colour-name="gold" style="background: url('/assets/icons/bases/gold_colour.gif');" class="colour"></div>
                const colour = document.createElement("div");
                colour.style.background = `url('/assets/icons/bases/${item.filename}_colour.gif')`
                colour.classList.add("colour");
                colour.onclick = function() {
                    inventory.filter(item2 => {
                        if (item2.type == "bases") {
                            if (item2.filename != item.filename) {
                                item2.equip = 0
                            } else {
                                item2.equip = 1
                            }
                        }
                        return item2;
                    })
                    axios({
                        url: `${apiURL}/marketplace/colour`,
                        method: "POST",
                        headers: {
                            "authorization": session
                        },
                        data: {
                            name: item.filename
                        },
                        timeout: 5000
                    }).then(res => {
                        updateUserIcon()
                    }).catch(e => {
                        alert("something went wrong when updating")
                        console.error(e)
                    })
                }
                coloursDiv.appendChild(colour);
            })
            asideDiv.appendChild(coloursDiv);
            asideDiv.appendChild(document.createElement("hr"))
    /*
     <div class="usericon">
                <div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                <div style="background-image: url('../assets/icons/bases/purpleheart_neck_base.gif');z-index: 1;"></div>
                <div class="outline" style="background-image: url('../assets/icons/bases/square_outline.gif');"></div>
                <div style="background-image: url('../assets/icons/bases/purpleheart_square_base.gif');z-index: 1;"></div>
    
                <div class="outline accessory" style="background-image: url('../assets/icons/faces/eye/robotic.gif');z-index: 99;"></div>
                <div class="outline accessory" style="background-image: url('../assets/icons/faces/mouth/colon_three.gif');z-index: 99;"></div>
    
                <!--scaleX(-1) scale(150%);"-->
            </div>
    */
    /*
            asideDiv.innerHTML += `
           
            <div class="colours"> <!--FOR SHAPES-->
                <div data-shape-name="circle" class="colour" style="background-image: url('../assets/icons/bases/circle_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>
                <div data-shape-name="square" class="colour" style="background-image: url('../assets/icons/bases/square_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>
                <div data-shape-name="triangle" class="colour" style="background-image: url('../assets/icons/bases/triangle_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>
                <!--<div data-shape-name="diamond" class="colour" style="background-image: url('../assets/icons/bases/diamond_outline.gif');background-size: 100%;image-rendering: pixelated;"></div>-->
            </div>
            <hr>
            <div class="colours">
                <!--
                    caribbeangreen
                    crimson
                    dodgerblue
                    orange
                    pizazz
                    purpleheart
                    redorange
                    white
                -->
                <div data-colour-name="caribbeangreen" style="background: #00D084;" class="colour"></div>
                <div data-colour-name="crimson" style="background: #EB144C;" class="colour"></div>
                <div data-colour-name="dodgerblue" style="background: #2196F3;" class="colour"></div>
                <div data-colour-name="orange" style="background: #FF5722;" class="colour"></div>
                <div data-colour-name="pizazz" style="background: #FF9307;" class="colour"></div>
                <div data-colour-name="purpleheart" style="background: #673AB7;" class="colour"></div>
                <div data-colour-name="redorange" style="background: #FF3A3A;" class="colour"></div>
                <div data-colour-name="white" style="background: #fff;" class="colour"></div>
    
                <!--purchasable/unlockable-->
                <div data-colour-name="gold" style="background: url('/assets/icons/bases/gold_colour.gif');" class="colour"></div>
                <div data-colour-name="rainbow" style="background: url('/assets/icons/bases/rainbow_colour.gif');" class="colour"></div>
                <div data-colour-name="flesh" style="background-image: url('/assets/icons/bases/flesh_colour.gif');" class="colour"></div>
    
            </div>
            <hr>
            <div class="colours">
                <!--
                    BADGES
                -->
                <div data-badge-name="none" style="background-color: white;background-image: url('../assets/icons/cosmetics/none.gif');background-size: 100%;" class="colour"></div>
                <div data-badge-name="verified" style="background-color: white;background-image: url('../assets/icons/badges/verified.gif');background-size: 100%;" class="colour"></div>
                <div data-badge-name="artist" style="background-color: white;background-image: url('../assets/icons/badges/artist.gif');background-size: 100%;" class="colour unobtained">
                </div>
            </div>`*/
            //content.classList.add();
            function changeAllHighlighted() {
                mouthsItem.classList.remove("highlighted")
                eyesItem.classList.remove("highlighted")
                cosmeticsItem.classList.remove("highlighted")
                equippedItem.classList.remove("highlighted")
            }
    
            function renderContent(id) {
                changeAllHighlighted();
                const content = document.getElementById("settings-customise");
                content.innerHTML = "";
                const container = document.createElement("div");
                container.classList.add("inventoryContainer")
                container.id = "inventory";
                // for now doing innerhtml
                switch (id) {
                    case 0: { // mouths
                        mouthsItem.classList.add("highlighted")
                        const mouthItems = inventory.filter(item => item.type == "mouth");
                        mouthItems.forEach(item => {
                            const itemDiv = document.createElement("div");
                            itemDiv.classList.add("inventoryItem", "outline")
                            itemDiv.style.backgroundImage = `url('/assets/icons/faces/mouth/${item.filename}.gif')`
                            itemDiv.onclick = function() {
                                inventory.filter(item2 => {
                                    if (item2.type == "mouth") {
                                        if (item2.filename != item.filename) {
                                            item2.equip = 0
                                        } else {
                                            item2.equip = 1
                                        }
                                    }
                                    return item2;
                                })
                                axios({
                                    url: `${apiURL}/marketplace/wear/mouth`,
                                    method: "POST",
                                    headers: {
                                        "authorization": session
                                    },
                                    data: {
                                        name: item.filename
                                    },
                                    timeout: 5000
                                }).then(res => {
                                    updateUserIcon()
                                }).catch(e => {
                                    alert("something went wrong when updating")
                                    console.error(e)
                                })
                            }
                            container.appendChild(itemDiv);
                        })
                        content.appendChild(container);
                        break;
                    }
                    case 1: { // eyes
                        eyesItem.classList.add("highlighted")
                        const eyeItems = inventory.filter(item => item.type == "eye");
                        eyeItems.forEach(item => {
                            const itemDiv = document.createElement("div");
                            itemDiv.classList.add("inventoryItem", "outline")
                            itemDiv.style.backgroundImage = `url('/assets/icons/faces/eye/${item.filename}.gif')`
                            itemDiv.onclick = function() {
                                inventory.filter(item2 => {
                                    if (item2.type == "eye") {
                                        if (item2.filename != item.filename) {
                                            item2.equip = 0
                                        } else {
                                            item2.equip = 1
                                        }
                                    }
                                    return item2;
                                })
                                axios({
                                    url: `${apiURL}/marketplace/wear/eye`,
                                    method: "POST",
                                    headers: {
                                        "authorization": session
                                    },
                                    data: {
                                        name: item.filename
                                    },
                                    timeout: 5000
                                }).then(res => {
                                    updateUserIcon()
                                }).catch(e => {
                                    alert("something went wrong when updating")
                                    console.error(e)
                                })
                            }
                            container.appendChild(itemDiv);
                        })
                        content.appendChild(container);
                        break;
                    }
                    case 2: { // cosmetics
                        cosmeticsItem.classList.add("highlighted")
                        const cosmeticItems = inventory.filter(item => item.type == "cosmetics");
                        cosmeticItems.forEach(item => {
                            const itemDiv = document.createElement("div");
                            itemDiv.classList.add("inventoryItem", "outline")
                            itemDiv.style.backgroundImage = `url('/assets/icons/cosmetics/${item.filename}.gif')`
                            itemDiv.onclick = function() {
                                inventory.filter(item2 => {
                                    if (item2.type == "cosmetics" && item2.filename == item.filename) {
                                        item2.equip = 1
                                    }
                                    return item2;
                                })
                                axios({
                                    url: `${apiURL}/marketplace/wear/cosmetic`,
                                    method: "POST",
                                    headers: {
                                        "authorization": session
                                    },
                                    data: {
                                        name: item.filename
                                    },
                                    timeout: 5000
                                }).then(res => {
                                    updateUserIcon()
                                }).catch(e => {
                                    alert("something went wrong when updating")
                                    console.error(e)
                                })
                            }
                            container.appendChild(itemDiv);
                        })
                        content.appendChild(container);
                        break;
                    }
                    case 3: { // equipped
                        equippedItem.classList.add("highlighted")
                        const equippedContainer = document.createElement("div");
                        equippedContainer.id = "equipped"
                        equippedContainer.classList.add("inventoryContainer")
                        const equippedItems = inventory.filter(item => item.equip && ["cosmetics","mouth","eye"].includes(item.type));
                        equippedItems.forEach(item => {
                            const spanEquipped = document.createElement("span");
                            spanEquipped.classList.add("equippedItem")
                            const itemDiv = document.createElement("div");
                            itemDiv.classList.add("inventoryItem", "outline")
                            let folder = "cosmetics"
                            if (item.type == "mouth") folder = "faces/mouth"
                            if (item.type == "eye") folder = "faces/eye" 
                            itemDiv.style.backgroundImage = `url('/assets/icons/${folder}/${item.filename}.gif')`
                            spanEquipped.appendChild(itemDiv);
                            const nameSpan = document.createElement("span");
                            nameSpan.innerText = item.name;
                            const dropdownBtn = document.createElement("i");
                            dropdownBtn.className = "fa-solid fa-caret-up dropdown";
                            const removeBtn = document.createElement("i");
                            removeBtn.className = "fa-solid fa-trash-can dropdown remove";
                            const configDiv = document.createElement("div");
                            configDiv.style.fontSize = "12px";
                            /*configDiv.innerHTML = `<br>
                            <span>
                                <label for="zindex">z index</label>
                                <input type="range" name="zindex" min="-10" max="10">
                                <span>value</span>
                            </span>
                            <br>
                            <span class="locked">
                                <label for="xpos">x offset</label>
                                <input type="range" name="xpos" min="-10" max="10">
                                <span>value</span>
                                <span><i class="fa-solid fa-lock"></i></span>
                            </span>
                            <br>
                            <span>
                                <label for="ypos">y offset</label>
                                <input type="range" name="ypos" min="-10" max="10">
                                <span>value</span>
                            </span>
                            <br>
                            <span>
                                <label for="ypos">scale</label>
                                <input type="range" name="ypos" min="-10" max="10">
                                <span>value</span>
                            </span>
                            <br>
                            <span class="locked">
                                <label for="ypos">flip</label>
                                <input class="chekmark" type="checkbox" name="ypos" min="0" max="1">
                                <span><i class="fa-solid fa-lock"></i></span>
                            </span>
                            <br>
                            <div class="reset">
                                <i class="fa-solid fa-rotate-right"></i>
                            </div>`*/
                            configDiv.innerHTML = `<br><span>this is being worked on</span>`
                            dropdownBtn.onclick = function() {
                                if (!configDiv.hidden) {
                                    dropdownBtn.className = "fa-solid fa-caret-up dropdown";
                                } else {
                                    dropdownBtn.className = "fa-solid fa-caret-down dropdown";
                                }
                                configDiv.hidden = !configDiv.hidden;
                            }
                            configDiv.hidden = true;
                            removeBtn.onclick = function() {
                                inventory.filter(item2 => {
                                    if (item2.type == item.type && item2.filename == item.filename) {
                                        item2.equip = 0
                                    }
                                    return item2;
                                })
                                axios({
                                    url: `${apiURL}/marketplace/removefromskin/${item.type}`,
                                    method: "POST",
                                    headers: {
                                        "authorization": session
                                    },
                                    data: {
                                        name: item.filename
                                    },
                                    timeout: 5000
                                }).then(res => {
                                    document.getElementById(`equip-item-${item.filename}`).remove()
                                    updateUserIcon()
                                }).catch(e => {
                                    alert("something went wrong when updating")
                                    console.error(e)
                                })
                                
                            }
                            spanEquipped.appendChild(nameSpan);
                            spanEquipped.appendChild(dropdownBtn);
                            spanEquipped.appendChild(removeBtn);
                            spanEquipped.appendChild(configDiv);
                            spanEquipped.id = `equip-item-${item.filename}`
                            equippedContainer.appendChild(spanEquipped)
                        })
                        /*
                        equippedContainer.innerHTML = `<span class="equippedItem">
                        <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/mahoraga_wheel.gif');"></div>
                        <span>mahoraga wheel</span>
                        <i class="fa-solid fa-caret-down dropdown"></i><i class="fa-solid fa-trash-can dropdown remove"></i>
                        <div id="cosmeticConfigidfkrenamethis" style="font-size: 12px;">
                            
                        </div>
                    </span>
    
                    <span class="equippedItem">
                        <div class="inventoryItem outline" style="background-image: url('../assets/icons/cosmetics/mahoraga_wheel.gif');"></div>
                        <span>mahoraga wheel</span>
                        <i class="fa-solid fa-caret-up dropdown"></i>
                        <div id="cosmeticConfigidfkrenamethis" style="font-size: 12px;" hidden>
                            <br>
                            <span>
                                <label for="zindex">z index</label>
                                <input type="range" name="zindex" min="-10" max="10">
                                <span>value</span>
                            </span>
                            <br>
                            <span class="locked">
                                <label for="xpos">x offset</label>
                                <input type="range" name="xpos" min="-10" max="10">
                                <span>value</span>
                                <span><i class="fa-solid fa-lock"></i></span>
                            </span>
                            <br>
                            <span>
                                <label for="ypos">y offset</label>
                                <input type="range" name="ypos" min="-10" max="10">
                                <span>value</span>
                            </span>
                            <br>
                            <span>
                                <label for="ypos">scale</label>
                                <input type="range" name="ypos" min="-10" max="10">
                                <span>value</span>
                            </span>
                            <br>
                            <span class="locked">
                                <label for="ypos">flip</label>
                                <input class="chekmark" type="checkbox" name="ypos" min="0" max="1">
                                <span><i class="fa-solid fa-lock"></i></span>
                            </span>
                            <br>
                            <div class="reset">
                                <i class="fa-solid fa-rotate-right"></i>
                            </div>
                        </div>
                    </span>`*/
                        content.appendChild(equippedContainer);
                        break;
                    }
                }
            }
    
            mouthsItem.onclick = function() {
                renderContent(0)
            }
            eyesItem.onclick = function() {
                renderContent(1)
            }
            cosmeticsItem.onclick = function() {
                renderContent(2)
            }
            equippedItem.onclick = function() {
                renderContent(3)
            }
            ul.appendChild(mouthsItem);
            ul.appendChild(eyesItem);
            ul.appendChild(cosmeticsItem);
            ul.appendChild(equippedItem);
            nav.appendChild(ul);
            const someDiv = document.createElement("div");
            someDiv.appendChild(nav);
            someDiv.appendChild(nav);
            someDiv.appendChild(content);
            igEverythingQuestionMark.appendChild(someDiv)
            igEverythingQuestionMark.appendChild(asideDiv);
            div.appendChild(igEverythingQuestionMark);
            const chatPreview = document.createElement("div");
            //chatPreview.id = "chatPreview";
            chatPreview.classList.add("chat", "previewMessage");
            const chatList = document.createElement("div");
            chatList.classList.add("chat-list");
            const chatMessage = document.createElement("div");
            chatMessage.classList.add("chat-message");
            chatList.appendChild(chatMessage);
            chatPreview.appendChild(chatList);
            chatMessage.id = "chatPreview";
            div.appendChild(chatPreview);
            /*
        <button>save</button>`*/
            if (!dontDoPopup) createPopup(div);
            if (dontDoPopup) {
                setTimeout(function() {
                    renderContent(0);
                    updateUserIcon();
                }, 200)
            } else {
                renderContent(0);
                updateUserIcon();
            }
            resolve(div);
            
        }).catch((e) => {
            alert(e);
            reject(e)
        });
    })
}

async function showMarketPlace() {
    let marketplacePopup;
    const div = document.createElement("div");
    div.innerHTML = `<h1>Marketplace</h1>`
    
    const timeUntilNextCycle = document.createElement("span");
    div.appendChild(timeUntilNextCycle);
    timeUntilNextCycle.innerText = "time until next cycle: GONE."
    clearInterval(timeWEFLOPWFLloop);
    timeWEFLOPWFLloop = setInterval(() => {
        const currentTime = moment();
        const nextCycleEnd = moment.utc().endOf('day').add(1, 'day');
        const duration = moment.duration(nextCycleEnd.diff(currentTime));
        if (duration.seconds() == 0 && duration.hours() == 0 && duration.minutes() == 0) {
            clearInterval(timeWEFLOPWFLloop);
            marketplacePopup.remove();
            showMarketPlace();
        } else {
            timeUntilNextCycle.innerText = `Time until next cycle: ${duration.hours()}hr, ${duration.minutes()}m, ${duration.seconds()}s`;
        }
    }, 1000)

    const currentPoints = document.createElement("div");
    currentPoints.innerText = ""
    currentPoints.style = "text-align: right;margin: 0;"
    currentPoints.id = "marketpoints"
    div.appendChild(currentPoints)
    //<div style="text-align: right;margin: 0;">${myPoints} points</div>`
    const flexCenter = document.createElement("div");
    flexCenter.classList.add("flexcenter")

    const container = document.createElement("div");
    container.classList.add("settingsPanel", "marketContain");
    
    flexCenter.appendChild(container);
    div.appendChild(flexCenter);

    const topBar = document.createElement("div");
    topBar.classList.add("topbar");
    // fix
    topBar.innerHTML = `<span class="searchbar">
        <input id="search-bar" type="text" placeholder="Search the marketplace">
        <i onclick="search()" id="search-btn" class="fa-solid fa-search"></i>
    </span>`

    const shopGrid = document.createElement("div");
    shopGrid.classList.add("shopGrid");

    const customiseBtn = document.createElement("button");
    customiseBtn.innerText = "customise your avatar";
    customiseBtn.onclick = function() {
        showCustomiseAvatar();
    }

    container.appendChild(topBar);
    container.appendChild(shopGrid);
    container.appendChild(customiseBtn);
    

    axios({
        url: `${apiURL}/marketplace`,
        method: "GET",
        headers: {
            "authorization": session
        },
        timeout: 5000
    }).then(res => {
        axios({
            url: `${apiURL}/user/@me?inventory=1`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        }).then(userRes => {
            // use userRes to get inventory to change stuff like "already owned"
            myPoints = userRes.data.points;
            currentPoints.innerHTML = `${parseInt(myPoints)} <i class="fa-solid fa-coins"></i>` //xss...... NOT FOR LONG
            function genItem(item) {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("shopItem");
                if (item.rarity != "common") {
                    itemDiv.classList.add(item.rarity)
                }
                const userIcon = generateIconMarket(item);
    
                const tag2 = document.createElement("span");
                tag2.classList.add("tag");
                tag2.innerText = item.rarity;
                if (item.rarity != "common" && item.rarity != "uncommon") {
                    tag2.innerText = item.rarity.toUpperCase()
                }

                const tag = document.createElement("span");
                tag.classList.add("tag");
                tag.innerText = item.tag;
                
                const name = document.createElement("span");
                name.innerText = item.name;
                
                const price = document.createElement("span");
                price.classList.add("price");
                price.innerHTML = `${item.price} <i class="fa-solid fa-coins"></i>`
                
                const desc = document.createElement("span");
                desc.classList.add("itemDesc");
                desc.innerText = item.desc; // how did you what  OH I COPIED AND PASYTED Ok
                // you wrote price instead of desc lmaofjkesdkjfjdkjs classic blunder
    
                const hasItem = userRes.data.inventory.find(userItem => {
                    return userItem.filename == item.filename
                });
                const purchaseBtn = document.createElement("button");
                purchaseBtn.innerText = "PURCHASE"
                purchaseBtn.id = "marketplaceitem-" + item.filename + "-btn"
                purchaseBtn.onclick = function() {
                    purchaseItem(item);
                }
                if (
                    hasItem ||
                    (item.type == "bundle" && userRes.data.inventory.filter(userItem => item.items.includes(userItem.filename)).length >= item.items.length)
                ) {
                    purchaseBtn.classList.add("alreadyOwned")
                    purchaseBtn.innerText = "already owned"
                    purchaseBtn.onclick = function() {}
                }
    
                itemDiv.appendChild(tag2)
                itemDiv.appendChild(tag);
                itemDiv.appendChild(userIcon);
                itemDiv.appendChild(name);
                itemDiv.appendChild(price);
                itemDiv.appendChild(desc);
                itemDiv.appendChild(purchaseBtn);
                itemDiv.id = "marketplaceitem-" + item.filename
                return itemDiv;
                
                
    
                /*
                <div class="shopItem">
                                <div class="usericon">
                                    <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                                </div>
                                <span class="tag">ANIMATED OVERLAY</span>
                                <span>Cleave</span>
                                <span class="price">9000 points</span>
                                <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                                <button>PURCHASE</button>
                            </div>
                */
            }
            const data = res.data;
            data.forEach(item => {
                shopGrid.appendChild(genItem(item));
            })
        })
        
    }).catch(e => {
        shopGrid.innerText = "something went wrong, check console for more info"
        console.error(e)
    })
    marketplacePopup = createPopup(div);
    //

    /*
<div class="modal-overlay show-">
        <div class="modal">
            <span class="closebtn"><i class="fa-solid fa-x"></i></span>
            <h1>Marketplace</h1>
            <div style="text-align: right;margin: 0;">10 points</div>
            <div class="flexcenter">
                <div class="settingsPanel marketContain">
                    <div class="topbar">
                        <span class="searchbar">
                            <input id="search-bar" type="text" placeholder="Search the marketplace">
                            <i onclick="search()" id="search-btn" class="fa-solid fa-search"></i>
                        </span>
                    </div>
                    <div class="shopGrid">

                        <div class="shopItem uncommon">
                            <div class="usericon">
                                <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED OVERLAY</span>
                            <span>Cleave</span>
                            <span class="price">9000 points</span>
                            <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                            <button>PURCHASE</button>
                        </div>

                        <div class="shopItem rare">
                            <div class="usericon">
                                <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED OVERLAY</span>
                            <span>Cleave</span>
                            <span class="price">9000 points</span>
                            <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                            <button>PURCHASE</button>
                        </div>

                        <div class="shopItem epic">
                            <div class="usericon">
                                <div class="outline" style="background-image: url('../assets/icons/cosmetics/dialogue_box.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED FACE</span>
                            <span>Ravenous</span>
                            <span class="price">2000 points</span>
                            <span class="itemDesc">Shiny!</span>
                            <button>PURCHASE</button>
                        </div>

                        <div class="shopItem legendary">
                            <div class="usericon">
                                <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED OVERLAY</span>
                            <span>Cleave</span>
                            <span class="price">9000 points</span>
                            <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                            <button>PURCHASE</button>
                        </div>

                        <div class="shopItem">
                            <div class="usericon">
                                <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED OVERLAY</span>
                            <span>Cleave</span>
                            <span class="price">9000 points</span>
                            <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                            <button>PURCHASE</button>
                        </div>
                        <div class="shopItem">
                            <div class="usericon">
                                <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED OVERLAY</span>
                            <span>Cleave</span>
                            <span class="price">9000 points</span>
                            <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                            <button>PURCHASE</button>
                        </div>
                        <div class="shopItem">
                            <div class="usericon">
                                <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED OVERLAY</span>
                            <span>Cleave</span>
                            <span class="price">9000 points</span>
                            <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                            <button>PURCHASE</button>
                        </div>
                        <div class="shopItem">
                            <div class="usericon">
                                <div class="inventoryItem" style="background-image: url('../assets/icons/cosmetics/world_slash.gif');"></div>
                            </div>
                            <span class="tag">ANIMATED OVERLAY</span>
                            <span>Cleave</span>
                            <span class="price">9000 points</span>
                            <span class="itemDesc">"I'll Show You What Real Jujutsu Is."</span>
                            <button>PURCHASE</button>
                        </div>

                    </div>
                    <button>customise your avatar</button>
                </div>
            </div>
        </div>
    </div>
    */
}

/*
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡤⠶⠚⠉⢉⣩⠽⠟⠛⠛⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠉⠀⢀⣠⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡞⠁⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠀⠀⠀⡼⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⡤⠤⠄⢤⣄⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢰⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠴⠒⠋⠉⠀⠀⠀⣀⣤⠴⠒⠋⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⡄⠀⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⢳⡄⢀⡴⠚⠉⠀⠀⠀⠀⠀⣠⠴⠚⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠘⣧⠀⠀⠀⠀⠀⠀⠀⠀⣰⠃⠀⠀⠹⡏⠀⠀⠀⠀⠀⣀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠳⢬⣳⣄⣠⠤⠤⠶⠶⠒⠋⠀⠀⠀⠀⠹⡀⠀⠀⠀⠀⠈⠉⠛⠲⢦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠤⠖⠋⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢳⠦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣠⠖⠋⠀⠀⠀⣠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⢃⠈⠙⠲⣄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢠⠞⠁⠀⠀⠀⢀⢾⠃⠀⠀⠀⠀⠀⠀⠀⠀⢢⠀⠀⠀⠀⠀⠀⠀⢣⠀⠀⠀⠀⠀⠀⠀⠀⠀⣹⠮⣄⠀⠀⠀⠙⢦⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣰⠋⠀⠀⢀⡤⡴⠃⠈⠦⣀⠀⠀⠀⠀⠀⠀⢀⣷⢸⠀⠀⠀⠀⢀⣀⠘⡄⠤⠤⢤⠔⠒⠂⠉⠁⠀⠀⠀⠑⢄⡀⠀⠀⠙⢦⡀⠀⠀⠀
⠀⠀⠀⠀⣼⠃⠀⠀⢠⣞⠟⠀⠀⠀⡄⠀⠉⠒⠢⣤⣤⠄⣼⢻⠸⠀⠀⠀⠀⠉⢤⠀⢿⡖⠒⠊⢦⠤⠤⣀⣀⡀⠀⠀⠀⠈⠻⡝⠲⢤⣀⠙⢦⠀⠀
⠀⠀⠀⢰⠃⠀⠀⣴⣿⠎⠀⠀⢀⣜⠤⠄⢲⠎⠉⠀⠀⡼⠸⠘⡄⡇⠀⠀⠀⠀⢸⠀⢸⠘⢆⠀⠘⡄⠀⠀⠀⢢⠉⠉⠀⠒⠒⠽⡄⠀⠈⠙⠮⣷⡀
⠀⠀⠀⡟⠀⠀⣼⢻⠧⠐⠂⠉⡜⠀⠀⡰⡟⠀⠀⠀⡰⠁⡇⠀⡇⡇⠀⠀⠀⠀⢺⠇⠀⣆⡨⢆⠀⢽⠀⠀⠀⠈⡷⡄⠀⠀⠀⠀⠹⡄⠀⠀⠀⠈⠁
⠀⠀⢸⠃⠀⠀⢃⠎⠀⠀⠀⣴⠃⠀⡜⠹⠁⠀⠀⡰⠁⢠⠁⠀⢸⢸⠀⠀⠀⢠⡸⢣⠔⡏⠀⠈⢆⠀⣇⠀⠀⠀⢸⠘⢆⠀⠀⠀⠀⢳⠀⠀⠀⠀⠀
⠀⠀⢸⠀⠀⠀⡜⠀⠀⢀⡜⡞⠀⡜⠈⠏⠀⠈⡹⠑⠒⠼⡀⠀⠀⢿⠀⠀⠀⢀⡇⠀⢇⢁⠀⠀⠈⢆⢰⠀⠀⠀⠈⡄⠈⢢⠀⠀⠀⠈⣇⠀⠀⠀⠀
⠀⠀⢸⡀⠀⢰⠁⠀⢀⢮⠀⠇⡜⠀⠘⠀⠀⢰⠃⠀⠀⡇⠈⠁⠀⢘⡄⠀⠀⢸⠀⠀⣘⣼⠤⠤⠤⣈⡞⡀⠀⠀⠀⡇⠰⡄⢣⡀⠀⠀⢻⠀⠀⠀⠀
⠀⠀⠈⡇⠀⡜⠀⢀⠎⢸⢸⢰⠁⠀⠄⠀⢠⠃⠀⠀⢸⠀⠀⠀⠀⠀⡇⠀⠀⡆⠀⠀⣶⣿⡿⠿⡛⢻⡟⡇⠀⠀⠀⡇⠀⣿⣆⢡⠀⠀⢸⡇⠀⠀⠀
⠀⠀⢠⡏⠀⠉⢢⡎⠀⡇⣿⠊⠀⠀⠀⢠⡏⠀⠀⠀⠎⠀⠀⠀⠀⠀⡇⠀⡸⠀⠀⠀⡇⠀⢰⡆⡇⢸⢠⢹⠀⠀⠀⡇⠀⢹⠈⢧⣣⠀⠘⡇⠀⠀⠀
⠀⠀⢸⡇⠀⠀⠀⡇⠀⡇⢹⠀⠀⠀⢀⡾⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⢠⠃⠀⠀⠠⠟⡯⣻⣇⢃⠇⢠⠏⡇⠀⢸⡆⠀⢸⠀⠈⢳⡀⠀⡇⠀⠀⠀
⠀⠀⠀⣇⠀⡔⠋⡇⠀⢱⢼⠀⠀⡂⣼⡇⢹⣶⣶⣶⣤⣤⣀⠀⠀⠀⣇⠇⠀⠀⠀⠀⣶⡭⢃⣏⡘⠀⡎⠀⠇⠀⡾⣷⠀⣼⠀⠀⠀⢻⡄⡇⠀⠀⠀
⠀⠀⠀⣹⠜⠋⠉⠓⢄⡏⢸⠀⠀⢳⡏⢸⠹⢀⣉⢭⣻⡽⠿⠛⠓⠀⠋⠀⠀⠀⠀⠀⠘⠛⠛⠓⠀⡄⡇⠀⢸⢰⡇⢸⡄⡟⠀⠀⠀⠀⢳⡇⠀⠀⠀
⠀⣠⠞⠁⠀⠀⠀⠀⠀⢙⠌⡇⠀⣿⠁⠀⡇⡗⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⠀⠀⠀⠀⠀⠀⠁⠁⠀⢸⣼⠀⠈⣇⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢸⠁⠀⠀⢀⡠⠔⠚⠉⠉⢱⣇⢸⢧⠀⠀⠸⣱⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⡤⠦⡔⠀⠀⠀⠀⠀⢀⡼⠀⠀⣼⡏⠀⠀⢹⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢸⠀⠀⠀⠋⠀⠀⠀⢀⡠⠤⣿⣾⣇⣧⠀⠀⢫⡆⠀⠀⠀⠀⠀⠀⠀⢨⠀⠀⣠⠇⠀⠀⢀⡠⣶⠋⠀⠀⡸⣾⠁⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢸⡄⠀⠀⠀⠀⠠⠊⠁⠀⠀⢸⢃⠘⡜⡵⡀⠈⢿⡱⢲⡤⠤⢀⣀⣀⡀⠉⠉⣀⡠⡴⠚⠉⣸⢸⠀⠀⢠⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢧⠀⠀⠀⠀⠀⠀⠀⣀⠤⠚⠚⣤⣵⡰⡑⡄⠀⢣⡈⠳⡀⠀⠀⠀⢨⡋⠙⣆⢸⠀⠀⣰⢻⡎⠀⠀⡎⡇⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠈⢷⡀⠀⠀⠀⠀⠀⠁⠀⠀⠀⡸⢌⣳⣵⡈⢦⡀⠳⡀⠈⢦⡀⠀⠘⠏⠲⣌⠙⢒⠴⡧⣸⡇⠀⡸⢸⠇⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢠⣿⠢⡀⠀⠀⠀⠠⠄⡖⠋⠀⠀⠙⢿⣳⡀⠑⢄⠹⣄⡀⠙⢄⡠⠤⠒⠚⡖⡇⠀⠘⣽⡇⢠⠃⢸⢀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣾⠃⠀⠀⠀⠀⠀⢀⡼⣄⠀⠀⠀⠀⠀⠑⣽⣆⠀⠑⢝⡍⠒⠬⢧⣀⡠⠊⠀⠸⡀⠀⢹⡇⡎⠀⡿⢸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⡼⠁⠀⠀⠀⠀⠀⠀⢀⠻⣺⣧⠀⠀⠀⠰⢢⠈⢪⡷⡀⠀⠙⡄⠀⠀⠱⡄⠀⠀⠀⢧⠀⢸⡻⠀⢠⡇⣾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢰⠇⠀⠀⠀⠀⠀⠀⠀⢸⠀⡏⣿⠀⠀⠀⠀⢣⢇⠀⠑⣄⠀⠀⠸⡄⠀⠀⠘⡄⠀⠀⠸⡀⢸⠁⠀⡾⢰⡏⢳⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
you can do this!
*/
