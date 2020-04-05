/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { SavedRequestDetail } from '@advanced-rest-client/saved-request-detail';
import { html } from 'lit-element';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-textarea.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-chip-input/anypoint-chip-input.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-collapse/iron-collapse.js';
import { arrowDropDown } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@advanced-rest-client/code-mirror/code-mirror.js';
import { ProjectsListConsumerMixin } from
  '@advanced-rest-client/projects-list-consumer-mixin/projects-list-consumer-mixin.js';
import styles from './Styles.js';
/**
 * A dialog to edit request meta data.
 *
 * It requires `<request-model>` and `<project-model>` to be in the DOM to
 * handle data queries.
 *
 * ## Usage
 *
 * Assign `request` proeprty to a request obejct. The component decides
 * what view to render (saved vs. not saved request).
 *
 * ```html
 * <saved-request-editor request='{...}'></saved-request-editor>
 * ```
 *
 * If the request has both `_id` and `_rev` proeprties (PouchDB properties)
 * it renders "saved" view.
 *
 * ### Styling
 *
 * `<saved-request-editor>` provides the following custom properties and mixins
 * for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--saved-request-editor` | Mixin applied to the element | `{}`
 * `--saved-request-editor-color` | Color of the element | `inherit`
 * `--saved-request-editor-background-color` | Background color of the element | `inherit`
 * `--saved-request-editor-padding` | Padding of the element. | ``
 * `--saved-request-editor-options-color` | Additional options section color | `rgba(0, 0, 0, 0.74)`
 * `--saved-request-editor-caption-icon-color` | Color of the icon to toggle options | `rgba(0, 0, 0, 0.74)`
 * `--saved-request-editor-caption-icon` | `Mixin applied to toggle options icon` | ``
 * `--saved-request-editor-action-button-color` | Color of action button | `--primary-color`
 * `--saved-request-editor-action-button-background-color` | Background color of action button | ``
 * `--saved-request-editor-action-buttons` | Mixin applied to action buttons | ``
 *
 * @customElement
 * @memberof UiElements
 * @appliesMixin Polymer.IronResizableBehavior
 * @appliesMixin ProjectsListConsumerMixin
 */
export class SavedRequestEditor extends ProjectsListConsumerMixin(SavedRequestDetail) {
  static get styles() {
    return [
      SavedRequestDetail.styles,
      styles,
    ];
  }

  static get properties() {
    return {
      /**
       * Name of the request.
       */
      name: { type: String },
      /**
       * Request description.
       */
      description: { type: String },
      /**
       * True when saving request to Google Drive.
       */
      isDrive: { type: Boolean },
      /**
       * Set if the user chooses to override current request.
       */
     _override: { type: Boolean },
      // True when additional options are opened.
      additionalOptionsOpened: { type: Boolean },
      /**
       * List of selected in the dialog project names.
       * @type {Array<String>}
       */
      selectedProjects: { type: Array },

      _saving: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
    };
  }

  get selectedProjects() {
    return this._selectedProjects;
  }

  set selectedProjects(value) {
    const old = this._selectedProjects;
    const oldSerialized = Array.isArray(old) ? JSON.stringify(old) : '';
    const thisStringified = Array.isArray(value) ? JSON.stringify(value) : '';
    if (oldSerialized === thisStringified) {
      return;
    }
    this._selectedProjects = value;
    this.requestUpdate();
  }

  /**
   * Computes value for `isSaved` property.
   * @return {Boolean}
   */
  get isSavedRequest() {
    const { request } = this;
    if (!request) {
      return false;
    }
    const history = !!(request && request.type === 'history');
    return history ? false : !!request._rev;
  }

  constructor() {
    super();
    this._projectsChanged = this._projectsChanged.bind(this);
    this._requestChangedHandler = this._requestChangedHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.addEventListener('projects-changed', this._projectsChanged);
    window.addEventListener('request-object-changed', this._requestChangedHandler);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('projects-changed', this._projectsChanged);
    window.removeEventListener('request-object-changed', this._requestChangedHandler);
  }

  _projectsChanged() {
    this._requestChanged(this.request);
  }

  _requestChangedHandler(e) {
    const { request } = this;
    if (e.cancelable || !request) {
      return;
    }
    if (e.detail.request._id === request._id) {
      this.request = e.detail.request;
    }
  }

