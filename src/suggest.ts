/*
--------------------------------------------------------
suggest.js - Input Suggest
Version 2.3.1 (Update 2013/02/11)

Copyright (c) 2006-2013 onozaty (http://www.enjoyxstudy.com)

Released under an MIT-style license.

For details, see the web site:
 http://www.enjoyxstudy.com/javascript/suggest/

--------------------------------------------------------
*/

class Suggest {
    /*-- KeyCodes -----------------------------------------*/
    static KEY = {
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        UP: 38,
        DOWN: 40
    };
    
    /*-- Utils --------------------------------------------*/
    copyProperties = function (dest: object, src: object) {
        for (var property in src) {
            dest[property] = src[property];
        }
        return dest;
    };
}

/*-- Suggest.Local ------------------------------------*/
class SuggestLocal extends Suggest {
    // options
    interval = 500;
    dispMax = 20;
    listTagName = 'div';
    prefix = false;
    ignoreCase = true;
    highlight = false;
    dispAllKey = false;
    classMouseOver = 'over';
    classSelect = 'select';
    hookBeforeSearch = (text: string) => {};
    
    input: HTMLInputElement;
    suggestArea: HTMLElement;
    candidateList: any[];
    oldText: string;
    timerId: number|undefined;
    suggestIndexList: number[];
    suggestList?: HTMLElement[];
    activePosition?: number;
    inputValueBackup: string;

    constructor(input: string, suggestArea: string, candidateList: any[], options?: object) {
        super();

        this.input = this.#getElement(input) as HTMLInputElement;
        this.suggestArea = this.#getElement(suggestArea);
        this.candidateList = candidateList;
        this.oldText = this.getInputText();

        if (options) this.setOptions(options);

        // reg event
        this.#addEvent(this.input, 'focus', this.#bind(this.checkLoop));
        this.#addEvent(this.input, 'blur', this.#bind(this.inputBlur));
        this.#addEvent(this.suggestArea, 'blur', this.#bind(this.inputBlur));

        this.#addEvent(this.input, 'keydown', this.#bindEvent(this.keyEvent));

        // init
        this.clearSuggestArea();

    }
    
    setOptions(options: object) {
        this.copyProperties(this, options);
    }

