/*
 * @Author: Antoine YANG 
 * @Date: 2019-09-18 15:40:42 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-23 01:34:04
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
        private svg: {};

        public constructor(parent: JQuery<HTMLElement>) {
            this._parent = parent;
            this.svg = {};
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

        public resize(data: Array<S & { key: string | number }>): void {
            this._data = data;
            setTimeout(() => {
                let box: {} = {};
                let update: {} = {};
                for (let i: number = 0; i < this._data.length; i++) {
                    update[this._data[i].key] = true;
                    if (!this.svg.hasOwnProperty(this._data[i].key)) {
                        let s: WhatSVG = new WhatSVG(this._data[i].key, this._parent);
                        box[this._data[i].key] = s;
                        let virtualDOM: {} = {};
                        this.settings.forEach(set => {
                            virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                        });
                        s.setState({ ...virtualDOM, tag: this.tag });
                    }
                }
                for (const key in this.svg) {
                    if (this.svg.hasOwnProperty(key)) {
                        if (!update.hasOwnProperty(key)) {
                            const element: WhatSVG = this.svg[key];
                            element.remove();
                            this.svg[key] = null;
                        }
                    }
                }
                this.svg = box;
            });
        }

        public each(...settings: Array<{attr: string, val: ((data?: S & { key: string | number }, index?: number) => (string | number)) | string | number}>): WhatData<S> {
            this.settings = settings;
            return this;
        }

        protected render(): void {
            setTimeout(() => {
                let box: {} = {};
                let update: {} = {};
                for (let i: number = 0; i < this._data.length; i++) {
                    update[this._data[i].key] = true;
                    if (this.svg.hasOwnProperty(this._data[i].key)) {
                        box[this._data[i].key] = this.svg[this._data[i].key];
                        let virtualDOM: {} = {};
                        this.settings.forEach(set => {
                            virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                        });
                        this.svg[this._data[i].key].setState({ ...virtualDOM, tag: this.tag });
                    }
                    else {
                        let s: WhatSVG = new WhatSVG(this._data[i].key, this._parent);
                        box[this._data[i].key] = s;
                        let virtualDOM: {} = {};
                        this.settings.forEach(set => {
                            virtualDOM[set.attr] = typeof set.val === "function" ? set.val(this._data[i], i) : set.val;
                        });
                        s.setState({ ...virtualDOM, tag: this.tag });
                    }
                }
                for (const key in this.svg) {
                    if (this.svg.hasOwnProperty(key)) {
                        if (!update.hasOwnProperty(key)) {
                            const element: WhatSVG = this.svg[key];
                            element.remove();
                            this.svg[key] = null;
                        }
                    }
                }
                this.svg = box;
            });
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

        protected mount(tag: string): void {
            this.reference = $(jQuery.parseXML(`<${tag} xmlns="http://www.w3.org/2000/svg" />`).documentElement);
            this.parent.append(this.reference);
        }

        protected render(): void {
            setTimeout(() => {
                let virtual: {} = this.state;
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
        }

        protected selfShouldUpdate<K extends keyof S>(state: Pick<S&{}, K>): boolean {
            if (!this.reference) {
                this.mount((Object(state)).tag);
                return true;
            }
            return true;
        }

        public setState<K extends keyof S>(state: Pick<S&{}, K>): WhatSVG<S> {
            if (this.selfShouldUpdate(state)) {
                this.state = { ...this.state, ...state };
                this.render();
            }
            return this;
        }
    };
}
