import { assert } from 'chai';
import { describeModule, it } from 'ember-mocha';

describeModule('route:contacts', 'Unit | Route | contacts', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
  },
  function () {

it('it exists', function () {
  let route = this.subject();
  assert.ok(route);
});
});
