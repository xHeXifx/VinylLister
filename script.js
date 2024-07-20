document.addEventListener('DOMContentLoaded', () => {
    const addRecordBtn = document.getElementById('addRecordBtn');
    const addRecordModal = document.getElementById('addRecordModal');
    const closeModal = document.querySelector('.close');
    const addRecordForm = document.getElementById('addRecordForm');
    const recordsContainer = document.getElementById('recordsContainer');

    const records = JSON.parse(localStorage.getItem('records')) || [];

    addRecordBtn.addEventListener('click', () => {
        addRecordModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        addRecordModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == addRecordModal) {
            addRecordModal.style.display = 'none';
        }
    });

    addRecordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const recordName = document.getElementById('recordName').value;
        const artistName = document.getElementById('artistName').value;

        const recordData = await fetchRecordData(recordName, artistName);
        if (recordData) {
            records.push(recordData);
            localStorage.setItem('records', JSON.stringify(records));
            addRecordToDOM(recordData);
            addRecordModal.style.display = 'none';
        }
    });

    function addRecordToDOM(record) {
        const recordElement = document.createElement('div');
        recordElement.classList.add('record');

        const recordHeader = document.createElement('div');
        recordHeader.style.display = 'flex';
        recordHeader.style.alignItems = 'center';

        const recordCover = document.createElement('img');
        recordCover.src = record.cover;
        recordHeader.appendChild(recordCover);

        const recordTitle = document.createElement('h3');
        recordTitle.textContent = record.title;
        recordHeader.appendChild(recordTitle);

        const recordArtist = document.createElement('p');
        recordArtist.textContent = record.artist;
        recordHeader.appendChild(recordArtist);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            recordsContainer.removeChild(recordElement);
            const index = records.findIndex(r => r.title === record.title && r.artist === record.artist);
            if (index > -1) {
                records.splice(index, 1);
                localStorage.setItem('records', JSON.stringify(records));
            }
        });
        recordHeader.appendChild(deleteBtn);

        recordElement.appendChild(recordHeader);

        const tracklistElement = document.createElement('div');
        tracklistElement.classList.add('tracklist');
        const tracklistTitle = document.createElement('h4');
        tracklistTitle.textContent = 'Tracklist';
        tracklistElement.appendChild(tracklistTitle);
        const tracklistUl = document.createElement('ul');
        record.tracklist.forEach(track => {
            const li = document.createElement('li');
            li.textContent = track;
            tracklistUl.appendChild(li);
        });
        tracklistElement.appendChild(tracklistUl);
        recordElement.appendChild(tracklistElement);

        recordElement.addEventListener('click', () => {
            const isOpen = recordElement.classList.contains('show-tracklist');
            document.querySelectorAll('.record').forEach(el => {
                el.classList.remove('show-tracklist');
                el.style.height = 'auto';
            });
            if (!isOpen) {
                recordElement.classList.add('show-tracklist');
                recordElement.style.height = `${recordElement.scrollHeight}px`;
            }
        });

        recordsContainer.appendChild(recordElement);
    }

    async function fetchRecordData(recordName, artistName) {
        try {
            const response = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(recordName)} ${encodeURIComponent(artistName)}&type=release&key=zLlKdOxELgIDJRBthWgc&secret=uhJTJbMcSAdOmfaHauoVvillKARFbDBD`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const record = data.results[0];
                const recordDetails = await fetch(record.resource_url);
                const details = await recordDetails.json();
                return {
                    cover: record.cover_image,
                    title: record.title,
                    artist: record.artist,
                    tracklist: details.tracklist.map(track => track.title)
                };
            }
        } catch (error) {
            console.error('Error fetching record data:', error);
        }
        return null;
    }

    records.forEach(record => addRecordToDOM(record));
});
