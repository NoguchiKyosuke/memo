<?php
session_start();

function isLoggedIn() {
    if (isset($_SESSION['user_id'])) {
        return true;
    }
    return checkAutoLogin();
}

function checkAutoLogin() {
    if (isset($_COOKIE['remember_me'])) {
        global $pdo;
        $token = $_COOKIE['remember_me'];
        
        $stmt = $pdo->prepare("SELECT id, email FROM users WHERE remember_token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            return true;
        }
    }
    return false;
}

function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit;
    }
}

function h($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

function fetchMeaning($word, $type = 'en-ja') {
    $word = trim($word);
    $apiWord = strtolower($word); // Lowercase for better API matching
    
    if ($type === 'en-en') {
        // Free Dictionary API (En-En)
        $url = "https://api.dictionaryapi.dev/api/v2/entries/en/" . urlencode($apiWord);
    } else {
        // Jisho.org API (En-Ja)
        $url = "https://jisho.org/api/v1/search/words?keyword/" . urlencode($apiWord);
        // Fix: Jisho API uses ?keyword=
        $url = "https://jisho.org/api/v1/search/words?keyword=" . urlencode($apiWord);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'VocabularyApp/1.0');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        
        if ($type === 'en-en') {
            if (is_array($data) && isset($data[0])) {
                $entry = $data[0];
                $html = '<div class="meaning-en-en">';
                
                // Phonetic
                if (isset($entry['phonetic'])) {
                    $html .= '<span class="phonetic">' . h($entry['phonetic']) . '</span> ';
                }
                
                // Meanings
                if (isset($entry['meanings'])) {
                    foreach ($entry['meanings'] as $meaning) {
                        $html .= '<div class="part-of-speech">' . h($meaning['partOfSpeech']) . '</div>';
                        $html .= '<ol class="definitions">';
                        foreach ($meaning['definitions'] as $def) {
                            $html .= '<li>' . h($def['definition']);
                            if (isset($def['example'])) {
                                $html .= '<div class="example">"' . h($def['example']) . '"</div>';
                            }
                            $html .= '</li>';
                        }
                        $html .= '</ol>';
                    }
                }
                $html .= '</div>';
                return $html;
            }
        } else {
            // Jisho logic
            // Jisho logic
            if (isset($data['data']) && is_array($data['data'])) {
                $html = '<div class="meaning-en-ja">';
                
                // Limit to top 3 entries
                $entries = array_slice($data['data'], 0, 3);
                
                foreach ($entries as $index => $entry) {
                    if ($index > 0) {
                        $html .= '<hr class="entry-divider">';
                    }
                    
                    $html .= '<div class="jisho-entry">';
                    
                    // Japanese Word/Reading
                    if (isset($entry['japanese'][0])) {
                        $jp = $entry['japanese'][0];
                        $word_text = isset($jp['word']) ? $jp['word'] : '';
                        $reading = isset($jp['reading']) ? $jp['reading'] : '';
                        
                        $html .= '<div class="jp-header">';
                        if ($word_text) {
                            $html .= '<span class="jp-word">' . h($word_text) . '</span>';
                            if ($reading) {
                                $html .= ' <span class="jp-reading">(' . h($reading) . ')</span>';
                            }
                        } elseif ($reading) {
                            $html .= '<span class="jp-word">' . h($reading) . '</span>';
                        }
                        $html .= '</div>';
                    }
                    
                    // Senses
                    if (isset($entry['senses'])) {
                        $html .= '<ul class="senses">';
                        foreach ($entry['senses'] as $sense) {
                            $definitions = isset($sense['english_definitions']) ? implode(', ', $sense['english_definitions']) : '';
                            $pos = isset($sense['parts_of_speech']) ? implode(', ', $sense['parts_of_speech']) : '';
                            
                            $html .= '<li>';
                            if ($pos) {
                                $html .= '<span class="pos-tag">' . h($pos) . '</span> ';
                            }
                            $html .= h($definitions);
                            $html .= '</li>';
                        }
                        $html .= '</ul>';
                    }
                    
                    $html .= '</div>'; // End jisho-entry
                }
                
                $html .= '</div>';
                return $html;
            }
        }
    }
    
    return "Meaning not found.";
}
?>
