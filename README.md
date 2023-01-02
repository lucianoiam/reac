react-nojsx
-----------

*Utilities for using React without JSX*

This project is more of a hack and learning tool than a general solution for
using React without JSX. It only covers a few simple cases useful for my own
projects. Contributions are welcome.

What is included
----------------

| File | Contents
|------|---------
| [renderer.js](https://github.com/lucianoiam/react-nojsx/blob/master/renderer.js) | Class for converting HTML text into a `React.Element` tree
| [component.js](https://github.com/lucianoiam/react-nojsx/blob/master/component.js) | Optional `React.Component` subclass for convenience

Markup syntax
-------------

```js
const html = `<div>
                 <button onClick="{function}">
                    ${string}
                 </button>
                 <ChildComponent someProp="{anything}"></ChildComponent>
              </div>`;
```

- Expressions placed between curly braces are evaluated during parsing and
the result values used for setting the prop values

- Custom component tags are supported by including a map of tag names to
component classes in the renderer options object

- Since the parser accepts HTML strings as input, template literals are enough
for inserting dynamic data.

See [example.html](https://github.com/lucianoiam/react-nojsx/blob/master/example.html)
for a complete example.

Credits
-------

react-nojsx was inspired on [html-react-parser](https://github.com/remarkablemark/html-react-parser)
and [LemonadeJS](https://github.com/lemonadejs/lemonadejs). It is also
compatible with [Preact](https://preactjs.com).
