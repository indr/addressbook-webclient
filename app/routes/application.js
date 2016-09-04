import Ember from 'ember';
import SimpleAuthApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import CustomApplicationRouteMixin from '../mixins/application-route-mixin';

const {
  assign,
  K
} = Ember;

function debug (message) {
  Ember.debug('[route:application] ' + message);
}

export default Ember.Route.extend(SimpleAuthApplicationRouteMixin, CustomApplicationRouteMixin, {
  addressbook: Ember.inject.service(),
  crypto: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  intl: Ember.inject.service(),
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  updatePuller: Ember.inject.service('update-puller'),
  
  beforeModel()  {
    const noSsl = window.location.href.indexOf('https') !== 0 && window.location.href.indexOf('http://localhost') !== 0;
    if (noSsl) {
      Ember.run.later(function () {
        window.location.href = 'https' + window.location.href.substr(4);
      }, 1500);
    }
    
    this.get('session').set('data.isDecrypted', false);
    this.restoreLocale();
  },
  
  restoreLocale() {
    // http://stackoverflow.com/questions/8199760/how-to-get-the-browser-language-using-javascript
    var language = this.get('session').get('data.localeName') || navigator.language || navigator.userLanguage;
    var localeName = ('' + language).toLowerCase().substr(0, 2);
    const names = {'en': 'en-us', 'de': 'de-de'};
    localeName = names[localeName] || 'en-us';
    debug('Setting locale ' + localeName + ' (detected ' + language + ')');
    this.get('intl').setLocale(localeName);
  },
  
  restoreProgress() {
    this.controller.set('progress.max', 0);
    this.controller.set('progress.type', 'info');
  },
  
  onProgress(status) {
    debug(`onProgress done:${status.done}, max:${status.max}, value:${status.value}`);
    this.controller.set('progress.value', status.value);
    this.controller.set('progress.max', status.max);
    if (status.done && status.value !== status.max) {
      this.controller.set('progress.type', 'danger');
      Ember.run.later(this.restoreProgress.bind(this), 1000);
    } else if (status.done || status.value === status.max) {
      this.controller.set('progress.type', 'success');
      Ember.run.later(this.restoreProgress.bind(this), 1000);
    }
  },
  
  clearError() {
    this.render('application');
  },
  
  actions: {
    error: function (error, transition) {
      Ember.Logger.error(error, transition);
      
      // Clear flash messages. Success messages at this point are confusing
      this.get('flashMessages').clearMessages();
      
      // Render template. Remember that {{outlet}} inside error.hbs would render
      // the currents route content
      this.render('error', {
        into: 'application',
        model: error
      });
      
      // More specific errors could be rendered this way
      // Or; Set error.status = error.errors[0].status and handle this in the template
      // if (error.isAdapterError && error.errors && error.errors[0] && error.errors[0].status) {
      //   const status = error.errors[0].status;
      //   this.render('error.404', {
      //     into: 'error'
      //   });
      // }
    },
    
    setLocale(localeName) {
      this.get('intl').setLocale(localeName);
      this.get('session').set('data.localeName', localeName);
    },
    
    invalidateSession() {
      this.get('session').invalidate();
    },
    
    modalOpened() {
      this.controller.set('isModal', true);
    },
    
    modalClosed() {
      this.controller.get('isModal', false);
    },
    
    willTransition() {
      this.clearError();
      this.controller.set('isModal', false);
      return this._super(...arguments);
    },
    
    pullUpdates(options) {
      options = assign({silent: false}, options);
      const flashMessages = this.get('flashMessages');
      
      const emailAddress = this.get('session').get('data.authenticated.email');
      const onProgress = options.silent ? K : this.onProgress.bind(this);
      
      try {
        return this.get('updatePuller').pull(emailAddress, onProgress).catch((err) => {
          flashMessages.dangerT('pull-updates.unknown-error', err.message || err);
        });
      } catch (err) {
        flashMessages.dangerT('pull-updates.unknown-error', err.message || err);
      }
    },
    
    onProgress(status) {
      this.onProgress(status);
    },
    
    generateFakes() {
      this.get('addressbook').fake(this.onProgress.bind(this));
    },
    
    clearContacts() {
      this.get('addressbook').clear(this.onProgress.bind(this));
    }
  }
});
