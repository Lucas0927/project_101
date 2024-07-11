import { db } from './firebase-config.js';
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.getElementById('updateButton').addEventListener('click', async () => {
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.innerHTML = 'Updating...';

    try {
        const response = await fetch('./topics.json');
        const topics = await response.json();

        const topicsCollection = collection(db, 'Topics');
        const existingTopicsSnapshot = await getDocs(topicsCollection);
        const existingTopics = new Set(existingTopicsSnapshot.docs.map(doc => doc.id));

        const updatedTopics = [];
        const skippedTopics = [];

        for (const topic of topics) {
            const topicName = topic.topic_name;

            if (existingTopics.has(topicName)) {
                skippedTopics.push(topicName);
            } else {
                const wordList = [];
                for (let i = 1; i <= 16; i++) {
                    wordList.push(topic[`word${i}`]);
                }

                await setDoc(doc(topicsCollection, topicName), {
                    WordList: wordList
                });

                updatedTopics.push(topicName);
            }
        }

        resultMessage.innerHTML = `
            <p>Topics updated: ${updatedTopics.length ? updatedTopics.join(', ') : 'NONE'}</p>
            <p>Topics skipped (already in database): ${skippedTopics.length ? skippedTopics.join(', ') : 'NONE'}</p>
        `;
    } catch (error) {
        console.error('Error updating topics:', error);
        resultMessage.innerHTML = 'Error updating topics. Check the console for details.';
    }
});

document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = './addtopic.html';
});