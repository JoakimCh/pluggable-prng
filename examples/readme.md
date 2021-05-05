# Examples

These examples have successfully been tested in [Node.js](https://nodejs.org), [Deno](https://deno.land/) and a [Chromium based browser](https://en.wikipedia.org/wiki/Chromium_(web_browser)#Browsers_based_on_Chromium).

## How to run them

### Node.js
```shell
node example_1
```

If you're on a Unix compatible system there's also the shell script `node_runAll.sh` which will run them all.

### Deno
```shell
deno run --import-map=import_map.json example_1.js
```

If you're on a Unix compatible system there's also the shell script `deno_runAll.sh` which will run them all.

### Browser
Fire up a server in this directory e.g. `npx serve`. Then open `example_1.html` in a Chromium based browser and check the console output.

#### Other browsers / legacy support

For running them in legacy browsers (outdated browsers that nobody should be using) or browsers lagging behind when it comes to supporting new features (like Firefox and Safari) you need to use something like [Babel](https://babeljs.io/), [webpack](https://webpack.js.org/) or [Browserify](http://browserify.org/) with support/plugin for [import maps](). There is [this plugin](https://www.npmjs.com/package/babel-plugin-import-map) for Babel which should make this possible.

Do NOT ask me for support on how to get it working using any of those tools. I find them super cumbersome and will never personally use any of them; since I'm fine with only supporting Chromium based browsers for any of my own projects.
