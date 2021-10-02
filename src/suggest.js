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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SuggestLocal_instances, _SuggestLocal_search, _SuggestLocal_getElement, _SuggestLocal_addEvent, _SuggestLocal_getEventElement, _SuggestLocal_bind, _SuggestLocal_bindEvent, _SuggestLocal_escapeHTML;
class Suggest {
    constructor() {
        /*-- Utils --------------------------------------------*/
        this.copyProperties = function (dest, src) {
            for (var property in src) {
                dest[property] = src[property];
            }
            return dest;
        };
    }
}
/*-- KeyCodes -----------------------------------------*/
Suggest.KEY = {
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    UP: 38,
    DOWN: 40
};
/*-- Suggest.Local ------------------------------------*/
class SuggestLocal extends Suggest {
    constructor(input, suggestArea, candidateList, options) {
        super();
        _SuggestLocal_instances.add(this);
        // options
        this.interval = 500;
        this.dispMax = 20;
        this.listTagName = 'div';
        this.prefix = false;
        this.ignoreCase = true;
        this.highlight = false;
        this.dispAllKey = false;
        this.classMouseOver = 'over';
        this.classSelect = 'select';
        this.hookBeforeSearch = (text) => { };
        this.input = __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_getElement).call(this, input);
        this.suggestArea = __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_getElement).call(this, suggestArea);
        this.candidateList = candidateList;
        this.oldText = this.getInputText();
        if (options)
            this.setOptions(options);
        // reg event
        __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_addEvent).call(this, this.input, 'focus', __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bind).call(this, this.checkLoop));
        __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_addEvent).call(this, this.input, 'blur', __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bind).call(this, this.inputBlur));
        __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_addEvent).call(this, this.suggestArea, 'blur', __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bind).call(this, this.inputBlur));
        __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_addEvent).call(this, this.input, 'keydown', __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bindEvent).call(this, this.keyEvent));
        // init
        this.clearSuggestArea();
    }
    setOptions(options) {
        this.copyProperties(this, options);
    }
    inputBlur() {
        setTimeout(__classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bind).call(this, function () {
            if (document.activeElement == this.suggestArea
                || document.activeElement == this.input) {
                // keep suggestion
                return;
            }
            this.changeUnactive();
            this.oldText = this.getInputText();
            if (this.timerId)
                clearTimeout(this.timerId);
            this.timerId = null;
            setTimeout(__classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bind).call(this, this.clearSuggestArea), 500);
        }, 500));
    }
    checkLoop() {
        var text = this.getInputText();
        if (text != this.oldText) {
            this.oldText = text;
            this.search();
        }
        if (this.timerId)
            clearTimeout(this.timerId);
        this.timerId = setTimeout(__classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bind).call(this, this.checkLoop), this.interval);
    }
    search() {
        // init
        this.clearSuggestArea();
        const text = this.getInputText();
        if (!text)
            return;
        this.hookBeforeSearch(text);
        var resultList = __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_search).call(this, text);
        if (resultList.length != 0)
            this.createSuggestArea(resultList);
    }
    isMatch(value, pattern) {
        if (value == null)
            return null;
        var pos = (this.ignoreCase) ?
            value.toLowerCase().indexOf(pattern.toLowerCase())
            : value.indexOf(pattern);
        if ((pos == -1) || (this.prefix && pos != 0))
            return null;
        if (this.highlight) {
            return (__classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_escapeHTML).call(this, value.substr(0, pos)) + '<strong>'
                + __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_escapeHTML).call(this, value.substr(pos, pattern.length))
                + '</strong>' + __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_escapeHTML).call(this, value.substr(pos + pattern.length)));
        }
        else {
            return __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_escapeHTML).call(this, value);
        }
    }
    clearSuggestArea() {
        this.suggestArea.innerHTML = '';
        this.suggestArea.style.display = 'none';
        this.suggestList = null;
        this.suggestIndexList = null;
        this.activePosition = null;
    }
    createSuggestArea(resultList) {
        this.suggestList = [];
        this.inputValueBackup = this.input.value;
        for (var i = 0, length = resultList.length; i < length; i++) {
            var element = document.createElement(this.listTagName);
            element.innerHTML = resultList[i];
            this.suggestArea.appendChild(element);
            __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_addEvent).call(this, element, 'click', __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bindEvent).call(this, this.listClick, i));
            __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_addEvent).call(this, element, 'mouseover', __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bindEvent).call(this, this.listMouseOver, i));
            __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_addEvent).call(this, element, 'mouseout', __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bindEvent).call(this, this.listMouseOut, i));
            this.suggestList.push(element);
        }
        this.suggestArea.style.display = '';
        this.suggestArea.scrollTop = 0;
    }
    getInputText() {
        return this.input.value;
    }
    setInputText(text) {
        this.input.value = text;
    }
    // key event
    keyEvent(event) {
        if (!this.timerId) {
            this.timerId = setTimeout(__classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_bind).call(this, this.checkLoop), this.interval);
        }
        if (this.dispAllKey && event.ctrlKey
            && this.getInputText() == ''
            && !this.suggestList
            && event.keyCode == Suggest.KEY.DOWN) {
            // dispAll
            this._stopEvent(event);
            this.keyEventDispAll();
        }
        else if (event.keyCode == Suggest.KEY.UP ||
            event.keyCode == Suggest.KEY.DOWN) {
            // key move
            if (this.suggestList && this.suggestList.length != 0) {
                this._stopEvent(event);
                this.keyEventMove(event.keyCode);
            }
        }
        else if (event.keyCode == Suggest.KEY.RETURN) {
            // fix
            if (this.suggestList && this.suggestList.length != 0) {
                this._stopEvent(event);
                this.keyEventReturn();
            }
        }
        else if (event.keyCode == Suggest.KEY.ESC) {
            // cancel
            if (this.suggestList && this.suggestList.length != 0) {
                this._stopEvent(event);
                this.keyEventEsc();
            }
        }
        else {
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
    keyEventMove(keyCode) {
        this.changeUnactive();
        if (keyCode == Suggest.KEY.UP) {
            // up
            if (this.activePosition == null) {
                this.activePosition = this.suggestList.length - 1;
            }
            else {
                this.activePosition--;
                if (this.activePosition < 0) {
                    this.activePosition = null;
                    this.input.value = this.inputValueBackup;
                    this.suggestArea.scrollTop = 0;
                    return;
                }
            }
        }
        else {
            // down
            if (this.activePosition == null) {
                this.activePosition = 0;
            }
            else {
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
    keyEventOther(event) { }
    changeActive(index) {
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
    listClick(event, index) {
        this.changeUnactive();
        this.activePosition = index;
        this.changeActive(index);
        this.clearSuggestArea();
        this.moveEnd();
    }
    listMouseOver(event, index) {
        this.setStyleMouseOver(__classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_getEventElement).call(this, event));
    }
    listMouseOut(event, index) {
        if (!this.suggestList)
            return;
        var element = __classPrivateFieldGet(this, _SuggestLocal_instances, "m", _SuggestLocal_getEventElement).call(this, event);
        if (index == this.activePosition) {
            this.setStyleActive(element);
        }
        else {
            this.setStyleUnactive(element);
        }
    }
    setStyleActive(element) {
        element.className = this.classSelect;
        // auto scroll
        var offset = element.offsetTop;
        var offsetWithHeight = offset + element.clientHeight;
        if (this.suggestArea.scrollTop > offset) {
            this.suggestArea.scrollTop = offset;
        }
        else if (this.suggestArea.scrollTop + this.suggestArea.clientHeight < offsetWithHeight) {
            this.suggestArea.scrollTop = offsetWithHeight - this.suggestArea.clientHeight;
        }
    }
    setStyleUnactive(element) {
        element.className = '';
    }
    setStyleMouseOver(element) {
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
    _stopEvent(event) {
        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            event.returnValue = false;
            event.cancelBubble = true;
        }
    }
}
_SuggestLocal_instances = new WeakSet(), _SuggestLocal_search = function _SuggestLocal_search(text) {
    var resultList = [];
    var temp;
    this.suggestIndexList = [];
    for (var i = 0, length = this.candidateList.length; i < length; i++) {
        if ((temp = this.isMatch(this.candidateList[i], text)) != null) {
            resultList.push(temp);
            this.suggestIndexList.push(i);
            if (this.dispMax != 0 && resultList.length >= this.dispMax)
                break;
        }
    }
    return resultList;
}, _SuggestLocal_getElement = function _SuggestLocal_getElement(element) {
    return (typeof element == 'string') ? document.getElementById(element) : element;
}, _SuggestLocal_addEvent = function _SuggestLocal_addEvent(element, type, func) {
    element.addEventListener(type, func, false);
}, _SuggestLocal_getEventElement = function _SuggestLocal_getEventElement(event) {
    return event.target || event.srcElement;
}, _SuggestLocal_bind = function _SuggestLocal_bind(func, ...args) {
    var self = this;
    return function () { func.apply(self, args); };
}, _SuggestLocal_bindEvent = function _SuggestLocal_bindEvent(func, ...args) {
    var self = this;
    return function (event) { event = event || window.event; func.apply(self, [event].concat(args)); };
}, _SuggestLocal_escapeHTML = function _SuggestLocal_escapeHTML(value) {
    return value.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
};
/*-- Suggest.LocalMulti ---------------------------------*/
export class SuggestMulti extends SuggestLocal {
    constructor() {
        super(...arguments);
        this.delim = ' '; // delimiter
    }
    keyEventReturn() {
        this.clearSuggestArea();
        this.input.value += this.delim;
        this.moveEnd();
    }
    ;
    keyEventOther(event) {
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
    }
    ;
    listClick(event, index) {
        this.changeUnactive();
        this.activePosition = index;
        this.changeActive(index);
        this.input.value += this.delim;
        this.clearSuggestArea();
        this.moveEnd();
    }
    ;
    getInputText() {
        var pos = this.getLastTokenPos();
        if (pos == -1) {
            return this.input.value;
        }
        else {
            return this.input.value.substr(pos + 1);
        }
    }
    ;
    setInputText(text) {
        var pos = this.getLastTokenPos();
        if (pos == -1) {
            this.input.value = text;
        }
        else {
            this.input.value = this.input.value.substr(0, pos + 1) + text;
        }
    }
    ;
    getLastTokenPos() {
        return this.input.value.lastIndexOf(this.delim);
    }
    ;
}
//# sourceMappingURL=suggest.js.map