/**
 * secsy-webclient
 *
 * Copyright (c) 2016 Reto Inderbitzin <mail@indr.ch>
 *
 * For the full copyright and licence information, please view
 * the LICENSE file that was distributed with this source code.
 */

import Ember from 'ember';
import Base from 'ember-simple-auth/session-stores/base';
import utils from './utils';

import AdaptiveStore from 'ember-simple-auth/session-stores/adaptive';
import VolatileStore from './volatile';

import ENV from 'secsy-webclient/config/environment';

const {
  RSVP
} = Ember;

function debug (message) {
  Ember.debug('[store:secure] ' + message);
}

export default Base.extend({
  persistentKeys: null,
  volatileKeys: null,
  
  init() {
    debug('init()');
    this._super(...arguments);
    
    const config = ENV['secure-store'];
    
    if (config) {
      this.persistentKeys = config.persistent ?
        Ember.isArray(config.persistent) ?
          config.persistent : new Array(config.persistent) :
        null;
      
      this.volatileKeys = config.volatile ?
        Ember.isArray(config.volatile) ?
          config.volatile : new Array(config.volatile) :
        null;
    }
    
    this._persistentStore = this._createPersistentStore();
    this._volatileStore = VolatileStore.create();
  },
  
  persist(data) {
    debug('persist()');
    
    const persistent = utils.pick(data, this.persistentKeys);
    const volatile = this.volatileKeys ?
      utils.pick(data, this.volatileKeys) : utils.omit(data, this.persistentKeys);
    
    return RSVP.all([
      this._persistentStore.persist(persistent),
      this._volatileStore.persist(volatile)
    ]).then(() => {
      // Don't return promise array
    });
  },
  
  restore() {
    debug('restore()');
    
    return RSVP.all([
      this._persistentStore.restore(),
      this._volatileStore.restore()
    ]).then((datas) => {
      return Ember.assign({},
        utils.pick(datas[0], this.persistentKeys),
        this.volatileKeys ?
          utils.pick(datas[1], this.volatileKeys) : utils.omit(datas[1], this.persistentKeys));
    });
  },
  
  clear() {
    debug('clear()');
    
    return RSVP.all([
      this._persistentStore.clear(),
      this._volatileStore.clear()
    ]).then(() => {
      // Don't return promise array
    });
  },
  
  _createPersistentStore() {
    const store = AdaptiveStore.create({
      cookieName: 'ember_simple_auth:persistent',
      localStorageKey: 'ember_simple_auth:persistent'
    });
    
    store.on('sessionDataUpdated', () => {
      debug('event on sessionDataUpdated');
      
      this.restore().then((data) => {
        debug('triggering on sessionDataUpdated');
        this.trigger('sessionDataUpdated', data);
      });
    });
    
    return store;
  }
});
