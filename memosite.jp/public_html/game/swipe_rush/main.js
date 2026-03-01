/**
 * Swipe Rush - Main Game Logic
 */

class Game {
    constructor() {
        this.score = 0;
        this.time = 10;
        this.isPlaying = false;
        this.timerInterval = null;

        // Dom Elements
        this.feed = document.getElementById('feed');
        this.timeDisplay = document.getElementById('time-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.finalScore = document.getElementById('final-score');
        this.uiOverlay = document.getElementById('ui-overlay');
        this.gameOverScreen = document.getElementById('game-over');

        this.descriptionDisplay = document.querySelector('.video-info .description');
        this.authorDisplay = document.querySelector('.video-info .author');
        this.musicDisplay = document.querySelector('.video-info .music');

        this.images = {};
        this.loaded = false;

        this.loadAssets();

        // Setup Swipe Detection
        this.setupSwipe();
    }

    async loadAssets() {
        const assets = {
            'employees': 'assets/bg_employees.png',
            'cat': 'assets/bg_cat.png',
            'cooking': 'assets/bg_cooking.png',
            // Existing
            'nature_forest': 'assets/bg_nature_forest.png',
            'nature_beach': 'assets/bg_nature_beach.png',
            'human_coffee': 'assets/bg_human_coffee.png',
            'human_sports': 'assets/bg_human_sports.png',
            'future_city': 'assets/bg_future_city.png',
            'future_robot': 'assets/bg_future_robot.png',
            'past_retro': 'assets/bg_past_retro.png',
            'past_samurai': 'assets/bg_past_samurai.png',
            'space_galaxy': 'assets/bg_space_galaxy.png',
            'festive_lanterns': 'assets/bg_festive_lanterns.png',
            // Funny New
            'funny_alien': 'assets/bg_funny_alien.png',
            'funny_bear': 'assets/bg_funny_bear.png',
            'funny_banana': 'assets/bg_funny_banana.png'
        };

        const promises = Object.keys(assets).map(key => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = assets[key];
                img.onload = () => { this.images[key] = img; resolve(); };
                img.onerror = () => {
                    // Silent fail for clean console or warn
                    console.log("Asset missing, using fallback: " + key);
                    resolve();
                };
            });
        });

        await Promise.all(promises);
        this.loaded = true;
        console.log("Assets loaded");
    }

    start() {
        if (!this.loaded) {
            alert("Loading assets... please wait.");
            return;
        }

        if (this.isPlaying) return;
        this.isPlaying = true;
        this.score = 0;
        this.time = 10;

        this.feed.innerHTML = '';
        this.videos = [];
        this.currentIndex = 0;

        for (let i = 0; i < 3; i++) {
            this.addVideo();
        }

        this.uiOverlay.style.display = 'block';
        this.gameOverScreen.style.display = 'none';

        this.updateUI();

        this.timerInterval = setInterval(() => this.tick(), 1000);
        requestAnimationFrame(() => this.animate());
    }

    resetToTitle() {
        location.reload();
    }

    tick() {
        this.time--;
        if (this.time <= 0) {
            this.end();
        }
        this.timeDisplay.textContent = this.time;
    }

    end() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        this.finalScore.textContent = this.score;
        this.gameOverScreen.style.display = 'flex';
        this.uiOverlay.style.display = 'none';
    }

    updateUI() {
        this.timeDisplay.textContent = this.time;
        this.scoreDisplay.textContent = this.score;

        const current = this.videos[this.currentIndex];
        if (current && current.meta) {
            this.authorDisplay.textContent = current.meta.author;
            this.descriptionDisplay.textContent = current.meta.desc;
            this.musicDisplay.textContent = current.meta.music;
        }
    }

    addVideo() {
        const videoData = VideoFactory.create(this.images);
        this.feed.appendChild(videoData.element);
        this.videos.push(videoData);
    }

    onSwipeUp() {
        if (!this.isPlaying) return;
        this.score++;
        this.currentIndex++;
        this.updateUI();
        this.addVideo();
    }

    onDislike() {
        if (!this.isPlaying) return;
        const currentVideo = this.getCurrentVisibleVideo();
        if (!currentVideo) return;

        if (currentVideo.disliked) {
            this.showFeedback("済み (Done)", "#aaa");
            return;
        }
        currentVideo.disliked = true;

        if (currentVideo.type === 'employees') {
            this.addTime(4);
            this.showFeedback("Nice! +4s", "#00ff00");
        } else {
            this.addTime(-5);
            this.showFeedback("Bad! -5s", "#ff0000");
        }
    }

    getCurrentVisibleVideo() {
        const center = this.feed.scrollTop + this.feed.clientHeight / 2;
        const index = Math.floor(center / this.feed.clientHeight);
        return this.videos[index];
    }

    addTime(sec) {
        this.time += sec;
        this.timeDisplay.textContent = this.time;
    }

    showFeedback(text, color) {
        const popup = document.createElement('div');
        popup.className = 'bonus-popup';
        popup.textContent = text;
        popup.style.color = color;
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    setupSwipe() {
        this.feed.addEventListener('scroll', () => {
            const index = Math.floor((this.feed.scrollTop + 10) / this.feed.clientHeight);
            if (index > this.currentIndex) {
                this.score += (index - this.currentIndex);
                this.currentIndex = index;
                this.updateUI();
                while (this.videos.length < this.currentIndex + 3) {
                    this.addVideo();
                }
            }
        });
    }

    animate() {
        if (!this.isPlaying) return;
        const start = Math.max(0, this.currentIndex - 1);
        const end = Math.min(this.videos.length, this.currentIndex + 2);

        for (let i = start; i < end; i++) {
            const v = this.videos[i];
            if (v && v.update) v.update();
        }

        requestAnimationFrame(() => this.animate());
    }
}

