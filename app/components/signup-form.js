import Ember from 'ember';
import TrackerMixin from './../mixins/tracker-mixin';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorsMixin from '../mixins/validation-errors-mixin';

const Validations = buildValidations({
  emailAddress: {
    validators: [
      validator('presence', true),
      validator('format', {type: 'email'}),
      validator('ds-error')
    ]
  },
  password: {
    validators: [
      validator('presence', true),
      validator('length', {min: 8, max: 64}),
      validator('ds-error')
    ]
  },
  passwordRepeat: {
    validators: [
      validator('presence', true),
      validator('confirmation', {
        on: 'password', messageKey: 'errors.confirmation-password'
      })
    ]
  }
});

export default Ember.Component.extend(TrackerMixin, Validations, ValidationErrorsMixin, {
  intl: Ember.inject.service(),
  
  emailAddress: null,
  password: null,
  passwordRepeat: null,
  syncEnabled: false,
  
  showSuccess: false,
  
  actions: {
    signup() {
      const flash = this.get('flashMessages');
      const {emailAddress, password, syncEnabled} = this.getProperties('emailAddress', 'password', 'syncEnabled');
      
      const model = this.get('model');
      model.set('email', emailAddress);
      model.set('password', password);
      const locale = this.get('intl').get('locale')[0];
      model.set('locale', locale);
      model.set('syncEnabled', syncEnabled);
      
      this.track('signupState', model.save()).then(() => {
        this.set('showSuccess', true)
      }).catch((error) => {
        return this.handleValidationErrors(error, {email: 'emailAddress', username: 'emailAddress'});
      }).catch((error) => {
        flash.dangerT('signup.unknown-error', error.getMessage());
      });
    }
  }
});
