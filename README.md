Reac
----

*React without Transpiler*

This project provides some utilities for using React without JSX. It is more of
a hack and learning tool than a general solution for using React without JSX.

What is included
----------------

| File | Contents
|------|---------
| [renderer.js](https://github.com/lucianoiam/reac/blob/master/renderer.js) | Class for converting HTML text into a `React.Element` tree
| [component.js](https://github.com/lucianoiam/reac/blob/master/component.js) | Optional `React.Component` subclass for convenience

Interface
---------

```js
const reactElements = new Reac.Renderer({
    react           : React|preact,         // default React
    childComponents : {tagname:component},  // default {}
    callContext     : argument-for-bind,    // default null (global context)
    evaluateInput   : true|false            // default false
}).render(`
    <div>

        <div @if="true|false">
            Conditional element
        </div>

        <ul @loop="{expression}">
            <li data-index="{i}">
                The value at index {i} is {val}
            </li>
        </ul>

        <button onClick="{expression}"></button>

        <ChildComponent someProp="{expression}"></ChildComponent>

        ${expression}

    </div>
`);
```

- The parser input is a valid HTML string, no special tokens are needed.
Therefore template literals are enough for interleaving dynamic data.

- Statements and their arguments are defined by attributes. Statement attribute
`@if` implements conditional rendering and `@loop` array iteration.

- Only one statement attribute can be present in a given element.

- Expressions placed between curly braces in attribute values are evaluated
during parsing, and their result values used for setting prop values.

- Possible values for `@if` are the strings `true` and `false`.

- The return value of the `@loop` expression must be the array to be iterated.
The current iteration index and value are accesssible from any text content or
attribute value of any descendant, via tokens with names defined in optional
argument attributes `@index` and `@value`. The default tokens are `i` and `val`
respectively.

- There is a special non-rendering `<do>` element whose purpose is to define
statements without polluting rendering tags. 

- Custom component tags are supported by including a map of tag names to
component classes in the renderer options object

- Input HTML can be optionally evaluated before rendering, useful for parsing
external templates while keeping all functionality.

- A single, top level, enclosing HTML element is not required.

See [example.html](https://github.com/lucianoiam/reac/blob/master/example.html)
for more details

Credits
-------

Reac was inspired on [html-react-parser](https://github.com/remarkablemark/html-react-parser)
and [LemonadeJS](https://github.com/lemonadejs/lemonadejs). It is also
compatible with [Preact](https://preactjs.com).
