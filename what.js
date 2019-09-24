/*
* @Author: Antoine YANG
* @Date: 2019-09-18 15:40:42
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-23 02:51:51
*/

"use strict";


var What;
(function (What) {
    var WhatData = /** @class */ (function () {
        function WhatData(parent) {
            this._parent = parent;
            this.svg = {};
            this.tag = "circle";
            this.settings = [];
        }
        WhatData.prototype.use = function (tag) {
            this.tag = tag;
            return this;
        };
        WhatData.prototype.bind = function (data) {
            this._data = data;
            this.render();
        };
        WhatData.prototype.resize = function (data) {
            this._data = data;
            setTimeout(() => {
                let box = {};
                let update = {};
                for (let i = 0; i < this._data.length; i++) {
                    update[this._data[i].key] = true;
                    if (!this.svg.hasOwnProperty(this._data[i].key)) {
                        let s = new WhatSVG(this._data[i].key, this._parent);
                        box[this._data[i].key] = s;
                        let virtualDOM = {};
                        this.settings.forEach(set => {
                            virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                        });
                        s.setState({ ...virtualDOM, tag: this.tag });
                    }
                }
                for (const key in this.svg) {
                    if (this.svg.hasOwnProperty(key)) {
                        if (!update.hasOwnProperty(key)) {
                            const element = this.svg[key];
                            element.remove();
                            this.svg[key] = null;
                        }
                    }
                }
                this.svg = box;
                stop();
            });
        };
        WhatData.prototype.each = function (...settings) {
            this.settings = settings;
            return this;
        };
        WhatData.prototype.render = function () {
            let box = {};
            let update = {};
            let process = 0;
            let i = 0;
            let loop = () => {setTimeout(() => {
                i = process;
                if (i >= this._data.length) {
                    for (const key in this.svg) {
                        if (this.svg.hasOwnProperty(key)) {
                            if (!update.hasOwnProperty(key)) {
                                const element = this.svg[key];
                                element.remove();
                                this.svg[key] = null;
                            }
                        }
                    }
                    this.svg = box;
                    loop = () => {};
                    stop();
                }
                else {
                    for (; i < process + 200 && i < this._data.length; i++) {
                        update[this._data[i].key] = true;
                        if (this.svg.hasOwnProperty(this._data[i].key)) {
                            box[this._data[i].key] = this.svg[this._data[i].key];
                            let virtualDOM = {};
                            this.settings.forEach(set => {
                                virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                            });
                            this.svg[this._data[i].key].setState({ ...virtualDOM, tag: this.tag });
                        }
                        else {
                            let s = new WhatSVG(this._data[i].key, this._parent);
                            box[this._data[i].key] = s;
                            let virtualDOM = {};
                            this.settings.forEach(set => {
                                virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                            });
                            s.setState({ ...virtualDOM, tag: this.tag });
                        }
                    }
                    process += 200;
                    setTimeout(loop(), 0);
                }
            });}
            loop();
        };
        return WhatData;
    }());
    What.WhatData = WhatData;

    var WhatSVG = /** @class */ (function () {
        function WhatSVG(key, parent) {
            this.key = key;
            this.parent = parent;
            this.virtualdom = {};
        }
        WhatSVG.prototype.getKey = function () {
            return this.key;
        };
        WhatSVG.prototype.ref = function () {
            return this.reference;
        };
        WhatSVG.prototype.remove = function () {
            $(this.reference).remove();
        };
        WhatSVG.prototype.mount = function (tag) {
            this.reference = jQuery.parseXML("<" + tag + " xmlns=\"http://www.w3.org/2000/svg\" />").documentElement;
            this.parent.append(this.reference);
        };
        WhatSVG.prototype.render = function () {
            setTimeout(() => {
                let virtual = this.state;
                for (const key in virtual) {
                    if (virtual.hasOwnProperty(key)) {
                        if (key.toString() === "tag") {
                            continue;
                        }
                        const element = virtual[key];
                        if (this.virtualdom.hasOwnProperty(key) && this.virtualdom[key] === element) {
                            continue;
                        }
                        $(this.reference).attr(key.toString(), element.toString());
                    }
                }
                this.virtualdom = { ...this.virtualdom, ...virtual };
            });
        };
        WhatSVG.prototype.selfShouldUpdate = function (state) {
            if (!this.reference) {
                this.mount(state.tag);
                return true;
            }
            return true;
        };
        WhatSVG.prototype.setState = function (state) {
            if (this.selfShouldUpdate(state)) {
                this.state = { ...this.state, ...state };
                this.render();
            }
            return this;
        };
        return WhatSVG;
    }());
    What.WhatSVG = WhatSVG;
})(What || (What = {}));
