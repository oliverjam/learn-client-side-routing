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

Now you should see the right title render when you click each link.

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

## Enhancements

### Better link listener

We have a bug with our link handlers. We only ever add the handlers once, which means if a link is removed from the page and re-added it will no longer run the route callback when clicked.

Amend your home route handler to render a link to `/contact` underneath the `h1`.

<details>
<summary>Solution</summary>

```js
get("/", () => {
  appContainer.innerHTML = `
    <h1>Hello world</h1>
    <a href="/contact">Another contact link</a>
  `;
});
```

</details>

Since this link is added when we render the home route it never has a click-handler added. This means it doesn't navigate properly.

We can fix this by instead adding the click handler to the _entire page_, then checking whether the event target was a link.

Remove the click handler on every link and instead add one to `window`. Check that the element that was clicked on was a link using `event.target.tagName`, then navigate to the link's `href`.

<details>
<summary>Solution</summary>

```js
function handleClick(event) {
  // tagNames are capitalised (XHTML lol)
  if (event.target.tagName === "A") {
    event.preventDefault();
    navigate(event.target.href);
  }
}

window.addEventListener("click", handleClick);
```

</details>

This should ensure that links navigate correctly even if they're added to the page later. It's also more efficient to have a single listener on pages with lots of links.

</details>

### Making it reusable

Currently the router code is all tangled up with our application code. It would be good to split it out into a standalone module that we can re-use. We want to create something with an API similar to Express:

```js
const app = router();

app.get("/", () => console.log("home route"));
```

Move your router code into a new filename `router.js`. Put the router code into a function named `router` that is default exported. The function should return an object containing the `get` method.

<details>
<summary>Solution</summary>

```js
function router() {
  // all the router stuff
  // ...
  return { get };
}

export default router;
```

</details>

### Starting the router

When the page first loads nothing is rendered. That's because our route callbacks only run when the user clicks a link. It would be good to navigate to the current URL as soon as the page loads.

It would also be nice to give control over _when_ the router starts to handle navigation, kind of like `server.listen()` in Express. That way the user of the router can decide when their app is ready to start routing (once they've set up all their route callbacks). We want an API like this:

```js
const app = router();

app.get("/", () => console.log("home route"));

app.listen();
```

Add a function to your router named `listen`. Move the `click` and `popstate` window event listeners inside of it, so they are only added when `listen` is called. Call `navigate` with the current location, so the first route is loaded as soon as the router starts listening.

Make sure you add `listen` to the returned object.

<details>
<summary>Solution</summary>

```js
function listen() {
  window.addEventListener("click", handleClick);
  window.addEventListener("popstate", () => navigate(window.location));
  navigate(window.location);
}
```

</details>

Add a call to `app.listen()` to your `app.js`. You should see the home route load immediately when the page loads, without having to click the link.

### Other types of clicks

Our click handler doesn't discriminate: it hijacks all kinds of clicks, whether they were intended to navigate or not. We should only hijack the default behaviour when the user does a standard left click without holding any modifier keys. For example on a Mac holding `command` whilst clicking opens the link in a new tab. We've currently broken that behaviour.

Luckily the [click `event`](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvents) has properties that tell us what type of click occurred. Change your click handler so it only navigates if:

1. `event.button` is `0` (standard left mouse button)
1. `altKey`, `ctrlKey`, `metaKey` and `shiftKey` are all false

<details>
<summary>Solution</summary>

```js
function handleClick(event) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    event.ctrlKey
  )
    return;
  if (event.target.tagName === "A") {
    event.preventDefault();
    navigate(event.target.href);
  }
}
```

</details>

Now you should be able to `cmd-click` to open a link in a new tab.

### Missing routes

Our router just does nothing if it can't find a matching callback for a route. This can lead to a weirdly broken looking page. We should add a way to register a "default" route that loads if there are no other matches. This will allow users to add a `404` page like this:

```js
app.get("default", () => console.log("This is the 404 page"));
```

Amend the `navigate` function so that it either uses the callback it finds in the `routes` object, _or_ uses the `default` one.

Add a default route, then try to navigate to a nonexistent URL. You should see your default page rendered.

<details>
<summary>Solution</summary>

```js
// router.js
function navigate(url) {
  const parsedUrl = new URL(url);
  const callback = routes[parsedUrl.pathname] || routes.default;
  window.history.pushState(null, null, parsedUrl.href);
  callback();
}
```

```js
// app.js
app.get("default", () => {
  appContainer.innerHTML = `<h1>Page not found</h1>`;
});
```

</details>

### Opting out of hijacking

We currently hijack clicks for every link on the page. This means it's impossible to link to an external website. We could either make client-side navigation opt _in_ or opt \_out. Since the majority of our links will be internal it makes more sense for external links to opt out of hijacking.

Let's use a [data attribute]() to mark external links, like this:

```html
<a href="https://github.com" data-external>Github</a>
```

Amend your click handler to check whether this data attribute is present before preventing the default navigation. **Hint**: you can use `"thing" in element.dataset` to check if an element has `data-thing` set.

Add a link to an external site like GitHub to test this is working.

<details>
<summary>Solution</summary>

```js
function handleClick(event) {
  if ("external" in event.target.dataset) return;
  if (event.target.tagName === "A") {
    event.preventDefault();
    navigate(event.target.href);
  }
}
```

### Dynamic URLs

We can only use static URLs right now. If we wanted to have links to `/posts/1`, `/posts/2` etc we'd need to define each individually. Ideally we'd have something like Express's route params (`/posts/:id`), but that's pretty complex to implement correctly.

Instead we can rely on something browser URLs have built-in: `searchParams`. Any key/value pairs after a question mark will be parsed for you. Since we're already parsing the URL in `navigate` we can pass that parsed URL into our route callback so it's accessible there. Amend your `navigate` to do this.

Add a new route for `/posts`. Add a link to the homepage with an href of `/posts?id=1`. The route callback will be passed the parsed URL as an argument. Use `url.searchParams.get("id")` to get the ID and render a title containing it.

When you click the link to `/posts?id=1` you should see your post title rendered.

<details>
<summary>Solution</summary>

```js
// router.js
function navigate(url) {
  const parsedUrl = new URL(url);
  // ...
  callback(parsedUrl);
}
```

```js
//app.js
app.get("/posts", (url) => {
  const id = url.searchParams.get("id");
  appContainer.innerHTML = `<h1>Post ${id}</h1>`;
});
```

</details>

### Clean up

Since we've given the user control over when to _start_ routing, we should probably provide a way to stop it too. Add a `close` function inside your router that removes the window event listeners. Don't forget to return it in the object.

<details>
<summary>Solution</summary>

```js
function close() {
  window.removeEventListener("click", handleClick);
  window.removeEventListener("popstate", handlePop);
}
```

</details>

## Conclusion

Congratulations, you've built a client-side router in less than 50 lines of code! Fair warning—this probably isn't ready for production on a serious app, but it's a fun learning process. In the real world you'll probably use something framework-specific like [React Router](https://reacttraining.com/react-router/) or [Vue Router](https://router.vuejs.org/).
