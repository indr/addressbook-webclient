/**
 * secsy-webclient
 *
 * Copyright (c) 2016 Reto Inderbitzin <mail@indr.ch>
 *
 * For the full copyright and licence information, please view
 * the LICENSE file that was distributed with this source code.
 */

import Ember from 'ember';
import TrackerMixin from './../../mixins/tracker-mixin';

export default Ember.Route.extend(TrackerMixin, {
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  
  model(params) {
    return this.get('store').findRecord('contact', params.id);
  },
  
  afterModel(contact) {
    if (!this.get('session').get('data.authenticated.sync_enabled')) {
      this.transitionTo('contacts.view', contact);
    }
  },
  
  actions: {
    apply(keys) {
      const contact = this.controller.get('model');
      
      contact.applyUpdates(keys);
      
      this.track('controller.applyState', contact.save()).then(() => {
        return contact.dismissUpdates()
      }).then(() => {
        this.get('flashMessages').successT('review.update-successful');
        this.transitionTo('contacts.view', contact);
      }).catch((error) => {
        this.get('flashMessages').dangerT('review.update-unknown-error', error);
      });
    },
    
    dismiss() {
      const contact = this.controller.get('model');
      
      this.track('controller.dismissState', contact.dismissUpdates()).then(() => {
        this.transitionTo('contacts.view', contact);
      }).catch((error) => {
        this.get('flashMessages').dangerT('review.dismiss-unknown-error', error);
      });
    },
    
    back() {
      const model = this.controller.get('model');
      this.transitionTo('contacts.view', model);
    }
  }
});
