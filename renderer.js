/*
 * Reac - Utilities for using React/Preact without JSX
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
            rels.push(this._renderHTMLElementWithStatement(el));
        }

        return rels;
    }

    _renderHTMLElementWithStatement(el) {
        let rel;

        const nonRendering = el.tagName == 'DO',
              attrs = {};

        for (const attr of el.attributes) {
            attrs[attr.nodeName] = attr.nodeValue;
        }

        if (attrs['@if'] == 'false') {
            rel = null;

        } else if (attrs['@if'] == 'true') {
            rel = nonRendering ? this._renderHTMLCollection(el.children)
                               : this._renderHTMLElement(el, null);

        } else if (attrs['@loop']) {
            const loop  = this._evaluate(attrs['@loop'] , null),
                  index = attrs['@index'] || 'i',
                  value = attrs['@value'] || 'val';

            let rels = [];
            this._tokens = {};

            for (let i = 0; i < loop.length; i++) {
                this._tokens[index] = String(i);

                if (loop) {
                    this._tokens[value] = loop[i];
                }

                rels = rels.concat(this._renderHTMLCollection(el.children));
            }

            rel = nonRendering ? rels : this._renderHTMLElement(el, rels);
        
        } else {
            rel = this._renderHTMLElement(el, null);
        }

        return rel;
    }

    _renderHTMLElement(el, children) {
        const react = this._options.react,
              components = this._options.childComponents,
              recursive = children === null,
              props = this._renderHTMLElementProps(el);

        let rel;

        if (recursive) {
            children = this._renderHTMLCollection(el.children);
        }

        if (el.tagName in components) {
            rel = react.createElement(components[el.tagName], props, children);
        } else {
            if (children.length > 0) {
                rel = react.createElement(el.tagName, props, children);
            } else {
                if (recursive) {
                    props.dangerouslySetInnerHTML = {
                        __html: this._replaceTokens(el.innerHTML)
                    };
                }

                rel = react.createElement(el.tagName, props);
            }
        }

        return rel;
    }

    _renderHTMLElementProps(el) {
        const This = this.constructor,
              props = {};

        for (const attr of el.attributes) {
            if (This.statementAttributes.indexOf(attr.nodeName) != -1) {
                continue;
            }

            const locaseName = attr.nodeName.toLowerCase(),
                  name = locaseName in This.attributeToPropMap ?
                            This.attributeToPropMap[locaseName] : attr.nodeName,
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

Renderer.statementAttributes = [
    '@if', '@loop', '@index', '@value'
];

// TODO : this is very incomplete
Renderer.attributeToPropMap = {
    'onchange' : 'onChange',
    'onclick'  : 'onClick',
    'oninput'  : 'onInput',
};

window.Reac = window.Reac || {};
window.Reac.Renderer = Renderer;

})();
