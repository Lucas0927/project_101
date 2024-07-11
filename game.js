import { db } from './firebase-config.js';
import { collection, doc, getDoc, getDocs, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');

    const secretWordElement = document.querySelector('.secret-word');
    const userNameElement = document.querySelector('.user-name');
    const wordsListElement = document.querySelector('.words-list');
    const endButton = document.querySelector('.spy-themed3');

    if (roomCode && userId) {
        // Real-time listener for the deletion of the room
        const roomRef = doc(db, 'rooms', roomCode);
        onSnapshot(roomRef, (docSnapshot) => {
            if (!docSnapshot.exists()) {
                window.location.href = 'index.html';
            }
        });

        // Fetch and display the username using userId
        const userRef = doc(db, 'rooms', roomCode, 'players', userId);
        const userDoc = await getDoc(userRef);

        //displaying end button
        if (userDoc.exists()) {
            const username = userDoc.data().username;
            userNameElement.textContent = username;

            // Check if the current user is the host
            if (username === 'HOST') {
                endButton.style.display = 'block';
            } else {
                endButton.style.display = 'none';
            }
        } else {
            console.error('No such user document!');
        }

        // Fetch and display the secret word for the room
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
            const secretWord = roomDoc.data().secretWord;
            const liarId = roomDoc.data().liar;
            if (userId === liarId) {
                secretWordElement.textContent = '??Guess??';
            } else {
                secretWordElement.textContent = secretWord;
            }
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
    endButton.addEventListener('click', async () => {
        if (endButton.style.display === 'block') {
            // Delete all players in the room
            const playersCollection = collection(db, 'rooms', roomCode, 'players');
            const playersSnapshot = await getDocs(playersCollection);

            for (const player of playersSnapshot.docs) {
                await deleteDoc(player.ref);
            }

            // Delete the room document
            const roomRef = doc(db, 'rooms', roomCode);
            const roomDoc = await getDoc(roomRef);
            if (roomDoc.exists()) {
                await deleteDoc(roomRef);
            }
            window.location.href = 'index.html';
        }
    });
});
