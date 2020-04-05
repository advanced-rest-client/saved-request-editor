import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/saved-menu/saved-menu.js';
import '@advanced-rest-client/arc-models/request-model.js';
import '@advanced-rest-client/arc-models/project-model.js';
import '@polymer/paper-toast/paper-toast.js';
import 'chance/chance.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../saved-request-editor.js';

/* global chance */

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'request'
    ]);
    this.componentName = 'saved-request-editor';

    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this._selectRequest = this._selectRequest.bind(this);

    window.addEventListener('google-drive-data-save', this._exportDriveHandler);
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  async generateData() {
    await DataGenerator.insertSavedRequestData({
      requestsSize: 100
    });
    document.getElementById('genToast').opened = true;
    const e = new CustomEvent('data-imported', {
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async deleteData() {
    await DataGenerator.destroySavedRequestData();
    document.getElementById('clearToast').opened = true;
    const e = new CustomEvent('datastore-destroyed', {
      detail: {
        datastore: 'all'
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  _onEdit() {
    document.getElementById('editToast').opened = true;
  }

  _onDelete() {
    document.getElementById('deleteToast').opened = true;
  }

  _onNavigate() {
    document.getElementById('navToast').opened = true;
  }

  async _selectRequest(e) {
    const ev = new CustomEvent('request-object-read', {
      bubbles: true,
      cancelable: true,
      detail: {
        id: e.detail.id,
        type: 'saved'
      }
    });
    document.body.dispatchEvent(ev);
    const result = await ev.detail.result
    this.request = result;
  }

  _exportDriveHandler(e) {
    e.preventDefault();
    e.detail.result = Promise.resolve({
      id: chance.guid({ version: 5 })
    });
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      request
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the saved-request-editor element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <div class="demo-app" slot="content">
            <nav>
              <saved-menu
                ?compatibility="${compatibility}"
                @navigate="${this._selectRequest}"></saved-menu>
            </nav>
            <saved-request-editor
              ?compatibility="${compatibility}"
              .request="${request}"
              @edit-request="${this._onEdit}"
              @delete-request="${this._onDelete}"
              @navigate="${this._onNavigate}"
              ></saved-request-editor>
          </div>
        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button
            @click="${this.generateData}"
            ?compatibility="${compatibility}">Generate 100 requests</anypoint-button>
          <anypoint-button
            @click="${this.deleteData}"
            ?compatibility="${compatibility}">Clear datastore</anypoint-button>
        </div>
      </section>

      <paper-toast id="genToast" text="The request data has been generated"></paper-toast>
      <paper-toast id="clearToast" text="The request data has been removed"></paper-toast>
      <paper-toast id="navToast" text="Navigate to project event handled"></paper-toast>
      <paper-toast id="deleteToast" text="Delete request event handled"></paper-toast>
      <paper-toast id="editToast" text="Edit request event handled"></paper-toast>
    `;
  }

  _introductionTemplate() {
    return html`
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          Advanced REST Client saved request editor is a dialog that renders saved request editr.
          It is styled for material design lists with compatibility with
          Anypoint platform.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html`
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>The request details dialog comes with 2 predefied styles:</p>
        <ul>
          <li><b>Material</b> - Normal state</li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design
          </li>
        </ul>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC saved request editor</h2>
      <project-model></project-model>
      <request-model></request-model>
      ${this._demoTemplate()}
      ${this._introductionTemplate()}
      ${this._usageTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
window._demo = instance;
