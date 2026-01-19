/* --- MOTEUR (ENGINE) --- */
window.Core = {
    init: () => {
        console.log("INIT ENGINE V16.1");
        const s = localStorage.getItem('distory_save_fix');
        if(s) {
            try { 
                const loaded = JSON.parse(s);
                State.data = { ...State.data, ...loaded };
                if(!Array.isArray(State.data.inventory)) State.data.inventory = [];
            } catch(e) { console.error(e); }
        }

        if (!State.data.char) {
            UI.modal('char');
        } else {
            Core.calc();
            UI.update();
            // Restauration du bouton
            if(State.run.active && !State.combat.active) UI.btn("CONTINUER", Core.next);
            else if(State.combat.active) { State.combat.active = false; UI.btn("REPRENDRE", Core.next); }
            else UI.btn("DÉMARRER", Core.start);
        }
    },

    save: () => localStorage.setItem('distory_save_fix', JSON.stringify(State.data)),
    
    hardReset: () => { 
        if(confirm("RESET TOTAL ?")) { localStorage.clear(); location.reload(); } 
    },

    // --- LOGIQUE DE JEU ---
    click: () => {
        if(State.conf.action) State.conf.action();
    },

    pickChar: (c) => {
        State.data.char = c;
        Core.save();
        UI.closeModal();
        UI.update();
        UI.btn("DÉMARRER", Core.start);
    },

    start: () => {
        Core.calc();
        State.run.hp = State.run.maxHp;
        State.run.day = 0;
        State.run.active = true;
        State.run.skills = [];
        
        UI.scene('adv');
        UI.btn("JOUR SUIVANT", Core.next);
        UI.txt("DÉPLOIEMENT", "Zone 1-1");
        Core.next(); // Lance direct le jour 1
    },

    next: () => {
        State.run.day++;
        Core.calc();
        UI.update();

        // 1 chance sur 2 de combat
        if(Math.random() < 0.5) {
            Core.combatStart(false);
        } else {
            // Event simple
            let r = Math.random();
            if(r < 0.4) {
                State.data.gold += 20;
                UI.log("Crédits trouvés (+20)");
                UI.toast("+20 🪙");
            } else if (r < 0.7) {
                UI.modal('skill');
            } else {
                Core.heal(50);
            }
            UI.update();
            Core.auto();
        }
    },

    // --- COMBAT ---
    combatStart: (boss) => {
        State.combat.active = true;
        State.combat.boss = boss;
        
        // Ennemi basique
        let en = DB.enemies.z1[Math.floor(Math.random() * DB.enemies.z1.length)];
        let scale = 1 + (State.run.day * 0.1);
        
        State.combat.max = Math.floor(en.hp * scale);
        State.combat.hp = State.combat.max;
        State.combat.atk = Math.floor(en.atk * scale);
        
        UI.scene('combat');
        document.getElementById('vis-enemy').innerText = en.i;
        document.getElementById('enemy-name').innerText = en.n;
        UI.txt("HOSTILE", en.n);
        UI.btn("COMBAT...", null, true); // Désactive bouton
        
        setTimeout(Core.combatTurn, 1000);
    },

    combatTurn: () => {
        if(!State.combat.active) return;

        // Player Hit
        let dmg = State.run.atk;
        State.combat.hp -= dmg;
        UI.fx(dmg, '#fbbf24', 'vis-enemy');
        UI.bar();

        if(State.combat.hp <= 0) {
            setTimeout(() => Core.endCombat(true), 500);
            return;
        }

        // Enemy Hit
        setTimeout(() => {
            if(!State.combat.active) return;
            let edmg = Math.max(1, State.combat.atk - State.run.def);
            State.run.hp -= edmg;
            UI.fx(edmg, '#ef4444', 'vis-hero');
            UI.update();

            if(State.run.hp <= 0) Core.endCombat(false);
            else setTimeout(Core.combatTurn, 800);
        }, 500);
    },

    endCombat: (win) => {
        State.combat.active = false;
        if(win) {
            State.data.gold += 10 + State.run.day;
            UI.log("Victoire !");
            UI.txt("SUCCÈS", "Zone sécurisée");
            UI.btn("CONTINUER", Core.next);
            Core.auto();
        } else {
            State.run.active = false;
            UI.log("Échec mission.");
            UI.txt("ÉCHEC", "Rapatriement");
            UI.btn("RELANCER", Core.start);
        }
        Core.save();
        UI.scene('adv');
    },

    // --- ACTIONS DIVERSES ---
    chest: () => {
        if(State.data.perls >= 5) {
            State.data.perls -= 5;
            let item = JSON.parse(JSON.stringify(DB.items[Math.floor(Math.random() * DB.items.length)]));
            State.data.inventory.push(item);
            Core.save();
            UI.update();
            UI.toast(`Loot: ${item.n}`);
        } else {
            UI.toast("Pas assez de perles !");
        }
    },

    equip: (idx) => {
        let item = State.data.inventory[idx];
        let type = item.t === 'pet' ? 'pet' : (item.t === 'weapon' ? 'weapon' : 'head');
        
        // Swap
        if(State.data[type]) State.data.inventory.push(State.data[type]);
        State.data[type] = item;
        State.data.inventory.splice(idx, 1);
        
        Core.calc();
        Core.save();
        UI.update();
        UI.toast("Équipé");
    },

    heal: (v) => {
        State.run.hp = Math.min(State.run.maxHp, State.run.hp + v);
        UI.update();
        UI.toast(`+${v} PV`);
    },

    calc: () => {
        // Stats de base
        State.run.maxHp = 100 + (State.data.stats.hp * 20);
        State.run.atk = 10 + (State.data.stats.atk * 5);
        
        // Ajout équipement
        if(State.data.weapon) State.run.atk += State.data.weapon.s;
        if(State.data.head) State.run.maxHp += State.data.head.s * 2;
        if(State.data.pet) State.run.atk += State.data.pet.s;
        
        // Clamp HP
        if(State.run.hp > State.run.maxHp) State.run.hp = State.run.maxHp;
    },

    addSkill: (id) => {
        let s = State.run.skills.find(x => x.id === id);
        if(s) s.lvl++; else State.run.skills.push({id:id, lvl:1});
        UI.closeModal();
        UI.update();
        Core.auto();
    },

    // Auto-play basic
    auto: () => {
        State.conf.auto = !State.conf.auto;
        document.getElementById('btn-auto').innerText = State.conf.auto ? "AUTO: ON" : "AUTO: OFF";
        if(State.conf.auto && !State.combat.active) {
            setTimeout(() => {
                if(!document.getElementById('btn-act').disabled) Core.click();
            }, 1000);
        }
    }
};
