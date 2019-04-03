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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import '../../@polymer/polymer/lib/elements/dom-if.js';
import {mixinBehaviors} from '../../@polymer/polymer/lib/legacy/class.js';
import {IronResizableBehavior} from '../../@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '../../@polymer/paper-checkbox/paper-checkbox.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/paper-input/paper-textarea.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@advanced-rest-client/paper-chip-input/paper-chip-input.js';
import '../../@polymer/iron-form/iron-form.js';
import '../../@polymer/iron-collapse/iron-collapse.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import {ProjectsListConsumerMixin} from
  '../../@advanced-rest-client/projects-list-consumer-mixin/projects-list-consumer-mixin.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
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
 * @polymer
 * @customElement
 * @memberof UiElements
 * @appliesMixin Polymer.IronResizableBehavior
 * @appliesMixin ProjectsListConsumerMixin
 */
class SavedRequestEditor extends ProjectsListConsumerMixin(
    mixinBehaviors([IronResizableBehavior], PolymerElement)) {
  static get template() {
    return html`<style>
    :host {
      display: block;
      outline: none;
      color: var(--saved-request-editor-color, inherit);
      background-color: var(--saved-request-editor-background-color, inherit);
      padding: var(--saved-request-editor-padding);
      box-sizing: border-box;
      @apply --arc-font-body1;
    }

    form {
      outline: none;
    }

    .additional-options {
      color: var(--saved-request-editor-options-color, rgba(0, 0, 0, 0.74));
    }

    .caption {
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
    }

    .caption-icon {
      color: var(--saved-request-editor-caption-icon-color, rgba(0, 0, 0, 0.74));
      transform: rotate(0deg);
      transition: 0.31s transform ease-in-out;
    }

    [data-caption-opened] .caption-icon {
      transform: rotate(-180deg);
    }

    .options {
      margin-top: 16px;
    }

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .actions paper-button {
      color: var(--saved-request-editor-action-button-color, var(--primary-color));
      background-color: var(--saved-request-editor-action-button-background-color);
      padding-left: 12px;
      padding-right: 12px;
    }

    .actions paper-button.action-button {
      background-color: var(--action-button-background-color, var(--primary-color));
      color: var(--action-button-color, white);
    }
    </style>
    <iron-form id="form" on-iron-form-presubmit="_formSubmit">
      <form method="post">
        <paper-input
          label="Request name (required)"
          required=""
          auto-validate=""
          error-message="Name is required"
          value="{{name}}"></paper-input>
        <paper-textarea
          id="autogrow"
          label="Description (optional)"
          value="{{description}}"
          on-bind-value-changed="_autogrowCheckResize"></paper-textarea>
        <paper-chip-input
          label="Add to project"
          value="{{selectedProjects}}"
          source="[[_computeProjectsAutocomplete(projects)]]"
          chip-remove-icon="arc:close"
          on-iron-overlay-opened="_stopEvent"
          on-iron-overlay-closed="_stopEvent"></paper-chip-input>
        <section class="additional-options">
          <div class="caption" on-click="_toggleOptions" data-caption-opened\$="[[additionalOptionsOpened]]">
            Additional options
            <paper-icon-button icon="arc:arrow-drop-down" class="caption-icon"></paper-icon-button>
          </div>
          <iron-collapse opened="[[additionalOptionsOpened]]">
            <div class="options">
              <paper-checkbox checked="{{isDrive}}">Save to Google Drive</paper-checkbox>
            </div>
          </iron-collapse>
        </section>
      </form>
    </iron-form>
    <div class="actions">
      <paper-button on-click="_cancel" data-action="cancel-edit" title="Cancels any changes">cancel</paper-button>
      <template is="dom-if" if="[[isSaved]]">
        <paper-button
          on-click="_save"
          data-action="save-as-new"
          title="Saves request as new object">Save as new</paper-button>
        <paper-button
          class="action-button"
          on-click="_override"
          data-action="override"
          title="Replaces request data">Update</paper-button>
      </template>
      <template is="dom-if" if="[[!isSaved]]">
        <paper-button
          class="action-button"
          on-click="_save"
          data-action="save-request"
          title="Commits changes and stores request in data store">Save</paper-button>
      </template>
    </div>`;
  }

  static get properties() {
    return {
      /**
       * The request object to be saved / updated in the datastore.
       * It's not required for the editor to work.
       * This object will be attached to `save-request` object as a reference.
       * When this object change it computes values for `name`, `isSaved`,
       * `isDrive`, `projectName` and `projectId` properties.
       */
      request: Object,
      /**
       * Name of the request.
       */
      name: String,
      /**
       * Request description.
       */
      description: String,
      /**
       * Should be set if the request has been already saved in the datastore.
       * Adds UI controls to override or save as new.
       */
      isSaved: {
        type: Boolean,
        value: false,
        computed: '_computeIsSaved(request)'
      },
      /**
       * True when saving request to Google Drive.
       */
      isDrive: Boolean,
      /**
       * Set if the user chooses to override current request.
       */
      override: {
        type: Boolean,
        readOnly: true
      },
      // True when additional options are opened.
      additionalOptionsOpened: Boolean,
      /**
       * List of selected in the dialog project names.
       * @type {Array<String>}
       */
      selectedProjects: Array
    };
  }

  static get observers() {
    return [
      '_requestChanged(request, projects)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._ensureAttribute('tabindex', -1);
    this._ensureAttribute('role', 'dialog');
  }
  /**
   * Resets the state of the UI
   */
  reset() {
    this.isDrive = false;
    this.name = '';
    this.description = '';
    this.set('selectedProjects', []);
  }
  /**
   * Sends the `cancel-request-edit` custom event to cancel the edit.
   */
  _cancel() {
    this.dispatchEvent(new CustomEvent('cancel-request-edit', {
      composed: true
    }));
  }
  /**
   * Sets `override` to `false` and sends the form.
   */
  _save() {
    this._setOverride(false);
    this._sendForm();
  }
  /**
   * Sets `override` to `true` and sends the form.
   */
  _override() {
    this._setOverride(true);
    this._sendForm();
  }
  // Validates and submits the form.
  _sendForm() {
    if (!this.$.form.validate()) {
      return;
    }
    this.$.form.submit();
  }
  /**
   * Sends the `save-request` custom event with computed detail object.
   *
   * @param {CustomEvent} e
   */
  _formSubmit(e) {
    e.preventDefault();
    const detail = this._computeEventDetail();

    this.dispatchEvent(new CustomEvent('save-request', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    }));
  }
  /**
   * Computes `save-request` custom event's `detail` object
   * @return {Object} A detail property of the event.
   */
  _computeEventDetail() {
    const storeRequest = Object.assign({}, this.request);
    storeRequest.name = this.name;
    if (this.description) {
      storeRequest.description = this.description;
    }
    if (!this.override && storeRequest._id) {
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
  /**
   * Computes value for `isSaved` property.
   * @param {?Object} request Request object assigned to the `request`
   * @return {Boolean}
   */
  _computeIsSaved(request) {
    if (!request) {
      return false;
    }
    const history = !!(request && request.type === 'history');
    return history ? false : !!request._rev;
  }

  _requestChanged(request, projects) {
    if (!request) {
      this.reset();
      return;
    }
    const history = this.isHistory || request.type === 'history';
    const isDrive = history ? false : !!request.driveId;

    this.set('name', request.name || '');
    this.set('description', request.description || '');
    this.set('isDrive', isDrive);
    let projectIds = [];
    if (request.legacyProject) {
      projectIds[projectIds.length] = request.legacyProject;
    }
    if (request.projects) {
      projectIds = projectIds.concat(request.projects);
    }
    const projectsLen = (projects && projects.length);
    if (projectsLen) {
      let projectsData = [];
      projectIds.forEach((id) => {
        for (let i = 0; i < projectsLen; i++) {
          if (projects[i]._id === id) {
            projectsData[projectsData.length] = projects[i].name;
            return;
          }
        }
        projectsData[projectsData.length] = id;
      });
      this.set('selectedProjects', projectsData.length ? projectsData : undefined);
    } else {
      this.set('selectedProjects', projectIds.length ? projectIds : undefined);
    }
  }
  /**
   * Notifies resize when the height of autogrow textarea changes.
   */
  _autogrowCheckResize() {
    if (!this._lastAutogrowHeight) {
      this._lastAutogrowHeight = this.$.autogrow.offsetHeight;
      return;
    }
    if (this._lastAutogrowHeight !== this.$.autogrow.offsetHeight) {
      this._lastAutogrowHeight = this.$.autogrow.offsetHeight;
      this.notifyResize();
    }
  }

  _stopEvent(e) {
    e.stopPropagation();
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
window.customElements.define('saved-request-editor', SavedRequestEditor);