  /**
   * Resets the state of the UI
   */
  reset() {
    this.isDrive = false;
    this.name = '';
    this.description = '';
    this.selectedProjects = [];
  }
  /**
   * Sends the `cancel` custom event to cancel the edit.
   */
  _cancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }
  /**
   * Sets `override` to `false` and sends the form.
   */
  _save() {
    this._override = false;
    this._sendForm();
  }
  /**
   * Sets `override` to `true` and sends the form.
   */
  _overrideHandler() {
    this._override = true;
    this._sendForm();
  }
  // Validates and submits the form.
  _sendForm() {
    const form = this.shadowRoot.querySelector('iron-form');
    if (!form.validate()) {
      return;
    }
    form.submit();
  }
  /**
   * Sends the `save-request` custom event with computed detail object.
   *
   * @param {CustomEvent} e
   */
  async _formSubmit(e) {
    e.preventDefault();
    const detail = this._computeEventDetail();
    const ev = new CustomEvent('save-request', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    });
    this.dispatchEvent(ev);
    this._saving = true;
    await e.detail.result;
    this._saving = false;
  }
  /**
   * Computes `save-request` custom event's `detail` object
   * @return {Object} A detail property of the event.
   */
  _computeEventDetail() {
    const storeRequest = Object.assign({}, this.request);
    storeRequest.name = this.name;
    storeRequest.description = this.description;
    if (!this._override && storeRequest._id) {
      delete storeRequest._id;
      delete storeRequest._rev;
    }
    const info = this._processSelectedProjectsInfo(this.selectedProjects);
    storeRequest.projects = info.existing;
    const storeOptions = {
      isDrive: this.isDrive
    };
    if (!this.isDrive && storeRequest.driveId) {
      delete storeRequest.driveId;
    }
    return {
      request: storeRequest,
      projects: info.add.length ? info.add : undefined,
      options: storeOptions
    };
  }

  _toggleOptions() {
    this.additionalOptionsOpened = !this.additionalOptionsOpened;
  }

  _requestChanged(request) {
    if (!request) {
      this.reset();
      return;
    }

    const history = this.isHistory || request.type === 'history';
    const isDrive = history ? false : !!request.driveId;

    this.name = request.name || '';
    this.description = request.description || '';
    this.isDrive = isDrive;
    this._restoreProjects(request);
  }

  _restoreProjects(request) {
    const projects = this.projects || [];
    let projectIds = [];
    if (request.legacyProject) {
      projectIds[projectIds.length] = request.legacyProject;
    }
    if (request.projects) {
      projectIds = projectIds.concat(request.projects);
    }
    const projectsLen = (projects && projects.length);
    if (projectsLen) {
      const projectsData = [];
      projectIds.forEach((id) => {
        for (let i = 0; i < projectsLen; i++) {
          if (projects[i]._id === id) {
            projectsData[projectsData.length] = projects[i].name;
            return;
          }
        }
        projectsData[projectsData.length] = id;
      });
      this.selectedProjects = projectsData.length ? projectsData : undefined;
    } else {
      this.selectedProjects = projectIds.length ? projectIds : undefined;
    }
  }

  _stopEvent(e) {
    e.stopPropagation();
  }

  _inputChanged(e) {
    const { name, value } = e.target;
    this[name] = value;
  }

  _projectsHandler(e) {
    this.selectedProjects = e.detail.value;
  }

  _isDriveHandler(e) {
    this.isDrive = e.detail.value;
  }

  _editorValueChanged(e) {
    this.description = e.detail.value;
  }

  notifyResize() {
    super.notifyResize();
    const cm = this.shadowRoot.querySelector('#cm');
    if (cm) {
      cm.refresh();
    }
  }

  _titleTemplate() {
    const { name, compatibility, outlined } = this;
    return html`
    <anypoint-input
      required
      autovalidate
      invalidmessage="Name is required"
      .value="${name}"
      name="name"
      @input="${this._inputChanged}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    >
      <label slot="label">Request name (required)</label>
    </anypoint-input>
    `;
  }

  _descriptionTemplate() {
    const { description } = this;
    return html`
    <div class="cm-wrap">
      <label for="cm">Description (markdown)</label>
      <code-mirror
        id="cm"
        mode="markdown"
        .value="${description}"
        @value-changed="${this._editorValueChanged}"
        gutters='["CodeMirror-lint-markers"]'
        lineNumbers></code-mirror>
    </div>`;
  }

  _projectsTemplate() {
    const { compatibility, selectedProjects, projects } = this;
    const source = this._computeProjectsAutocomplete(projects);
    return html`<anypoint-chip-input
      .chipsValue="${selectedProjects}"
      .source="${source}"
      @overlay-opened="${this._stopEvent}"
      @overlay-closed="${this._stopEvent}"
      @chips-changed="${this._projectsHandler}"
      ?compatibility="${compatibility}">
      <label slot="label">Add to project</label>
    </anypoint-chip-input>`;
  }

  _additionalActionsTemplate() {
    const { additionalOptionsOpened, compatibility, isDrive } = this;
    return html`<section class="additional-options">
      <div class="caption"
        @click="${this._toggleOptions}"
        ?data-caption-opened="${additionalOptionsOpened}">
        Additional options
        <anypoint-icon-button
          ?compatibility="${compatibility}"
          class="caption-icon"
          aria-label="Activate to toggle additional options"
        >
          <span class="icon">${arrowDropDown}</span>
        </anypoint-icon-button>
      </div>
      <iron-collapse .opened="${additionalOptionsOpened}">
        <div class="options">
          <anypoint-checkbox
            .checked="${isDrive}"
            @checked-changed="${this._isDriveHandler}">Save to Google Drive</anypoint-checkbox>
        </div>
      </iron-collapse>
    </section>`;
  }

  _actionsTemplate() {
    const { isSavedRequest } = this;
    return html`
    <anypoint-button
      @click="${this._cancel}"
      data-action="cancel-edit"
      title="Cancels any changes"
      aria-label="Activate to cancel editor"
      ?compatibility="${this.compatibility}">
      Cancel
    </anypoint-button>
    ${isSavedRequest ? this._savedActionsTemplate() : this._unsavedActionsTemplate()}
    `;
  }

  _savedActionsTemplate() {
    const { _saving, compatibility } = this;
    return html`<anypoint-button
      @click="${this._save}"
      data-action="save-as-new"
      title="Saves request as new object"
      aria-label="Activate to save request as new object"
      ?compatibility="${compatibility}"
      ?disabled="${_saving}"
    >
      Save as new
    </anypoint-button>
    <anypoint-button
      @click="${this._overrideHandler}"
      data-action="override"
      title="Replaces request data"
      aria-label="Activate to update the request"
      ?compatibility="${compatibility}"
      ?disabled="${_saving}"
      emphasis="high"
    >
      Update
    </anypoint-button>`;
  }

  _unsavedActionsTemplate() {
    const { _saving, compatibility } = this;
    return html`<anypoint-button
      class="action-button"
      @click="${this._save}"
      data-action="save-request"
      title="Commits changes and stores request in data store"
      aria-label="Activate to save the request"
      ?compatibility="${compatibility}"
      ?disabled="${_saving}"
    >Save</anypoint-button>`;
  }

  render() {
    return html`
    <iron-form id="form" @iron-form-presubmit="${this._formSubmit}">
      <form method="post">
        ${this._modelTemplate()}
        ${this._titleTemplate()}
        ${this._projectsTemplate()}
        ${this._descriptionTemplate()}
        ${this._additionalActionsTemplate()}
      </form>
    </iron-form>
    <div class="actions">
      ${this._actionsTemplate()}
    </div>`;
  }

  /**
   * Fired when the user cancels the editor.
   * @event cancel-request-edit
   */

  /**
   * Fire when the user saves the request.
   *
   * @event save-request
   * @param {Object} request ArcRequest object with request data.
   * It is the copy of object assigned to `request` property.
   * If the user choose to save request as new object it's `_id` and `_rev`
   * properties are removed.
   * @param {?Array<String>} projects Optional list of new projects to create
   * with this request. It contains user entered names.
   * @param {Object} options Store options:
   * - isDrive {Boolean} If true then the request should be saved to Google
   * Drive as well.
   */
}
