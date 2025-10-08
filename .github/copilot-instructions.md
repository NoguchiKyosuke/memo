# Copilot Instructions for `memo`

## プロジェクト概要
## プロジェクト概要
- **スタック:** フラットな PHP テンプレート + 共有インクルード (`public_html/includes/`)、素の JavaScript、単一の CSS バンドル (`assets/css/app.css`)
- **ホスティング環境:** Apache 互換の共有ホスティング (PHP 7.4+)。Composer、Node、POSIX 以外のシェルユーティリティは利用不可と想定。
- **主要エントリーポイント:**
  - `index.php` - 全体のホームページ（SDV と音声研究へのゲートウェイ）
  - `sdv.php` - SDV 単体記事
  - `voice/index.php` - 音声研究のホームページ（記事一覧）
  - `voice/speech.php`, `voice/jspaw.php` - 音声研究の個別記事
  - 問い合わせフォームハンドラー `public_html/contact.php` は JSON を `mail/memo-site.com/inquiries/` に保存し、既定で `k.noguchi2005@gmail.com` にメール送信（環境変数 `CONTACT_RECIPIENT` で上書き可能）
  - 音声記事のメタデータは `includes/voice-articles.php` で一元管理

## コーディング指針
1. **コードスタイル:**
   - CSS は単一ファイル方式を尊重。既存の minified セクションを再フォーマットせず、必要な部分だけ慎重に追記する。

2. **構造とスタイル:**
   - PHP 関数は短く焦点を絞る。グローバルスコープへの副作用を最小化する。
   - UI 用の文字列は既存コンテンツに合わせて日本語で記述する。
   - 文章は常態で記述する。また、絵文字は極力使わない。

3. **セキュリティと信頼性:**
   - ヘッダーインジェクション、パストラバーサル、不正なリダイレクトを防ぐ。
   - スパム対策として Honeypot、レート制限、キーワードフィルタリングを実装する。
   - すべての外部入力を検証・サニタイズし、XSS や SQL インジェクション（該当する場合）を防止する。

4. **永続化とメール:**
   - 問い合わせデータは JSON 形式で `mail/memo-site.com/inquiries/` に保存（ディレクトリがなければ作成）。
   - 通知メールは `mail()` 関数で送信。設定または既定の受信者アドレスを使用。

5. **テストと検証:**
   - 構文チェックには `php -l <file>` を推奨。

6. **ドキュメント:**
   - 動作やプロセスが変更された場合は `public_html/README.md` を更新する（例: 新しいエンドポイント、設定項目）。また、必要に応じて `copilot-instructions.md` も更新する。

## よくあるタスク
- **新しいページの追加:** 既存のページテンプレートを複製し、`renderHead` でメタデータを更新、必要に応じて `renderNavigation` にナビゲーションリンクを追加する。
- **音声研究記事の追加:** 
  1. `voice/` ディレクトリに新しい記事ファイルを作成
  2. `includes/voice-articles.php` の配列に記事メタデータを追加
  3. `sitemap.xml` に新しいURLを追加
- **フッターの拡張:** `renderFooter()` を変更する際は、アクセシビリティ属性（aria 属性、フォーカス可能なコントロール）を維持する。
- **新しいスクリプトの追加:** アセットを `public_html/assets/js/` に配置し、該当ページまたは `renderHead`（全体で使う場合）から `<script defer>` で読み込む。
- **SEOの改善:** 常にSEOを意識して、最善な行動を撮ってください。

上記の指針に従うことで、Copilot（および人間）は予期しない不具合を起こさず、プロジェクトを安全に拡張できます。
