import { db } from './firebase-config.js';
import { collection, onSnapshot, doc, deleteDoc, getDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');
    const startButton = document.querySelector('.start-button');
    const leaveButton = document.querySelector('.leave-button'); 
    const topicSelection = document.getElementById('topic-selection');
    const topicsDropdown = document.getElementById('topics');

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

            // Set the visibility of the start button and topic selection based on host status
            if (isHost) {
                startButton.style.display = 'block';
                topicSelection.style.display = 'block';
                loadTopics(roomRef); // Pass the roomRef to loadTopics
            } else {
                startButton.style.display = 'none';
                topicSelection.style.display = 'none';
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

        // Attach event listener to the leave button
        leaveButton.addEventListener('click', async () => {
            await handleLeaveRoom(roomCode, userId);
            window.location.href = './index.html'; // Redirect to the index page
        });

        // Handle the START button click
        startButton.addEventListener('click', async () => {
            const selectedTopic = topicsDropdown.value;
            const roomDoc = await getDoc(roomRef);
            await roomSetup(roomDoc, roomRef, playersCollection, selectedTopic);

            // Wait for the update to be confirmed before proceeding with the redirection
            const unsubscribe = onSnapshot(roomRef, (doc) => {
                if (doc.exists() && doc.data().IsStarted) {
                    unsubscribe(); // Unsubscribe from further updates
                    window.location.href = `./game.html?roomCode=${roomCode}&userId=${userId}`;
                }
            });
        });

        // Listen for deletion of the room document and redirect to index page if room is deleted
        onSnapshot(roomRef, (doc) => {
            if (!doc.exists()) {
                window.location.href = './index.html';
            }
        });
    }
});

async function loadTopics(roomRef) {
    const topicsCollection = collection(db, 'Topics');
    const topicsSnapshot = await getDocs(topicsCollection);
    const topicsDropdown = document.getElementById('topics');
    const roomDoc = await getDoc(roomRef);

    let currentTopic = '';
    if (roomDoc.exists()) {
        currentTopic = roomDoc.data().topic;
    }

    topicsSnapshot.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.id;
        topicsDropdown.appendChild(option);
    });

    if (currentTopic) {
        topicsDropdown.value = currentTopic; // Set the default selected option to the current topic
    }
}

async function roomSetup(roomDoc, roomRef, playersCollection, selectedTopic) {
    const topicRef = doc(db, 'Topics', selectedTopic);
    const topicDoc = await getDoc(topicRef);

    if (topicDoc.exists()) {
        const wordList = topicDoc.data().WordList;
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];

        // Set the chosen word as the secret word in the room document
        await updateDoc(roomRef, {
            secretWord: randomWord,
            topic: selectedTopic
        });
    } else {
        console.error(`No document found for topic: ${selectedTopic}`);
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
