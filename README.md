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
const html = `
    <div>
        
        <do if="true|false">
        <div>Conditional child</div>
        </do>

        <ul>
        <do from="0" to="10" step="1" iter="index">
            <li>Current iteration is {index}</li>
        </do>
        </ul>
        
        <button onClick="{function}"></button>

        <ChildComponent someProp="{expression}"></ChildComponent>

        ${string}

    </div>
`;
```

- The parser input is valid HTML text, no special tokens needed. Template
literals are enough for interleaving dynamic data.

- Only the `<do>` element has a special meaning and is reserved for statements.
These statement elements can contain multiple children.

- Expressions placed between curly braces in element attribute values are
evaluated during parsing, and their result values are used for setting prop
values.

- When the value of `iter` enclosed between curly braces is found within the
text content or attribute value of any `<do>` loop element descendant, it gets
replaced by the iteration number. The default arguments for loops are
`from="0"`, `step="1"` and `iter="i"`. The latter makes the iteration number
available in token `{i}` by default.

- Custom component tags are supported by including a map of tag names to
component classes in the renderer options object

- A single, top level, enclosing HTML element is optional.

See [example.html](https://github.com/lucianoiam/react-nojsx/blob/master/example.html)
for more details

Credits
-------

react-nojsx was inspired on [html-react-parser](https://github.com/remarkablemark/html-react-parser)
and [LemonadeJS](https://github.com/lemonadejs/lemonadejs). It is also
compatible with [Preact](https://preactjs.com).
