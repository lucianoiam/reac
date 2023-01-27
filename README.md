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
        
        <div @if="true|false">Conditional child</div>

        <ul @loop="{expression}" @start="0" @count="10" @index="i" @value="val">
            <li>The value at index {i} is {val}</li>
        </ul>

        <button onClick="{expression}"></button>

        <ChildComponent someProp="{expression}"></ChildComponent>

        ${expression}


        <!-- Alternate version with non-rendering tag <do> -->

        <do @if="true|false">
            <div>Conditional child</div>
        </do>

        <ul>
            <do @loop="{expression}" @start="0" @count="10" @index="i" @value="val">
                <li>The value at index {i} is {val}</li>
            </do>
        </ul>

    </div>
`);
```

- The parser input is a valid HTML string, no special tokens needed. Therefore 
template literals are enough for interleaving dynamic data.

- Statements are defined by attributes, `@if` for conditional rendering and
`@loop` for iterating arrays.

- Only one statement attribute can be present in a given element.

- The reserved `<do>` element is non-rendering and its purpose is to define
statements without polluting rendering tags. 

- Expressions placed between curly braces in attribute values are evaluated
during parsing, and their result values used for setting prop values.

- Conditional rendering is controlled by attribute `@if` and its possible values
are the strings `true` and `false`.

- Array iteration is implemented by the presence of attributes `@loop`, `@count`
or both. The attributes `@start`, `@index` and `@value` are optional. The return
value of the expression in the `@loop` attribute must be the array that provides
values during iteration. The current index and value can be accessed from any
text content or attribute value of any descendant, via tokens with names defined
in `@index` and `@value`. The default tokens are `{i}` and `{val}` respectively.
The default starting index `@from` is 0. If `@loop` is specified and `@count` is
not specified, then the last index is array length-1. If `@count` is specified
and `@loop` is not specified, only the loop indexes are available.

- Custom component tags are supported by including a map of tag names to
component classes in the renderer options object

- Input HTML can be optionally evaluated before rendering, useful for parsing
external templates while keeping all functionality.

- A single, top level, enclosing HTML element is optional.

See [example.html](https://github.com/lucianoiam/reac/blob/master/example.html)
for more details

Credits
-------

Reac was inspired on [html-react-parser](https://github.com/remarkablemark/html-react-parser)
and [LemonadeJS](https://github.com/lemonadejs/lemonadejs). It is also
compatible with [Preact](https://preactjs.com).
