import { db } from './firebase-config.js';
import { doc, getDoc, onSnapshot, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');

    const secretWordElement = document.querySelector('.secret-word');
    const userNameElement = document.querySelector('.user-name');
    const wordsListElement = document.querySelector('.words-list');
    const voteButton = document.querySelector('#voteButton');

    if (roomCode && userId) {
        // Real-time listener for the room status
        const roomRef = doc(db, 'rooms', roomCode);
        onSnapshot(roomRef, (doc) => {
            if (doc.exists()) {
                const roomData = doc.data();
                if (roomData.readyToVote) {
                    window.location.href = `./vote.html?roomCode=${roomCode}&userId=${userId}`;
                }
            }
        });

        // Fetch and display the username using userId
        const userRef = doc(db, 'rooms', roomCode, 'players', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const username = userDoc.data().username;
            userNameElement.textContent = username;

            voteButton.style.display = 'block';
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

        // Fetch and display the list of words from Topics/{topic}/WordList
        const topic = roomDoc.data().topic;
        const topicRef = doc(db, 'Topics', topic);
        const topicDoc = await getDoc(topicRef);

        if (topicDoc.exists()) {
            const wordList = topicDoc.data().WordList;
            wordList.forEach(word => {
                const listItem = document.createElement('li');
                listItem.textContent = word;
                wordsListElement.appendChild(listItem);
            });
        } else {
            console.error('No such document in Topics!');
        }
    }

    // Handle the Vote button click
    voteButton.addEventListener('click', async () => {
        const userRef = doc(db, 'rooms', roomCode, 'players', userId);
        await updateDoc(userRef, { readyToVote: true });

        // Change the button to red and update text
        voteButton.style.backgroundColor = 'red';
        voteButton.style.color = 'black';
        voteButton.textContent = 'Ready';

        const playersCollection = collection(db, 'rooms', roomCode, 'players');
        const playersSnapshot = await getDocs(playersCollection);
        const allReadyToVote = playersSnapshot.docs.every(doc => doc.data().readyToVote);

        if (allReadyToVote) {
            const roomRef = doc(db, 'rooms', roomCode);
            await updateDoc(roomRef, { readyToVote: true });
        }
    });
});
