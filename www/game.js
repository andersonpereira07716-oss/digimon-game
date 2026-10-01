const Game = {
    state: {
        partnerId: 'agumon',
        currentChapterIndex: 0,
        playerLevel: 0,
        playerCurrentHp: 100,
        exp: 0,
        gold: 80,
        potions: 3,
        equipment: [],
        questProgress: { q1: 0, q2: 0 },
        questClaimed: { q1: false, q2: false },
        dexDiscovered: ['agumon', 'devimon'],
        isArena: false,
        arenaWave: 1,
        isPlayerTurn: true,
        activeEnemy: null
    },

    audioCtx: null,
    playSound(type) {
        try {
            if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain); gain.connect(this.audioCtx.destination);
            let freq = 440, dur = 0.1;
            if (type === 'click') { freq = 600; dur = 0.04; }
            else if (type === 'attack') { freq = 200; dur = 0.1; osc.type = 'square'; }
            else if (type === 'special') { freq = 800; dur = 0.18; osc.type = 'sawtooth'; }
            else if (type === 'heal') { freq = 500; dur = 0.25; osc.type = 'sine'; }
            else if (type === 'evolve') { freq = 900; dur = 0.35; osc.type = 'triangle'; }
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + dur);
            osc.start(); osc.stop(this.audioCtx.currentTime + dur);
        } catch(e) {}
    },

    saveGame() { localStorage.setItem('digimon_ultimate_save', JSON.stringify(this.state)); },
    loadGame() {
        const saved = localStorage.getItem('digimon_ultimate_save');
        if (saved) { try { this.state = JSON.parse(saved); return true; } catch(e) {} }
        return false;
    },
    resetGameData() {
        if (confirm("Queres reiniciar todo o progresso do jogo?")) {
            localStorage.removeItem('digimon_ultimate_save');
            location.reload();
        }
    },

    switchScreen(screenId) {
        this.playSound('click');
        ['screen-menu', 'screen-partner', 'screen-story', 'screen-dojo', 'screen-shop', 'screen-equipment', 'screen-quests', 'screen-digidex', 'screen-battle', 'screen-victory'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(screenId);
        if (target) { target.classList.remove('hidden'); target.classList.add('flex'); }
    },

    init() {
        if (this.loadGame()) {
            this.loadChapterData();
            this.switchScreen('screen-story');
        } else {
            this.switchScreen('screen-menu');
        }
    },

    openPartnerSelection() {
        this.playSound('click');
        const container = document.getElementById('partner-list-container');
        container.innerHTML = '';
        GAME_DATA.partners.forEach(partner => {
            const baseEvo = partner.evos[0];
            const btn = document.createElement('button');
            btn.className = "w-full bg-slate-900 border border-slate-800 hover:border-cyan-500 p-3 rounded-xl flex items-center justify-between cursor-pointer";
            btn.innerHTML = `<div class="flex items-center space-x-3"><span class="text-2xl">${baseEvo.sprite}</span><div class="text-left"><p class="font-bold text-xs text-cyan-400">${partner.name}</p><p class="text-[9px] text-slate-400">HP: ${baseEvo.hp} | ATK: ${baseEvo.atk}</p></div></div><span class="text-[10px] bg-cyan-900 text-cyan-300 px-2.5 py-1 rounded">Escolher</span>`;
            btn.onclick = () => this.selectPartner(partner.id);
            container.appendChild(btn);
        });
        this.switchScreen('screen-partner');
    },

    selectPartner(id) {
        this.state.partnerId = id;
        this.state.currentChapterIndex = 0;
        this.state.playerLevel = 0;
        this.state.exp = 0;
        this.state.gold = 80;
        this.state.potions = 3;
        this.state.equipment = [];
        this.state.isArena = false;
        const pObj = GAME_DATA.partners.find(p => p.id === id);
        this.state.playerCurrentHp = pObj.evos[0].hp;
        if (!this.state.dexDiscovered.includes(id)) this.state.dexDiscovered.push(id);
        this.saveGame();
        this.loadChapterData();
        this.switchScreen('screen-story');
    },

    getCurrentPartnerObj() {
        const p = GAME_DATA.partners.find(x => x.id === this.state.partnerId) || GAME_DATA.partners[0];
        return p.evos[this.state.playerLevel] || p.evos[0];
    },

    getPassiveBonuses() {
        let bonusAtk = 0, bonusDef = 0, bonusGold = 0;
        this.state.equipment.forEach(eqId => {
            const eq = GAME_DATA.equipmentList.find(e => e.id === eqId);
            if (eq) {
                if (eq.type === 'atk') bonusAtk += eq.val;
                if (eq.type === 'def') bonusDef += eq.val;
                if (eq.type === 'gold') bonusGold += eq.val;
            }
        });
        return { bonusAtk, bonusDef, bonusGold };
    },

    loadChapterData() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        document.getElementById('chapter-tag').innerText = chapter.tag;
        document.getElementById('chapter-title').innerText = chapter.title;
        document.getElementById('chapter-desc').innerText = chapter.desc;
        document.getElementById('weather-name').innerText = chapter.weather;
        document.getElementById('enemy-preview-name').innerText = chapter.enemy.name;
        this.updateStatusBar();
    },

    updateStatusBar() {
        const evo = this.getCurrentPartnerObj();
        document.getElementById('player-status-bar').innerText = `Parceiro: ${evo.name} | Nv. ${this.state.playerLevel + 1} | 💰 ${this.state.gold}`;
    },

    // Dojo de Treino (Minijogo de Reflexo)
    dojoTimeout: null,
    startDojo() {
        this.switchScreen('screen-dojo');
        const btn = document.getElementById('dojo-action-btn');
        btn.innerText = "AGUARDE...";
        btn.className = "w-full bg-slate-800 hover:bg-slate-700 font-bold py-6 rounded-xl text-sm border border-slate-700 cursor-pointer transition";
        
        const delay = 1500 + Math.random() * 2000;
        this.dojoTimeout = setTimeout(() => {
            btn.innerText = "CLICA AGORA!";
            btn.className = "w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-6 rounded-xl text-sm border border-emerald-500 cursor-pointer transition animate-pulse";
            btn.dataset.ready = "true";
        }, delay);
    },

    dojoClick() {
        const btn = document.getElementById('dojo-action-btn');
        if (btn.dataset.ready === "true") {
            clearTimeout(this.dojoTimeout);
            btn.dataset.ready = "false";
            this.playSound('evolve');
            this.state.exp += 40;
            this.state.questProgress.q2++;
            alert("Treino bem-sucedido! Ganhaste +40 EXP.");
            this.saveGame();
            this.init();
        } else {
            clearTimeout(this.dojoTimeout);
            alert("Clicaste demasiado cedo! Tenta novamente.");
            this.startDojo();
        }
    },

    // Equipamentos Passivos
    openEquipment() {
        const container = document.getElementById('equipment-list-container');
        container.innerHTML = '';
        GAME_DATA.equipmentList.forEach(eq => {
            const owned = this.state.equipment.includes(eq.id);
            const div = document.createElement('div');
            div.className = "bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between";
            div.innerHTML = `<div><p class="font-bold text-xs text-amber-300">${eq.name}</p><p class="text-[9px] text-slate-400">${eq.desc} - ${eq.cost} Bits</p></div><button onclick="Game.buyEquipment('${eq.id}')" class="text-[10px] px-3 py-1.5 rounded-lg font-bold ${owned ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-amber-600 text-slate-950 cursor-pointer'}">${owned ? 'Adquirido' : 'Comprar'}</button>`;
            container.appendChild(div);
        });
        this.switchScreen('screen-equipment');
    },

    buyEquipment(eqId) {
        const eq = GAME_DATA.equipmentList.find(e => e.id === eqId);
        if (this.state.equipment.includes(eqId)) return;
        if (this.state.gold >= eq.cost) {
            this.state.gold -= eq.cost;
            this.state.equipment.push(eqId);
            alert(`Equipamento ${eq.name} comprado com sucesso!`);
            this.saveGame();
            this.openEquipment();
        } else {
            alert("Bits insuficientes!");
        }
    },

    // Missões Diárias
    openQuests() {
        const container = document.getElementById('quests-list-container');
        container.innerHTML = '';
        GAME_DATA.questsDef.forEach(q => {
            const current = this.state.questProgress[q.id] || 0;
            const claimed = this.state.questClaimed[q.id];
            const completed = current >= q.target;
            const div = document.createElement('div');
            div.className = "bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between";
            div.innerHTML = `<div><p class="font-bold text-xs text-purple-300">${q.name}</p><p class="text-[9px] text-slate-400">${q.desc} (${current}/${q.target})</p></div><button onclick="Game.claimQuest('${q.id}')" class="text-[10px] px-3 py-1.5 rounded-lg font-bold ${claimed ? 'bg-slate-800 text-slate-500' : completed ? 'bg-purple-600 text-white cursor-pointer' : 'bg-slate-800 text-slate-400'}">${claimed ? 'Resgatado' : completed ? 'Resgatar' : 'Em progresso'}</button>`;
            container.appendChild(div);
        });
        this.switchScreen('screen-quests');
    },

    claimQuest(qId) {
        const q = GAME_DATA.questsDef.find(x => x.id === qId);
        const current = this.state.questProgress[qId] || 0;
        if (current >= q.target && !this.state.questClaimed[qId]) {
            this.state.questClaimed[qId] = true;
            this.state.gold += q.rewardGold;
            alert(`Recompensa resgatada: +${q.rewardGold} Bits!`);
            this.saveGame();
            this.openQuests();
        }
    },

    // DigiDex
    openDigiDex() {
        const container = document.getElementById('digidex-list-container');
        container.innerHTML = '';
        const allCreatures = [
            { id: 'agumon', name: 'Agumon', sprite: '🦖', type: 'Parceiro' },
            { id: 'gabumon', name: 'Gabumon', sprite: '🐺', type: 'Parceiro' },
            { id: 'biyomon', name: 'Biyomon', sprite: '🦅', type: 'Parceiro' },
            { id: 'devimon', name: 'Devimon', sprite: '😈', type: 'Chefe' },
            { id: 'etemon', name: 'Etemon', sprite: '🐵', type: 'Chefe' },
            { id: 'myotismon', name: 'Myotismon', sprite: '🦇', type: 'Chefe' }
        ];
        allCreatures.forEach(c => {
            const unlocked = this.state.dexDiscovered.includes(c.id);
            const div = document.createElement('div');
            div.className = "bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center space-x-3";
            div.innerHTML = `<span class="text-2xl">${unlocked ? c.sprite : '❓'}</span><div><p class="font-bold text-xs text-cyan-300">${unlocked ? c.name : 'Desconhecido'}</p><p class="text-[9px] text-slate-400">Tipo: ${c.type}</p></div>`;
            container.appendChild(div);
        });
        this.switchScreen('screen-digidex');
    },

    startArena() {
        this.state.isArena = true;
        this.state.arenaWave = 1;
        const evo = this.getCurrentPartnerObj();
        this.state.playerCurrentHp = evo.hp;
        this.setupArenaEnemy();
        this.switchScreen('screen-battle');
        this.logMessage(`Início da Onda ${this.state.arenaWave} na Arena!`);
    },

    setupArenaEnemy() {
        const wave = this.state.arenaWave;
        this.state.activeEnemy = {
            name: `Monstro W${wave}`,
            sprite: ['👾', '🐉', '🤖', '💀'][wave % 4],
            element: 'dark',
            hp: 90 + wave * 40,
            maxHp: 90 + wave * 40,
            atk: 14 + wave * 6,
            def: 3 + wave * 2,
            expReward: 40 * wave,
            goldReward: 30 * wave
        };
        this.updateBattleUI();
    },

    startBattle() {
        this.state.isArena = false;
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        const evo = this.getCurrentPartnerObj();
        this.state.activeEnemy = { ...chapter.enemy, currentHp: chapter.enemy.hp };
        this.state.isPlayerTurn = true;

        if (!this.state.dexDiscovered.includes(chapter.enemy.name.toLowerCase())) {
            this.state.dexDiscovered.push(chapter.enemy.name.toLowerCase());
        }

        document.getElementById('battle-player-name').innerText = evo.name;
        document.getElementById('player-sprite').innerText = evo.sprite;
        document.getElementById('enemy-name').innerText = this.state.activeEnemy.name;
        document.getElementById('enemy-sprite').innerText = this.state.activeEnemy.sprite;
        document.getElementById('potion-count').innerText = this.state.potions;
        this.updateBattleUI();
        document.getElementById('battle-log').innerHTML = '';
        this.logMessage(`Batalha iniciada contra ${this.state.activeEnemy.name}!`);
        this.switchScreen('screen-battle');
    },

    playerAttack(type) {
        if (!this.state.isPlayerTurn) return;
        const evo = this.getCurrentPartnerObj();
        const bonuses = this.getPassiveBonuses();
        const totalAtk = evo.atk + bonuses.bonusAtk;
        let baseDmg = type === 'basic' ? totalAtk - this.state.activeEnemy.def : Math.floor(totalAtk * 1.5) - this.state.activeEnemy.def;
        
        if (evo.element === 'fire' && this.state.activeEnemy.element === 'dark') {
            baseDmg = Math.floor(baseDmg * 1.3);
            this.logMessage(`🔥 Vantagem elementar aplicada!`);
        }

        const dmg = Math.max(5, baseDmg + Math.floor(Math.random() * 5));
        if (type === 'basic') this.playSound('attack'); else this.playSound('special');

        this.state.activeEnemy.currentHp = Math.max(0, this.state.activeEnemy.currentHp - dmg);
        this.logMessage(`${evo.name} atacou causando ${dmg} de dano.`);
        this.updateBattleUI();

        if (this.state.activeEnemy.currentHp <= 0) {
            this.handleVictory();
            return;
        }

        this.state.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 900);
    },

    usePotion() {
        if (!this.state.isPlayerTurn || this.state.potions <= 0) return;
        const evo = this.getCurrentPartnerObj();
        if (this.state.playerCurrentHp >= evo.hp) return;
        this.state.potions--;
        this.playSound('heal');
        const heal = Math.floor(evo.hp * 0.5);
        this.state.playerCurrentHp = Math.min(evo.hp, this.state.playerCurrentHp + heal);
        document.getElementById('potion-count').innerText = this.state.potions;
        this.logMessage(`Poção usada! HP recuperado em ${heal}.`);
        this.updateBattleUI();
        this.state.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 900);
    },

    playerEvolve() {
        const partner = GAME_DATA.partners.find(p => p.id === this.state.partnerId);
        if (this.state.playerLevel >= partner.evos.length - 1) return;
        this.state.playerLevel++;
        this.playSound('evolve');
        const evo = this.getCurrentPartnerObj();
        this.state.playerCurrentHp = evo.hp;
        document.getElementById('battle-player-name').innerText = evo.name;
        document.getElementById('player-sprite').innerText = evo.sprite;
        this.logMessage(`⚡ DIGIEVOLUÇÃO para ${evo.name}!`);
        this.updateBattleUI();
        this.saveGame();
    },

    enemyTurn() {
        const enemy = this.state.activeEnemy;
        const evo = this.getCurrentPartnerObj();
        const bonuses = this.getPassiveBonuses();
        const totalDef = evo.def + bonuses.bonusDef;
        this.playSound('attack');
        const dmg = Math.max(3, enemy.atk - totalDef + Math.floor(Math.random() * 4));
        this.state.playerCurrentHp = Math.max(0, this.state.playerCurrentHp - dmg);
        this.logMessage(`${enemy.name} contra-atacou com ${dmg} de dano.`);
        this.updateBattleUI();

        if (this.state.playerCurrentHp <= 0) {
            this.logMessage(`Derrotado... A reiniciar combate.`);
            setTimeout(() => {
                if (this.state.isArena) this.startArena(); else this.startBattle();
            }, 1200);
            return;
        }
        this.state.isPlayerTurn = true;
    },

    updateBattleUI() {
        const evo = this.getCurrentPartnerObj();
        const enemy = this.state.activeEnemy;
        const pPct = Math.max(0, (this.state.playerCurrentHp / evo.hp) * 100);
        const ePct = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
        document.getElementById('player-hp-bar').style.width = `${pPct}%`;
        document.getElementById('player-hp-text').innerText = `HP: ${this.state.playerCurrentHp}/${evo.hp}`;
        document.getElementById('player-exp-text').innerText = `EXP: ${this.state.exp}`;
        document.getElementById('enemy-hp-bar').style.width = `${ePct}%`;
    },

    handleVictory() {
        const enemy = this.state.activeEnemy;
        const bonuses = this.getPassiveBonuses();
        const earnedGold = (enemy.goldReward || 40) + bonuses.bonusGold;
        
        this.state.exp += enemy.expReward || 50;
        this.state.gold += earnedGold;
        this.state.questProgress.q1++;

        this.logMessage(`Vitória! Ganhou ${enemy.expReward} EXP e ${earnedGold} Bits.`);
        this.saveGame();

        setTimeout(() => {
            if (this.state.isArena) {
                this.state.arenaWave++;
                alert(`Onda ${this.state.arenaWave - 1} vencida! A preparar seguinte.`);
                this.setupArenaEnemy();
                this.state.isPlayerTurn = true;
                return;
            }
            document.getElementById('shop-gold').innerText = this.state.gold;
            this.switchScreen('screen-shop');
        }, 1200);
    },

    buyItem(type) {
        if (type === 'potion' && this.state.gold >= 30) {
            this.state.gold -= 30;
            this.state.potions++;
            alert("Poção comprada!");
        } else {
            alert("Bits insuficientes!");
        }
        document.getElementById('shop-gold').innerText = this.state.gold;
        this.saveGame();
    },

    leaveShop() {
        this.state.currentChapterIndex++;
        if (this.state.currentChapterIndex >= GAME_DATA.chapters.length) {
            this.state.currentChapterIndex = 0;
            alert("Parabéns! Completaste a campanha principal!");
        }
        this.saveGame();
        this.loadChapterData();
        this.switchScreen('screen-story');
    },

    logMessage(text) {
        const box = document.getElementById('battle-log');
        if (!box) return;
        const p = document.createElement('div');
        p.innerText = text;
        box.appendChild(p);
        box.scrollTop = box.scrollHeight;
    }
};

window.onload = () => { Game.init(); };
