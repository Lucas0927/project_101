import { db } from './firebase-config.js';
import { collection, doc, getDoc, getDocs, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');
    const playersListElement = document.getElementById('players-list');
    const submitVoteButton = document.getElementById('submitVoteButton');
    let selectedPlayerId = null;

    if (roomCode) {
        const playersCollection = collection(db, 'rooms', roomCode, 'players');
        const roomRef = doc(db, 'rooms', roomCode);

        // Listen for real-time updates in the players collection
        onSnapshot(playersCollection, (snapshot) => {
            playersListElement.innerHTML = ''; // Clear the list before appending
            snapshot.forEach(playerDoc => {
                const player = playerDoc.data();
                const playerListItem = document.createElement('li');
                playerListItem.textContent = player.username;
                playerListItem.dataset.id = playerDoc.id;
                playerListItem.addEventListener('click', () => {
                    selectedPlayerId = playerDoc.id;
                    document.querySelectorAll('.players-list li').forEach(li => li.classList.remove('selected'));
                    playerListItem.classList.add('selected');
                });
                playersListElement.appendChild(playerListItem);
            });
        });

        // Listen for changes to the room document to redirect all players to the end page when voting is complete
        onSnapshot(roomRef, (doc) => {
            if (doc.exists() && doc.data().votesComplete) {
                window.location.href = `./end.html?roomCode=${roomCode}&userId=${userId}`;
            }
        });

        // Handle the submit vote button click
        submitVoteButton.addEventListener('click', async () => {
            if (selectedPlayerId) {
                const userRef = doc(db, 'rooms', roomCode, 'players', userId);
                await updateDoc(userRef, { vote: selectedPlayerId });

                // Mark the voted username
                document.querySelector(`li[data-id='${selectedPlayerId}']`).classList.add('voted');

                // Check if all players have voted
                const playersSnapshot = await getDocs(playersCollection);
                const allVotesIn = playersSnapshot.docs.every(doc => doc.data().vote);

                if (allVotesIn) {
                    // Calculate the player with the most votes
                    let voteCounts = {};
                    playersSnapshot.docs.forEach(doc => {
                        const vote = doc.data().vote;
                        if (vote) {
                            voteCounts[vote] = (voteCounts[vote] || 0) + 1;
                        }
                    });

                    // Find the player with the most votes
                    const mostVotedPlayerId = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
                    await updateDoc(roomRef, { votesComplete: true, mostVotedPlayerId });
                }
            } else {
                alert('Please select a player to vote for.');
            }
        });
    }
});
