// totally not copied from nyaco.tk
async function aTimer(page) {
    const menu = document.getElementById("menu");
    try {
        await axios({
            url: `${URL}/verify`,
            method: "POST",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        
        if (page == "main") {
            if (menu) { // logged in
                const userIcon = document.createElement("div");
                userIcon.style.border = "solid black 2px";
                userIcon.classList.add("usericon")
                userIcon.id = "whyisthisnotworking12345132451"
                userIcon.style.backgroundColor = "white";
                axios({
                    url: `${URL}/user/@me?inventory=1`,
                    method: "GET",
                    headers: {
                        "authorization": session
                    },
                    timeout: 5000
                }).then(res => {
                    const userData = res.data;
                    const inventory = userData.inventory
                    /*userIcon.innerHTML = `<div class="outline" style="background-image: url('../assets/icons/bases/neck_outline.gif');"></div>
                    <div style="background-image: url('../assets/icons/bases/white_neck_base.gif');"></div>
                    <div class="outline" style="background-image: url('../assets/icons/bases/circle_outline.gif');"></div>
                    <div style="background-image: url('../assets/icons/bases/white_circle_base.gif');"></div>

                    <div class="outline" style="background-image: url('../assets/icons/faces/mouth/smile.gif');"></div>`*/ 
                    document.getElementById("whyisthisnotworking12345132451").innerHTML = generateIcon(inventory.filter(item => item.equip), inventory.filter(item => item.type == "bases" && item.equip == 1)[0].filename, userData.shape).innerHTML
                })
                menu.appendChild(userIcon);
                const welcome = document.createElement("h3");
                welcome.style.margin = 0;
                welcome.style.marginBottom = "20px";
                welcome.id = "currentUser"
                welcome.innerText = `Welcome, ${localStorage.getItem("username")}`
                menu.appendChild(welcome);
                menu.innerHTML += `<button onclick="onRoomList()">view rooms</button><span>or</span>
                <input type="text" name="roomidjoin" id="roomidjoin" placeholder="room id">
                <button onclick="onJoinRoom()">join directly</button>
                <span id="errortext" hidden>what</span>`

                //<button>view rooms</button>
                /*
            <h3 style="margin: 0;margin-bottom: 20px;" id="currentUser">Welcome, (username)</h3>
            <button>view rooms</button>
            <span>or</span>
            <input type="text" name="roomid" id="roomid" placeholder="room id">
            <button onclick="onJoinRoom()">join directly</button>-->
                */
                
            }
        }
    } catch (error) {
        if (error.response && error.response.status == 401 && !["main","404"].includes(page)) {
            window.location.href = '/';
        } else if (page == "main") {
            if (page == "main") {
                if (menu) { // logged out
                    const loginPopupButton = document.createElement("button");
                    loginPopupButton.innerText = "log in"
                    loginPopupButton.onclick = function() {
                        const loginDiv = document.createElement("div")
                        loginDiv.innerHTML = `<h1>Account</h1>
                            <h2>login</h2>
                            <label for="username">username:</label>
                            <input type="text" name="username" id="l-user">
                            <br>
                            <label for="password">password:</label>
                            <input type="password" name="password" id="l-pwd">
                            <br>`
                        const loginButton = document.createElement("button");
                        loginButton.innerText = "LOG IN";
                        
                        loginButton.onclick = async function() {
                            const username = document.getElementById('l-user').value;
                            const password = document.getElementById('l-pwd').value;
                            if ([username.length,password.length].includes(0)) return createPopup(createErrorDiv("One of the values is not provided!"))
                            if (!checkValid("username", username)) return;
                            try {
                                const verifyAuth = await axios.post(`${URL}/auth`, {
                                    username,
                                    password
                                });
                                if (verifyAuth) {
                                    localStorage.setItem('osuliterallysucks', verifyAuth.data.token);
                                    localStorage.setItem("username", username);
                                    location.reload();
                                }
                            } catch (e) {
                                console.error(e);
                                createPopup(createErrorDiv(e.response.data))
                            }
                        }
                        const registerRedirect = document.createElement("button");
                        registerRedirect.innerText = "register";
                        loginDiv.appendChild(loginButton);
                        loginDiv.appendChild(document.createElement("br"));
                        loginDiv.appendChild(document.createElement("br"));
                        const spanOr = document.createElement("span");
                        spanOr.innerText = "or ";
                        loginDiv.appendChild(spanOr); // I have to do this stupid thing or else the event wont work
                        loginDiv.appendChild(registerRedirect);
                        
                        const registerDiv = document.createElement("div")
                        registerDiv.innerHTML = `<h1>Account</h1>
                        <h2>register</h2>
                        <label for="username">username:</label>
                        <input type="text" name="username" id="s-user">
                        <br>
                        <label for="password">password:</label>
                        <input type="password" name="password" id="s-pwd">
                        <br>
                        <label for="confirmpassword">confirm password:</label>
                        <input type="password" name="confirmpassword" id="s-cpwd">
                        <br>
                        <p style="font-size: 10px;">*make sure to save your password somewhere!</p>`
                        const registerButton = document.createElement("button");
                        registerButton.innerText = "REGISTER";
                        registerButton.onclick = async function() {
                            const username = document.getElementById('s-user').value;
                            const password = document.getElementById('s-pwd').value;
                            const confirmPass = document.getElementById('s-cpwd').value;
                            if ([username.length,password.length,confirmPass.length].includes(0)) return createPopup(createErrorDiv("One of the values is not provided!"))
                            if (!checkValid("username", username)) return;
                            if (password != confirmPass) return createPopup(createErrorDiv("Password and Confirm Password don't share the same value!"));
                            try {
                                const verifyAuth = await axios.post(`${URL}/register`, {
                                    username,
                                    password
                                });
                                if (verifyAuth) {
                                    localStorage.setItem('osuliterallysucks', verifyAuth.data.token);
                                    localStorage.setItem("username", username);
                                    location.reload();
                                }
                            } catch (e) {
                                console.error(e);
                                createPopup(createErrorDiv(e.response.data))
                            }
                        }
                        registerDiv.appendChild(registerButton);
                        registerDiv.appendChild(document.createElement("br"));
                        registerDiv.appendChild(document.createElement("br"));

                        const loginPopup = createPopup(loginDiv);
                        registerRedirect.onclick = function() {
                            loginPopup.remove();
                            createPopup(registerDiv);
                        }
                    }
                    menu.appendChild(loginPopupButton);
                }
            }
        } else {
            console.log(error);
            if (["ECONNABORTED", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT"].includes(error.code) || error.response.status == 0) {
                setTimeout(() => aTimer(page), 3000);
            }
        }
    }
}

async function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("osuliterallysucks");
    window.location.href = "/"
}

async function checkAuth(page) {
    aTimer(page)
    updateSettings();
    if (["main","404"].includes(page)) return;
    setInterval(async function() {
        aTimer(page);
    }, 60000)
    // uncomment when we release hA
}

/*
⣿⣻⣿⣿⡟⠀⠀⠀⠀⠀⠀⢀⣴⣿⡿⢟⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢫⣊⣽⣵⠖⠀⠻⣿⣿⣿⣿⣿⣿⣯⢻⣿⣷⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠙⠳⣄⠀⠀⠀⠀⠀⠀⠀⠀⣐⢣
⣿⣷⣻⣿⠁⠀⠀⠀⠀⠀⣰⣿⠟⠉⢐⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠜⣫⣿⢯⡞⠀⠀⠹⣿⣿⣿⣿⣿⣿⠀⢿⣿⡄⣀⣴⣟⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠈⠂⠀⠀⠀⠀⠀⠀⠀⢆⢧
⣿⣿⣷⠉⠀⠀⠀⠀⢀⡾⠋⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⣿⣿⣇⣴⢏⣵⢏⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⠀⠈⢿⣧⠓⢉⣯⢧⢿⣿⣿⣿⣿⠌⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⡜⣎
⣿⣿⣿⠀⠀⠀⠀⠀⠋⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⠇⣼⣷⠟⠁⠀⢀⡴⢃⠀⠹⣿⣿⣿⣿⡃⠀⠈⣿⡔⠋⣡⢣⣾⠿⣿⣿⣿⡃⢸⣿⣿⣿⣿⣿⣿⣿⣿⣷⡈⢻⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠜⣲
⣿⣿⡯⠀⠀⠀⠀⠀⠀⠀⠀⢀⢮⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣗⣿⣿⣿⠾⠋⠁⠀⣠⢞⡿⡵⡻⣂⠀⢹⣿⣿⣿⡇⠀⣴⡻⣷⣔⣯⢾⠵⢫⢿⣿⣿⠅⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠙⢿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⣸⡱
⣞⣿⡃⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⢟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢨⡗⣿⣿⠀⠀⠀⠈⠙⢫⢋⣼⣿⡛⠀⠀⢻⣿⣿⡆⠀⠙⣡⣼⣾⢜⣣⢔⣵⣫⣿⣿⡁⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠻⣿⠀⠀⠀⠀⠀⠀⠀⠀⠰⢨⣱⢹
⣿⠼⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⡿⠟⠁⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠈⠀⢻⣿⢀⣀⣀⣀⠤⢤⣉⣁⠈⠛⠃⠀⠘⣿⣿⠇⠀⠀⠀⠀⣈⣧⣉⣛⣑⣛⡍⢿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠚⣧⠀⠀⠀⠀⠀⠀⢀⢃⠳⣬⠳
⣿⠃⠀⠀⠀⠀⠀⠀⢀⣾⠟⠋⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠐⠒⢻⣿⠁⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⡹⣿⡃⠀⠀⠉⠉⠁⠀⠀⠀⠀⠀⠈⠹⠉⠓⠂⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠑⠀⠀⠀⠀⠀⠄⣎⢳⡜⡳
⣿⠁⠀⠀⠀⠀⠀⠀⠋⠁⠀⠀⠀⢀⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡗⠀⠀⠈⣿⣀⡤⠠⠄⠤⣀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠅⢠⠄⠀⠀⣴⣒⠶⠭⠤⢄⣀⡀⠀⠀⠀⢸⡏⢿⣿⣿⣿⣿⣿⣿⣿⠈⠻⣿⣷⣄⠀⠀⠀⠀⠀⢀⡚⣬⢳⣚⠵
⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡌⢢⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⢀⣨⣟⠶⠶⠉⠛⠓⠭⣍⣉⠒⠀⠀⠀⠀⠀⠸⠇⡞⠀⢒⡩⢕⡒⠐⠂⠒⠒⠒⠪⢅⡀⠀⢸⠀⢸⣿⣿⣿⣿⣿⣿⣿⡇⠀⠈⠙⢿⣮⣢⣄⠀⡐⢬⡺⡵⣏⢮⡓
⡗⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⡄⣻⣿⣿⣿⡿⣻⣿⣿⣿⣿⣿⣿⢻⣿⣿⡇⣠⠟⣉⣀⣀⣀⡠⠄⣀⣀⠈⡙⠻⠄⠀⠀⠀⢀⣴⢿⠃⢰⣟⠫⠥⠤⠠⢠⣤⠠⠤⠤⣀⡉⠂⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠈⠪⠝⠿⣽⣰⢣⣟⡽⣎⠷⡡
⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡘⢰⣻⣿⣿⡟⠁⣿⣿⣿⣿⣿⣿⣿⠈⣿⣿⡟⠫⠥⠤⠤⠼⠿⠧⠤⠔⢒⡋⠁⠀⠀⠀⠀⠀⠉⣼⣻⠀⠘⠫⢔⣒⡒⠠⠼⢟⢣⢖⣒⠒⠋⠁⢀⠀⢨⣿⣿⣿⣿⡝⣿⣿⣿⠀⠀⢀⠠⡐⣋⠖⣼⣻⠿⣼⢯⡝⣧⠑
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡱⠌⣿⣿⡟⠀⢸⣿⣿⣿⣿⣿⣿⣿⡀⢹⣿⡗⠈⠓⠒⠒⠒⠒⠒⠲⠟⠛⢉⣵⡦⣶⠀⠀⠀⠀⠉⣟⠀⠀⠙⠒⠒⠠⠍⠻⡤⠂⠒⠲⡖⠋⠉⠉⠀⢸⣿⣿⣿⣿⡇⠸⣿⣿⡃⠰⣌⠲⡱⡜⣾⣱⢯⡿⡽⣾⡹⢆⡍
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢑⡀⣿⡟⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⢿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠟⠁⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠉⠀⠀⠀⠀⣾⣿⣿⣿⣿⣷⢐⢻⣿⣇⠳⣌⡳⣽⣹⢾⣽⢯⡿⣽⢶⡛⢦⠐
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢢⠀⣿⠁⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠸⢿⠀⠀⣀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠹⠰⢤⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⢻⣿⣿⣿⣿⣿⣎⡽⣿⣧⣛⡼⣳⢷⣯⡿⣯⡿⣽⡳⣯⢝⠢⡁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡠⢈⠃⢠⣾⡿⠋⢁⣿⣿⣿⡿⣿⣿⣷⠀⠀⠈⣀⣼⣥⢞⣅⠀⠀⠀⠀⠀⠀⡰⠋⢉⣉⡀⠀⠀⠀⠀⢀⣠⣀⠀⠹⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠿⠳⣿⣿⣷⣽⣻⡷⣾⢽⣯⣿⢾⣟⣷⣻⡗⣿⡱⣎⠱⡀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⢁⠂⣾⡿⠋⠀⠀⢸⣿⣽⢱⢲⡌⠻⣿⣇⢰⡾⣟⣷⡟⣫⠞⠀⠀⠀⠀⠀⠀⢧⡀⢾⣿⣿⠀⠀⠀⠠⣻⣿⡿⢂⡴⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⡴⣾⢣⢹⣿⢿⡿⣟⡿⣽⣻⢾⣽⣻⢞⡷⣯⢟⡾⣱⢎⠱⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠄⠁⠀⠀⠀⢀⠀⢻⢿⠀⢸⣽⣆⢹⡹⠀⢀⣼⣷⠿⣫⠀⡀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣯⣶⣿⠀⣾⣿⣻⣽⢿⣽⣳⣯⣟⡾⣽⢯⡿⣭⣟⣞⡳⢎⠢⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣈⠂⠄⠀⠀⠀⠈⠀⠀⢪⢧⠘⣧⣻⣀⡇⠀⠚⡡⢋⣴⡷⣻⡧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣼⡧⠏⣰⣿⣳⣟⡾⣯⣟⣷⣻⢾⡽⣯⢷⣻⣳⡽⢮⡝⢎⡰⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠐⣄⠊⠄⠀⠀⠀⠀⠀⠀⠀⠩⡳⣀⠉⠙⠻⡄⠀⣵⣿⡯⣺⣿⡥⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢤⠋⢀⣠⢞⡏⢷⣛⡾⣽⣳⣟⡾⣽⢯⡿⣽⢯⣷⣻⡼⣻⡜⣡⠂⡁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠌⡰⢈⠄⠀⠀⠀⠀⠀⠀⠀⠀⠉⡈⠳⢦⣄⣹⡄⠑⠋⠈⠙⠋⠓⠀⢀⣀⡤⠴⢖⡒⣒⢒⡒⣒⢒⡒⢖⠲⡒⢦⠤⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⣠⠞⢒⠫⡐⢊⠜⣢⢛⡼⢳⣛⡾⣽⢯⡿⣽⢯⣟⣾⣳⡽⣣⠟⡤⠁⠄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡑⢌⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡑⢢⠐⡀⠙⢦⡀⠀⠀⠀⠀⠐⠛⠓⠚⠓⠒⠓⠚⠒⠓⠞⠦⠙⠮⠱⠭⠖⠳⠴⠒⠦⠭⠟⠂⠀⠀⢀⡴⠃⠁⠀⠁⡘⠄⢊⢄⠣⢜⠣⣏⡽⣏⡿⣽⢯⣟⡾⣷⢯⣷⢫⣝⡰⢁⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡑⢌⠂⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠢⠑⠄⠂⠀⠙⢦⡀⠀⠀⠀⠀⠀⠉⠒⠒⠦⠤⠤⠤⢀⣀⣀⠀⡀⣀⢀⡠⠤⠤⠀⠀⠀⠀⣠⠴⠋⠀⠀⠀⠀⠀⠀⠈⠀⠌⠒⡈⠱⢌⡚⣭⢻⣽⣻⢾⡽⣯⣟⡾⣝⢦⡑⢂⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⢠⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⢈⠐⠀⠈⠐⣙⢳⡤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠴⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢁⠂⡱⢌⡻⣜⣯⠿⣽⣳⢯⡽⣞⢧⡙⠄⠂
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠜⣄⠊⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠄⠀⠁⢆⠣⣜⠢⡉⠙⣶⢦⣤⣄⣀⣀⣀⡀⣀⣀⣀⣀⣤⡤⠴⠒⠋⠍⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢀⠢⠱⣙⢮⢿⡽⢯⣻⡽⣝⡮⡕⢊⠄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢭⠰⡈⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠈⢄⠫⡔⢣⠐⠀⢸⣎⡜⡹⢻⢿⣿⣿⣿⣿⣿⠟⣻⠁⠀⠀⠀⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⡌⢾⡹⣞⣯⢷⣻⡝⣾⣉⠆⡀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢊⠵⣁⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠈⡕⣪⢅⠊⠀⠸⡝⢶⣡⢃⡎⡜⣩⢫⡑⢦⣹⢾⠀⠀⠀⠀⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡰⣙⠾⣽⣞⣳⣻⠵⣍⠖⡀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢜⡢⢅⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⠒⡥⣊⠔⠀⠀⡇⠀⠙⢶⣸⡰⢡⢆⣹⠖⠃⢸⠀⠀⠀⠀⡐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⠐⣩⢛⡼⣞⣳⣭⠿⣜⢣⠐
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢪⡜⡥⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡉⢖⡡⢊⠀⠀⡇⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⢸⠄⠀⠀⠀⠐⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠠⢋⡼⢭⣳⣭⢟⡼⢢⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢡⢚⡴⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣢⢑⠢⠀⢀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⢸⡆⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠂⡜⢣⢗⣮⢻⣜⠣⠌
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣈⠞⡴⣁⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⢎⡁⠂⢸⠃⠀⠀⠀⠀⠀⠀⠀⠀⣴⠇⠸⡇⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⠘⠤⣋⢼⡳⢮⣙⠂
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⣀⠻⡴⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣌⣧⣘⡀⡟⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⠇⠀⢿⡂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢁⠂⡱⢪⣝⡳⣌⠣
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠁⠤⣛⠴⣁⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣾⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⣠⠞⣱⠗⣳⡄⠘⣧⣶⣶⣷⣶⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⡁⠳⣌⠷⣭⠒
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⢁⠲⣍⠷⣀⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⣿⣿⣿⣿⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠸⣾⠕⣹⣟⣴⠆⠘⢏⠙⢿⣿⡿⣿⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⠱⡌⣟⢶⡩
⠀⠀⠀⠀⠀⠀⠀⠀⠠⡘⢀⠲⣭⡳⡅⠀⠀⠀⠀⣠⣤⣤⣤⣤⣴⣶⣶⣿⣿⣿⣿⣿⣿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⣰⠟⡵⢃⣤⠏⡀⠓⠌⣻⣿⣟⣿⣿⣿⣿⣶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠒⡸⢬⣳⢣
⠀⠀⠀⠀⠀⠀⠀⠀⠤⡑⠂⡜⣶⡻⡔⣁⡤⠤⠚⣿⣿⣿⣿⢿⣻⣿⣻⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠞⢡⡮⠔⢡⢫⡿⠃⠀⠀⠀⢿⣿⣻⣿⣿⢿⣿⡿⣿⣿⣿⣶⣶⣾⣶⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠣⢏⡾⣱
⠀⠀⠀⠀⠀⠀⠀⢀⠢⢡⠁⣼⣳⠟⠋⠁⠀⠀⠀⣿⣿⣿⣿⣻⣿⣳⣿⣿⣻⣯⣿⡏⠒⠲⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠰⢃⣉⡤⠤⠤⠴⠒⠚⣿⣿⣽⣿⣿⣿⣿⣟⣾⡿⣽⣿⢿⣿⣿⣷⠢⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣍⢺⡱⢧
⠀⠀⠀⠀⠀⠀⠀⢀⠎⣐⡶⠋⠀⠀⣀⠀⠀⠀⠀⢼⣿⣿⡿⣽⣷⣿⣿⣻⣽⣷⡿⠁⠀⠀⠀⠀⠀⠀⠙⢦⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠉⠀⠀⠀⠀⠀⠀⠀⢸⣿⣯⣿⣿⣿⣿⣿⣯⣿⣟⣯⣿⣿⣷⣿⡆⠀⠉⠲⢄⡀⠀⠀⠀⠀⠀⠀⣂⠧⡝⣧
⠀⠀⠀⠀⠀⠀⠀⢢⡼⠋⠀⢀⡠⠞⠁⠀⠀⠀⠀⣾⣿⣿⡿⣿⣽⣾⣟⣿⣽⣾⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠒⠀⠀⠀⠀⠀⠾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣽⣿⣿⣯⣿⣿⢷⣿⣻⣽⣿⣯⣿⡇⠀⠀⠀⠀⠉⠢⣄⠀⠀⠀⠀⢄⠫⡼⣱
⠀⠀⠀⠀⠀⠀⣰⠏⢀⣠⢔⡋⠀⣀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣻⣽⣾⢿⣽⣾⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡎⢸⣿⣯⣿⣿⣿⣿⣾⢿⣻⣿⣽⣿⣿⣽⣿⠀⠀⠀⠀⠀⣠⢼⠗⣤⠀⠀⢀⢣⢳⡱
⠀⠀⠀⠀⠀⡴⠃⡨⠏⣡⣫⠔⠋⠁⠀⠀⠀⠀⢰⣿⣿⣿⣷⣿⣻⣽⡿⣯⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢞⠝⣜⣨⣿⣿⣽⣿⣿⣿⣾⡿⣟⣷⡿⣽⣿⡿⣿⠀⠀⠀⡴⠊⠱⢃⣞⠴⡷⣄⠀⢎⠲⣍
⠀⠀⠀⠀⡼⠑⣊⠤⢚⡥⣊⡀⠀⠀⠀⡀⠀⠀⢸⣿⣿⣿⡾⣟⣿⣽⣿⣻⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠃⣎⠜⣫⡠⣿⣿⣽⣿⣷⣿⣿⢿⣟⣯⣿⡿⣿⣿⢿⡇⠀⠀⠀⢠⠴⠊⠁⠼⣵⡏⡳⣌⠳⣌
⠀⠀⠀⡼⠁⠀⢠⠔⢉⢴⠟⠀⣀⡴⠚⠁⠀⠀⣿⣿⣿⣷⡿⣿⣯⣿⢾⣟⣿⠀⠀⠀⠀⠀⠀⢀⡴⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢠⠞⢁⢞⡕⢡⣿⣿⣽⣾⣿⣯⣿⣿⣿⣻⣷⣿⣿⡿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠀⠈⢷⡌
⠀⠀⣰⠃⠀⠀⠀⠀⠑⢃⡤⡞⠁⠀⠀⠀⠀⢸⣿⣿⣿⢷⣿⣟⣷⡿⣿⣻⣿⡀⠀⠀⠀⠀⢶⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⣿⡇⢸⣿⡿⣾⣟⣿⣻⣽⣿⣷⣿⣻⣾⢿⣿⣟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻
⠀⢀⠃⠀⠀⠀⢀⡠⠖⣡⢞⠤⠀⠀⠀⠀⢀⣿⣿⣿⣿⣻⣽⣾⣟⣿⣟⣯⣿⣧⠀⠀⠀⠀⠈⢛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠴⠃⠀⠀⠀⠀⠀⠀⠀⠈⠀⣾⣿⣟⣿⣽⣟⣿⣻⣿⣿⢾⡿⣽⣿⣿⡿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
*/