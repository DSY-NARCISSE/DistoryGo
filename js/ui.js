/* --- INTERFACE (UI) --- */
window.UI = {
    // Mise à jour globale de l'écran
    update: () => {
        const S = State.data; // Raccourci vers Data
        const R = State.run;  // Raccourci vers Run

        // 1. Ressources
        document.getElementById('ui-gold').innerText = S.gold;
        document.getElementById('ui-perls').innerText = S.perls;
        document.getElementById('ui-lvl').innerText = S.level;

        // 2. Affichage du Héros (CORRECTIF AVATAR)
        if(S.char) {
            document.getElementById('vis-hero').innerText = S.char;
        }

        // 3. Stats en direct
        if (R.active || S.char) {
            document.getElementById('ui-day').innerText = R.day;
            document.getElementById('ui-hp-txt').innerText = `${Math.floor(R.hp)}/${R.maxHp}`;
            document.getElementById('ui-hp-bar').style.width = `${(R.hp / R.maxHp) * 100}%`;
            document.getElementById('ui-shield-bar').style.width = R.shield > 0 ? "100%" : "0%";
            
            document.getElementById('ui-atk').innerText = R.atk;
            document.getElementById('ui-def').innerText = R.def;
            
            // Liste des skills
            const sl = document.getElementById('list-skills');
            sl.innerHTML = '';
            if (R.skills.length === 0) sl.innerHTML = `<div class="text-xs text-slate-500 text-center italic mt-10">Aucun module</div>`;
            
            R.skills.forEach(s => {
                let def = DB.skills[s.id];
                sl.innerHTML += `<div class="bg-white/5 border border-white/10 p-2 rounded text-xs flex justify-between mb-1">
                    <span class="${def.c} font-bold">${def.i} ${def.n}</span>
                    <span class="text-slate-400">Niv.${s.lvl}</span>
                </div>`;
            });
        }

        // 4. Inventaire & Slots
        const setSlot = (id, item, placeholder) => {
            const el = document.getElementById(id);
            if (item) {
                el.innerText = item.e;
                el.className = `slot ${item.r}`;
            } else {
                el.innerText = placeholder;
                el.className = "slot text-slate-600 border-slate-700";
            }
        };
        setSlot('slot-weapon', S.weapon, '⚔️');
        setSlot('slot-head', S.head, '🛡️');
        setSlot('slot-pet', S.pet, '🐾');

        // Grille Inventaire (CORRECTIF COFFRE)
        const grid = document.getElementById('grid-inv');
        grid.innerHTML = '';
        S.inventory.forEach((item, idx) => {
            let d = document.createElement('div');
            d.className = `slot ${item.r} scale-90`;
            d.innerText = item.e;
            d.onclick = () => Core.equip(idx);
            grid.appendChild(d);
        });
    },

    // Barre ennemi
    bar: () => {
        const C = State.combat;
        document.getElementById('ui-enemy-bar').style.width = `${(C.hp / C.max * 100)}%`;
    },

    // Navigation Scènes
    scene: (mode) => {
        const enemy = document.getElementById('enemy-container');
        const txt = document.getElementById('narrative-box');
        if (mode === 'combat') {
            enemy.classList.remove('hidden', 'opacity-0');
            txt.classList.add('hidden');
        } else {
            enemy.classList.add('hidden', 'opacity-0');
            txt.classList.remove('hidden');
        }
    },

    // Gestion Bouton Principal
    btn: (txt, action, disabled = false) => {
        const b = document.getElementById('btn-main');
        b.innerText = txt;
        State.conf.action = action;
        b.disabled = disabled;
        if(disabled) b.classList.add('grayscale', 'cursor-not-allowed');
        else b.classList.remove('grayscale', 'cursor-not-allowed');
    },

    // Textes narratifs
    txt: (t1, t2) => {
        document.getElementById('txt-title').innerText = t1;
        document.getElementById('txt-sub').innerText = t2;
    },

    // Logs
    log: (msg) => {
        const box = document.getElementById('game-logs');
        box.innerHTML = `<div class="mb-1 border-b border-white/5 pb-1"><span class="text-slate-400">> ${msg}</span></div>` + box.innerHTML;
    },

    // Modals
    modal: (type) => {
        const o = document.getElementById('modal-overlay');
        const c = document.getElementById('modal-content');
        o.classList.remove('hidden');
        
        let h = '';
        if(type === 'char') {
            h = `<h2 class="text-2xl font-bold text-white mb-6">IDENTIFICATION</h2><div class="flex gap-4 justify-center">${DB.chars.map(x => `<button onclick="Core.pickChar('${x.id}')" class="text-6xl p-4 bg-slate-800 border rounded-xl hover:scale-110 transition border-blue-500">${x.id}</button>`).join('')}</div>`;
        }
        else if(type === 'shop') {
            h = `<h2 class="text-xl font-bold text-emerald-400 mb-4">RAVITAILLEMENT</h2><button onclick="Core.heal(50);UI.closeModal();" class="w-full p-3 bg-slate-800 border border-green-500 rounded text-green-400 font-bold mb-2">💊 Soin 50%</button>`;
        }
        else if(type === 'skill') {
            let k = Object.keys(DB.skills)[Math.floor(Math.random()*Object.keys(DB.skills).length)];
            let s = DB.skills[k];
            h = `<h2 class="text-xl font-bold text-yellow-400 mb-4">MODULE</h2><div class="text-5xl mb-2">${s.i}</div><div class="font-bold text-white text-xl mb-4">${s.n}</div><button onclick="Core.addSkill('${k}');UI.closeModal();" class="w-full py-3 bg-yellow-600 text-black font-bold rounded">INSTALLER</button>`;
        }
        c.innerHTML = h;
    },

    closeModal: () => document.getElementById('modal-overlay').classList.add('hidden'),

    // Effets visuels
    toast: (msg) => {
        const t = document.createElement('div');
        t.className = "bg-slate-800 border-l-4 border-blue-500 text-white px-4 py-2 rounded shadow-lg";
        t.innerText = msg;
        document.getElementById('toast-container').appendChild(t);
        setTimeout(() => t.remove(), 2500);
    },
    
    fx: (txt, color, target) => {
        const el = document.createElement('div');
        el.className = "absolute font-black text-2xl animate-bounce pointer-events-none";
        el.style.color = color;
        el.innerText = txt;
        const r = document.getElementById(target).getBoundingClientRect();
        el.style.left = (r.left + 20) + "px";
        el.style.top = r.top + "px";
        document.getElementById('fx-layer').appendChild(el);
        setTimeout(() => el.remove(), 800);
    }
};
