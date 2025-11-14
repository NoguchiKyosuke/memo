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
        ],
        [
            'id' => 'jspaw',
            'title' => 'なりすまし音声のデータセットについて',
            'slug' => 'jspaw.php',
            'description' => '音声言語処理に関する最新研究文献。J-SPAW 2024で発表された音声合成と認識のなりすまし対策について紹介します。',
            'tags' => ['J-SPAW', '音声処理', '研究論文', '音声合成'],
            'date' => '2024-10',
        ],
        [
            'id' => 'v2s_attack',
            'title' => 'V2S Attack 論文解説',
            'slug' => 'V2S-attack_paper.php',
            'description' => 'ASVを突破するためのDNNベース音声変換攻撃「V2S Attack」の仕組みと評価、防御策を整理した解説です。',
            'tags' => ['音声セキュリティ', 'Spoofing', 'Voice Conversion', 'ASV'],
            'date' => '2025-10',
        ],
        [
            'id' => 'kaggle_t4x2',
            'title' => 'Kaggle GPU T4×2 利用ガイド',
            'slug' => 'kaggle_t4x2_guide.php',
            'description' => 'Kaggle Notebooks で GPU T4×2 を有効化する手順とマルチGPUの運用ベストプラクティスをまとめました。',
            'tags' => ['Kaggle', 'GPU', 'ディープラーニング', 'MLOps'],
            'date' => '2025-10',
        ],
        [
            'id' => 'plda_overview',
            'title' => 'PLDA の基礎と応用',
            'slug' => 'plda_overview.php',
            'description' => 'Probabilistic Linear Discriminant Analysis (PLDA) の理論と話者認証への応用、実装時のコツをまとめた解説記事です。',
            'tags' => ['PLDA', '話者認証', '音声セキュリティ', '機械学習'],
            'date' => '2025-10',
        ],
        [
            'id' => 'onedrive_error',
            'title' => 'OneDrive エラー対処法',
            'slug' => 'onedrive_error.php',
            'description' => 'OneDriveで発生する同期エラーやアクセス問題の解決方法。研究データの安全な管理とバックアップのベストプラクティスも紹介します。',
            'tags' => ['OneDrive', 'トラブルシューティング', 'データ管理', 'バックアップ'],
            'date' => '2025-10',
        ],
        [
            'id' => 'safear_jspaw',
            'title' => 'SafeEar × J-SPAW 検証レポート',
            'slug' => 'safear_jspaw_evaluation.php',
            'description' => 'SafeEar を使用して J-SPAW データセットのスプーフィング検出性能を評価した結果と運用上の示唆をまとめました。',
            'tags' => ['SafeEar', 'J-SPAW', '音声セキュリティ', '評価レポート'],
            'date' => '2025-10',
        ],
        [
            'id' => 'seanet_overview',
            'title' => 'SEANet: 音声符号化のためのニューラルネットワーク',
            'slug' => 'seanet_overview.php',
            'description' => 'SEANet（Simple and Efficient Audio Neural Network）の基本構造、エンコーダ・デコーダの設計原理、音声圧縮への応用を詳しく解説します。',
            'tags' => ['SEANet', '音声符号化', '深層学習', '畳み込みニューラルネットワーク'],
            'date' => '2025-11',
        ],
        [
            'id' => 'safear_results',
            'title' => 'SafeEar: ASVspoof2019学習 → J-SPAW評価 実験レポート',
            'slug' => 'safear_results.php',
            'description' => 'ASVspoof2019で学習したSafeEarをJ-SPAWでゼロショット評価。EERの伸び悩み要因（ドメインシフト等）を分析し、改善策を提案。',
            'tags' => ['SafeEar', 'ASVspoof2019', 'J-SPAW', 'スプーフィング検出', '実験'],
            'date' => '2025-11',
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
