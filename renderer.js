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
        this._options = {};
        this._options.react = options.react || React;
        this._options.callContext = options.callContext || null;
        this._options.evaluateInput = options.evaluateInput || false;

        this._options.childComponents = options.childComponents ?
             Object.fromEntries(Object.entries(options.childComponents)
                .map(([k, v]) => [k.toUpperCase(), v])) : {};

        this._tokens = {};
    }

    render(html) {
        if (this._options.evaluateInput) {
            const js = 'return `' + html + '`';
            html = Function(js).bind(this._options.callContext).call();
        }

        const doc = (new DOMParser).parseFromString(html, 'text/html');

        return this._renderHTMLCollection(doc.body.children); 
    }

    _renderHTMLCollection(collection) {
        const rels = [];

        for (const el of collection) {
            rels.push(this._renderHTMLElement(el));
        }

        return rels;
    }

    _renderHTMLElement(el) {
        let rel;

        if (el.tagName == 'DO') {
            return this._renderHTMLElementWithStatement(el);
        } else {
            const react = this._options.react,
                  components = this._options.childComponents,
                  props = this._renderHTMLElementProps(el),
                  children = this._renderHTMLCollection(el.children);

            if (el.tagName in components) {
                rel = react.createElement(components[el.tagName], props, children);
            } else {
                if (children.length > 0) {
                    rel = react.createElement(el.tagName, props, children);
                } else {
                    props.dangerouslySetInnerHTML = {
                        __html: this._replaceTokens(el.innerHTML)
                    };

                    rel = react.createElement(el.tagName, props);
                }
            }
        }

        return rel;
    }

    _renderHTMLElementWithStatement(el) {
        let attrs = {};

        for (const attr of el.attributes) {
            attrs[attr.nodeName] = attr.nodeValue;
        }

        if (attrs.if == 'false') {
            return null;

        } else if (attrs.if == 'true') {
            return this._renderHTMLCollection(el.children);

        } else if (attrs.on || attrs.to) {
            const on = this._evaluate(attrs.on, null),
                  to = (attrs.to && !isNaN(attrs.to)) ? parseFloat(attrs.to)
                                                        : on.length,
                  from = parseFloat(attrs.from || '0'),
                  index = attrs.index || 'i',
                  value = attrs.value || 'val';

            let rels = [];
            this._tokens = {};

            for (let i = from; i < to; i++) {
                this._tokens[index] = String(i);

                if (on) {
                    this._tokens[value] = on[i];
                }

                rels = rels.concat(this._renderHTMLCollection(el.children));
            }

            return rels;

        } else {
            throw new Error('Malformed statement ' + el.cloneNode(false).outerHTML);
        }
    }

    _renderHTMLElementProps(el) {
        const attrToProp = this.constructor.attributeToPropMap,
              props = {};

        for (const attr of el.attributes) {
            const locaseName = attr.nodeName.toLowerCase(),
                  name = locaseName in attrToProp ? attrToProp[locaseName]
                                                    : attr.nodeName,
                  value = this._replaceTokens(attr.nodeValue);

            if (name == 'style') {
                props.style = {};

                for (let i = 0; i < el.style.length; i++) {
                    const item = el.style.item(i);
                    props.style[item] = el.style[item];
                }
            } else {
                props[name] = this._evaluate(value, value);
            }
        }

        return props;
    }

    _evaluate(exp, def) {
        if (exp && exp.startsWith('{') && exp.endsWith('}')) {
            const js = 'return (' + exp.substring(1, exp.length - 1) + ')',
                  val = Function(js).bind(this._options.callContext).call();

            return typeof(val) === 'function' ?
                                    val.bind(this._options.callContext)
                                    : val;
        }

        return def;
    }

    _replaceTokens(s) {
        if (! this._tokens) {
            return s;
        }

        for (const [token, value] of Object.entries(this._tokens)) {
            s = s.replace('{' + token + '}', value);
        }

        return s;
    }

}

// TODO : this is very incomplete
Renderer.attributeToPropMap = {
    'onchange' : 'onChange',
    'onclick'  : 'onClick',
    'oninput'  : 'onInput',
};

window.ReactNoJSX = window.ReactNoJSX || {};
window.ReactNoJSX.Renderer = Renderer;

})();
