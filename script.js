const container = document.getElementById("main-container");
console.log(container)

fetch("http://localhost:42069/template")
    .then(r => r.text())
    .then(html => {
        container.innerHTML = html;
    })
