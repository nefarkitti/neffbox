//let URL = "https://neffi.firee.dev/neffbox"
let URL = "https://neffbox.firee.dev"
console.log(window.location.host)
if (window.location.host.startsWith("localhost")) {
    URL = "http://localhost:3000"
}
