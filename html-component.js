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

class HTMLComponent extends React.Component {

    constructor(props, childComponents) {
        super(props);

        this._renderer = new ReactNoJSX.HTMLRenderer({
            react: React,
            childComponents: childComponents,
            callContext: this
        });
    }
    
    render() {
        return this._renderer.render(this.renderHTML());
    }

    renderHTML() {
        throw new Error('renderHTML must be implemented');
    }

}

window.ReactNoJSX = window.ReactNoJSX || {};
window.ReactNoJSX.HTMLComponent = HTMLComponent;
