import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');
    const finishButton = document.querySelector('#finishButton');

    if (roomCode) {
        const roomRef = doc(db, 'rooms', roomCode);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
            const liarId = roomDoc.data().liar;
            const liarRef = doc(db, 'rooms', roomCode, 'players', liarId);
            const liarDoc = await getDoc(liarRef);

            if (liarDoc.exists()) {
                const liarUsername = liarDoc.data().username;
                document.getElementById('liarUsername').textContent = liarUsername;
            }

            // Set IsStarted to false if the user is the HOST
            const userRef = doc(db, 'rooms', roomCode, 'players', userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const username = userDoc.data().username;
                if (username === 'HOST') {
                    await updateDoc(roomRef, { IsStarted: false });
                }
            }
        } else {
            console.error('Room does not exist');
        }

        // Listen for deletion of the room document and redirect to index page if room is deleted
        onSnapshot(roomRef, (doc) => {
            if (!doc.exists()) {
                window.location.href = './index.html';
            }
        });
    }

    finishButton.addEventListener('click', async () => {
        const userRef = doc(db, 'rooms', roomCode, 'players', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const username = userDoc.data().username;

            if (username === 'HOST') {
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

                window.location.href = './index.html';
            } else {
                // Delete only the specific player
                await deleteDoc(userRef);
                window.location.href = './index.html';
            }
        }
    });

    document.getElementById('playAgainButton').addEventListener('click', async () => {
        window.location.href = `./homewaiting.html?roomCode=${roomCode}&userId=${userId}`;
    });
});