    inputBlur() {

        setTimeout(this.#bind(function () {

            if (document.activeElement == this.suggestArea
                || document.activeElement == this.input) {
                // keep suggestion
                return;
            }

            this.changeUnactive();
            this.oldText = this.getInputText();

            if (this.timerId) clearTimeout(this.timerId);
            this.timerId = null;

            setTimeout(this.#bind(this.clearSuggestArea), 500);
        }, 500));
    }

    checkLoop() {
        var text = this.getInputText();
        if (text != this.oldText) {
            this.oldText = text;
            this.search();
        }
        if (this.timerId) clearTimeout(this.timerId);
        this.timerId = setTimeout(this.#bind(this.checkLoop), this.interval);
    }

    search() {

        // init
        this.clearSuggestArea();

        const text = this.getInputText();

        if (!text) return;

        this.hookBeforeSearch(text);
        var resultList = this.#search(text);
        if (resultList.length != 0) this.createSuggestArea(resultList);
    }

    #search(text: string) {

        var resultList = [];
        var temp;
        this.suggestIndexList = [];

        for (var i = 0, length = this.candidateList.length; i < length; i++) {
            if ((temp = this.isMatch(this.candidateList[i], text)) != null) {
                resultList.push(temp);
                this.suggestIndexList.push(i);

                if (this.dispMax != 0 && resultList.length >= this.dispMax) break;
            }
        }
        return resultList;
    }

    isMatch(value?: string, pattern?: string) {

        if (value == null) return null;

        var pos = (this.ignoreCase) ?
            value.toLowerCase().indexOf(pattern.toLowerCase())
            : value.indexOf(pattern);

        if ((pos == -1) || (this.prefix && pos != 0)) return null;

        if (this.highlight) {
            return (this.#escapeHTML(value.substr(0, pos)) + '<strong>'
                + this.#escapeHTML(value.substr(pos, pattern.length))
                + '</strong>' + this.#escapeHTML(value.substr(pos + pattern.length)));
        } else {
            return this.#escapeHTML(value);
        }
    }

    clearSuggestArea() {
        this.suggestArea.innerHTML = '';
        this.suggestArea.style.display = 'none';
        this.suggestList = null;
        this.suggestIndexList = null;
        this.activePosition = null;
    }

    createSuggestArea(resultList: string[]) {

        this.suggestList = [];
        this.inputValueBackup = this.input.value;

        for (var i = 0, length = resultList.length; i < length; i++) {
            var element = document.createElement(this.listTagName);
            element.innerHTML = resultList[i];
            this.suggestArea.appendChild(element);

            this.#addEvent(element, 'click', this.#bindEvent(this.listClick, i));
            this.#addEvent(element, 'mouseover', this.#bindEvent(this.listMouseOver, i));
            this.#addEvent(element, 'mouseout', this.#bindEvent(this.listMouseOut, i));

            this.suggestList.push(element);
        }

        this.suggestArea.style.display = '';
        this.suggestArea.scrollTop = 0;
    }

    getInputText() {
        return this.input.value;
    }

    setInputText(text: string) {
        this.input.value = text;
    }

    // key event
    keyEvent(event: KeyboardEvent) {

        if (!this.timerId) {
            this.timerId = setTimeout(this.#bind(this.checkLoop), this.interval);
        }

        if (this.dispAllKey && event.ctrlKey
            && this.getInputText() == ''
            && !this.suggestList
            && event.keyCode == Suggest.KEY.DOWN) {
            // dispAll
            this._stopEvent(event);
            this.keyEventDispAll();
        } else if (event.keyCode == Suggest.KEY.UP ||
            event.keyCode == Suggest.KEY.DOWN) {
            // key move
            if (this.suggestList && this.suggestList.length != 0) {
                this._stopEvent(event);
                this.keyEventMove(event.keyCode);
            }
        } else if (event.keyCode == Suggest.KEY.RETURN) {
            // fix
            if (this.suggestList && this.suggestList.length != 0) {
                this._stopEvent(event);
                this.keyEventReturn();
            }
        } else if (event.keyCode == Suggest.KEY.ESC) {
            // cancel
            if (this.suggestList && this.suggestList.length != 0) {
                this._stopEvent(event);
                this.keyEventEsc();
            }
        } else {
            this.keyEventOther(event);
        }
    }

    keyEventDispAll() {

        // init
        this.clearSuggestArea();

        this.oldText = this.getInputText();

        this.suggestIndexList = [];
        for (var i = 0, length = this.candidateList.length; i < length; i++) {
            this.suggestIndexList.push(i);
        }

        this.createSuggestArea(this.candidateList);
    }

    keyEventMove(keyCode: number) {

        this.changeUnactive();

        if (keyCode == Suggest.KEY.UP) {
            // up
            if (this.activePosition == null) {
                this.activePosition = this.suggestList.length - 1;
            } else {
                this.activePosition--;
                if (this.activePosition < 0) {
                    this.activePosition = null;
                    this.input.value = this.inputValueBackup;
                    this.suggestArea.scrollTop = 0;
                    return;
                }
            }
        } else {
            // down
            if (this.activePosition == null) {
                this.activePosition = 0;
            } else {
                this.activePosition++;
            }

            if (this.activePosition >= this.suggestList.length) {
                this.activePosition = null;
                this.input.value = this.inputValueBackup;
                this.suggestArea.scrollTop = 0;
                return;
            }
        }

        this.changeActive(this.activePosition);
    }

    keyEventReturn() {

        this.clearSuggestArea();
        this.moveEnd();
    }

    keyEventEsc() {
        this.clearSuggestArea();
        this.input.value = this.inputValueBackup;
        this.oldText = this.getInputText();
    }

    keyEventOther(event: KeyboardEvent) { }

    changeActive(index: number) {

        this.setStyleActive(this.suggestList[index]);

        this.setInputText(this.candidateList[this.suggestIndexList[index]]);

        this.oldText = this.getInputText();
        this.input.focus();
    }

    changeUnactive() {

        if (this.suggestList != null
            && this.suggestList.length > 0
            && this.activePosition != null) {
            this.setStyleUnactive(this.suggestList[this.activePosition]);
        }
    }

    listClick(event: Event, index: number) {

        this.changeUnactive();
        this.activePosition = index;
        this.changeActive(index);

        this.clearSuggestArea();
        this.moveEnd();
    }

    listMouseOver(event: MouseEvent, index: number) {
        this.setStyleMouseOver(this.#getEventElement(event) as HTMLElement);
    }

    listMouseOut(event: MouseEvent, index: number) {

        if (!this.suggestList) return;

        var element = this.#getEventElement(event);

        if (index == this.activePosition) {
            this.setStyleActive(element as HTMLElement);
        } else {
            this.setStyleUnactive(element as HTMLElement);
        }
    }

    setStyleActive(element: HTMLElement) {
        element.className = this.classSelect;

        // auto scroll
        var offset = element.offsetTop;
        var offsetWithHeight = offset + element.clientHeight;

        if (this.suggestArea.scrollTop > offset) {
            this.suggestArea.scrollTop = offset
        } else if (this.suggestArea.scrollTop + this.suggestArea.clientHeight < offsetWithHeight) {
            this.suggestArea.scrollTop = offsetWithHeight - this.suggestArea.clientHeight;
        }
    }

    setStyleUnactive(element: HTMLElement) {
        element.className = '';
    }

    setStyleMouseOver(element: HTMLElement) {
        element.className = this.classMouseOver;
    }

    moveEnd() {

        // if (this.input.createTextRange) {
        //     this.input.focus(); // Opera
        //     var range = this.input.createTextRange();
        //     range.move('character', this.input.value.length);
        //     range.select();
        // } else if (this.input.setSelectionRange) {
            this.input.setSelectionRange(this.input.value.length, this.input.value.length);
        // }
    }

    // Utils
    #getElement(element: string|HTMLElement): HTMLElement {
        return (typeof element == 'string') ? document.getElementById(element) : element;
    }
    #addEvent(element: HTMLElement, type: keyof HTMLElementEventMap, func: EventListenerOrEventListenerObject) {
        element.addEventListener(type, func, false);
    }
    protected _stopEvent(event: Event) {
        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.returnValue = false;
            event.cancelBubble = true;
        }
    }
    #getEventElement(event: Event) {
        return event.target || event.srcElement;
    }
    #bind(func: Function, ...args: unknown[]) {
        var self = this;
        return function () { func.apply(self, args); };
    }
    #bindEvent(func: Function, ...args: unknown[]) {
        var self = this;
        return function (event?: Event) { event = event || window.event; func.apply(self, ([event] as unknown[]).concat(args)); };
    }
    #escapeHTML(value: string) {
        return value.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
    }
}