class EffectProfile {
    static generate(type) {
        const profile = {
            camera: 'chaos',
            filter: 'deep_fry',
            textStyle: 'neon'
        };

        if (type === 'employees') {
            profile.camera = 'chaos';
            profile.filter = 'rainbow'; // No strobe
            profile.textStyle = 'neon';
        } else {
            // Extreme Randomness
            const cams = ['shake', 'zoom_fast', 'spin_crazy', 'chaos', 'chaos'];
            profile.camera = cams[Math.floor(Math.random() * cams.length)];

            // No strobe
            const filters = ['glitch', 'red_tint', 'rainbow', 'deep_fry', 'none'];
            profile.filter = filters[Math.floor(Math.random() * filters.length)];

            const styles = ['neon', 'kawaii', '8bit', 'horror'];
            profile.textStyle = styles[Math.floor(Math.random() * styles.length)];
        }
        return profile;
    }
}

class VideoFactory {
    static create(images) {
        // 1 in 14 chance for employees
        const type = Math.random() < (1 / 14) ? 'employees' : this.getRandomType();
        let img = images[type];
        if (!img && images['cat']) img = images['cat'];
        if (!img && images['employees']) img = images['employees'];

        const div = document.createElement('div');
        div.className = 'slide';

        const canvas = document.createElement('canvas');
        canvas.className = 'video-content';
        canvas.width = 480;
        canvas.height = 800;

        div.appendChild(canvas);

        const overlayText = PunchyText.generate(type);
        const renderer = new CanvasRenderer(canvas, type, overlayText, img);

        return {
            id: Date.now() + Math.random(),
            type: type,
            element: div,
            meta: FunnyContent.generate(type),
            disliked: false,
            update: () => renderer.render()
        };
    }

    static getRandomType() {
        const types = [
            'cat', 'cooking',
            'nature_forest', 'nature_beach',
            'human_coffee', 'human_sports',
            'future_city', 'future_robot',
            'past_retro', 'past_samurai',
            'space_galaxy', 'festive_lanterns',
            'funny_alien', 'funny_bear', 'funny_banana'
        ];
        return types[Math.floor(Math.random() * types.length)];
    }
}

