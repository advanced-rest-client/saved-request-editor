import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
// import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../saved-request-editor.js';

describe('<saved-request-editor>', function() {
  async function basicFixture() {
    return await fixture(html`<saved-request-editor></saved-request-editor>`);
  }

  async function newRequestFixture() {
    const request = {
      method: 'GET',
      url: 'https://domain.com',
      headers: 'a-abc:test'
    };
    const name = 'test-name';
    const description = 'test-description';
    return await fixture(html`<saved-request-editor
      noautoprojects
      .request="${request}"
      .name="${name}"
      .description="${description}"></saved-request-editor>`);
  }

  async function newRequestProjectsFixture() {
    const request = {
      method: 'GET',
      url: 'https://domain.com',
      headers: 'a-abc:test'
    };
    const name = 'test-name';
    const description = 'test-description';
    const element = await fixture(html`<saved-request-editor
      noautoprojects
      .request="${request}"
      .name="${name}"
      .description="${description}"></saved-request-editor>`);
   await element._updateProjectsList();
   return element;
  }

  async function existingRequestFixture() {
    const request = {
      method: 'GET',
      url: 'https://domain.com',
      headers: 'a-abc:test',
      _id: 'test-id',
      _rev: 'test-rev',
      type: 'saved'
    };
    const name = 'test-name';
    const description = 'test-description';
    return await fixture(html`<saved-request-editor
      noautoprojects
      .request="${request}"
      .name="${name}"
      .description="${description}"></saved-request-editor>`);
  }

  async function existingRequestProjectFixture() {
    const request = {
      method: 'GET',
      url: 'https://domain.com',
      headers: 'a-abc:test',
      _id: 'test-id',
      _rev: 'test-rev',
      type: 'saved'
    };
    const name = 'test-name';
    const description = 'test-description';
    const element = await fixture(html`<saved-request-editor
      noautoprojects
      .request="${request}"
      .name="${name}"
      .description="${description}"></saved-request-editor>`);
    await element._updateProjectsList();
    return element;
  }

  async function driveSavedFixture() {
    const request = {
      method: 'GET',
      url: 'https://domain.com',
      headers: 'a-abc:test',
      _id: 'test-id',
      _rev: 'test-rev',
      type: 'saved',
      driveId: 'testDriveId'
    };
    const name = 'test-name';
    const description = 'test-description';
    return await fixture(html`<saved-request-editor
      noautoprojects
      .request="${request}"
      .name="${name}"
      .description="${description}"></saved-request-editor>`);
  }

  function getActionItem(node, action) {
    return node.shadowRoot.querySelector('[data-action="' + action + '"]');
  }

  describe('Basics', () => {
    it('save request button is rendered', async () => {
      const element = await basicFixture();
      const node = getActionItem(element, 'save-request');
      assert.ok(node);
    });
  });

  describe('Validation', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('save-request event is not fired when invalid', () => {
      const spy = sinon.spy();
      element.addEventListener('save-request', spy);
      const node = getActionItem(element, 'save-request');
      node.click();
      assert.isFalse(spy.called);
    });

    it('Fires save-request event when form is valid', async () => {
      const spy = sinon.spy();
      element.name = 'test';
      await nextFrame();
      element.addEventListener('save-request', spy);
      const node = getActionItem(element, 'save-request');
      node.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('#isSavedRequest', () => {
    it('returns false when no request', async () => {
      const element = await basicFixture();
      assert.isFalse(element.isSavedRequest);
    });

    it('returns false when no saved request', async () => {
      const element = await newRequestFixture();
      assert.isFalse(element.isSavedRequest);
    });

    it('returns true when saved request', async () => {
      const element = await existingRequestFixture();
      assert.isTrue(element.isSavedRequest);
    });
  });

  describe('Setting request data', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets name from request name', () => {
      element.request = {
        name: 'test'
      };
      assert.equal(element.name, 'test');
    });

    it('Sets description from request description', () => {
      element.request = {
        description: 'test'
      };
      assert.equal(element.description, 'test');
    });

    it('Sets isDrive when driveId is set on request', () => {
      element.request = {
        driveId: 'test'
      };
      assert.isTrue(element.isDrive);
    });

    it('Does not set isDrive when request type is history', () => {
      element.request = {
        driveId: 'test',
        type: 'history'
      };
      assert.isFalse(element.isDrive);
    });

    it('Does not set selectedProjects when no project info', () => {
      element.request = {};
      assert.isUndefined(element.selectedProjects);
    });

    it('Sets project id from legacyProject', () => {
      element.request = {
        legacyProject: 'unknown'
      };
      assert.equal(element.selectedProjects[0], 'unknown');
    });

    it('Sets project name from legacyProject', () => {
      element.request = {
        legacyProject: 'id-1'
      };
      assert.equal(element.selectedProjects[0], 'id-1');
    });

    it('Sets project id from projects array', () => {
      element.request = {
        projects: ['unknown']
      };
      assert.equal(element.selectedProjects[0], 'unknown');
    });

    it('Sets project name from projects array', () => {
      element.request = {
        projects: ['id-1']
      };
      assert.equal(element.selectedProjects[0], 'id-1');
    });

    it('Renders override button for saved request', async () => {
      element.request = {
        _rev: 'test'
      };
      await nextFrame();
      const node = getActionItem(element, 'override');
      assert.ok(node);
    });

    it('Renders save as new button for saved request', async () => {
      element.request = {
        _rev: 'test'
      };
      await nextFrame();
      const node = getActionItem(element, 'save-as-new');
      assert.ok(node);
    });
  });

  describe('_computeEventDetail()', function() {
    let projects;
    before(async () => {
      projects = await DataGenerator.insertProjectsData({
        projectsSize: 2,
        autoRequestId: true
      });
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    it('Contains request data', async () => {
      const element = await newRequestFixture();
      const result = element._computeEventDetail();
      assert.deepEqual(result.request, {
        description: '',
        method: 'GET',
        url: 'https://domain.com',
        headers: 'a-abc:test',
        name: '',
        projects: []
      });
    });

    it('Contains request name', async () => {
      const element = await newRequestFixture();
      element.name = 'test-name';
      const result = element._computeEventDetail();
      assert.deepEqual(result.request, {
        description: '',
        method: 'GET',
        url: 'https://domain.com',
        headers: 'a-abc:test',
        name: 'test-name',
        projects: []
      });
    });

    it('Contains request description', async () => {
      const element = await newRequestFixture();
      element.description = 'test-desc';
      const result = element._computeEventDetail();
      assert.deepEqual(result.request, {
        method: 'GET',
        url: 'https://domain.com',
        headers: 'a-abc:test',
        name: '',
        description: 'test-desc',
        projects: []
      });
    });

    it('Adds existing projects', async () => {
      const element = await newRequestProjectsFixture();
      element.selectedProjects = [projects[0]._id];
      const result = element._computeEventDetail();
      assert.deepEqual(result.request, {
        description: '',
        method: 'GET',
        url: 'https://domain.com',
        headers: 'a-abc:test',
        name: '',
        projects: [projects[0]._id]
      });
    });

    it('Adds not existing projects', async () => {
      const element = await newRequestFixture();
      element.selectedProjects = ['something'];
      const result = element._computeEventDetail();
      assert.deepEqual(result.projects, ['something']);
    });

    it('Adds both existing and non-existing projects', async () => {
      const element = await newRequestProjectsFixture();
      element.selectedProjects = [projects[0]._id, 'something'];
      const result = element._computeEventDetail();
      assert.deepEqual(result.request.projects, [projects[0]._id], 'request project is set');
      assert.deepEqual(result.projects, ['something'], 'new project is set');
    });

    it('Keeps _id and _rev when updating request', async () => {
      const element = await existingRequestFixture();
      element._override = true;
      const result = element._computeEventDetail();
      assert.equal(result.request._id, 'test-id');
      assert.equal(result.request._rev, 'test-rev');
    });

    it('Removes _id and _rev when overriding request', async () => {
      const element = await existingRequestFixture();
      element._override = false;
      const result = element._computeEventDetail();
      assert.isUndefined(result.request._id);
      assert.isUndefined(result.request._rev);
    });

    it('Sets isDrive on options', async () => {
      const element = await existingRequestFixture();
      element._override = false;
      element.isDrive = true;
      const result = element._computeEventDetail();
      assert.isTrue(result.options.isDrive);
    });

    it('Removes driveId from the request', async () => {
      const element = await driveSavedFixture();
      element._override = false;
      element.isDrive = false;
      const result = element._computeEventDetail();
      assert.isUndefined(result.request.driveId);
    });
  });

  describe('save-request event dispatch', function() {
    let projects;
    before(async () => {
      projects = await DataGenerator.insertProjectsData({
        projectsSize: 2,
        autoRequestId: true
      });
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await existingRequestProjectFixture();
      element.name = 'test-name';
      element.selectedProjects = [projects[0]._id, 'something'];
      await nextFrame();
    });

    it('Save request event is cancelable', () => {
      const spy = sinon.spy();
      element.addEventListener('save-request', spy);
      const node = getActionItem(element, 'override');
      node.click();
      assert.isTrue(spy.called);
      assert.isTrue(spy.args[0][0].cancelable);
    });

    it('Dispatches update type event', (done) => {
      element.addEventListener('save-request', function(e) {
        const data = e.detail;
        assert.equal(data.request._id, 'test-id');
        assert.equal(data.request._rev, 'test-rev');
        done();
      });
      const node = getActionItem(element, 'override');
      node.click();
    });

    it('Update type event has all detail properties', (done) => {
      element.addEventListener('save-request', function(e) {
        const data = e.detail;
        assert.ok(data.request);
        assert.ok(data.projects);
        assert.ok(data.projects);
        done();
      });
      const node = getActionItem(element, 'override');
      node.click();
    });

    it('Dispatches save as new type event', (done) => {
      element.addEventListener('save-request', function(e) {
        const data = e.detail;
        assert.isUndefined(data.request._id);
        assert.isUndefined(data.request._rev);
        done();
      });
      const node = getActionItem(element, 'save-as-new');
      node.click();
    });

    it('Save as new type event has all detail properties', (done) => {
      element.addEventListener('save-request', function(e) {
        const data = e.detail;
        assert.ok(data.request);
        assert.ok(data.projects);
        assert.ok(data.projects);
        done();
      });
      const node = getActionItem(element, 'save-as-new');
      node.click();
    });
  });

  describe('_cancel()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches "cancel" event', () => {
      const spy = sinon.spy();
      element.addEventListener('cancel', spy);
      element._cancel();
      assert.isTrue(spy.called);
    });
  });

  describe('_toggleOptions()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Toggles additionalOptionsOpened true', () => {
      element._toggleOptions();
      assert.isTrue(element.additionalOptionsOpened);
    });

    it('Toggles additionalOptionsOpened false', () => {
      element.additionalOptionsOpened = true;
      element._toggleOptions();
      assert.isFalse(element.additionalOptionsOpened);
    });
  });

  describe('reset()', () => {
    let element;
    beforeEach(async () => {
      element = await driveSavedFixture();
      element.selectedProjects = ['test'];
    });

    it('clears isDrive', () => {
      element.reset();
      assert.isFalse(element.isDrive);
    });

    it('clears name', () => {
      element.reset();
      assert.equal(element.name, '');
    });

    it('clears description', () => {
      element.reset();
      assert.equal(element.description, '');
    });

    it('clears selectedProjects', () => {
      element.reset();
      assert.deepEqual(element.selectedProjects, []);
    });
  });

  describe('request-object-changed', () => {
    let element;
    beforeEach(async () => {
      element = await existingRequestFixture();
    });

    function fire(detail, cancelable) {
      if (typeof cancelable !== 'boolean') {
        cancelable = false;
      }
      const e = new CustomEvent('request-object-changed', {
        bubbles: true,
        cancelable,
        detail
      });
      document.body.dispatchEvent(e);
    }

    it('updates request object when id matches', () => {
      fire({
        request: {
          _id: 'test-id',
          name: 'updated'
        }
      });
      assert.equal(element.name, 'updated');
    });

    it('ignores event when id does not match', () => {
      fire({
        request: {
          _id: 'test-id-other',
          name: 'updated'
        }
      });
      assert.notEqual(element.name, 'updated');
    });

    it('ignores event when no request', () => {
      element.request = undefined;
      fire({
        request: {
          _id: 'test-id',
          name: 'updated'
        }
      });
      assert.equal(element.name, '');
    });

    it('ignores event when cancelable', () => {
      fire({
        request: {
          _id: 'test-id',
          name: 'updated'
        }
      }, true);
      assert.notEqual(element.name, 'updated');
    });
  });

  describe('a11y', () => {
    it('is accessible with new request', async () => {
      const element = await newRequestProjectsFixture();
      await assert.isAccessible(element);
    });

    it('is accessible with saved request', async () => {
      const element = await existingRequestFixture();
      await assert.isAccessible(element);
    });
  });
});
