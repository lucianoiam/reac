/*
 * react-nojsx - Utilities for using React/Preact without JSX
 * Copyright (C) 2023 Luciano Iam <oss@lucianoiam.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

(() => {

class HTMLRenderer {

    constructor(options) {
        if (!options || !options.react) {
            throw new Error('React library must be specified');
        }

        this._options = options;
        this._options.callContext = this._options.callContext || null;

        this._options.childComponents = options.childComponents ?
             Object.fromEntries(Object.entries(options.childComponents)
                .map(([k, v]) => [k.toUpperCase(), v])) : {};
    }

    render(html) {
        const doc = (new DOMParser).parseFromString(html, 'text/html');
        return this._renderHTMLCollection(doc.body.children);
    }

    _renderHTMLCollection(collection) {
        const reactElements = [];

        for (const element of collection) {
            reactElements.push(this._renderHTMLElement(element));
        }

        return reactElements;
    }

    _renderHTMLElement(element) {
        const react = this._options.react,
              components = this._options.childComponents,
              props = this._renderHTMLElementProps(element),
              children = this._renderHTMLCollection(element.children);

        let reactElement;

        if (element.tagName in components) {
            reactElement = react.createElement(components[element.tagName], props, children);
        } else {
            if (children.length > 0) {
                reactElement = react.createElement(element.tagName, props, children);
            } else {
                props.dangerouslySetInnerHTML = { __html: element.innerHTML };
                reactElement = react.createElement(element.tagName, props);
            }
        }

        return reactElement;
    }

    _renderHTMLElementProps(element) {
        const This = this.constructor,
              props = {};

        for (const attribute of element.attributes) {
            const lowerCaseName = attribute.nodeName.toLowerCase(),
                  name = lowerCaseName in This.attributePropMap ? This.attributePropMap[lowerCaseName]
                            : attribute.nodeName,
                  value = attribute.nodeValue;

            if (name == 'style') {
                props.style = {};

                for (let i = 0; i < element.style.length; i++) {
                    const item = element.style.item(i);
                    props.style[item] = element.style[item];
                }
            } else {
                if (value.startsWith('{') && value.endsWith('}')) {
                    const js = 'return ' + value.substring(1, value.length - 1),
                          propVal = Function(js).bind(this._options.callContext).call();

                    if (typeof(propVal) === 'function') {
                        props[name] = propVal.bind(this._options.callContext);
                    } else {
                        props[name] = propVal;
                    }
                } else {
                    props[name] = value;
                }
            }
        }

        return props;
    }
}

// TODO : this is very incomplete
HTMLRenderer.attributePropMap = {
    'onchange' : 'onChange',
    'onclick'  : 'onClick',
    'oninput'  : 'onInput',
};

window.ReactNoJSX = window.ReactNoJSX || {};
window.ReactNoJSX.HTMLRenderer = HTMLRenderer;

})();