class PunchyText {
    static generate(type) {
        if (type === 'employees') {
            const jokes = [
                { main: "若者よ、大志を抱け(笑)", sub: "私の若い頃はね、3日寝ずに働いたことなんてザラだったよ。今の君たちには少し酷かもしれないが、それが成長の糧になるんだ。期待しているよ、未来のリーダーたち！(笑)" },
                { main: "飲みニケーション大事！", sub: "仕事だけの関係なんて寂しいじゃないか。今夜は無礼講だ！私の武勇伝をたっぷり聞かせてあげるから、覚悟しておきたまえ。割り勘だけどね！(笑)" },
                { main: "俺の若い頃はな...", sub: "パソコンなんて便利なものはなかった！すべて手書き、すべて足で稼ぐ！それが営業というものだ。君たちのスマートなやり方もいいが、泥臭い情熱も忘れないでほしいな。" },
                { main: "期待してるぞ★", sub: "君のその企画書、斬新すぎて私には理解できなかったが(笑) 若い感性を信じて採用だ！ 失敗しても責任は私が...いや、君が取ってくれよ！頼んだぞ！" },
                { main: "残業は愛だ！(笑)", sub: "会社への愛があれば、時間なんて気にならないはずだよね？ もちろん冗談だよ(笑) でも、君の頑張りはちゃんと見ているから。無理はしないで、あと2時間だけ頑張ろうか！" },
                // New Added
                { main: "昭和の根性論(笑)", sub: "風邪でも這って出てこい！...なんて言ったらパワハラになるのかね？ 便利な世の中になったもんだ。でも気合いは大事だよ！魂を燃やせ！(笑)" },
                { main: "定時で帰るの？", sub: "おお、もう帰りたまえ！ 私の若い頃はこれからが本番だったがね(笑) 彼女とのデートか？ 楽しんできなさい！お土産よろしく！" },
                { main: "ゴルフやろうよ", sub: "君、筋がいいね！ 今度の日曜、空いてるだろう？ 強制参加ではないが、断ると査定に...冗談だよ(笑) 楽しくやろうじゃないか！" },
                { main: "報・連・相！", sub: "ほうれん草じゃないぞ(笑) 社会人の基本が大事だ。君の報告はいつも事後報告だが、まあ結果オーライなら許そう！次は頼むよ！" },
                { main: "給料分は働け(笑)", sub: "きつい言い方かな？ でもプロフェッショナルとはそういうことだ。君には期待額の倍は稼いでもらわないとね！頼んだぞエース！期待してる！" }
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }

        const phrases = [
            { main: "虚無の彼方へ", sub: "この映像を見ていると、日々の悩みなんてちっぽけなものに思えてきます。宇宙の広大さ、時間の永遠さに比べれば、私たちの存在なんて一瞬の煌めきに過ぎないのです..." },
            { main: "輝ける未来", sub: "テクノロジーの進化は止まらない。私たちが夢見たSFの世界は、もうすぐそこまで来ています。AIと共存し、新たな価値を創造する未来。あなたは準備ができていますか？" },
            { main: "過去の栄光", sub: "あの頃の私たちは、何も持っていなかったけれど、すべてを持っていた気がする。セピア色の記憶の中で輝く、二度と戻らない青春の日々。涙が止まりません。" },
            { main: "人類の革新", sub: "歴史が変わる瞬間を目撃せよ。常識を覆すこの発明は、世界をどう変えていくのか。批判を恐れず突き進んだ彼らの情熱に、心からの敬意を表します。" },
            { main: "自然の驚異", sub: "言葉を失うほどの絶景。加工一切なしでこの美しさ。地球という惑星が作り出した奇跡のアートに、ただただ圧倒されるばかりです。保存して壁紙にどうぞ。" },
            { main: "全米が泣いた", sub: "ハンカチの用意はいいですか？ ラスト10秒、衝撃の展開にあなたは必ず涙する。愛とは何か、絆とは何か。この小さな物語が、大切な答えを教えてくれます。" },
            // New Added
            { main: "人類の敗北", sub: "この映像を見た時、AIには勝てないと確信しました。創造性とは何か、人間性とは何か。深い問いを投げかけられています。もはや言葉は不要です。" },
            { main: "腹筋崩壊ｗ", sub: "電車で見ちゃダメなやつです。笑いをこらえるのに必死で変な顔になってしまいました。責任取ってください(笑) 久々にこんなに笑いました。" },
            { main: "涙腺崩壊", sub: "最初は笑ってみてたのに、最後で全部持っていかれた。こんなの反則でしょう。明日目が腫れて仕事に行けません。ティッシュ箱必須です。" },
            { main: "奇跡の瞬間", sub: "カメラを回していなかったら誰も信じなかったでしょう。確率0.0001%の偶然が重なった、まさに神様のいたずら。シェアせずにはいられません。" },
            { main: "閲覧注意", sub: "心臓の弱い方はご遠慮ください。あまりの尊さにショック死する可能性があります。可愛すぎて罪悪感すら覚えるレベル。天使は実在しました。" },
            { main: "無限ループ", sub: "気づけば1時間経っていました。中毒性が高すぎる。この映像には何かサブリミナル的なものが含まれているのでは？ 誰か私を止めてください。" }
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
}

class FunnyContent {
    static generate(type) {
        if (type === 'employees') {
            const prezJokes = [
                "最近の若者は元気がないねぇ。私の若い頃は3日寝ずに働いたものだよ(笑) まあ無理しないで頑張ってくれたまえ！期待してるよ！",
                "昨日のゴルフが楽しすぎて腰が痛いよ(笑) ところで君、週末空いてる？ バーベキュー大会の買出し係を任せたいんだが！",
                "今の若者は「エモい」って言うんだろ？ 私のこのネクタイもエモいかな？ ガハハ！(笑) ...え？滑ってる？",
                "我が社は家族のようなものだ！ つまり私はお父さんで君たちは子供！ 反抗期は許さんぞ(笑) なんてね、仲良くやろう！",
                "君の企画書読んだよ。斬新すぎて私には理解できなかったが(笑) 若い感性を信じて採用だ！ 責任は君が取ってくれよ！",
                // New Added
                "今日は無礼講だ！ 私のことは社長ではなくニックネームで呼びたまえ。え？ 「おっさん」？ それはただの悪口だろ(笑)",
                "IT革命だ！ 我が社もDXを推進するぞ！ というわけで、この書類をPDFにしてメールで送ってくれ。FAXじゃなくてメールだぞ！",
                "君、いい時計してるねぇ。ボーナスで買ったのか？ うらやましいねぇ、私のお小遣いじゃ買えないよ(笑)",
                "社員旅行はハワイだ！ ...と言いたいところだが、予算の関係で熱海になった(笑) 温泉卓球で勝負だ！",
                "リーダーシップとは背中で語るもの... というのは古いかな？ もっとフレンドリーにいこう！ タピオカ飲みに行くか！"
            ];
            return {
                desc: prezJokes[Math.floor(Math.random() * prezJokes.length)],
                author: "@shacho_official_real",
                music: "♫ My Way (Karaoke ver.)"
            };
        }

        const headers = [
            "【衝撃】", "【感動】", "【閲覧注意】", "【神回】", "【必見】",
            "【緊急】", "【悲報】", "【拡散希望】", "【放送事故】", "【朗報】"
        ];
        const bodies = [
            "この映像を見た瞬間、私の人生が変わりました。まさかこんな結末が待っていようとは... 最後まで絶対に見逃さないでください。",
            "古代より伝わる伝説の映像がついに公開。信じるか信じないかはあなた次第ですが、歴史の真実がここにあります。",
            "未来から来たと思われるこの映像。AIが生成したのか現実なのか、専門家でも判別不能と言われています。美しすぎて涙が出ます。",
            "ただただ尊い。語彙力を失うほどの可愛さと美しさ。これを見て癒やされない人はいないでしょう。100回リピートしました。",
            "深夜テンションで作ってみました。意味不明ですがなんとなくエモい感じになったのでアップします。高評価お願いします！",
            "宇宙の広さを感じさせる壮大な映像。我々の悩みなんてちっぽけなものだと思い知らせてくれます。明日も頑張ろう。",
            "懐かしいあの頃を思い出す... 昭和レトロな雰囲気に包まれて、涙が止まりません。おじいちゃん元気かな...",
            // New Added
            "もはや芸術の域に達している。これを見ずに死ぬことはできないレベルの傑作です。まばたき厳禁。",
            "全米が震撼したラスト。ハンカチなしでは見られません。大切な人と一緒に見てください。",
            "これが現代の闇。考えさせられる内容でした。決して他人事ではありません。",
            "明日から使えるライフハック。なんで今まで知らなかったんだろう。目からウロコが落ちました。",
            "3分で人生が変わります。騙されたと思って見てください。後悔はさせません。",
            "※この映像は専門家の指導のもと行われています。危険ですので絶対に真似しないでください。",
            "コメント欄が地獄(笑) みんなの反応が面白すぎるので、ぜひコメントも読んでみてください。"
        ];
        const tags = ["#fyp", "#viral", "#trending", "#emoi", "#japan", "#funny", "#sad", "#art", "#lifehack", "#omg", "#wtf", "#cute"];

        const fullDesc = headers[Math.floor(Math.random() * headers.length)] + " " +
            bodies[Math.floor(Math.random() * bodies.length)] + " " +
            tags.map(x => [x, x]).sort(() => .5 - Math.random()).map(p => p[0]).slice(0, 3).join(' '); // 3 Random unique tags

        const authors = ["@viral_video_god", "@future_traveler", "@retro_mania", "@nature_lover_x", "@cat_is_god", "@meme_master", "@daily_dose_of_internet"];
        const musics = ["♫ Interstellar Theme", "♫ Lofi Hip Hop Beats", "♫ Epic Orchestral", "♫ 80s City Pop", "♫ EDM Banger", "♫ Sad Violin"];

        return {
            desc: fullDesc,
            author: authors[Math.floor(Math.random() * authors.length)],
            music: musics[Math.floor(Math.random() * musics.length)]
        };
    }
}

class CanvasRenderer {
    constructor(canvas, type, textObj, image) {
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.type = type;
        if (typeof textObj === 'string') {
            this.textMain = textObj;
            this.textSub = "";
        } else {
            this.textMain = textObj.main;
            this.textSub = textObj.sub;
        }
        this.image = image;
        this.profile = EffectProfile.generate(type);
        this.seed = Math.random() * 1000;
        this.startTime = Date.now();
    }

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const t = (Date.now() - this.startTime) / 1000;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        ctx.filter = 'none';

        ctx.save();
        ctx.translate(w / 2, h / 2);

        switch (this.profile.camera) {
            case 'chaos':
                // EXTREME CHAOS
                const cs = 50;
                ctx.translate((Math.random() - 0.5) * cs, (Math.random() - 0.5) * cs);
                ctx.rotate(Math.sin(t * 10) * 0.5);
                const cz = 1.0 + Math.abs(Math.sin(t * 8)) * 0.5;
                ctx.scale(cz, cz);
                break;
            case 'shake':
                const s = 20;
                ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
                break;
            case 'zoom_fast':
                const z = 1.0 + (Math.sin(t * 15) + 1) * 0.4;
                ctx.scale(z, z);
                break;
            case 'spin_crazy':
                ctx.rotate(t * 5);
                break;
            case 'handheld':
            default:
                const dx = Math.sin(t * 1.5 + this.seed) * 40;
                const dy = Math.cos(t * 1.3 + this.seed) * 40;
                const rot = Math.sin(t * 0.8) * 0.1;
                ctx.translate(dx, dy);
                ctx.rotate(rot);
                ctx.scale(1.2, 1.2);
                break;
        }

        if (this.image) {
            const iw = this.image.width;
            const ih = this.image.height;
            const ratio = Math.max(w / iw, h / ih);
            ctx.drawImage(this.image, -iw * ratio / 2, -ih * ratio / 2, iw * ratio, ih * ratio);
        } else {
            ctx.fillStyle = "#333";
            ctx.fillRect(-w / 2, -h / 2, w, h);
        }

        ctx.restore();

        // Filters
        if (this.profile.filter === 'deep_fry') {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.globalCompositeOperation = 'hard-light';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';
            ctx.filter = 'contrast(200%) saturate(300%)';
        } else if (this.profile.filter === 'rainbow') {
            ctx.fillStyle = `hsla(${t * 800 % 360}, 100%, 50%, 0.3)`;
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';
        } else if (this.profile.filter === 'invert') {
            // Disabled flashing invert
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.globalCompositeOperation = 'difference';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';
        }

        this.drawOverlayText(ctx, w, h, t);

        // Extreme Glitch
        if ((this.profile.filter === 'glitch' || this.profile.camera === 'chaos') && Math.random() < 0.4) {
            const gy = Math.random() * h;
            const gh = Math.random() * 200;
            const off = (Math.random() - 0.5) * 200;
            try {
                ctx.drawImage(this.ctx.canvas, 0, gy, w, gh, off, gy, w, gh);
                ctx.globalCompositeOperation = 'difference';
                ctx.fillStyle = `rgb(${Math.random() * 255},0,${Math.random() * 255})`;
                ctx.fillRect(0, gy, w, 20);
                ctx.globalCompositeOperation = 'source-over';
            } catch (e) { }
        }

        ctx.filter = 'none';
    }

    drawOverlayText(ctx, w, h, t) {
        ctx.save();
        ctx.translate(w / 2, h / 2);

        let font = "bold 60px sans-serif";
        let fill = "white";
        let stroke = "black";

        switch (this.profile.textStyle) {
            case 'neon':
                font = "900 80px Impact, sans-serif"; // Bigger
                stroke = "white";
                fill = `hsl(${t * 800 % 360}, 100%, 50%)`; // Faster Color Cycle
                ctx.shadowColor = fill;
                ctx.shadowBlur = 50; // More glow

                // Pulsating Scale
                const scale = 1.0 + Math.sin(t * 10) * 0.2;
                ctx.scale(scale, scale);
                break;
            case 'horror':
                font = "bold 90px 'Times New Roman', serif";
                fill = "#8b0000";
                stroke = "black";
                ctx.shadowColor = "red";
                ctx.shadowBlur = 10;
                // Violent Shake
                ctx.translate((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
                break;
            case '8bit':
                font = "bold 70px 'Courier New', monospace";
                fill = "#0f0";
                stroke = "#000";
                ctx.shadowColor = "#0f0";
                ctx.shadowBlur = 0;
                // Blinking (Slow)
                if (Math.floor(t * 4) % 2 === 0) fill = "transparent";
                break;
            case 'kawaii':
                font = "bold 70px 'Comic Sans MS', sans-serif";
                fill = "#ff69b4";
                stroke = "white";
                ctx.shadowColor = "#ffb6c1";
                ctx.shadowBlur = 20;
                // Bouncing
                ctx.translate(0, Math.sin(t * 8) * 20);
                ctx.rotate(Math.sin(t * 3) * 0.1);
                break;
        }

        ctx.textAlign = "center";

        ctx.font = font;
        ctx.lineWidth = 5;
        ctx.strokeStyle = stroke;
        ctx.strokeText(this.textMain, 0, -100);
        ctx.fillStyle = fill;
        ctx.fillText(this.textMain, 0, -100);

        ctx.restore();

        // Subtitle (Bottom Long Text)
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        const subHeight = 200;
        const subY = h - subHeight - 100;
        ctx.fillRect(10, subY, w - 20, subHeight);

        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.shadowBlur = 2;
        ctx.shadowColor = "black";

        const maxWidth = w - 40;
        const lineHeight = 28;
        const words = this.textSub.split('');
        let line = '';
        let y = subY + 30;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, 20, y);
                line = words[n];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 20, y);

        if (this.type === 'employees') {
            ctx.textAlign = "center";
            ctx.font = "bold 30px sans-serif";
            ctx.fillStyle = "yellow";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "orange";
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";

            const bob = Math.sin(t * 5) * 5;
            const tagY = subY - 40 + bob;

            ctx.strokeText("✨ TikToker気取り ✨", w / 2, tagY);
            ctx.fillText("✨ TikToker気取り ✨", w / 2, tagY);
        }

        ctx.restore();
    }
}

const game = new Game();
window.game = game;
