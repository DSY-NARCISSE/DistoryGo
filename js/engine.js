const Core = {
    init: () => {
        console.log("INIT DISTORY GO");
        let s = localStorage.getItem('distory_save_v1');
        if(s) try { 
            let loaded = JSON.parse(s);
            D = { ...D, ...loaded }; // Merge pour sécurité
            if(!Array.isArray(D.inv)) D.inv = []; 
        } catch(e) { console.error(e); }
        
        if(!D.char) UI.modal('char');
        else {
            Core.calc(); 
            UI.upd();
            if(R.active && !C.active) UI.btn("CONTINUER", Core.next);
            else if(C.active) { 
                C.active = false; // Reset combat crash
                UI.btn("REPRENDRE", Core.next); 
                UI.log("Récupération système...", "sys");
            } 
            else UI.btn("DÉMARRER", Core.start);
        }
    },

    save: () => localStorage.setItem('distory_save_v1', JSON.stringify(D)),
    
    hardReset: () => { 
        if(confirm("RESET TOTAL ?")) { localStorage.clear(); location.reload(); } 
    },
    
    calc: () => {
        let hp = 100 + (D.stats.hp * 20);
        let atk = 10 + (D.stats.atk * 5);
        let def = 0 + (D.stats.def * 2);
        
        if(D.weapon) atk += D.weapon.s;
        if(D.head) { def += D.head.s; hp += D.head.s * 2; }
        if(D.pet) atk += D.pet.s;

        // Passifs
        if(R.active) {
            let chi = R.skills.find(s => s.id === 'chi');
            if(chi) { let m = 1 + (0.05 * chi.lvl); hp *= m; atk *= m; }
        }

        R.max = Math.floor(hp);
        R.atk = Math.floor(atk);
        R.def = Math.floor(def);
        if(R.hp > R.max) R.hp = R.max;
    },

    pick: (c) => { 
        D.char = c; 
        Core.save(); 
        document.getElementById('modal-layer').classList.remove('show'); 
        UI.upd(); 
        UI.btn("DÉMARRER", Core.start); 
    },

    start: () => {
        Core.calc(); 
        R.hp = R.max; 
        R.day = 0; 
        R.skills = []; 
        R.active = true;
        
        // Pet skill
        if(D.pet && D.pet.elem) {
            let map = {'FIRE':'fire', 'LIGHT':'bolt', 'EARTH':'shield'};
            let sk = map[D.pet.elem] || 'chi';
            R.skills.push({id:sk, lvl:1});
        }

        UI.scene('adv'); 
        UI.btn("JOUR SUIVANT", Core.next); 
        UI.txt("MISSION", "Zone 1");
        Core.next();
    },

    next: () => {
        if(!R.active) return;
        R.day++; 
        Core.calc(); 
        UI.upd();
        
        if(R.day % 20 === 0) { Core.fight(true); return; }
        
        let r = Math.random();
        if(R.day % 10 === 0) { UI.modal('shop'); UI.txt("REPOS", "Maintenance"); }
        else if(r < 0.6) Core.fight(false);
        else {
            let ev = Math.random();
            if(ev < 0.4) { D.gold += 30; UI.log("Coffre trouvé (+30 Or)"); UI.toast("+30 Or", "loot"); }
            else if(ev < 0.7) { UI.modal('skill'); }
            else { Core.heal(R.max / 2); }
            UI.upd(); 
            Core.auto();
        }
    },

    fight: (boss) => {
        C.active = true; 
        C.boss = boss;
        let pool = boss ? DB.enemies.boss : DB.enemies.z1;
        let en = pool[Math.floor(Math.random() * pool.length)];
        let sc = 1 + (R.day * 0.1);
        
        C.max = Math.floor(en.hp * sc); 
        C.hp = C.max; 
        C.atk = Math.floor(en.atk * sc);
        
        UI.scene('com');
        document.getElementById('vis-enemy').innerText = en.i;
        document.getElementById('name-enemy').innerText = en.n;
        UI.txt(boss ? "ALERTE BOSS" : "HOSTILE", en.n);
        UI.btn("COMBAT...", null, true);
        
        setTimeout(Core.turn, 1000 / Conf.spd);
    },

    turn: () => {
        if(!C.active) return;
        
        // Player Hit
        let dmg = R.atk;
        let fire = R.skills.find(s => s.id === 'fire'); 
        if(fire) dmg += 10 * fire.lvl;
        let crit = Math.random() < 0.1; 
        if(crit) dmg *= 2;
        
        C.hp -= dmg; 
        UI.fx(dmg, crit ? '#fbbf24' : '#fff', 'vis-enemy');
        UI.bar();

        if(C.hp <= 0) { setTimeout(() => Core.end(true), 500 / Conf.spd); return; }

        // Enemy Hit
        setTimeout(() => {
            if(!C.active) return;
            let edmg = Math.max(1, C.atk - R.def);
            R.hp -= edmg;
            UI.fx(edmg, '#f00', 'vis-hero');
            UI.upd();
            
            if(R.hp <= 0) Core.end(false);
            else setTimeout(Core.turn, 500 / Conf.spd);
        }, 500 / Conf.spd);
    },

    end: (win) => {
        C.active = false;
        if(win) {
            D.gold += 15 + R.day;
            let reg = R.skills.find(s => s.id === 'heal');
            if(reg) Core.heal(reg.lvl * 5);

            if(C.boss) { D.perls += 10; UI.log("BOSS VAINCU (+10 Perles)"); Core.save(); UI.btn("RETOUR", Core.start); }
            else { UI.btn("CONTINUER", Core.next); Core.auto(); }
        } else {
            R.active = false; 
            UI.log("Echec mission.", "err"); 
            UI.btn("RELANCER", Core.start);
        }
        Core.save(); 
        UI.scene('adv');
    },

    // ACTIONS
    click: () => { if(Conf.act) Conf.act(); },
    
    heal: (v) => { R.hp = Math.min(R.max, R.hp + v); UI.updateAll(); UI.toast(`+${Math.floor(v)} PV`, "success"); },
    
    chest: () => { 
        if(D.perls >= 5){ 
            D.perls -= 5; 
            let i = JSON.parse(JSON.stringify(DB.items[Math.floor(Math.random() * DB.items.length)]));
            i.uid = Date.now(); 
            D.inv.push(i); 
            Core.save(); 
            UI.upd(); 
            UI.toast(`Loot: ${i.n}`, "loot");
        } else UI.toast("Manque 5 Perles", "err");
    },
    
    equip: (i) => { 
        let it = D.inv[i]; 
        if(D[it.t]) D.inv.push(D[it.t]); 
        D[it.t] = it; 
        D.inv.splice(i, 1); 
        Core.save(); 
        Core.calc(); 
        UI.upd(); 
        UI.toast("Équipé");
    },
    
    addSkill: (k) => { 
        let x = R.skills.find(s => s.id === k); 
        if(x) x.lvl++; else R.skills.push({id: k, lvl: 1}); 
        document.getElementById('modal-layer').classList.remove('show'); 
        UI.upd(); 
        Core.auto(); 
    },
    
    upg: (t) => { 
        if(D.gold >= 100){ D.gold -= 100; D.stats[t]++; Core.save(); Core.calc(); UI.upd(); UI.toast("Amélioré", "success"); }
        else UI.toast("Pas assez d'or", "err");
    },
    
    auto: () => { 
        Conf.auto = !Conf.auto;
        document.getElementById('btn-auto').innerText = Conf.auto ? "AUTO: ON" : "AUTO: OFF";
        document.getElementById('btn-auto').classList.toggle('active');
        if(Conf.auto && R.active && !C.active) setTimeout(() => { let b = document.getElementById('btn-act'); if(!b.disabled) b.click(); }, 800 / Conf.spd); 
    },
    
    speed: () => {
        Conf.spd = Conf.spd === 1 ? 2 : 1;
        document.getElementById('btn-spd').innerText = `VIT: x${Conf.spd}`;
    }
};

window.onload = Core.init;
