/* === BASES DE DONNÉES (ITEMS, CLASSES, MOBS) === */

const CLASSES = {
    'barbarian': { name: "Barbare", img: "", icon: "🪓", desc: "Tape fort.", bonus: "+2 Force", malus: "-5 Int", stats: { hp: 130, atk: 15, def: 2, crit: 0.05, luck: 0 } },
    'mage': { name: "Magicienne", img: "", icon: "🔮", desc: "Boules de feu.", bonus: "+3 Magie", malus: "-2 PV", stats: { hp: 80, atk: 18, def: 0, crit: 0.10, luck: 1 } },
    'ranger': { name: "Voleur", img: "", icon: "🗡️", desc: "Fuit vite.", bonus: "+2 Agi", malus: "-1 Courage", stats: { hp: 100, atk: 12, def: 1, crit: 0.25, luck: 3 } },
    'paladin': { name: "Paladin", img: "", icon: "🛡️", desc: "Brille.", bonus: "+2 Def", malus: "-2 Discrétion", stats: { hp: 150, atk: 10, def: 5, crit: 0.05, luck: 0 } },
    'elf': { name: "Elfe", img: "", icon: "🏹", desc: "Tire mal.", bonus: "+1 Coiffure", malus: "N'aime pas les nains", stats: { hp: 90, atk: 13, def: 1, crit: 0.15, luck: 2 } },
    'dwarf': { name: "Nain", img: "", icon: "🍺", desc: "Aime l'or.", bonus: "+10% Or", malus: "Sent le poney", stats: { hp: 140, atk: 14, def: 4, crit: 0.05, luck: 1 } }
};

const ENEMIES = [
    { name: "Gobelin", img: "", icon: "👺", hp: 30, atk: 4, xp: 10 },
    { name: "Rat Géant", img: "", icon: "🐀", hp: 45, atk: 6, xp: 15 },
    { name: "Orque", img: "", icon: "👹", hp: 80, atk: 10, xp: 25 },
    { name: "Squelette", img: "", icon: "💀", hp: 50, atk: 8, xp: 20 },
    { name: "Slime", img: "", icon: "🟢", hp: 60, atk: 5, xp: 18 },
    { name: "Bandit", img: "", icon: "🦹", hp: 70, atk: 9, xp: 22 },
    { name: "Poulet", img: "", icon: "🐔", hp: 100, atk: 15, xp: 40 }
];

const BOSSES = [
    { name: "Troll", img: "", icon: "👿", hp: 400, atk: 25, xp: 200 },
    { name: "Araignée", img: "", icon: "🕷️", hp: 600, atk: 35, xp: 300 },
    { name: "Zangdar", img: "", icon: "🧙‍♂️", hp: 800, atk: 45, xp: 500 }
];

const ITEMS_DB = [
    { name: "Épée Rouillée", desc: "Ça coupe, c'est déjà ça.", type: "weapon", val: 2, stat: "atk", img: "", icon: "🗡️", rarity: "common" },
    { name: "Hache du Nain", desc: "Pour les négociations difficiles.", type: "weapon", val: 5, stat: "atk", img: "", icon: "🪓", rarity: "rare" },
    { name: "Bâton Magique", desc: "Un bout de bois qui fait des étincelles.", type: "weapon", val: 8, stat: "atk", img: "", icon: "🪄", rarity: "epic" },
    { name: "Casque à Cornes", desc: "Protège des chutes de pierres.", type: "head", val: 2, stat: "def", img: "", icon: "🪖", rarity: "common" },
    { name: "Bouclier en Bois", desc: "Une planche avec une poignée.", type: "head", val: 5, stat: "def", img: "", icon: "🛡️", rarity: "rare" },
    { name: "Couronne d'Or", desc: "Ça brille, les gobelins aiment ça.", type: "head", val: 8, stat: "def", img: "", icon: "👑", rarity: "epic" },
    { name: "Rat Toxique", desc: "Il a la rage, c'est un bonus.", type: "pet", val: 2, stat: "atk", element: "poison", img: "", icon: "🐀", rarity: "common" },
    { name: "Dragonnet", desc: "Attention, il crache.", type: "pet", val: 5, stat: "atk", element: "fire", img: "", icon: "🐲", rarity: "rare" },
    { name: "Gelée Vivante", desc: "C'est froid et gluant.", type: "pet", val: 3, stat: "atk", element: "ice", img: "", icon: "🧊", rarity: "rare" }
];

const EVENTS = [
    { title: "Porte", desc: "Fermée.", choices: [{t:"Défoncer", ef:"trap", result:"Piège !"}, {t:"Partir", ef:"nothing", result:"Rien."}], type: 'choice' },
    { title: "Marchand", desc: "Il vend.", choices: [{t:"Acheter", ef:"scam", result:"Arnaque !"}, {t:"Voler", ef:"loot", result:"Vol réussi."}], type: 'choice' },
    { title: "Pause", desc: "Manger ?", choices: [{t:"Oui", ef:"heal_small", result:"Miam."}, {t:"Non", ef:"damage", result:"Faim."}], type: 'choice' },
    { title: "Fontaine", desc: "Une eau claire.", ef: "heal_small", type: 'instant' }
];

const SKILLS_DB = [
    { id: 'poison', name: "Chaussette Puante", icon: "🧦", desc: "L'ennemi perd 2 PV par tour (Poison).", type: 'dot_poison' },
    { id: 'elec', name: "Doigts dans la Prise", icon: "⚡", desc: "Augmente vos dégâts de base de 2.", type: 'dmg_flat' },
    { id: 'fire', name: "Haleine de Chili", icon: "🌶️", desc: "Inflige 3 dégâts de feu par tour.", type: 'dot_fire' },
    { id: 'shadow', name: "Vampirisme", icon: "🧛", desc: "Soigne 20% des dégâts que vous infligez.", type: 'lifesteal' },
    { id: 'light', name: "Aura de Propreté", icon: "✨", desc: "Commence le combat avec 15 points de Bouclier.", type: 'shield_start' },
    { id: 'chi', name: "Yoga du Dimanche", icon: "🧘", desc: "+2 Force, +1 Défense, +5 PV Max.", type: 'stat_boost' },
    { id: 'crit', name: "Coup de Bol", icon: "🍀", desc: "Augmente les chances de critique de 10%.", type: 'stat_crit' }
];

const CULT_QUOTES = ["Chaussette !", "Baston !", "Zog zog."];
