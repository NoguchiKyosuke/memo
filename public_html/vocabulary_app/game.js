document.addEventListener('DOMContentLoaded', () => {
    const enText = document.getElementById('en-text');
    const jpText = document.getElementById('jp-text');
    const btnPlay = document.getElementById('btn-play');
    const btnShow = document.getElementById('btn-show');
    const feedbackControls = document.getElementById('feedback-controls');
    const btnGood = document.getElementById('btn-good');
    const btnBad = document.getElementById('btn-bad');

    let currentWord = null;

    // Preload voices
    const loadVoices = () => {
        speechSynthesis.getVoices();
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }

    function loadNextWord() {
        // Reset UI
        enText.textContent = 'Loading...';
        enText.classList.add('hidden-text');
        enText.classList.remove('revealed-text');
        jpText.style.display = 'none';
        jpText.textContent = '';
        btnShow.style.display = 'inline-block';
        feedbackControls.style.display = 'none';
        currentWord = null;

        fetch('get_random_word')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    enText.textContent = data.error;
                    enText.classList.remove('hidden-text');
                    btnPlay.disabled = true;
                    btnShow.disabled = true;
                } else {
                    currentWord = data;
                    // Use sentence if available, otherwise word
                    const text = currentWord.sentence || currentWord.word;
                    enText.textContent = text;
                    jpText.textContent = currentWord.meaning;
                    btnPlay.disabled = false;
                    btnShow.disabled = false;
                }
            })
            .catch(err => {
                console.error(err);
                enText.textContent = 'Error loading word.';
                enText.classList.remove('hidden-text');
            });
    }

    function playAudio() {
        if (!currentWord) return;

        // Cancel any ongoing speech to reset
        speechSynthesis.cancel();

        // Force resume (Chrome fix for stalled audio)
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
        }

        setTimeout(() => {
            const text = (currentWord.sentence || currentWord.word);
            console.log('Attempting to speak:', text); // Debug

            // Using window object to prevent Garbage Collection issues (Chrome bug)
            window.currentUtterance = new SpeechSynthesisUtterance(text);
            const utterance = window.currentUtterance;
            utterance.lang = 'en-US';
            utterance.volume = 1.0;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            // Try to select a specific English voice if available
            const voices = speechSynthesis.getVoices();
            console.log('Available voices:', voices.map(v => v.name + ' (' + v.lang + ')')); // Debug

            // Priority:
            // 1. Microsoft Mark/Zira/David (Stable Local Windows Voices)
            // 2. Google US English (Chrome Online/Local)
            // 3. Any Local en-US voice
            // 4. Any en-US voice
            const enVoice = voices.find(v => (v.name.includes('Zira') || v.name.includes('David') || v.name.includes('Mark')) && v.lang === 'en-US')
                || voices.find(v => v.name.includes('Google US English'))
                || voices.find(v => v.lang === 'en-US' && v.localService)
                || voices.find(v => v.lang.startsWith('en'));

            if (enVoice) {
                console.log('Selected voice:', enVoice.name); // Debug
                utterance.voice = enVoice;
            } else {
                console.log('No specific English voice found, using default.');
            }

            utterance.onstart = () => console.log('Speech started');
            utterance.onend = () => {
                console.log('Speech ended');
                // Don't nullify globally immediately to ensure it finishes
            };
            utterance.onerror = (e) => {
                console.error('Speech error event:', e);
                console.error('Error code:', e.error);

                // Retry with default voice if synthesis-failed and we used a specific voice
                if (e.error === 'synthesis-failed' && utterance.voice) {
                    console.log('Retrying with default voice...');
                    window.currentUtterance = new SpeechSynthesisUtterance(text);
                    const retryUtterance = window.currentUtterance;
                    retryUtterance.lang = 'en-US';
                    speechSynthesis.speak(retryUtterance);
                }
            };

            speechSynthesis.speak(utterance);
        }, 50);
    }

    function showAnswer() {
        enText.classList.remove('hidden-text');
        enText.classList.add('revealed-text');
        jpText.style.display = 'block';
        btnShow.style.display = 'none';
        feedbackControls.style.display = 'block';
    }

    function handleFeedback(status) {
        if (!currentWord) return;

        fetch('update_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: currentWord.id,
                status: status
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadNextWord();
                } else {
                    alert('Error updating status.');
                }
            })
            .catch(err => console.error(err));
    }

    // Event Listeners
    btnPlay.addEventListener('click', playAudio);
    btnShow.addEventListener('click', showAnswer);
    btnGood.addEventListener('click', () => handleFeedback('mastered'));
    btnBad.addEventListener('click', () => handleFeedback('review'));

    // Initial Load
    loadNextWord();
});
