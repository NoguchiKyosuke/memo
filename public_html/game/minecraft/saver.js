/**
 * GameSaver - Handles server-side saving of user data (e.g. money)
 */
class GameSaver {
    static async init(appName) {
        this.appName = appName;
        console.log(`[GameSaver] Initialized for ${appName}`);
    }

    static async save(data) {
        if (data.money === undefined) return;

        try {
            const res = await fetch('api/save_user_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ money: data.money })
            });
            const json = await res.json();
            if (json.success) {
                // success
            } else {
                console.error('[GameSaver] Save failed API:', json);
            }
        } catch (e) {
            console.error('[GameSaver] Save network error:', e);
        }
    }

    static async load() {
        try {
            const res = await fetch('api/load_user_data.php');
            const json = await res.json();
            if (json.success) {
                return { money: json.money };
            } else {
                console.warn('[GameSaver] Load failed API:', json);
                return null;
            }
        } catch (e) {
            console.error('[GameSaver] Load network error:', e);
            return null;
        }
    }
}

window.GameSaver = GameSaver;
