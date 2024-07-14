import { db } from './firebase-config.js';
import { collection, onSnapshot, doc, deleteDoc, getDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');
    const startButton = document.querySelector('.spy-themed3');

    if (roomCode) {
        document.getElementById('roomCode').textContent = roomCode;

        const playersList = document.getElementById('players-list');
        playersList.innerHTML = ''; // Clear the list before appending

        const playersCollection = collection(db, 'rooms', roomCode, 'players');
        const roomRef = doc(db, 'rooms', roomCode);

        // Listen for real-time updates in the players collection
        onSnapshot(playersCollection, (snapshot) => {
            playersList.innerHTML = ''; // Clear the list before appending
            let isHost = false;
            snapshot.forEach(playerDoc => {
                const player = playerDoc.data();
                const playerDiv = document.createElement('div');
                playerDiv.classList.add('player');
                playerDiv.textContent = player.username || 'Unknown Player';
                playersList.appendChild(playerDiv);

                // Check if the current user is the host
                if (playerDoc.id === userId && player.username === 'HOST') {
                    isHost = true;
                }
            });

            // Set the visibility of the start button based on host status
            if (isHost) {
                startButton.style.display = 'block';
            } else {
                startButton.style.display = 'none';
            }
        });

        onSnapshot(roomRef, (doc) => {
            if (doc.exists()) {
                const roomData = doc.data();
                if (roomData.IsStarted) {
                    window.location.href = `./game.html?roomCode=${roomCode}&userId=${userId}`;
                }
            }
        });

        // Attach event listener to the game name link
        document.getElementById('gameNameLink').addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent the default link behavior
            await handleLeaveRoom(roomCode, userId);
            window.location.href = event.target.href; // Redirect to the index page
        });

        // Handle the START button click
        startButton.addEventListener('click', async () => {
            const roomDoc = await getDoc(roomRef);
            await roomSetup(roomDoc, roomRef, playersCollection);

            window.location.href = `./game.html?roomCode=${roomCode}&userId=${userId}`;
        });
        
        // Listen for deletion of the room document and redirect to index page if room is deleted
        onSnapshot(roomRef, (doc) => {
            if (!doc.exists()) {
                window.location.href = './index.html';
            }
        });
    }
});

async function roomSetup(roomDoc, roomRef, playersCollection) {
    const topic = roomDoc.data().topic;

    // Get the WordList array from the topic document and choose a random word
    const topicRef = doc(db, 'Topics', topic);
    const topicDoc = await getDoc(topicRef);

    if (topicDoc.exists()) {
        const wordList = topicDoc.data().WordList;
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];

        // Set the chosen word as the secret word in the room document
        await updateDoc(roomRef, {
            secretWord: randomWord
        });
    } else {
        console.error(`No document found for topic: ${topic}`);
        return;
    }

    // Choose a random userId from players and set as liar
    const playersSnapshot = await getDocs(playersCollection);
    const playerIds = playersSnapshot.docs.map(doc => doc.id);
    const randomLiarId = playerIds[Math.floor(Math.random() * playerIds.length)];

    await updateDoc(roomRef, {
        liar: randomLiarId,
        IsStarted: true
    });
}

async function handleLeaveRoom(roomCode, userId) {
    const playerRef = doc(db, 'rooms', roomCode, 'players', userId);
    const playerDoc = await getDoc(playerRef);

    if (playerDoc.exists()) {
        const playerData = playerDoc.data();

        if (playerData.username === 'HOST') {
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
        } else {
            // Delete only the specific player
            await deleteDoc(playerRef);
        }
    }
}
