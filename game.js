const Game = {
    state: {
        currentChapterIndex: 0,
        playerLevel: 0, // Índice baseado em GAME_DATA.playerEvos
        playerCurrentHp: 100,
        enemyCurrentHp: 100,
        isDefending: false,
        isPlayerTurn: true,
        activeEnemy: null
    },

    // Alterna entre as telas da aplicação
    switchScreen(screenId) {
        ['screen-menu', 'screen-story', 'screen-battle', 'screen-victory'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('flex');
        }
    },

    // Inicia a aventura a partir do capítulo atual
    startAdventure() {
        this.loadChapterData();
        this.switchScreen('screen-story');
    },

    // Carrega dados visuais do capítulo ativo
    loadChapterData() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        document.getElementById('chapter-tag').innerText = chapter.tag;
        document.getElementById('chapter-title').innerText = chapter.title;
        document.getElementById('chapter-desc').innerText = chapter.desc;
        document.getElementById('enemy-preview-name').innerText = chapter.enemy.name;
    },

    // Prepara a batalha contra o chefe do capítulo
    startBattle() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        const evo = GAME_DATA.playerEvos[this.state.playerLevel];

        // Copia os dados do inimigo para o estado dinâmico
        this.state.activeEnemy = { ...chapter.enemy };
        this.state.playerCurrentHp = evo.hp;
        this.state.isDefending = false;
        this.state.isPlayerTurn = true;

        // Atualiza UI de Batalha
        document.getElementById('battle-player-name').innerText = evo.name;
        document.getElementById('player-sprite').innerText = evo.sprite;
        document.getElementById('enemy-name').innerText = this.state.activeEnemy.name;
        document.getElementById('enemy-sprite').innerText = this.state.activeEnemy.sprite;

        this.updateBattleUI();
        this.logMessage(`Um ${this.state.activeEnemy.name} selvagem apareceu! Prepare-se para lutar.`);
        this.switchScreen('screen-battle');
    },

    // Ações do Jogador (Ataque básico ou especial)
    playerAttack(type) {
        if (!this.state.isPlayerTurn) return;

        const evo = GAME_DATA.playerEvos[this.state.playerLevel];
        let damage = 0;
        let actionName = "";

        if (type === 'basic') {
            damage = Math.max(5, evo.atk - this.state.activeEnemy.def + Math.floor(Math.random() * 6));
            actionName = `usou Ataque Físico`;
        } else if (type === 'special') {
            damage = Math.max(10, Math.floor(evo.atk * 1.6) - this.state.activeEnemy.def + Math.floor(Math.random() * 10));
            actionName = `usou a habilidade especial **${evo.specialName}**`;
        }

        this.state.activeEnemy.maxHp = this.state.activeEnemy.maxHp || this.state.activeEnemy.hp;
        this.state.activeEnemy.currentHp = (this.state.activeEnemy.currentHp !== undefined) ? this.state.activeEnemy.currentHp : this.state.activeEnemy.hp;
        
        // Aplica dano ao inimigo
        this.state.activeEnemy.currentHp = Math.max(0, this.state.activeEnemy.currentHp - damage);
        this.logMessage(`${evo.name} ${actionName} causando ${damage} de dano!`);

        this.updateBattleUI();

        // Verifica vitória
        if (this.state.activeEnemy.currentHp <= 0) {
            this.handleVictory();
            return;
        }

        // Passa o turno para o inimigo
        this.state.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 1000);
    },

    // Ação de Defender
    playerDefend() {
        if (!this.state.isPlayerTurn) return;
        const evo = GAME_DATA.playerEvos[this.state.playerLevel];
        this.state.isDefending = true;
        this.logMessage(`${evo.name} assumiu postura defensiva! Dano recebido será reduzido.`);
        
        this.state.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 1000);
    },

    // Ação de Digievoluir durante a jornada
    playerEvolve() {
        if (this.state.playerLevel >= GAME_DATA.playerEvos.length - 1) {
            this.logMessage(`Seu Digimon já está no estágio máximo de evolução!`);
            return;
        }

        this.state.playerLevel++;
        const evo = GAME_DATA.playerEvos[this.state.playerLevel];
        this.state.playerCurrentHp = evo.hp; // Cura total ao evoluir

        document.getElementById('battle-player-name').innerText = evo.name;
        document.getElementById('player-sprite').innerText = evo.sprite;
        
        this.logMessage(`⚡ DIGIEVOLUÇÃO! Seu parceiro evoluiu para **${evo.name}**! Poder ampliado!`);
        this.updateBattleUI();

        // Se atingiu o nível máximo, desativa visualmente o botão de evolução
        if (this.state.playerLevel >= GAME_DATA.playerEvos.length - 1) {
            const btn = document.getElementById('btn-evolve');
            if (btn) btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    },

    // Turno do Inimigo / Chefe
    enemyTurn() {
        const enemy = this.state.activeEnemy;
        const evo = GAME_DATA.playerEvos[this.state.playerLevel];

        let damage = Math.max(3, enemy.atk - evo.def + Math.floor(Math.random() * 5));
        
        if (this.state.isDefending) {
            damage = Math.floor(damage / 2);
            this.state.isDefending = false;
            this.logMessage(`Postura defensiva amorteceu o golpe!`);
        }

        this.state.playerCurrentHp = Math.max(0, this.state.playerCurrentHp - damage);
        this.logMessage(`${enemy.name} contra-atacou causando ${damage} de dano em ${evo.name}!`);

        this.updateBattleUI();

        // Verifica derrota do jogador
        if (this.state.playerCurrentHp <= 0) {
            this.logMessage(`${evo.name} foi derrotado... Tente novamente.`);
            setTimeout(() => {
                alert("Você foi derrotado pelo chefe! Reiniciando a fase.");
                this.startBattle();
            }, 1200);
            return;
        }

        this.state.isPlayerTurn = true;
    },

    // Atualiza barras de vida e textos na UI de batalha
    updateBattleUI() {
        const evo = GAME_DATA.playerEvos[this.state.playerLevel];
        const enemy = this.state.activeEnemy;

        // Player HP
        const playerHpPercent = Math.max(0, (this.state.playerCurrentHp / evo.hp) * 100);
        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        document.getElementById('player-hp-text').innerText = `HP: ${this.state.playerCurrentHp}/${evo.hp}`;

        // Enemy HP
        const enemyMax = enemy.maxHp || enemy.hp;
        const enemyCurr = (enemy.currentHp !== undefined) ? enemy.currentHp : enemy.hp;
        const enemyHpPercent = Math.max(0, (enemyCurr / enemyMax) * 100);
        document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;

        // Barra de status superior global
        const statusBar = document.getElementById('player-status-bar');
        if (statusBar) {
            statusBar.innerText = `Parceiro: ${evo.name} | Nível: ${this.state.playerLevel + 1}`;
        }
    },

    // Gerencia o fim bem-sucedido de uma fase/chefe
    handleVictory() {
        const chapter = GAME_DATA.chapters[this.state.currentChapterIndex];
        this.logMessage(`Vitória! ${chapter.enemy.name} foi vencido!`);

        setTimeout(() => {
            const isLast = this.state.currentChapterIndex >= GAME_DATA.chapters.length - 1;
            const titleEl = document.getElementById('victory-title');
            const descEl = document.getElementById('victory-desc');

            if (isLast) {
                titleEl.innerText = "PARABÉNS, SALVADOR DO MUNDO DIGITAL!";
                descEl.innerText = "Você derrotou o Apocalymon e restaurou a paz em todas as dimensões digitais!";
            } else {
                titleEl.innerText = `${chapter.title} Concluída!`;
                descEl.innerText = `O chefe ${chapter.enemy.name} foi derrotado com sucesso.`;
            }

            this.switchScreen('screen-victory');
        }, 1000);
    },

    // Avança para o próximo capítulo ou reinicia se zerar
    nextChapter() {
        this.state.currentChapterIndex++;
        if (this.state.currentChapterIndex >= GAME_DATA.chapters.length) {
            this.state.currentChapterIndex = 0;
            alert("Você zerou o jogo! Reiniciando a jornada do início.");
        }
        this.startAdventure();
    },

    // Adiciona logs na caixa de texto da batalha com formatação básica
    logMessage(text) {
        const logBox = document.getElementById('battle-log');
        if (!logBox) return;
        const p = document.createElement('div');
        p.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        logBox.appendChild(p);
        logBox.scrollTop = logBox.scrollHeight;
    }
};

// Inicializa o status base ao carregar os scripts
window.onload = () => {
    Game.loadChapterData();
};
