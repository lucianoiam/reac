Reactant
--------

*React And No Transpiler*

This project provides some utilities for using React without JSX. It is more of
a hack and learning tool than a general solution for using React without JSX. It
only covers a few simple cases useful for my own projects.

What is included
----------------

| File | Contents
|------|---------
| [renderer.js](https://github.com/lucianoiam/reactant/blob/master/renderer.js) | Class for converting HTML text into a `React.Element` tree
| [component.js](https://github.com/lucianoiam/reactant/blob/master/component.js) | Optional `React.Component` subclass for convenience

Interface
---------

```js
const reactElements = new Reactant.Renderer({
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
        <do iterate="{expression}" from="0" to="10" index="i" value="val">
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
values.

- A loop statement is defined by a `<do>` element with attribute `iterate` or
`to`, or both. The attributes `from`, `index` and `value` are optional. The
return value of the expression in the optional `iterate` attribute must be the
array that provides values during iteration. The current index and value can be
accessed from any text content or attribute value in any descendant of `<do>`,
via tokens with names defined in `index` and `value`. The default tokens are
`{i}` and `{val}` respectively. The default starting index (`from`) is 0. If
`iterate` is specified and `to` is not specified, the last index is array
length-1. If `to` is specified and `iterate` is not specified, only indexes are
available.

- A conditional statement is defined by a `<do>` element with attribute `if`,
and the only possible values are the strings `true` and `false`.

- Custom component tags are supported by including a map of tag names to
component classes in the renderer options object

- Input HTML can be optionally evaluated before rendering, useful for parsing
external templates while keeping all functionality.

- A single, top level, enclosing HTML element is optional.

See [example.html](https://github.com/lucianoiam/reactant/blob/master/example.html)
for more details

Credits
-------

reactant was inspired on [html-react-parser](https://github.com/remarkablemark/html-react-parser)
and [LemonadeJS](https://github.com/lemonadejs/lemonadejs). It is also
compatible with [Preact](https://preactjs.com).
