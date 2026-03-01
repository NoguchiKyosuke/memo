# Memo Platform - PHP移行完了

**注意: このプロジェクトはJavaのSpring BootからPHPに移行されました。**

## 移行概要
JavaベースのThymeleafテンプレートエンジンからPHPへの完全移行を実施しました。

## 主な変更点

### ファイル構造の変更
- `index.html` → `index.php`
- `sdv.html` → `sdv.php`  
- `speech.html` → `speech.php`
- 新規追加: `includes/` ディレクトリ（共通ファイル）

### SEO対応強化
- メタタグ最適化（description, keywords, Open Graph）
- 構造化データ（JSON-LD）実装
- サイトマップ自動生成
- robots.txt設定

### 広告スクリプトの統合
- Google AdSense スクリプトを共通ヘッダーに読み込み
- 既存の AdMax 実装を撤去し、広告タグは後日差し込み予定

### URL構造の改善
- `.htaccess`によるクリーンURL
- 301リダイレクト設定
- セキュリティヘッダー追加

## 実行方法（PHP版）

```bash
# Webサーバーにファイルをアップロード
# Apache + PHP 7.4以上が必要
```

アクセス:
- Root: https://memosite.jp/
- SDV: https://memosite.jp/sdv
- 音声研究: https://memosite.jp/voice/
  - 音声解析: https://memosite.jp/voice/speech
  - J-SPAW研究: https://memosite.jp/voice/jspaw
  - SafeEar × J-SPAW評価: https://memosite.jp/voice/safear_jspaw_evaluation
- タイムマネージャ: https://memosite.jp/timekeeper.php

### ファイル構造 (2025-10)
```
public_html/
  index.php              # 全体のホームページ（SDV & 音声研究）
  sdv.php               # SDV記事
  contact.php           # 問い合わせフォームハンドラー
  timekeeper.php        # ローカル時計とアラーム管理ツール
  
  voice/                # 音声研究ディレクトリ
    index.php           # 音声研究ホーム（記事一覧）
    speech.php          # 記事: 音声解析と機械学習
    jspaw.php           # 記事: J-SPAW 2024研究文献
  
  includes/
    common.php          # 共通関数（ナビゲーション、フッター）
    head.php            # HTMLヘッダー
    voice-articles.php  # 音声記事のメタデータ管理
  
  assets/
    css/
      app.css           # 統合スタイルシート
    js/
      code-enhancer.js  # コードブロック拡張
      timekeeper.js     # タイムマネージャ用クライアントロジック

### タイムマネージャ機能 (2025-11)
- ブラウザのタイムゾーンに合わせた正確な時刻・日付表示
- 最大5件のアラームをローカルストレージに保存し日次で運用
- worldtimeapi.org を利用したサーバー同期型の時刻取得（クライアント環境に依存しない表示）
- カウントダウン表示、アラーム発火時のサウンド・バイブレーション通知、画面オーバーレイ
- 位置情報取得 (任意) による現在地推定とタイムゾーン検証
- PWA 対応（`static/manifest.json` と `assets/js/timekeeper-sw.js`）：ホーム画面インストールボタン、オフライン用キャッシュ、`static/timekeeper-offline.html` によるフォールバック
```

新しい音声研究記事を追加するには:
1. `voice/` ディレクトリに新しい記事ファイル (例: `new-article.php`) を作成
2. `includes/voice-articles.php` の配列に記事メタデータを追加
3. `sitemap.xml` に新しいURLを追加

---

## 旧版（Spring Boot）情報

Migrated from legacy CGI scripts (MEMO / SDV / SPEECH) to Spring Boot 3 (Java 17).

## Run (Production-like)
```
mvn spring-boot:run
```
Then open:
- Root: http://localhost:8080/
- APIs: http://localhost:8080/api/v1/sdv , /api/v1/speech , /api/v1/health
- Legacy memo endpoint/page removed ( /api/v1/memo returns 404, /memo.html returns 410 )

## Fast Dev (Auto Restart & No Cache)
Spring Boot DevTools + `dev` プロファイル。
```
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
テンプレートはキャッシュ無効で即時反映。Javaクラス変更は自動再起動。

### Unified Helper Script: `dev-run.sh`
Convenience script providing start/stop/status/restart and optional daemon mode.

```
# Foreground start (dev profile, port 8080)
./dev-run.sh start

# Background (daemon) start with logs (logs/app.out, logs/app.err)
DAEMON=1 ./dev-run.sh start

# Status / Stop / Restart
./dev-run.sh status
./dev-run.sh stop
DAEMON=1 ./dev-run.sh restart

# Change port / use packaged jar
PORT=8090 ./dev-run.sh start
JAR_MODE=1 DAEMON=1 ./dev-run.sh start
```
Environment variables:

| Var | Default | Purpose |
|-----|---------|---------|
| PORT | 8080 | Listening port |
| SPRING_PROFILE | dev | Spring profile to activate |
| JAR_MODE | 0 | 1 => use built jar instead of mvn run |
| DAEMON | 0 | 1 => background (nohup) |
| LOG_DIR | logs | Log directory when DAEMON=1 |
| OUT_LOG | app.out | Stdout file name |
| ERR_LOG | app.err | Stderr file name |
| MVN_OPTS | (empty) | Extra Maven options |

PID file: `app.pid` (removed on stop). If `lsof` is installed it improves duplicate detection; otherwise fallback warnings appear.

Typical flow:
1. `DAEMON=1 ./dev-run.sh start`
2. Develop & edit code
3. `./dev-run.sh status` (health check)
4. `./dev-run.sh stop` when done

## Build
```
mvn package
java -jar target/memo-0.0.1-SNAPSHOT.jar
```

## Test
```
mvn test
```

## Contact
Author email intentionally removed from runtime footer; see repository root instructions if needed.

### Footer Contact Form (2025-10)
- すべてのページのフッターに問い合わせフォームを追加しました。
- フォーム送信内容は `mail/memosite.jp/inquiries/` に JSON 形式で保存されます。
- メール通知は既定で `k.noguchi2005@gmail.com` に送信されます。必要があれば環境変数 `CONTACT_RECIPIENT` を設定して上書きできます。
