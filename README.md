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

The secret sauce for client-side routing is `event.preventDefault()`. You may have used this to stop form elements auto-submitting requests to the server. Other events can also have their default action prevented. If we call this in the click handler of a link element the normal `GET` request will not be sent and the page will not navigate to the new URL.

Open `workshop/app.js`. Select all the `a` tags using `querySelectorAll`, then loop through them and _for each_ tag add an event listener for the click event.
