/**
 * secsy-webclient
 *
 * Copyright (c) 2016 Reto Inderbitzin <mail@indr.ch>
 *
 * For the full copyright and licence information, please view
 * the LICENSE file that was distributed with this source code.
 */

import {RestSerializer} from 'ember-cli-mirage';

export default RestSerializer.extend({

  keyForAttribute(attr) {
    //return underscore(attr);
    return attr;
  }
});
