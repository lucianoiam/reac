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

class Renderer {

    constructor(options) {
        if (!options || !options.react) {
            throw new Error('React library must be specified');
        }

        this._options = options;
        this._options.callContext = this._options.callContext || null;

        this._options.childComponents = options.childComponents ?
             Object.fromEntries(Object.entries(options.childComponents)
                .map(([k, v]) => [k.toUpperCase(), v])) : {};

        this._replacement = {};
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
        let reactElement;

        if (element.tagName == 'DO') {
            return this._renderHTMLElementWithStatement(element);
        } else {
            const react = this._options.react,
                  components = this._options.childComponents,
                  props = this._renderHTMLElementProps(element),
                  children = this._renderHTMLCollection(element.children);

            if (element.tagName in components) {
                reactElement = react.createElement(components[element.tagName], props, children);
            } else {
                if (children.length > 0) {
                    reactElement = react.createElement(element.tagName, props, children);
                } else {
                    props.dangerouslySetInnerHTML = {
                        __html: this._replaceTokenIfNeeded(element.innerHTML)
                    };
                    reactElement = react.createElement(element.tagName, props);
                }
            }
        }

        return reactElement;
    }

    _renderHTMLElementWithStatement(element) {
        let attributes = {};

        for (const attribute of element.attributes) {
            attributes[attribute.nodeName] = attribute.nodeValue;
        }

        if (attributes.if == 'false') {
            return null;
        } if (attributes.if == 'true') {
            return this._renderHTMLCollection(element.children);
        } else if (! isNaN(attributes.to)) {
            const to = parseFloat(attributes.to),
                  from = parseFloat(attributes.from || '0'),
                  step = parseFloat(attributes.step || '1');

            this._replacement.token = '{' + (attributes.iter || 'i') + '}';

            let reactElements = [];

            for (let i = from; i < to; i += step) {
                this._replacement.value = String(i);
                reactElements = reactElements.concat(this._renderHTMLCollection(element.children));
            }

            this._replacement = {};

            return reactElements;
        } else {
            throw new Error('Malformed statement ' + element.cloneNode(false).outerHTML);
        }
    }

    _renderHTMLElementProps(element) {
        const This = this.constructor,
              props = {};

        for (const attribute of element.attributes) {
            const lowerCaseName = attribute.nodeName.toLowerCase(),
                  name = lowerCaseName in This.attributePropMap ? This.attributePropMap[lowerCaseName]
                            : attribute.nodeName,
                  value = this._replaceTokenIfNeeded(attribute.nodeValue);

            if (name == 'style') {
                props.style = {};

                for (let i = 0; i < element.style.length; i++) {
                    const item = element.style.item(i);
                    props.style[item] = element.style[item];
                }
            } else {
                if (value.startsWith('{') && value.endsWith('}')) {
                    const js = 'return (' + value.substring(1, value.length - 1) + ')',
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

    _replaceTokenIfNeeded(s) {
        return this._replacement ? s.replace(this._replacement.token, this._replacement.value) : s;
    }

}

// TODO : this is very incomplete
Renderer.attributePropMap = {
    'onchange' : 'onChange',
    'onclick'  : 'onClick',
    'oninput'  : 'onInput',
};

window.ReactNoJSX = window.ReactNoJSX || {};
window.ReactNoJSX.Renderer = Renderer;

})();
