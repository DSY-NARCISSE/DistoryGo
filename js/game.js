/* === MOTEUR DE JEU PRINCIPAL (V0.122) === */

let Player = { name: "Héros", class: "barbarian", level: 1, xp: 0, maxXp: 100, baseHp: 100, baseAtk: 10, baseDef: 0, baseLuck: 0, hp: 100, maxHp: 100, atk: 10, def: 0, luck: 0, gold: 0, gems: 5, inv: [], equipment: { weapon: null, head: null, pet: null }, skills: [], day: 1, room: 1, floor: 1 };
let GameState = { processing: false, inCombat: false, auto: false, speed: 1, enemy: null, lastEventIdx: -1, combatEffects: {}, turnCount: 0, eventHistory: [] };

const Game = {
    init: () => {
        // Version Check : distory_v122
        const save = localStorage.getItem('distory_v122'); 
        if(save) { 
            const loaded = JSON.parse(save);
            Player = { ...Player, ...loaded }; 
            if(!Player.floor) Player.floor = 1;
            if(!Player.room) Player.room = 1;
            Game.calcStats(); 
            document.getElementById('boot-screen').classList.add('hidden'); 
            document.getElementById('game-interface').style.filter = 'none'; 
            UI.update(); 
            UI.log("Retour de " + Player.name + ".", "narrator"); 
        } else { 
            UI.initClassSelection(); 
        }
    },
    hardReset: () => { if(confirm("Reset ?")) { localStorage.removeItem('distory_v122'); location.reload(); } },
    save: () => localStorage.setItem('distory_v122', JSON.stringify(Player)),
    
    calcStats: () => {
        let addAtk = 0; let addDef = 0;
        if(Player.equipment.weapon) addAtk += Player.equipment.weapon.val;
        if(Player.equipment.head) addDef += Player.equipment.head.val;
        if(Player.equipment.pet) addAtk += Player.equipment.pet.val;
        
        Player.skills.forEach(s => { 
            if(s.type === 'stat_boost') { addAtk+=2; addDef+=1; Player.baseHp+=5; } 
            if(s.type === 'stat_crit') Player.luck+=2;
            if(s.type === 'dmg_flat') addAtk += 2;
        });
        
        Player.maxHp = Player.baseHp; 
        Player.atk = Player.baseAtk + addAtk; 
        Player.def = Player.baseDef + addDef;
        Player.luck = (Player.baseLuck || 0) + (CLASSES[Player.class].stats.luck || 0);
    },

    selectClass: (key) => {
        document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        document.getElementById('cls-'+key).classList.add('selected');
        Player.class = key;
        document.getElementById('dice-roll-area').innerText = CLASSES[key].name;
    },

    startGame: () => {
        const name = document.getElementById('player-name-input').value.trim();
        if(!name) { alert("Mettez un nom !"); return; }
        Player.name = name;
        const s = CLASSES[Player.class].stats;
        Player.baseHp = s.hp; Player.hp = s.hp; Player.baseAtk = s.atk; Player.baseDef = s.def; Player.baseLuck = 0; Player.skills = [];
        Player.room = 1; Player.floor = 1;
        Game.calcStats();
        document.getElementById('boot-screen').classList.add('hidden'); document.getElementById('game-interface').style.filter = 'none';
        UI.update(); UI.log("Début de l'aventure."); Game.save();
    },

    action: () => {
        if(GameState.processing || GameState.inCombat) return;
        GameState.processing = true;
        const btn = document.getElementById('btn-action'); btn.classList.add('opacity-50'); btn.innerText = "...";
        
        setTimeout(() => {
            if (Player.room >= 60) {
                Game.startCombat(true); 
            } else {
                Player.room++;
                Player.day++;
                const roll = Math.random();
                if(Player.room % 10 === 0) Game.startCombat(true); 
                else if(roll < 0.4) Game.triggerEvent(); 
                else if(roll < 0.7) Game.startCombat(false); 
                else Game.lootRoom();
            }
            Game.save();
        }, 500 / GameState.speed);
    },
    
    nextFloor: () => {
        Player.floor++;
        Player.room = 1;
        document.getElementById('btn-next-floor').classList.add('hidden');
        document.getElementById('btn-action').classList.remove('hidden');
        document.getElementById('story-text').innerText = `Vous descendez à l'étage ${Player.floor}...`;
        UI.log(`Arrivée Étage ${Player.floor}`, 'narrator');
        UI.update();
        Game.save();
    },

    lootRoom: () => {
        const gold = Math.floor(Math.random() * 20) + 5; Player.gold += gold;
        document.getElementById('story-text').innerHTML = "Salle vide... " + CULT_QUOTES[Math.floor(Math.random()*CULT_QUOTES.length)];
        UI.log(`+${gold} Or.`); UI.showPopup(`+${gold} Or`, 'loot'); Game.endAction();
    },

    startCombat: (isBoss) => {
        GameState.inCombat = true; GameState.combatEffects = { poison: 0, burn: 0, shield: 0 }; GameState.turnCount = 1;
        document.getElementById('view-story').classList.add('hidden'); document.getElementById('view-combat').classList.remove('hidden');
        
        let shieldAmt = 0;
        Player.skills.forEach(s => { if(s.type === 'shield_start') shieldAmt += 15; });
        if(shieldAmt > 0) { GameState.combatEffects.shield += shieldAmt; UI.log(`Bouclier: ${shieldAmt}`, "narrator"); }
        
        UI.floatText("BASTON !", "ui-avatar-visual", "crit");
        
        const enemyIndex = (Player.room + Player.floor) % ENEMIES.length;
        let baseEnemy = isBoss ? BOSSES[0] : ENEMIES[enemyIndex];
        
        const floorMult = 1 + (Player.floor * 0.5);
        const roomMult = 1 + (Player.room * 0.02); 
        
        GameState.enemy = { 
            ...baseEnemy, 
            name: isBoss ? "BOSS D'ÉTAGE" : baseEnemy.name,
            maxHp: Math.floor(baseEnemy.hp * floorMult * roomMult),
            atk: Math.floor((baseEnemy.atk || 5) * floorMult),
            xp: Math.floor((baseEnemy.xp || 10) * floorMult)
        };
        GameState.enemy.hp = GameState.enemy.maxHp;
        
        UI.updateCombat();
        setTimeout(Game.combatRound, 800 / GameState.speed);
    },

    combatRound: () => {
        if(!GameState.inCombat) return;
        
        const pet = Player.equipment.pet;
        if(pet && GameState.turnCount % 2 !== 0) {
            const petDmg = Math.max(1, Math.floor(pet.val));
            GameState.enemy.hp -= petDmg;
            UI.floatText(petDmg, 'enemy-sprite', 'crit'); 
            const petEl = document.getElementById('ui-pet-visual');
            if(petEl) { petEl.classList.remove('pet-attack-anim'); void petEl.offsetWidth; petEl.classList.add('pet-attack-anim'); }
            if(pet.element === 'fire') { GameState.combatEffects.burn += 2; UI.log("Familier: Brûlure !", "narrator"); }
            if(pet.element === 'poison') { GameState.combatEffects.poison += 2; UI.log("Familier: Poison !", "narrator"); }
        }

        let dmg = Player.atk;
        const hasElec = Player.skills.some(s => s.type === 'dmg_flat');
        const hasLifesteal = Player.skills.some(s => s.type === 'lifesteal');
        if(hasElec) dmg += 2;
        const isCrit = Math.random() < (0.15 + (Player.luck*0.01));
        if(isCrit) dmg *= 2;
        GameState.enemy.hp -= dmg;
        UI.floatText(dmg, 'enemy-sprite', isCrit ? 'crit' : 'dmg');
        UI.animPlayerAttack();
        if(hasLifesteal) { const heal = Math.ceil(dmg * 0.2); Player.hp = Math.min(Player.maxHp, Player.hp + heal); UI.floatText("+" + heal, "ui-avatar-visual", "gold"); }
        if(Player.skills.some(s => s.type === 'dot_poison') || GameState.combatEffects.poison > 0) { const pDmg = 2 + (GameState.combatEffects.poison>0?1:0); GameState.enemy.hp -= pDmg; UI.floatText("-"+pDmg, "enemy-sprite", "damage"); }
        if(Player.skills.some(s => s.type === 'dot_fire') || GameState.combatEffects.burn > 0) { const fDmg = 3 + (GameState.combatEffects.burn>0?1:0); GameState.enemy.hp -= fDmg; UI.floatText("-"+fDmg, "enemy-sprite", "damage"); }
        
        if(GameState.enemy.hp <= 0) { Game.winCombat(); return; }
        
        setTimeout(() => {
            if(!GameState.inCombat) return;
            let eDmg = Math.max(0, GameState.enemy.atk - Player.def);
            if(GameState.combatEffects.shield > 0) { let absorb = Math.min(GameState.combatEffects.shield, eDmg); GameState.combatEffects.shield -= absorb; eDmg -= absorb; UI.floatText(`(${absorb})`, "ui-avatar-visual", "gold"); }
            Player.hp -= eDmg; UI.floatText("-" + eDmg, 'ui-avatar-visual', 'dmg');
            GameState.turnCount++;
            if(Player.hp <= 0) Game.gameOver(); else { UI.update(); UI.updateCombat(); setTimeout(Game.combatRound, 800 / GameState.speed); }
        }, 600 / GameState.speed);
    },

    winCombat: () => {
        GameState.inCombat = false; Player.gold += 10; Player.xp += 20;
        
        const xpGain = GameState.enemy.xp || 10;
        Game.gainXp(xpGain);

        document.getElementById('view-story').classList.remove('hidden'); document.getElementById('view-combat').classList.add('hidden');
        document.getElementById('story-text').innerText = "Victoire !";
        
        if(Player.room >= 60) {
             document.getElementById('story-text').innerText = "BOSS VAINCU ! L'escalier est libre.";
             document.getElementById('btn-next-floor').classList.remove('hidden');
             document.getElementById('btn-action').classList.add('hidden'); 
             return;
        }

        setTimeout(Game.triggerSkillSelection, 500);
    },

    triggerSkillSelection: () => {
        document.getElementById('modal-body').innerHTML = `<h2 class="text-2xl text-gold mb-4">SKILL</h2><div id="sc" class="grid grid-cols-3 gap-2"></div>`;
        const c = document.getElementById('sc');
        const options = [];
        const pool = [...SKILLS_DB];
        while(options.length < 3 && pool.length > 0) { const idx = Math.floor(Math.random()*pool.length); options.push(pool[idx]); pool.splice(idx, 1); }
        options.forEach(s => {
            const d = document.createElement('div'); d.className = "skill-card";
            d.innerHTML = `<div class="skill-icon-lg">${s.icon}</div><div class="skill-name">${s.name}</div><div class="skill-desc">${s.desc}</div>`;
            d.onclick = () => { Game.addSkill(s); document.getElementById('modal-overlay').classList.add('hidden'); Game.endAction(); };
            c.appendChild(d);
        });
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    addSkill: (skill) => { Player.skills.push(skill); UI.log(`Skill: ${skill.name}`, 'levelup'); Game.calcStats(); UI.update(); },
    
    gameOver: () => { 
        alert("MORT. Reset salle 1."); 
        Player.hp = Player.maxHp; 
        Player.room = 1; 
        Player.floor = 1;
        
        GameState.inCombat = false; GameState.processing = false; 
        document.getElementById('view-combat').classList.add('hidden'); document.getElementById('view-story').classList.remove('hidden'); 
        UI.update(); Game.save(); 
    },
    
    triggerEvent: () => {
        if(!GameState.eventHistory) GameState.eventHistory = [];
        let availableEvents = EVENTS.filter((_, i) => !GameState.eventHistory.includes(i));
        if (availableEvents.length === 0) { GameState.eventHistory = []; availableEvents = EVENTS; }
        const ev = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        const originalIdx = EVENTS.indexOf(ev);
        GameState.eventHistory.push(originalIdx);
        if(GameState.eventHistory.length > 5) GameState.eventHistory.shift();

        if(ev.type === 'instant') {
            Game.applyEffect(ev.ef);
            document.getElementById('modal-body').innerHTML = `<h2 class="text-2xl text-purple-400 mb-4 uppercase">${ev.title}</h2><p class="mb-6 text-lg text-white">${ev.desc}</p><button class="btn-hex primary w-full" onclick="Game.closeEvent()">CONTINUER</button>`;
            document.getElementById('modal-overlay').classList.remove('hidden');
        } else {
            const m = document.getElementById('modal-body');
            m.innerHTML = `<h2 class="text-xl text-gold mb-2 uppercase">${ev.title}</h2><p class="mb-4 text-white text-lg">${ev.desc}</p><div id="eo" class="flex flex-col gap-2"></div>`;
            const eo = document.getElementById('eo');
            ev.choices.forEach(c => {
                const b = document.createElement('button'); b.className = "btn-hex"; b.innerText = c.t;
                b.onclick = () => { Game.showResult(c); };
                eo.appendChild(b);
            });
            document.getElementById('modal-overlay').classList.remove('hidden');
        }
    },
    
    showResult: (choice) => {
        Game.applyEffect(choice.ef);
        document.getElementById('modal-body').innerHTML = `<h2 class="text-2xl text-gold mb-4 uppercase">RÉSULTAT</h2><p class="mb-6 text-lg text-white italic">"${choice.result}"</p><button class="btn-hex primary w-full" onclick="Game.closeEvent()">CONTINUER L'AVENTURE</button>`;
    },
    closeEvent: () => { document.getElementById('modal-overlay').classList.add('hidden'); Game.endAction(); },
    applyEffect: (ef) => { if(ef==='heal_small') Player.hp = Math.min(Player.maxHp, Player.hp+20); else if(ef==='damage') Player.hp-=10; else if(ef==='loot') Player.gold+=50; UI.update(); },
    endAction: () => { GameState.processing = false; document.getElementById('btn-action').classList.remove('opacity-50'); document.getElementById('btn-action').innerText = "AVANCER"; Game.save(); if(GameState.auto) setTimeout(Game.action, 500/GameState.speed); },
    toggleAuto: () => { GameState.auto = !GameState.auto; document.getElementById('btn-auto').innerText = GameState.auto ? "ON" : "AUTO"; if(GameState.auto && !GameState.processing) Game.action(); },
    toggleSpeed: () => { GameState.speed = GameState.speed===1?2:1; document.getElementById('btn-speed').innerText = "x"+GameState.speed; },
    buyChest: () => { if(Player.gems<5) return; Player.gems-=5; const t = ITEMS_DB[Math.floor(Math.random()*ITEMS_DB.length)]; const item = { uid: Date.now(), ...t }; Player.inv.push(item); UI.log(`Obtenu: ${item.name}`); UI.update(); Game.save(); },
    equipItem: (uid) => { const idx = Player.inv.findIndex(i=>i.uid===uid); if(idx===-1) return; const item = Player.inv[idx]; const slot = item.type; if(Player.equipment[slot]) Player.inv.push(Player.equipment[slot]); Player.equipment[slot] = item; Player.inv.splice(idx,1); Game.calcStats(); UI.update(); Game.save(); },
    
    // V122: SPEND GOLD TO BUY STATS
    spendGold: (s) => {
        const cost = 100 * Player.level;
        if(Player.gold < cost) { 
            UI.showPopup("Pas assez d'or!", "damage");
            return; 
        }
        Player.gold -= cost;
        
        if(s==='hp') { Player.baseHp += 10; Player.hp += 10; UI.showPopup("+10 PV Max", "levelup"); }
        if(s==='atk') { Player.baseAtk += 1; UI.showPopup("+1 Force", "levelup"); }
        if(s==='def') { Player.baseDef += 1; UI.showPopup("+1 Défense", "levelup"); }
        
        Game.calcStats(); 
        UI.update();
        UI.updateCamp(); 
        Game.save();
    },

    gainXp: (amount) => {
        Player.xp += amount;
        if(Player.xp >= Player.maxXp) {
            Player.level++;
            Player.xp -= Player.maxXp;
            Player.maxXp = Math.floor(Player.maxXp * 1.5);
            Player.baseHp += 20; Player.hp = Player.baseHp; Player.baseAtk += 2; Player.baseDef += 1;
            Game.calcStats();
            UI.showPopup("NIVEAU SUPÉRIEUR !", "levelup");
        }
    }
};

// Export et Init global
window.Game = Game;
window.onload = Game.init;
