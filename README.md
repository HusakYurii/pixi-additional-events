### Features for PIXI.js interactivity
Since PIXI 5 has been split into components, I added a feature which uses the same flow that interaction manager has.
To use the events, copy files to your project. Then import the files in your index.js (at the top) and it should work fine.

**List**
1. window double click event feature for a PIXI.js.
THIS ONE SEEMS TO WORK FINE BUT NEED TO BE TESTED MORE
```javascript
import "./path_to_the_file/dbclick.js";

// the usage of this one is pretty straightforward
const text = new Text("Test the dblclick", {
    fill: "#cfb9b9",
    fontSize: 30,
});

// if a user is currently on PC, it will work
text.on("dblclick", (event) => {
    console.log("dblclick event!");
    // the same event which other PIXI.js events have
    console.log(event);
});

```

2. window touch event was used to create doube touch event feature for a PIXI.js. 
THIS ONE SHOULD BE TESTED
```javascript
import "./path_to_the_file/dbtouch.js";

const config = {
    width: 300,
    height: 300,
    antialias: true,
    view: document.getElementById("canvas")
};

const app = new Application(config);
app.stage.position.set(150, 150);
const text = new Text("I am for testing!", {
    fill: "#cfb9b9",
    fontFamily: "Comic Sans MS",
    fontSize: 30,
    fontWeight: "bold"
});

// will happen if a user makes 2 touches with in the 300 ms at the same object
text.on("dbltouch", (event) => {
    console.log("dbtouch event!");
    // the same event which other PIXI.js events have
    console.log(event);

});

app.stage.addChild(text);

```




