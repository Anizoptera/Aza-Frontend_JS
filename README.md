# AzaJS

AzaJS is a front-end JavaScript-framework having many useful tools and proposing an approach to organize the workflow.

The main goals of the framework are:
* Building efficient modular web-applications without loading redundant code.
* Ability to develop and launch web-apps right away without any pre-compilation or build systems (e.g Grunt, Gulp, Webpack).
* Providing a flexible routing system that allows to run the code that is actually needed in that particular place of an app.
* Providing some GUI-less functionality that is frequently used in many projects and is GUI-independant (e.g. Drag-n-Drop helpers, File-API tools, etc.).
* Offering a convenient way to build an optimized production version of the code.


## Getting started

**1)** Place a copy of AzaJS framework into a separate folder inside the directory where your js-code is.

For example, if you're planning to store your js-code inside `assets/js`, then place the framework into `assets/js/_framework` (I add underscore just for beter separation from the rest project code).

**2)** Include `_require.js` on your html-pages:

```html
<script src="/assets/js/_framework/_require.js"></script>
```

**3)** Start creating the project code in a separate file, that is also included on your pages:

```html
<script src="/assets/js/main.js"></script>
```

This file will be the entry point where your application starts working (a bootstrap). In this file you should configure paths for require.js:

```js
require.config({
	baseUrl: "/assets/js/_framework",
	paths: {
		"app": ".."
	}
});
```

And that's it! Now you can easily use the stuff from AzaJS and your own project code as well:

```js
require(["jquery", "aza/Core", "app/ModalWindow"], function($, Aza, ModalWindow) {
	var md = new ModalWindow($("#anchor"));
	// etc
});
```

**Note!** _If you're developing an app that will be running within the environment that already has a `require` method (e.g. Nodejs app), then you should use `requirejs` instead of `require`._

In the example above we required 3 dependencies:
`jquery`,
the `Core` class of AzaJS,
and `ModalWindow` – a file placed on the `app` path, which we configured earlier.

The `ModalWindow` file, as well as other files, should follow the [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) syntax of defining modules:

```js
define(["jquery", "aza/browser/Detector"], function($, Detector)
{
	function ModalWindow() {
		// logic
	}

	return ModalWindow;
});
```

So, the simpliest app will have such file tree:

```
assets/
  css/
  img/
  js/
    _framework/
    main.js
    ModalWindow.js
```


### File tree of more sophisticated projects

If your project is getting bigger, then it probably consists of several parts that have almost completelly different code. Online-stores, for example, may have **a main site part**, and **an admin-panel**. Of course we don't want to load the admin-panel code on the main part of our site. That's why we are going to create 2 separate files for each of these site parts:

```
assets/
  css/
  img/
  js/
    _framework/
    admin/
      ProductEditor.js
      Toolbar.js
      ...
    main/
      CartWidget.js
      ModalWindow.js
      ...
    admin.js
    main.js
```

As you can see, I created 2 files: `main.js` and `admin.js`; and also 2 corresponding folders where I'm going to store all the code related to the site part.

If there is some mutual code then feel free to create, let's say, the `_common` directory for it, and use code from it in every site part.


## Preparing for production

Nobody likes tons of requests on web sites, so now we're going to merge all the js-files into a single one using the awesome [r.js](http://requirejs.org/docs/optimization.html) tool. `r.js` combines related scripts together and minifies them via **UglifyJS** or **Closure Compiler**. Additionally it can optimize CSS.

The optimizer can be run using Node, Java with Rhino or Nashorn, or in the browser, but it is strongly recommended to use the Node-version, as it is **much** faster than others.

**1)** Create an `r.js` configuration file (e.g. `rjs-config-main.js`) and place it, let's say, to the root of the project. In this case configuration paths for building the `main` module will be like below:

```js
({
	// Get all the configured paths from 'main.js',
	// so we don't have to set up them here
	mainConfigFile: ["assets/js/main.js"],

	// Output file
	out: "_dist/main.js",

	// Path where the framework is located
	baseUrl: "assets/js/_framework",

	// The module to compile ('main' implies 'main.js')
	name: "app/main",

	// Include a light version of require.js,
	// that implements AMD API, but doesn't
	// provide dynamic script loading
	include: ["_almond"]
})
```

If you have several site parts, then create a separate config for each part.

**2)** Open terminal from the project root and run the command:

```
node assets/js/_framework/rjs/r.js -o rjs-config-main.js
```

In a few seconds a file will appear in the `_dist` folder. In the production you should use **only** this single file and nothing more. Don't add `_require.js` on your pages because a minimal version of AMD loader (called [almond](https://github.com/requirejs/almond)) is already included in `main.js`.


## License

The framework code, as well as all the used libraries, is licensed under the MIT License.


## Contacts

Developed by Oleg Cherr
* https://vk.com/olegcherr
* https://www.facebook.com/olegcherr
