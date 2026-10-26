import * as migration_20261026_074253 from './20261026_074253';
import * as contact_limits from './20261026_080000_contact_limits';

export const migrations = [
  {
    up: migration_20261026_074253.up,
    down: migration_20261026_074253.down,
    name: '20261026_074253'
  },
  { up: contact_limits.up, down: contact_limits.down, name: '20261026_080000_contact_limits' },
];
