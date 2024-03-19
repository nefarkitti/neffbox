let URL = "https://neffi.firee.dev/neffbox"
console.log(window.location.host)
if (window.location.host.startsWith("localhost")) {
    URL = "http://localhost:3000"
}