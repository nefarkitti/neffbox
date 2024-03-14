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

async function onJoinRoom() {
    if (localStorage.getItem("username") == null) return alert("set your username!")
    const errorText = document.getElementById("errortextjoin");
    const roomID = document.getElementById("roomid");
    if (!roomID) return console.error("Could not find roomID");
    if (!errorText) return console.error("Could not find errorText");
    try {
        const response = await axios.post(`${URL}/join`, {
            roomID: roomID.value,
            username: localStorage.getItem("username")
        })
        localStorage.setItem("tempData", JSON.stringify(response.data))
        window.location.href = `/sti/${roomID.value}`
    } catch (e) {
        console.error(e)
        if (!e.response) {
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
async function onCreateRoom() {
    if (localStorage.getItem("username") == null) return alert("set your username!")
    const errorText = document.getElementById("errortextcreate");
    if (!errorText) return console.error("Could not find errorText");
    try {
        const response = await axios.post(`${URL}/create`, {
            username: localStorage.getItem("username")
        })
        window.location.href = `/sti/${response.data.id}`
    } catch (e) {
        console.error(e)
        if (!e.response) {
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