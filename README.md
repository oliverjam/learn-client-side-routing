# Learn client-side routing

Single-page apps generally only request one HTML page from the server. After that all content is rendered in the browser using JavaScript.

You can just replace content as the user interacts with your UI, but this has some user-experience problems. New "pages" don't get added to the browser history, which breaks the back button. Since the URL never changes the user can't open a new tab or link to anything but the homepage. It also makes it more difficult to manage your application: modelling each "page" as a separate route makes things easier for you.

We can create a better user-experience by replicating how navigation normally works in the browser. Ideally we'll be able to register a bunch of URLs with a router, defining callback functions for each (just like on the server). When the user clicks a link our router should run the callback, allowing us to update the page accordingly.

Here's the API we're aiming for:

```js
const app = router();
const appContainer = document.querySelector("#app");

app.get("/", () => {
  const title = document.createElement("h1");
  title.textContent = "Hello world";
  appContainer.innerHTML = "";
  appContainer.appendChild(title);
});
```

The router will not care about how you render elements. It's unopinionated—you give it a callback to execute when the URL changes and it lets you handle the page update.

## Page structure

Since all our UI is going to be rendered via JavaScript we won't have much HTML. However we do need a container that we render into. This allows us to clear out the old page's elements and render the new ones on each navigation. So we'll start with an empty `<div id="app">`.

If we have any static "app shell" elements we can put those in the HTML too. For example we want the navigation to be at the top of every page.

```html
<body>
  <nav>
    <a href="/">Home</a>
    <a href="contact">Contact</a>
  </nav>
  <div id="app"></div>
</body>
```

This HTML structure is created for you in `workshop/index.html`.

## Routing magic

### Hijacking links

The secret sauce for client-side routing is `event.preventDefault()`. You may have used this to stop form elements auto-submitting requests to the server. Other events can also have their default action prevented. If we call this in the click handler of a link element the normal `GET` request will not be sent and the page will not navigate to the new URL.

Open `workshop/app.js`. Select all the `a` tags using `querySelectorAll`, then loop through them and _for each_ tag add an event listener for the click event.

The event listener should call `event.preventDefault`, then log `event.target.href`. This will show us which URL the clicked link pointed at.

<details>
<summary>Solution</summary>

```js
const links = document.querySelectorAll("a");
links.forEach((link) => link.addEventListener("click", handleClick));

function handleClick(event) {
  event.preventDefault();
  console.log(event.target.href);
}
```

</details>

The page should not change when you click a link, but you should see the `href` logged in the console.

### Route callbacks

We need a way to keep track of registered routes and the callback to run for each one. Create an empty object named `routes`. Whenever the app adds a new route we'll store it in here.

We also need a function that allows us to register new route. Write a function named `get` that takes two arguments: the path string (e.g. `"/"` or `"/about"`) and the callback function to run for that route.

`get` should add a new entry to the `routes` object each time it's called. The key should be the path and the value should be the callback. E.g.

```js
get("/about", () => console.log("rendering /about"));
```

should result in a routes object like this:

```js
{
  "/about": () => console.log("rendering /about")
}
```

<details>
<summary>Solution</summary>

```js
let routes = {};

function get(path, callback) {
  routes[path] = callback;
}
```

</details>

### Navigating

So we have stopped the default browser navigation and gathered a list of available routes. We need to re-implement navigation: when the user clicks a link we should find the callback registered for that URL and call it.

Write a function named `navigate` that takes a url as its only argument. It should get the pathname from the URL, then use this path to find the matching route callback in the `routes` object. Once you have the callback, call it.

**Hint**: you can get a parsed URL object using `new URL(href)`. This will have a pathname property.

Amend your link click handlers to call `navigate` with the `href` property of the link. You can test this is working by registering a route like this:

```js
get("/contact", () => console.log("navigating to contact"));
```

Clicking the contact link should log "navigating to contact".

<details>
<summary>Solution</summary>

```js
function handleClick(event) {
  event.preventDefault();
  navigate(event.target.href);
}

function navigate(url) {
  const parsedUrl = new URL(url);
  const callback = routes[parsedUrl.pathname];
  callback();
}
```

</details>

### Rendering routes

We now have a rudimentary router. Let's add routes for `"/"` and `"/contact"` so we can see how we'd use the router.

Use `get` to register a callback for each route. Use whatever method you like to render an `h1` containing some different text per route. Don't forget you'll need to clear out the old elements before rendering anything new, otherwise you'll get double pages.

<details>
<summary>Solution</summary>

```js
get("/", () => {
  const title = document.createElement("h1");
  title.textContent = "Learn Routing";
  appContainer.innerHTML = "";
  appContainer.appendChild(title);
});

get("/contact", () => {
  const title = document.createElement("h1");
  title.textContent = "Contact us";
  appContainer.innerHTML = "";
  appContainer.appendChild(title);
});
```

</details>

Currently when the page first loads nothing is rendered. That's because our route callbacks only run when the user clicks a link. It would be good to navigate to the current URL as soon as the page loads. Add an immediate call to `navigate` with the current location.

<details>
<summary>Solution</summary>

```js
navigate(window.location);
```

</details>

### Fixing the back button

We have implemented navigation but unfortunately broken the browser history. Users generally expect websites to work a certain way, so it's a good idea to try and be consistent with other sites.

Luckily HTML5 added a `history` API for interacting with the browser history. We need to manually push new entries into the history every time we "navigate" using JS. We can use [`window.history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) to do this:

```js
window.history.pushState(null, null, "http://example.com/whatever");
```

Frustratingly you almost never need to pass the first two arguments (state and title). The third is the URL to add to the history stack.

Use `pushState` inside your `navigate` function to add the full URL to the history.

<details>
<summary>Solution</summary>

```js
function navigate(url) {
  const parsedUrl = new URL(url);
  const callback = routes[parsedUrl.pathname];
  window.history.pushState(null, null, parsedUrl.href);
  callback();
}
```

</details>

If you click links now you should see the history update (right click the back button to see previous pages). Unfortunately the page doesn't actually re-render, since we aren't calling our route callback when the history changes.

Luckily there is an event called "popstate" that is fired whenever the user clicks the back or forward button. E.g.

```js
window.addEventListener("popstate", () => {
  console.log(`Going to ${window.location}`);
});
```

Add a `popstate` listener to the window that navigates to the current location. This should make the back/forward history buttons work correctly.

That's it! You have a minimum viable client-side router. There are however lots of improvements we can make.

