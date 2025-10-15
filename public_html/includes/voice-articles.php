<?php
/**
 * 音声研究記事のメタデータ管理
 * 
 * 新しい記事を追加する際は、このファイルの $articles 配列に追加してください。
 */

function getVoiceArticles(): array
{
    return [
        [
            'id' => 'speech',
            'title' => '音声解析と機械学習の研究メモ',
            'slug' => 'speech.php',
            'description' => 'MFCC、DTW、z-scoreなど音声処理の基礎技術とPythonライブラリの使い方について詳しく解説します。',
            'tags' => ['音声解析', '機械学習', 'MFCC', 'DTW', 'Python'],
            'date' => '2024-10',
            'icon' => '',
        ],
        [
            'id' => 'jspaw',
            'title' => 'なりすまし音声のデータセットについて',
            'slug' => 'jspaw.php',
            'description' => '音声言語処理に関する最新研究文献。J-SPAW 2024で発表された音声合成と認識のなりすまし対策について紹介します。',
            'tags' => ['J-SPAW', '音声処理', '研究論文', '音声合成'],
            'date' => '2024-10',
            'icon' => '',
        ],
        [
            'id' => 'v2s_attack',
            'title' => 'V2S Attack 論文解説',
            'slug' => 'V2S-attack_paper.php',
            'description' => 'ASVを突破するためのDNNベース音声変換攻撃「V2S Attack」の仕組みと評価、防御策を整理した解説です。',
            'tags' => ['音声セキュリティ', 'Spoofing', 'Voice Conversion', 'ASV'],
            'date' => '2025-10',
            'icon' => '',
        ],
        [
            'id' => 'kaggle_t4x2',
            'title' => 'Kaggle GPU T4×2 利用ガイド',
            'slug' => 'kaggle_t4x2_guide.php',
            'description' => 'Kaggle Notebooks で GPU T4×2 を有効化する手順とマルチGPUの運用ベストプラクティスをまとめました。',
            'tags' => ['Kaggle', 'GPU', 'ディープラーニング', 'MLOps'],
            'date' => '2025-10',
            'icon' => '',
        ],
        [
            'id' => 'onedrive_error',
            'title' => 'OneDrive エラー対処法',
            'slug' => 'onedrive_error.php',
            'description' => 'OneDriveで発生する同期エラーやアクセス問題の解決方法。研究データの安全な管理とバックアップのベストプラクティスも紹介します。',
            'tags' => ['OneDrive', 'トラブルシューティング', 'データ管理', 'バックアップ'],
            'date' => '2025-10',
            'icon' => '',
        ],
    ];
}

/**
 * スラッグから記事を取得
 */
function getVoiceArticleBySlug(string $slug): ?array
{
    $articles = getVoiceArticles();
    foreach ($articles as $article) {
        if ($article['slug'] === $slug) {
            return $article;
        }
    }
    return null;
}

/**
 * IDから記事を取得
 */
function getVoiceArticleById(string $id): ?array
{
    $articles = getVoiceArticles();
    foreach ($articles as $article) {
        if ($article['id'] === $id) {
            return $article;
        }
    }
    return null;
}

/**
 * 記事の総数を取得
 */
function getVoiceArticleCount(): int
{
    return count(getVoiceArticles());
}
