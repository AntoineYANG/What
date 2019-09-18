/*
 * @Author: Antoine YANG 
 * @Date: 2019-09-18 15:40:42 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-18 20:28:00
 */

import $ from 'jQuery';

namespace What {
    export type Pick<T, K extends keyof T> = {
        [P in K]: T[P];
    };

    export class WhatData<S = {}> {
        private _data: Array<S & { key: string | number }>;
        private settings: Array<{attr: string, val: ((data?: S & { key: string | number }, index?: number) => (string | number)) | string | number}>;
        private readonly _parent: JQuery<HTMLElement>;
        private tag: string;
        private svg: Array<WhatSVG>;

        public constructor(parent: JQuery<HTMLElement>) {
            this._parent = parent;
            this.svg = [];
            this.tag = "circle";
            this.settings = [];
        }

        public use(tag: string): WhatData<S> {
            this.tag = tag;
            return this;
        }

        public bind(data: Array<S & { key: string | number }>): void {
            this._data = data;
            this.render();
        }

        public each(...settings: Array<{attr: string, val: ((data?: S & { key: string | number }, index?: number) => (string | number)) | string | number}>): WhatData<S> {
            this.settings = settings;
            return this;
        }

        protected render(): void {
            let box: Array<WhatSVG> = [];
            for (let i: number = 0; i < this._data.length; i++) {
                let flag: boolean = false;
                for (let e: number = 0; e < this.svg.length; e++) {
                    if (this.svg[e].getKey() === this._data[i].key) {
                        flag = true;
                        box.push(this.svg[e]);
                        let virtualDOM: {} = {};
                        this.settings.forEach(set => {
                            virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                        });
                        this.svg[e].setState({ ...virtualDOM, tag: this.tag });
                        break;
                    }
                }
                if (!flag) {
                    let s: WhatSVG = new WhatSVG(this._data[i].key, this._parent);
                    box.push(s);
                    let virtualDOM: {} = {};
                    this.settings.forEach(set => {
                        virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                    });
                    s.setState({ ...virtualDOM, tag: this.tag });
                }
            }
            for (let i: number = 0; i < this.svg.length; i++) {
                let flag: boolean = false;
                for (let e: number = 0; e < this._data.length; e++) {
                    if (this.svg[i].getKey() === this._data[e].key) {
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
    };

    export class WhatSVG<S extends { tag: string } = { tag: string }> {
        protected readonly key: string | number;
        protected state: S & {};
        protected readonly parent: JQuery<HTMLElement>;
        private reference: JQuery<HTMLElement>;
        private virtualdom: {};

        public constructor(key: string | number, parent: JQuery<HTMLElement>) {
            this.key = key;
            this.parent = parent;
            this.virtualdom = {};
        }

        public getKey(): string | number {
            return this.key;
        }

        public ref(): JQuery<HTMLElement> {
            return this.reference;
        }

        public remove(): void {
            $(this.reference).remove();
        }

        protected render(): void {
            if (!this.reference) {
                this.reference = $(jQuery.parseXML(
                        `<${this.state.tag} xmlns="http://www.w3.org/2000/svg" />`
                    ).documentElement);
                this.parent.append(this.reference);
            }
            let virtual: {} = this.state;
            for (const key in virtual) {
                if (key.toString() === "tag") {
                    continue;
                }
                if (virtual.hasOwnProperty(key)) {
                    const element = virtual[key];
                    if (this.virtualdom.hasOwnProperty(key) && this.virtualdom[key] === element) {
                        continue;
                    }
                    $(this.reference).attr(key.toString(), element.toString());
                }
            }
            this.virtualdom = { ...this.virtualdom, ...virtual };
        }

        public setState<K extends keyof S>(state: Pick<S&{}, K>): WhatSVG<S> {
            this.state = { ...this.state, ...state };
            this.render();
            return this;
        }
    };
}
