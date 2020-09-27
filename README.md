### Features for PIXI.js interactivity
Since PIXI 5 has been split into components, I added a feature which uses the same flow that interaction manager has. Import the files in your index.js (at the top) and it should work fine.

**List**
1. window double click event feature for a PIXI.js.
THIS ONE SEEMS TO WORK FINE BUT NEED TO BE TESTED MORE
```javascript

```

2. window touch event was used to create doube touch event feature for a PIXI.js. 
THIS ONE SHOULD BE TESTED
```javascript

const config = {
    width: 300,
    height: 300,
    antialias: true,
    view: document.getElementById("canvas")
};

const app = new Application(config);
app.stage.position.set(150, 150);
const text = new Text("I am the 1stt", {
    fill: "#cfb9b9",
    fontFamily: "Comic Sans MS",
    fontSize: 30,
    fontWeight: "bold"
});

text.anchor.set(0.5);
text.position.set(0, 100);
text.interactive = true;

// will happen if a user makes 2 touches with in the 300 ms at the same object
text.on("dbtouch", (event) => {
    console.log("dbtouch event!");
    // the same event which other PIXI.js events have
    console.log(event);

});

app.stage.addChild(text);

```




