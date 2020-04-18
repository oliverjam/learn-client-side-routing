const links = document.querySelectorAll("a");
links.forEach((link) => link.addEventListener("click", handleClick));

function handleClick(event) {
  event.preventDefault();
  window.history.pushState(null, null, event.target.href);
  navigate(event.target.href);
}

let routes = {};

function get(path, callback) {
  routes[path] = callback;
}

function navigate(url) {
  const parsedUrl = new URL(url);
  const callback = routes[parsedUrl.pathname];
  callback();
}

const appContainer = document.querySelector("#app");

get("/", () => {
  appContainer.innerHTML = `
    <h1>Hello world</h1>
    <a href="/contact">Another contact link</a>
  `;
});

get("/contact", () => {
  const title = document.createElement("h1");
  title.textContent = "Contact us";
  appContainer.innerHTML = "";
  appContainer.appendChild(title);
});

// navigate(window.location);

window.addEventListener("popstate", () => {
  navigate(window.location);
});
