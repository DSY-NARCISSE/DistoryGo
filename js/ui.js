/* === GESTION DE L'INTERFACE UTILISATEUR === */

const UI = {
    initClassSelection: () => {
        const g = document.getElementById('class-grid'); g.innerHTML = "";
        for(const [k, c] of Object.entries(CLASSES)) {
            const d = document.createElement('div'); d.className = "class-card"; d.id = "cls-"+k;
            const vis = c.img ? `<img src="${c.img}" class="w-16 h-16 object-contain mb-2">` : `<div class="text-4xl mb-2">${c.icon}</div>`;
            d.innerHTML = `${vis}<div class="font-bold text-gold uppercase text-sm">${c.name}</div><div class="text-xs text-gray-400 italic">${c.desc}</div>`;
            d.onclick = () => Game.selectClass(k); g.appendChild(d);
        }
        Game.selectClass('barbarian');
    },

    update: () => {
        if(document.getElementById('boot-screen').classList.contains('hidden')===false) return;
        const setText = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
        setText('ui-name', Player.name); setText('ui-class-name', CLASSES[Player.class].name); setText('ui-level', Player.level);
        
        const avEl = document.getElementById('ui-avatar-visual');
        if(avEl) { const c = CLASSES[Player.class]; if(c.img) avEl.innerHTML = `<img src="${c.img}" class="custom-img">`; else avEl.innerHTML = `<div class="emoji-fallback">${c.icon}</div>`; }

        setText('ui-hp-text', Math.floor(Player.hp)+"/"+Player.maxHp);
        const hpBar = document.getElementById('ui-hp-bar'); if(hpBar) hpBar.style.width = Math.max(0,(Player.hp/Player.maxHp)*100)+"%";
        setText('ui-xp-text', Player.xp + "/" + Player.maxXp);
        const xpBar = document.getElementById('ui-xp-bar'); if(xpBar) xpBar.style.width = Math.min(100,(Player.xp/Player.maxXp)*100)+"%";
        
        setText('ui-atk', Player.atk); setText('ui-def', Player.def); setText('ui-luck', Player.luck); setText('ui-room', Player.room);
        setText('ui-gold', Player.gold); setText('ui-gems', Player.gems); setText('ui-zone', "Étage " + Player.floor + " - Salle " + Player.room);

        const shieldBar = document.getElementById('ui-shield-bar');
        if(shieldBar) { const shieldPct = Math.min(100, (GameState.combatEffects.shield / Player.maxHp) * 100); shieldBar.style.width = shieldPct + "%"; }

        ['weapon','head','pet'].forEach(t => {
            const el = document.getElementById('slot-'+t); if(!el) return; const it = Player.equipment[t]; el.innerHTML = "";
            if(it) { 
                if(it.img) el.innerHTML = `<img src="${it.img}" class="item-img">`; else el.innerText = it.icon; 
                el.className = `item-slot w-14 h-14 rarity-${it.rarity}`;
                el.onmouseenter = (e) => UI.tip(e, it.name, `${it.desc}\n\nType: ${it.type.toUpperCase()}\nBonus: +${it.val} ${it.stat.toUpperCase()}`);
                if(t === 'pet') { const petVis = document.getElementById('ui-pet-visual'); if(petVis) petVis.innerHTML = it.img ? `<img src="${it.img}" class="h-full">` : it.icon; }
            } else { 
                el.innerText = t==='weapon'?'🗡️':t==='head'?'🛡️':'🐾'; el.className = "item-slot w-14 h-14"; el.style.borderColor = "#5b5a56";
                el.onmouseenter = (e) => UI.tip(e, 'Vide', 'Rien équipé.'); 
                if(t === 'pet') document.getElementById('ui-pet-visual').innerHTML = "";
            }
        });

        const ig = document.getElementById('inventory'); if(ig) { ig.innerHTML = ""; Player.inv.forEach(i => { const d = document.createElement('div'); d.className = `item-slot rarity-${i.rarity}`; if(i.img) d.innerHTML = `<img src="${i.img}" class="item-img">`; else d.innerText = i.icon; d.onclick = () => Game.equipItem(i.uid); d.onmouseenter = (e) => UI.tip(e, i.name, `${i.desc}\n\nBonus: +${i.val} ${i.stat.toUpperCase()}`); d.onmouseleave = UI.hideTip; ig.appendChild(d); }); }
        
        const sg = document.getElementById('ui-skills'); if(sg) { sg.innerHTML = ""; Player.skills.forEach(s => { const d = document.createElement('div'); d.className = 'skill-slot'; d.innerText = s.icon; d.onmouseenter = (e) => UI.tip(e, s.name, s.desc); d.onmouseleave = UI.hideTip; sg.appendChild(d); }); }
    },

    updateCombat: () => {
        if(!GameState.enemy) return;
        const elName = document.getElementById('enemy-name'); if(elName) elName.innerText = GameState.enemy.name;
        const elHp = document.getElementById('enemy-hp-text'); if(elHp) elHp.innerText = Math.floor(GameState.enemy.hp)+"/"+GameState.enemy.maxHp;
        const elBar = document.getElementById('enemy-hp-bar'); if(elBar) elBar.style.width = Math.max(0,(GameState.enemy.hp/GameState.enemy.maxHp)*100)+"%";
        const eEl = document.getElementById('enemy-sprite'); if(eEl) { if(GameState.enemy.img) eEl.innerHTML = `<img src="${GameState.enemy.img}" class="h-full object-contain filter drop-shadow-lg">`; else eEl.innerHTML = `<div class="text-[80px]">${GameState.enemy.icon}</div>`; }
    },

    animPlayerAttack: () => { const el = document.getElementById('ui-avatar-visual'); if(el) { el.classList.remove('attack-anim'); void el.offsetWidth; el.classList.add('attack-anim'); } },
    
    showPopup: (m, t) => {
        const c = document.getElementById('combat-fx-layer'); if(!c) return;
        const e = document.createElement('div');
        e.className = `popup-msg ${t}`; e.innerText = m;
        c.appendChild(e);
        if(c.children.length > 3) c.firstChild.remove();
        setTimeout(()=>e.remove(), 2800);
    },

    log: (m) => { const b = document.getElementById('gamelog'); if(!b) return; const l = document.createElement('div'); l.className = "log-line log-narrator"; l.innerText = "> " + m; b.insertBefore(l, b.firstChild); if(b.children.length>15) b.lastChild.remove(); },
    
    tip: (e, t, d) => { const el = document.getElementById('tooltip'); if(!el) return; el.style.display='block'; el.style.left=(e.clientX+10)+'px'; el.style.top=(e.clientY-40)+'px'; el.innerHTML = `<strong>${t}</strong>${d}`; },
    hideTip: () => { const el = document.getElementById('tooltip'); if(el) el.style.display='none'; },
    
    floatText: (t, id, c) => {
        const container = document.getElementById('combat-fx-layer');
        if(!container) return;
        const el = document.createElement('div');
        el.className = 'float-txt'; el.innerText = t;
        if(c==='dmg') el.style.color='red';
        else if(c==='crit') { el.style.color='gold'; el.style.fontSize='30px'; }
        else if(c==='gold') el.style.color='#f0e6d2';
        
        const target = document.getElementById(id);
        const zone = document.getElementById('center-zone');
        if(target && zone) {
            const r = target.getBoundingClientRect();
            const z = zone.getBoundingClientRect();
            el.style.left = (r.left - z.left + (r.width/2)) + 'px';
            el.style.top = (r.top - z.top) + 'px';
        } else {
            el.style.left = '50%'; el.style.top = '50%';
        }
        container.appendChild(el);
        setTimeout(()=>el.remove(), 1000);
    },
    
    showFullStats: (e) => {
        const stats = `
            Niveau: <span class='text-gold'>${Player.level}</span>
            XP: ${Player.xp} / ${Player.maxXp}
            ---
            Force: <span class='text-red-400'>${Player.atk}</span>
            Défense: <span class='text-blue-400'>${Player.def}</span>
            Chance: <span class='text-green-400'>${Player.luck}</span>
            ---
            Or: <span class='text-yellow-300'>${Player.gold}</span>
            Gemmes: <span class='text-purple-400'>${Player.gems}</span>
        `.replace(/\n/g, '<br>');
        UI.tip(e, "STATISTIQUES COMPLÈTES", stats);
    },

    openCamp: () => {
        const modal = document.getElementById('modal-body');
        const cost = 100 * Player.level;
        modal.innerHTML = `
            <h2 class="text-2xl text-gold mb-4 uppercase">CAMPEMENT</h2>
            <p class="mb-4 text-gray-300 italic">"Ici, on s'entraîne. On ne dort pas."</p>
            <div class="grid grid-cols-3 gap-4">
                <button class="btn-hex" onclick="Game.spendGold('hp')">
                    <div class="text-xl">❤️</div>
                    <div>+10 PV Max</div>
                    <div class="text-xs text-gold mt-1">${cost} 🪙</div>
                </button>
                <button class="btn-hex" onclick="Game.spendGold('atk')">
                    <div class="text-xl">⚔️</div>
                    <div>+1 Force</div>
                    <div class="text-xs text-gold mt-1">${cost} 🪙</div>
                </button>
                <button class="btn-hex" onclick="Game.spendGold('def')">
                    <div class="text-xl">🛡️</div>
                    <div>+1 Défense</div>
                    <div class="text-xs text-gold mt-1">${cost} 🪙</div>
                </button>
            </div>
            <button class="btn-hex primary mt-6 w-full" onclick="document.getElementById('modal-overlay').classList.add('hidden')">QUITTER LE CAMP</button>
        `;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },
    updateCamp: () => UI.openCamp()
};

// Export global
window.UI = UI;
