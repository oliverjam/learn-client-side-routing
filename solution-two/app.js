import router from "./router.js";

const app = router();
const appContainer = document.querySelector("#app");

app.get("/", () => {
  appContainer.innerHTML = `
    <h1>Hello world</h1>
    <a href="/posts?id=1">Post 1</a>
    <a href="https://github.com" data-external>GitHub</a>
  `;
});

app.get("/contact", () => {
  const title = document.createElement("h1");
  title.textContent = "Contact us";
  appContainer.innerHTML = "";
  appContainer.appendChild(title);
});

app.get("default", () => {
  appContainer.innerHTML = `
    <h1>Page not found</h1>
  `;
});

app.get("/posts", ({ url }) => {
  const id = url.searchParams.get("id");
  appContainer.innerHTML = `<h1>Post ${id}</h1>`;
});

app.listen();
