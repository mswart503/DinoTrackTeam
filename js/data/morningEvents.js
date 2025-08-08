// src/data/morningEvents.js
export const morningEvents = [
  {
    id: 'shop-discount-1',
    weight: 2,
    canShow: gs => true,
    build: (gs) => ({
      sender: { name: 'Track Shop', email: 'sales@trackshop.example' },
      subject: 'Flash sale: items -$1 today',
      body: 'All shop items cost $1 less today.',
      choices: [
        { label: 'Nice!', apply: (scene, gs) => {
          gs.shopDiscountToday = 1;
          scene.toast('Shop items are $1 off today.');
        }},
      ]
    })
  },

  {
    id: 'all-xp-plus-1',
    weight: 2,
    canShow: gs => true,
    build: (gs) => ({
      sender: { name: 'Rival Coach', email: 'coach@rivals.example' },
      subject: 'Rude email fired up your team',
      body: 'Your athletes are motivated.',
      choices: [
        { label: 'Motivate!', apply: (scene, gs) => {
          gs.athletes.forEach(a => { a.exp.xp = (a.exp.xp || 0) + 1; });
          scene.toast('All athletes gained +1 XP.');
        }},
      ]
    })
  },

  {
    id: 'all-spd+1-stm-1',
    weight: 1,
    canShow: gs => true,
    build: (gs) => ({
      sender: { name: 'A Parent', email: 'parent@example' },
      subject: 'Extra training last night',
      body: 'Everyone feels faster, but a bit tired.',
      choices: [
        { label: 'Okay', apply: (scene, gs) => {
          gs.athletes.forEach(a => { a.speed += 1; a.stamina = Math.max(0, a.stamina - 1); });
          scene.toast('All athletes: +1 Speed, -1 Stamina.');
        }},
      ]
    })
  },

  {
    id: 'fundraiser-send-athletes',
    weight: 1,
    canShow: gs => true,
    build: (gs) => ({
      sender: { name: 'Booster Club', email: 'boosters@example' },
      subject: 'Fundraiser today ($5 per athlete)',
      body: 'Send athletes to raise funds. They cannot train this week.',
      choices: [
        { label: 'Send selected...', apply: (scene, gs) => {
          scene.pickManyAthletes('Select athletes to send', (names) => {
            const amt = 5 * names.length;
            gs.money += amt;
            gs.unavailableThisWeek ||= {};
            names.forEach(n => gs.unavailableThisWeek[n] = true);
            scene.toast(`Sent ${names.length} athlete(s). +$${amt}.`);
          });
        }},
        { label: 'Send all', apply: (scene, gs) => {
          const names = gs.athletes.map(a => a.name);
          const amt = 5 * names.length;
          gs.money += amt;
          gs.unavailableThisWeek ||= {};
          names.forEach(n => gs.unavailableThisWeek[n] = true);
          scene.toast(`Sent all athletes. +$${amt}.`);
        }},
        { label: 'Pass', apply: () => {} },
      ]
    })
  },

  {
    id: 'special-program-pick-one',
    weight: 1,
    canShow: gs => gs.athletes.length >= 2,
    build: (gs) => ({
      sender: { name: 'Elite Trainer', email: 'pro@train.example' },
      subject: 'Special program today',
      body: 'Pick one athlete for +2 Speed. Others lose 1 Speed.',
      choices: [
        { label: 'Pick athlete...', apply: (scene, gs) => {
          scene.pickOneAthlete('Who gets +2 Speed?', (name) => {
            gs.athletes.forEach(a => {
              if (a.name === name) a.speed += 2;
              else a.speed = Math.max(0, a.speed - 1);
            });
            scene.toast(`${name} +2 Speed. Others -1 Speed.`);
          });
        }},
        { label: 'Skip', apply: ()=>{} },
      ]
    })
  },

  {
    id: 'special-away-returns-next-week',
    weight: 1,
    canShow: gs => gs.athletes.length >= 1,
    build: (gs) => ({
      sender: { name: 'National Camp', email: 'camp@nation.example' },
      subject: 'Invite: week-long intensive',
      body: 'Chosen athlete unavailable this week; returns next week with +1–2 Speed & Stamina.',
      choices: [
        { label: 'Pick athlete...', apply: (scene, gs) => {
          scene.pickOneAthlete('Send to camp (unavailable this week)', (name) => {
            gs.unavailableThisWeek ||= {};
            gs.unavailableThisWeek[name] = true;
            // random 1–2; stage for next week
            const sp = 1 + Math.floor(Math.random()*2);
            const st = 1 + Math.floor(Math.random()*2);
            gs.pendingReturns.push({
              name,
              week: gs.currentWeek + 1,
              speedGain: sp,
              staminaGain: st,
            });
            scene.toast(`${name} is away this week; will return next week stronger.`);
          });
        }},
        { label: 'Decline', apply: ()=>{} },
      ]
    })
  },
];
