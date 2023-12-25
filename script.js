let recognition;
let inputLanguageSelect;
let outputLanguageSelect;
let chatWindow;

document.addEventListener('DOMContentLoaded', function () {
    inputLanguageSelect = document.getElementById('input-language');
    outputLanguageSelect = document.getElementById('output-language');
    chatWindow = document.getElementById('chat-window');

    initLanguageOptions();

    document.getElementById('record-button').addEventListener('click', function () {
        startRecognition();
    });

    document.getElementById('clear-history').addEventListener('click', function () {
        clearHistory();
    });

    // Add event listener to replay translated text on tap
    chatWindow.addEventListener('click', function (event) {
        if (event.target.classList.contains('replay-icon')) {
            replayTranslation(event.target.dataset.text);
        }
    });
});

function initLanguageOptions() {
    const languages = [
        'en', 'es', 'fr', 'de', 'it', 'hi', 'ja', 'zh-CN', 'ms', 'id', 'ko'
    ];

    languages.forEach((language) => {
        const option = document.createElement('option');
        option.value = language;
        option.text = language;
        inputLanguageSelect.add(option);

        const outputOption = document.createElement('option');
        outputOption.value = language;
        outputOption.text = language;
        outputLanguageSelect.add(outputOption);
    });
}

function startRecognition() {
    const inputLanguage = inputLanguageSelect.value;
    recognition = new webkitSpeechRecognition();
    recognition.lang = inputLanguage;

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        displayMessage(transcript, false);

        // Translate and speak the text
        translateAndSpeak(transcript, inputLanguage);
    };

    recognition.start();
}

function displayMessage(message, isTranslation) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-container');
    messageElement.innerHTML = `
        <div class="message ${isTranslation ? 'right' : 'left'}">
            <div class="message-text">${message}</div>
            <div class="timestamp">${getCurrentTime()}</div>
            ${isTranslation ? `<div class="replay-icon" data-text="${message}">▶️</div>` : ''}
        </div>
    `;

    // If it's a translation, add a separate class for styling and replay functionality
    if (isTranslation) {
        messageElement.querySelector('.message').classList.add('translated-text');
    }

    chatWindow.appendChild(messageElement);

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours}:${minutes}`;
}

function translateAndSpeak(text, sourceLanguage) {
    const targetLanguage = outputLanguageSelect.value;

    // Use Google Cloud Translation API to translate text
    const translationApiUrl = `https://translation.googleapis.com/language/translate/v2?key=AIzaSyCCNSJd2Kx2nOOxTvaSWhC0kOdbMZqnp8M`;
    $.ajax({
        url: translationApiUrl,
        type: 'POST',
        dataType: 'json',
        data: {
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
        },
        success: function (response) {
            const translatedText = response.data.translations[0].translatedText;

            // Use Web Speech API to speak translated text
            speakWithWebSpeechAPI(translatedText, targetLanguage);
            displayMessage(translatedText, true);
        },
        error: function (error) {
            console.error('Translation error:', error);
        },
    });
}

function speakWithWebSpeechAPI(text, language) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    speechSynthesis.speak(utterance);
}

function replayTranslation(text) {
    const targetLanguage = outputLanguageSelect.value;
    speakWithWebSpeechAPI(text, targetLanguage);
}

function clearHistory() {
    chatWindow.innerHTML = '';
}
