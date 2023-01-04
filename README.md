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

Interface
---------

```js
const reactElements = new ReactNoJSX.Renderer({
    react           : React|preact,         // default React
    childComponents : {tagname:component},  // default {}
    callContext     : argument-for-bind,    // default null (global context)
    evaluateInput   : true|false            // default false
}).render(`
    <div>
        
        <do if="true|false">
        <div>Conditional child</div>
        </do>

        <ul>
        <do from="0" to="10" on="{expression}" index="i" value="val">
            <li>The value at index {i} is {val}</li>
        </do>
        </ul>
        
        <button onClick="{expression}"></button>

        <ChildComponent someProp="{expression}"></ChildComponent>

        ${expression}

    </div>
`);
```

- The parser input is valid HTML text, no special tokens needed. Therefore 
template literals are enough for interleaving dynamic data.

- Only the `<do>` element has a special meaning, it is reserved for conditional
and loop statements. These statement elements can contain multiple children.

- Expressions placed between curly braces in element attribute values are
evaluated during parsing, and their result values are used for setting prop
values. Or in the case of the `<do>` loop `on` attribute, for optionally setting
a source array for the values.

- Custom component tags are supported by including a map of tag names to
component classes in the renderer options object

- Input text can be optionally evaluated before rendering, useful for parsing
external templates while keeping all functionality.

- A single, top level, enclosing HTML element is optional.

See [example.html](https://github.com/lucianoiam/react-nojsx/blob/master/example.html)
for more details

Credits
-------

react-nojsx was inspired on [html-react-parser](https://github.com/remarkablemark/html-react-parser)
and [LemonadeJS](https://github.com/lemonadejs/lemonadejs). It is also
compatible with [Preact](https://preactjs.com).
