<?php
/**
 * 音声研究記事のメタデータ管理
 * 
 * 新しい記事を追加する際は、このファイルの $articles 配列に追加してください。
 */

function getDiscordArticles(): array
{
    return [
    ];
}

/**
 * スラッグから記事を取得
 */
function getDiscordArticleBySlug(string $slug): ?array
{
    $articles = getDiscordArticles();
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
function getDiscordArticleById(string $id): ?array
{
    $articles = getDiscordArticles();
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
function getDiscordArticleCount(): int
{
    return count(getDiscordArticles());
}
