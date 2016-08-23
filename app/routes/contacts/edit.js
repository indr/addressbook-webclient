import Ember from 'ember';

export default Ember.Route.extend({
  intl: Ember.inject.service(),
  store: Ember.inject.service(),
  
  model(params) {
    return this.get('store').findRecord('contact', params.id);
  },
  
  actions: {
    save() {
      const model = this.controller.get('model');
      model.save().then(() => {
        this.transitionTo('contacts.view', model);
      }).catch((err) => {
        this.get('flashMessages').dangerT('errors.save-unknown', err.message || err);
      });
    },
    
    cancel() {
      const model = this.controller.get('model');
      model.rollbackAttributes();
      this.transitionTo('contacts.view', model);
    },
    
    willTransition(transition) {
      const model = this.controller.get('model');
      if (!model.get('hasDirtyAttributes')) {
        return;
      }
      
      const message = this.get('intl').t('confirm.pending-unsaved');
      if (window.confirm(message)) {
        model.rollbackAttributes();
      } else {
        transition.abort();
      }
    }
  }
});