/*-- Suggest.LocalMulti ---------------------------------*/
export class SuggestMulti extends SuggestLocal {
    delim = ' '; // delimiter

    keyEventReturn() {

        this.clearSuggestArea();
        this.input.value += this.delim;
        this.moveEnd();
    };

    keyEventOther(event: KeyboardEvent) {

        if (event.keyCode == Suggest.KEY.TAB) {
            // fix
            if (this.suggestList && this.suggestList.length != 0) {
                this._stopEvent(event);

                // if (!this.activePosition) {
                //   this.activePosition = 0;
                //   this.changeActive(this.activePosition);
                // }
                if (!this.activePosition) {
                    this.activePosition = 0;
                    this.changeActive(this.activePosition);
                }

                this.clearSuggestArea();
                this.input.value += this.delim;
                this.moveEnd();
            }
        }
    };

    listClick(event: Event, index: number) {

        this.changeUnactive();
        this.activePosition = index;
        this.changeActive(index);

        this.input.value += this.delim;

        this.clearSuggestArea();
        this.moveEnd();
    };

    getInputText() {

        var pos = this.getLastTokenPos();

        if (pos == -1) {
            return this.input.value;
        } else {
            return this.input.value.substr(pos + 1);
        }
    };

    setInputText(text: string) {

        var pos = this.getLastTokenPos();

        if (pos == -1) {
            this.input.value = text;
        } else {
            this.input.value = this.input.value.substr(0, pos + 1) + text;
        }
    };

    getLastTokenPos() {
        return this.input.value.lastIndexOf(this.delim);
    };
}

