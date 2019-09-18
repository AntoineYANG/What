/*
* @Author: Antoine YANG
* @Date: 2019-09-18 15:40:42
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-18 20:25:03
*/

"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


var What;
(function (What) {
    var WhatData = /** @class */ (function () {
        function WhatData(parent) {
            this._parent = parent;
            this.svg = [];
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
        WhatData.prototype.each = function () {
            var settings = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                settings[_i] = arguments[_i];
            }
            this.settings = settings;
            return this;
        };
        WhatData.prototype.render = function () {
            let box = [];
            for (let i = 0; i < this._data.length; i++) {
                let flag = false;
                for (let e = 0; e < this.svg.length; e++) {
                    if (this.svg[e].getKey() === this._data[i].key) {
                        flag = true;
                        box.push(this.svg[e]);
                        let virtualDOM = {};
                        this.settings.forEach(set => {
                            virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                        });
                        this.svg[e].setState({ ...virtualDOM, tag: this.tag });
                        break;
                    }
                }
                if (!flag) {
                    let s = new WhatSVG(this._data[i].key, this._parent);
                    box.push(s);
                    let virtualDOM = {};
                    this.settings.forEach(set => {
                        virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                    });
                    s.setState({ ...virtualDOM, tag: this.tag });
                }
            }
            for (let i = 0; i < this.svg.length; i++) {
                let flag = false;
                for (let e = 0; e < this._data.length; e++) {
                    if (this._data[e].key === this.svg[i].getKey()) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    this.svg[i].remove();
                }
            }
            this.svg = box;
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
        WhatSVG.prototype.render = function () {
            if (!this.reference) {
                this.reference = jQuery.parseXML("<" + this.state.tag + " xmlns=\"http://www.w3.org/2000/svg\" />").documentElement;
                $(this.parent).append(this.reference);
            }
            var virtual = this.state;
            for (var key in virtual) {
                if (key.toString() === "tag") {
                    continue;
                }
                if (virtual.hasOwnProperty(key)) {
                    var element = virtual[key];
                    if (this.virtualdom.hasOwnProperty(key) && this.virtualdom[key] === element) {
                        continue;
                    }
                    $(this.reference).attr(key.toString(), element.toString());
                }
            }
            this.virtualdom = __assign({}, this.virtualdom, virtual);
        };
        WhatSVG.prototype.setState = function (state) {
            this.state = __assign({}, this.state, state);
            this.render();
            return this;
        };
        return WhatSVG;
    }());
    What.WhatSVG = WhatSVG;
})(What || (What = {}));
