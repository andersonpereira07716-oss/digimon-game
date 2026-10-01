const Game = {
    state: {
        partnerId: 'agumon',
        currentChapterIndex: 0,
        playerLevel: 0,
        playerCurrentHp: 100,
        exp: 0,
        gold: 50,
        potions: 2,
        extraAtkBonus: 0,
        isArena: false,
        arenaWave: 1,
        achievements: [],
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

    saveGame() { localStorage.setItem('digimon_advanced_save', JSON.stringify(this.state)); },
    loadGame() {
        const saved = localStorage.getItem('digimon_advanced_save');
        if (saved) { try { this.state = JSON.parse(saved); return true; } catch(e) {} }
        return false;
    },
    resetGameData() {
        if (confirm("Queres reiniciar todo o progresso do jogo?")) {
            localStorage.removeItem('digimon_advanced_save');
            location.reload();
        }
    },

    switchScreen(screenId) {
        this.playSound('click');
        ['screen-menu', 'screen-partner', 'screen-story', 'screen-shop', 'screen-battle', 'screen-achievements', 'screen-victory'].forEach(id => {
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
        this.state.gold = 50;
        this.state.potions = 2;
        this.state.extraAtkBonus = 0;
        this.state.isArena = false;
        const pObj = GAME_DATA.partners.find(p => p.id === id);
        this.state.playerCurrentHp = pObj.evos[0].hp;
        this.saveGame();
        this.loadChapterData();
        this.switchScreen('screen-story');
    },

    getCurrentPartnerObj() {
        const p = GAME_DATA.partners.find(x => x.id === this.state.partnerId) || GAME_DATA.partners[0];
        return p.evos[this.state.playerLevel] || p.evos[0];
    },

    loadChapterData() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        document.getElementById('chapter-tag').innerText = chapter.tag;
        document.getElementById('chapter-title').innerText = chapter.title;
        document.getElementById('chapter-desc').innerText = chapter.desc;
        document.getElementById('enemy-preview-name').innerText = chapter.enemy.name;
        this.updateStatusBar();
    },

    updateStatusBar() {
        const evo = this.getCurrentPartnerObj();
        document.getElementById('player-status-bar').innerText = `Parceiro: ${evo.name} | Nv. ${this.state.playerLevel + 1} | 💰 ${this.state.gold}`;
    },

    // Modo Arena / Sobrevivência
    startArena() {
        this.state.isArena = true;
        this.state.arenaWave = 1;
        const evo = this.getCurrentPartnerObj();
        this.state.playerCurrentHp = evo.hp;
        this.setupArenaEnemy();
        this.switchScreen('screen-battle');
        this.logMessage(`Início da Onda ${this.state.arenaWave} na Arena de Batalha!`);
    },

    setupArenaEnemy() {
        const wave = this.state.arenaWave;
        this.state.activeEnemy = {
            name: `Monstro Feral W${wave}`,
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
        const totalAtk = evo.atk + this.state.extraAtkBonus;
        let baseDmg = type === 'basic' ? totalAtk - this.state.activeEnemy.def : Math.floor(totalAtk * 1.5) - this.state.activeEnemy.def;
        
        // Vantagem Elementar
        if (evo.element === 'fire' && this.state.activeEnemy.element === 'dark') {
            baseDmg = Math.floor(baseDmg * 1.3);
            this.logMessage(`🔥 Vantagem elementar! Dano aumentado.`);
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
        this.playSound('attack');
        const dmg = Math.max(3, enemy.atk - evo.def + Math.floor(Math.random() * 4));
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
        this.state.exp += enemy.expReward || 50;
        this.state.gold += enemy.goldReward || 40;

        // Conquistas
        if (!this.state.achievements.includes('first_win')) {
            this.state.achievements.push('first_win');
        }
        if (this.state.gold >= 200 && !this.state.achievements.includes('rich')) {
            this.state.achievements.push('rich');
        }

        this.logMessage(`Vitória! Ganhou ${enemy.expReward} EXP e ${enemy.goldReward} Bits.`);
        this.saveGame();

        setTimeout(() => {
            if (this.state.isArena) {
                this.state.arenaWave++;
                if (this.state.arenaWave >= 4 && !this.state.achievements.includes('arena_master')) {
                    this.state.achievements.push('arena_master');
                }
                alert(`Onda ${this.state.arenaWave - 1} vencida! Preparando seguinte.`);
                this.setupArenaEnemy();
                this.state.isPlayerTurn = true;
                return;
            }

            // Ir para a Loja entre capítulos
            document.getElementById('shop-gold').innerText = this.state.gold;
            this.switchScreen('screen-shop');
        }, 1200);
    },

    buyItem(type) {
        if (type === 'potion' && this.state.gold >= 30) {
            this.state.gold -= 30;
            this.state.potions++;
            alert("Poção comprada!");
        } else if (type === 'atk' && this.state.gold >= 50) {
            this.state.gold -= 50;
            this.state.extraAtkBonus += 5;
            alert("Ataque aumentado permanentemente em +5!");
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

    openAchievements() {
        const list = document.getElementById('achievements-list');
        list.innerHTML = '';
        GAME_DATA.achievementsDef.forEach(ach => {
            const unlocked = this.state.achievements.includes(ach.id);
            const div = document.createElement('div');
            div.className = `p-3 rounded-xl border ${unlocked ? 'bg-amber-950/40 border-amber-600 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`;
            div.innerHTML = `<p class="font-bold text-xs">${ach.name} ${unlocked ? '✅' : '🔒'}</p><p class="text-[10px]">${ach.desc}</p>`;
            list.appendChild(div);
        });
        this.switchScreen('screen-achievements');
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
