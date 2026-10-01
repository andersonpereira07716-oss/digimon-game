const Game = {
    state: {
        partnerId: 'agumon',
        currentChapterIndex: 0,
        playerLevel: 0,
        playerCurrentHp: 100,
        enemyCurrentHp: 100,
        potions: 2,
        isDefending: false,
        isPlayerTurn: true,
        activeEnemy: null
    },

    // Inicialização e Sistema de Som Nativo (Web Audio API)
    audioCtx: null,
    playSound(type) {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            let freq = 440;
            let duration = 0.1;

            if (type === 'click') { freq = 600; duration = 0.05; }
            else if (type === 'attack') { freq = 200; duration = 0.12; osc.type = 'square'; }
            else if (type === 'special') { freq = 800; duration = 0.2; osc.type = 'sawtooth'; }
            else if (type === 'heal') { freq = 500; duration = 0.3; osc.type = 'sine'; }
            else if (type === 'evolve') { freq = 900; duration = 0.4; osc.type = 'triangle'; }

            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Ignora se o browser bloquear áudio sem interação prévia
        }
    },

    // Sistema de Salvamento Automático (LocalStorage)
    saveGame() {
        localStorage.setItem('digimon_save', JSON.stringify(this.state));
    },

    loadGame() {
        const saved = localStorage.getItem('digimon_save');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    },

    resetGameData() {
        if (confirm("Tens a certeza que queres reiniciar todo o progresso?")) {
            localStorage.removeItem('digimon_save');
            location.reload();
        }
    },

    // Alternar telas
    switchScreen(screenId) {
        this.playSound('click');
        ['screen-menu', 'screen-partner', 'screen-story', 'screen-battle', 'screen-victory'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('flex');
        }
    },

    // Iniciar fluxo do jogo no Menu
    init() {
        if (this.loadGame()) {
            this.loadChapterData();
            this.switchScreen('screen-story');
        } else {
            this.switchScreen('screen-menu');
        }
    },

    // Escolha de Parceiro Inicial
    openPartnerSelection() {
        this.playSound('click');
        const container = document.getElementById('partner-list-container');
        container.innerHTML = '';

        GAME_DATA.partners.forEach(partner => {
            const baseEvo = partner.evos[0];
            const btn = document.createElement('button');
            btn.className = "w-full bg-slate-900 border border-slate-800 hover:border-cyan-500 p-4 rounded-xl flex items-center justify-between cursor-pointer transition active:scale-95";
            btn.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-3xl">${baseEvo.sprite}</span>
                    <div class="text-left">
                        <p class="font-bold text-sm text-cyan-400">${partner.name}</p>
                        <p class="text-[10px] text-slate-400">Especial: ${baseEvo.specialName} | HP: ${baseEvo.hp}</p>
                    </div>
                </div>
                <span class="text-xs bg-cyan-900 text-cyan-300 px-3 py-1.5 rounded-lg font-bold">Escolher</span>
            `;
            btn.onclick = () => this.selectPartner(partner.id);
            container.appendChild(btn);
        });

        this.switchScreen('screen-partner');
    },

    selectPartner(id) {
        this.state.partnerId = id;
        this.state.currentChapterIndex = 0;
        this.state.playerLevel = 0;
        this.state.potions = 2;
        
        const partnerObj = GAME_DATA.partners.find(p => p.id === id);
        this.state.playerCurrentHp = partnerObj.evos[0].hp;

        this.saveGame();
        this.loadChapterData();
        this.switchScreen('screen-story');
    },

    getCurrentPartnerObj() {
        const partner = GAME_DATA.partners.find(p => p.id === this.state.partnerId) || GAME_DATA.partners[0];
        return partner.evos[this.state.playerLevel] || partner.evos[0];
    },

    loadChapterData() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        document.getElementById('chapter-tag').innerText = chapter.tag;
        document.getElementById('chapter-title').innerText = chapter.title;
        document.getElementById('chapter-desc').innerText = chapter.desc;
        document.getElementById('enemy-preview-name').innerText = chapter.enemy.name;
        
        const evo = this.getCurrentPartnerObj();
        const statusBar = document.getElementById('player-status-bar');
        if (statusBar) {
            statusBar.innerText = `Parceiro: ${evo.name} | Nv. ${this.state.playerLevel + 1}`;
        }
    },

    startBattle() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        const evo = this.getCurrentPartnerObj();

        this.state.activeEnemy = { ...chapter.enemy };
        this.state.activeEnemy.currentHp = chapter.enemy.hp;
        this.state.isDefending = false;
        this.state.isPlayerTurn = true;

        document.getElementById('battle-player-name').innerText = evo.name;
        document.getElementById('player-sprite').innerText = evo.sprite;
        document.getElementById('enemy-name').innerText = this.state.activeEnemy.name;
        document.getElementById('enemy-sprite').innerText = this.state.activeEnemy.sprite;
        document.getElementById('potion-count').innerText = this.state.potions;

        this.updateBattleUI();
        document.getElementById('battle-log').innerHTML = '';
        this.logMessage(`Um ${this.state.activeEnemy.name} selvagem apareceu! Prepare-se.`);
        this.switchScreen('screen-battle');
    },

    playerAttack(type) {
        if (!this.state.isPlayerTurn) return;

        const evo = this.getCurrentPartnerObj();
        let damage = 0;
        let actionName = "";

        if (type === 'basic') {
            this.playSound('attack');
            damage = Math.max(5, evo.atk - this.state.activeEnemy.def + Math.floor(Math.random() * 6));
            actionName = `usou Ataque Físico`;
        } else if (type === 'special') {
            this.playSound('special');
            damage = Math.max(10, Math.floor(evo.atk * 1.6) - this.state.activeEnemy.def + Math.floor(Math.random() * 10));
            actionName = `usou a habilidade **${evo.specialName}**`;
        }

        this.state.activeEnemy.currentHp = Math.max(0, this.state.activeEnemy.currentHp - damage);
        this.logMessage(`${evo.name} ${actionName} causando ${damage} de dano!`);

        this.updateBattleUI();

        if (this.state.activeEnemy.currentHp <= 0) {
            this.handleVictory();
            return;
        }

        this.state.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 1000);
    },

    // Sistema de Usar Poção de Cura
    usePotion() {
        if (!this.state.isPlayerTurn) return;
        if (this.state.potions <= 0) {
            this.logMessage(`Você não tem mais poções de cura!`);
            return;
        }

        const evo = this.getCurrentPartnerObj();
        if (this.state.playerCurrentHp >= evo.hp) {
            this.logMessage(`O HP já está cheio!`);
            return;
        }

        this.state.potions--;
        this.playSound('heal');
        const healAmount = Math.floor(evo.hp * 0.5); // Cura 50% do HP max
        this.state.playerCurrentHp = Math.min(evo.hp, this.state.playerCurrentHp + healAmount);

        document.getElementById('potion-count').innerText = this.state.potions;
        this.logMessage(`${evo.name} usou uma Poção e recuperou ${healAmount} de HP!`);
        this.updateBattleUI();

        this.state.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 1000);
    },

    playerEvolve() {
        const partnerObj = GAME_DATA.partners.find(p => p.id === this.state.partnerId) || GAME_DATA.partners[0];
        if (this.state.playerLevel >= partnerObj.evos.length - 1) {
            this.logMessage(`Seu Digimon já atingiu o estágio máximo!`);
            return;
        }

        this.state.playerLevel++;
        this.playSound('evolve');
        const evo = this.getCurrentPartnerObj();
        this.state.playerCurrentHp = evo.hp; // Cura total ao evoluir

        document.getElementById('battle-player-name').innerText = evo.name;
        document.getElementById('player-sprite').innerText = evo.sprite;
        
        this.logMessage(`⚡ DIGIEVOLUÇÃO! Seu parceiro evoluiu para **${evo.name}**!`);
        this.updateBattleUI();
        this.saveGame();
    },

    enemyTurn() {
        const enemy = this.state.activeEnemy;
        const evo = this.getCurrentPartnerObj();

        this.playSound('attack');
        let damage = Math.max(3, enemy.atk - evo.def + Math.floor(Math.random() * 5));

        this.state.playerCurrentHp = Math.max(0, this.state.playerCurrentHp - damage);
        this.logMessage(`${enemy.name} contra-atacou causando ${damage} de dano em ${evo.name}!`);

        this.updateBattleUI();

        if (this.state.playerCurrentHp <= 0) {
            this.logMessage(`${evo.name} foi derrotado... Reiniciando tentativa.`);
            setTimeout(() => {
                this.startBattle();
            }, 1500);
            return;
        }

        this.state.isPlayerTurn = true;
    },

    updateBattleUI() {
        const evo = this.getCurrentPartnerObj();
        const enemy = this.state.activeEnemy;

        const playerHpPercent = Math.max(0, (this.state.playerCurrentHp / evo.hp) * 100);
        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        document.getElementById('player-hp-text').innerText = `HP: ${this.state.playerCurrentHp}/${evo.hp}`;

        const enemyHpPercent = Math.max(0, (enemy.currentHp / enemy.hp) * 100);
        document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;

        const statusBar = document.getElementById('player-status-bar');
        if (statusBar) {
            statusBar.innerText = `Parceiro: ${evo.name} | Nv. ${this.state.playerLevel + 1}`;
        }
    },

    handleVictory() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        this.logMessage(`Vitória! ${chapter.enemy.name} foi vencido!`);

        // Recompensa com +1 poção ao vencer o chefe
        this.state.potions = Math.min(5, this.state.potions + 1);
        this.saveGame();

        setTimeout(() => {
            const isLast = this.state.currentChapterIndex >= GAME_DATA.chapters.length - 1;
            const titleEl = document.getElementById('victory-title');
            const descEl = document.getElementById('victory-desc');

            if (isLast) {
                titleEl.innerText = "PARABÉNS, SALVADOR DO MUNDO DIGITAL!";
                descEl.innerText = "Você derrotou o Apocalymon e salvou o universo!";
            } else {
                titleEl.innerText = `${chapter.title} Concluída!`;
                descEl.innerText = `Chefe derrotado! Ganhou 1 Poção extra.`;
            }

            this.switchScreen('screen-victory');
        }, 1200);
    },

    nextChapter() {
        this.state.currentChapterIndex++;
        if (this.state.currentChapterIndex >= GAME_DATA.chapters.length) {
            this.state.currentChapterIndex = 0;
            alert("Parabéns por zerar o jogo completo!");
        }
        this.saveGame();
        this.loadChapterData();
        this.switchScreen('screen-story');
    },

    logMessage(text) {
        const logBox = document.getElementById('battle-log');
        if (!logBox) return;
        const p = document.createElement('div');
        p.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        logBox.appendChild(p);
        logBox.scrollTop = logBox.scrollHeight;
    }
};

window.onload = () => {
    Game.init();
};
