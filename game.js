import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');

    const secretWordElement = document.querySelector('.secret-word');
    const userNameElement = document.querySelector('.user-name');
    const wordsListElement = document.querySelector('.words-list');

    if (roomCode && userId) {
        // Fetch and display the username using userId
        const userRef = doc(db, 'rooms', roomCode, 'players', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const username = userDoc.data().username;
            userNameElement.textContent = username;
        } else {
            console.error('No such user document!');
        }

        // Fetch and display the secret word for the room
        const roomRef = doc(db, 'rooms', roomCode);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
            const secretWord = roomDoc.data().secretWord;
            secretWordElement.textContent = secretWord;
        } else {
            console.error('No such document!');
        }

        // Fetch and display the list of words from Topics/Animal/WordList
        const topicRef = doc(db, 'Topics', 'Animal');
        const topicDoc = await getDoc(topicRef);

        if (topicDoc.exists()) {
            const wordList = topicDoc.data().WordList;
            wordList.forEach(word => {
                const listItem = document.createElement('li');
                listItem.textContent = word;
                wordsListElement.appendChild(listItem);
            });
        } else {
            console.error('No such document in Topics/Animal!');
        }
    }

    // Handle the END button click
    const endButton = document.querySelector('.spy-themed3');
    endButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
