// src/utils/abilities.js

// ─── Full Ability List ───
export const ALL_ABILITIES = [
  { code: 'SP+', name: 'Speed Surge',       desc: 'Every 4 seconds,\nincrease speed by 1' },
  { code: 'ST+', name: 'Stamina Regen',    desc: 'Every 3 seconds, \nrecover 1 stamina' },
  { code: 'D50', name: 'Halfway Dash',     desc: 'After you pass\n50% stamina, dash \nfor rest of race' },
  { code: 'DH-', name: 'Danger Dash',      desc: 'Dash for 2s, \nthen halve speed \nfor 0–4 seconds' },
  { code: 'PSP', name: 'Partner Speed',    desc: 'Boost your partner’s \nspeed by 3' },
  { code: 'PST', name: 'Partner Stamina',  desc: 'Boost your partner’s \nstamina by 4' },
  { code: 'PRS', name: 'Partner Regen',    desc: 'Recover your partner’s \nstamina by 2 every 3s' },
  { code: 'DS2', name: 'Quick Start',      desc: 'Don’t lose stamina \nfor the first 2 seconds \nof the race' },
  { code: 'R50', name: 'Late Drag',        desc: 'Stamina speed reduction \nonly starts below \n50% stamina' },
  { code: 'BD1', name: 'Dash Boost',       desc: 'Whenever you boost \nyour partner, \ndash for 1 second' },
  { code: 'PS1', name: 'Partner Surge',    desc: 'Whenever your partner \nincreases speed, \nrecover 1 stamina' }
];

// ─── Starter Codes (3 unique) ───
export const STARTER_CODES = ['PSP', 'SP+', 'DS2'];

// Utility: get ability object by code
export function findAbilityByCode(code) {
  return ALL_ABILITIES.find(a => a.code === code) || null;
}


