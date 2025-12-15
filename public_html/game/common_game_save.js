/**
 * Common Game Save Logic for Juggler and Tetris
 * Expects 'gameType' ('juggler' or 'tetris') and data object management
 */

const GameSaver = {
    gameType: null,
    userId: null,

    init: async function (type) {
        this.gameType = type;
        await this.load();
    },

    save: async function (data) {
        if (!this.gameType) return;

        try {
            const res = await fetch('/game/api/save_game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game: this.gameType,
                    data: data
                })
            });

            if (res.status === 409) {
                this.handleConflict();
                return;
            }

            const result = await res.json();
            if (result.success) {
                console.log('[GameSaver] Saved successfully');
            } else {
                console.warn('[GameSaver] Save failed:', result.error);
            }
        } catch (e) {
            console.error('[GameSaver] Network error:', e);
        }
    },

    load: async function () {
        if (!this.gameType) return null;

        try {
            const res = await fetch(`/game/api/load_game?game=${this.gameType}`);
            if (res.status === 401) {
                console.log('[GameSaver] Not logged in');
                return null;
            }
            const result = await res.json();
            if (result.success) {
                console.log('[GameSaver] Data loaded');
                return result.data;
            }
        } catch (e) {
            console.error('[GameSaver] Load error:', e);
        }
        return null;
    },

    handleConflict: function () {
        if (this.conflictAlertShown) return;
        this.conflictAlertShown = true;
        alert('他の端末でゲームが開始されたため、このセッションは無効になりました。ページを再読み込みしてください。');
        location.reload();
    },

    conflictAlertShown: false
};
window.GameSaver = GameSaver;
