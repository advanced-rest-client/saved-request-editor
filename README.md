[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/saved-request-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/saved-request-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/saved-request-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/saved-request-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/saved-request-editor)


# saved-request-editor

An applet to edit saved request data. The element appears in a context of a request editor or requests list.

It provides an UI to edit request metadata, but not HTTP request values.

The element dispatches bubbling `save-request` event that is handled by `request-model` which processes store request. This is preferred way of storing request data in ARC.

## Example:

```html
<saved-request-editor></saved-request-editor>
```

## Usage

### Installation
```
npm install --save @advanced-rest-client/saved-request-editor
```
### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import './node_modules/@advanced-rest-client/saved-request-editor/saved-request-editor.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <saved-request-editor
      .request="${this.request}"
      @cancel="${this._onCancel}"
      @save-request="${this._onSave}"></saved-request-editor>
    `;
  }

  _onCancel() {
    ...
  }

  _onSave() {
    ...
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/saved-request-editor
cd saved-request-editor
npm install
```

### Running the tests

```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
