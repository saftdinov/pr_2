let kolonki = {
    col1: [],
    col2: [],
    col3: []
};

let zablokirovano = false;

zagruzit();

function addCard() {
    if (zablokirovano || kolonki.col1.length >= 3) {
        return;
    }

    document.getElementById('editId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('items').innerHTML = `
        <input type="text" placeholder="1" required>
        <input type="text" placeholder="2" required>
        <input type="text" placeholder="3" required>
    `;
    document.getElementById('modal').style.display = 'flex';
}

function addItem() {
    let container = document.getElementById('items');
    if (container.children.length < 5) {
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = container.children.length + 1;
        input.required = true;
        container.appendChild(input);
    }
}

function saveCard() {
    let title = document.getElementById('title').value.trim();
    let inputs = document.getElementById('items').querySelectorAll('input');
    let items = Array.from(inputs).map(i => i.value.trim()).filter(v => v);

    if (items.length < 3) {
        alert('Нужно минимум 3 пункта!');
        return;
    }

    if (items.length > 5) {
        alert('Максимум 5 пунктов!');
        return;
    }

    kolonki.col1.push({
        id: Date.now(),
        title: title,
        items: items.map(i => ({ text: i, done: false })),
        lastDone: null
    });

    sohranit();
    pokazat();
    closeModal();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function checkItem(id, idx, checked) {
    let card = null;
    let col = null;

    for (let c in kolonki) {
        let i = kolonki[c].findIndex(x => x.id == id);
        if (i !== -1) {
            card = kolonki[c][i];
            col = c;
            break;
        }
    }

    if (!card) return;

    card.items[idx].done = checked;
    card.lastDone = new Date().toISOString();

    let doneCount = card.items.filter(i => i.done).length;
    let percent = Math.round((doneCount / card.items.length) * 100);

    if (col === 'col1' && percent > 50) {
        if (kolonki.col2.length < 5) {
            moveCard(id, 'col1', 'col2');
        } else {
            card.items[idx].done = !checked;
            card.lastDone = null;
            zablokirovat();
        }
    }

    if (col === 'col2' && percent === 100) {
        moveCard(id, 'col2', 'col3');
        razblokirovat();
    }

    sohranit();
    pokazat();
}

function moveCard(id, from, to) {
    let idx = kolonki[from].findIndex(c => c.id == id);
    if (idx === -1) return;

    let card = kolonki[from][idx];
    kolonki[from].splice(idx, 1);
    kolonki[to].push(card);
}

function zablokirovat() {
    zablokirovano = true;
    document.getElementById('locked').style.display = 'flex';
    sohranit();
    pokazat();
}

function razblokirovat() {
    if (kolonki.col2.length < 5) {
        zablokirovano = false;
        document.getElementById('locked').style.display = 'none';
        sohranit();
        pokazat();
    }
}

function pokazat() {
    document.getElementById('col1').innerHTML = '';
    document.getElementById('col2').innerHTML = '';
    document.getElementById('col3').innerHTML = '';

    document.getElementById('count1').textContent = `${kolonki.col1.length}/3`;
    document.getElementById('count2').textContent = `${kolonki.col2.length}/5`;
    document.getElementById('count3').textContent = `${kolonki.col3.length}`;

    kolonki.col1.forEach(c => {
        let div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <strong>${c.title}</strong>
            ${c.items.map((i, idx) => `
                <div class="card-item">
                    <input type="checkbox" onchange="checkItem(${c.id}, ${idx}, this.checked)" ${i.done ? 'checked' : ''}>
                    <label>${i.text}</label>
                </div>
            `).join('')}
        `;
        document.getElementById('col1').appendChild(div);
    });

    kolonki.col2.forEach(c => {
        let div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <strong>${c.title}</strong>
            ${c.items.map((i, idx) => `
                <div class="card-item">
                    <input type="checkbox" onchange="checkItem(${c.id}, ${idx}, this.checked)" ${i.done ? 'checked' : ''}>
                    <label>${i.text}</label>
                </div>
            `).join('')}
        `;
        document.getElementById('col2').appendChild(div);
    });

    kolonki.col3.forEach(c => {
        let div = document.createElement('div');
        div.className = 'card';
        let dateStr = c.lastDone ? new Date(c.lastDone).toLocaleString('ru-RU') : '';
        div.innerHTML = `
            <strong>${c.title}</strong>
            ${c.items.map(i => `
                <div class="card-item">
                    <input type="checkbox" checked disabled>
                    <label>${i.text}</label>
                </div>
            `).join('')}
            ${dateStr ? `<div class="completion-date">Завершено: ${dateStr}</div>` : ''}
        `;
        document.getElementById('col3').appendChild(div);
    });

    let btn = document.querySelector('button[onclick="addCard()"]');
    if (kolonki.col1.length >= 3 || zablokirovano) {
        btn.disabled = true;
    } else {
        btn.disabled = false;
    }
}

function sohranit() {
    localStorage.setItem('notes', JSON.stringify({ kolonki, zablokirovano }));
}

function zagruzit() {
    let saved = localStorage.getItem('notes');
    if (saved) {
        let data = JSON.parse(saved);
        kolonki = data.kolonki || { col1: [], col2: [], col3: [] };
        zablokirovano = data.zablokirovano || false;
    }
    pokazat();

    if (kolonki.col2.length >= 5) {
        let hasOver50 = kolonki.col1.some(c => {
            let done = c.items.filter(i => i.done).length;
            return (done / c.items.length) > 0.5;
        });
        if (hasOver50) {
            zablokirovat();
        }
    }
}

window.onclick = function(e) {
    if (e.target.id === 'modal') {
        closeModal();
    }
};