let isAdminLoggedIn = false;

function submitCode() {
    const codeInput = document.getElementById('codeInput');
    const message = document.getElementById('message');
    const code = codeInput.value.trim();

    message.textContent = '';
    message.className = 'message';

    if (code.length !== 5 || !/^\d+$/.test(code)) {
        message.textContent = 'Bitte geben Sie einen gültigen 5-stelligen Code ein.';
        message.classList.add('error');
        return;
    }

    fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            message.textContent = data.message;
            message.classList.add('success');
            setTimeout(() => {
                window.location.href = '/welcome';
            }, 1000);
        } else {
            message.textContent = data.message;
            message.classList.add('error');
            codeInput.value = '';
            codeInput.focus();
        }
    })
    .catch(error => {
        message.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        message.classList.add('error');
    });
}

document.getElementById('codeInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitCode();
    }
});

document.getElementById('codeInput')?.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 5);
});

function openAdminLogin() {
    document.getElementById('adminModal').classList.add('show');
    document.getElementById('adminPassword').focus();
}

function closeAdminLogin() {
    document.getElementById('adminModal').classList.remove('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminMessage').textContent = '';
}

function forgotPassword() {
    closeAdminLogin();
    document.getElementById('forgotTitle').textContent = 'Passwort zurücksetzen';
    document.getElementById('forgotText').textContent = 'Eine E-Mail mit einem Rücksetzungslink wird an den Administrator gesendet.';
    document.getElementById('forgotText').style.display = 'block';
    document.getElementById('forgotBtn').style.display = 'block';
    document.getElementById('forgotMessage').textContent = '';
    document.getElementById('forgotModal').classList.add('show');
}

function closeForgotPassword() {
    document.getElementById('forgotModal').classList.remove('show');
}

function sendResetEmail() {
    const message = document.getElementById('forgotMessage');
    const btn = document.getElementById('forgotBtn');
    const text = document.getElementById('forgotText');
    btn.textContent = 'Wird gesendet...';
    btn.disabled = true;
    message.textContent = '';
    message.className = 'message';

    fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('forgotTitle').textContent = 'E-Mail gesendet!';
            text.style.display = 'none';
            btn.style.display = 'none';
            message.textContent = data.message;
            message.classList.add('success');
        } else {
            message.textContent = data.message;
            message.classList.add('error');
            btn.textContent = 'Erneut senden';
            btn.disabled = false;
        }
    })
    .catch(error => {
        message.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        message.classList.add('error');
        btn.textContent = 'Erneut senden';
        btn.disabled = false;
    });
}

function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    const message = document.getElementById('adminMessage');

    if (!password) {
        message.textContent = 'Bitte geben Sie Ihr Passwort ein.';
        message.style.color = '#ff6b6b';
        return;
    }

    fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            isAdminLoggedIn = true;
            closeAdminLogin();
            window.location.href = '/admin';
        } else {
            message.textContent = data.message;
            message.style.color = '#ff6b6b';
        }
    })
    .catch(error => {
        message.textContent = 'Ein Fehler ist aufgetreten.';
        message.style.color = '#ff6b6b';
    });
}

document.getElementById('adminPassword')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        adminLogin();
    }
});

function logout() {
    window.location.href = '/';
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'contacts') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('contactsTab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('codesTab').classList.add('active');
    }
}

function loadContacts() {
    fetch('/api/contacts')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.contacts) {
            const c = data.contacts;
            const nameEl = document.getElementById('name');
            const phoneEl = document.getElementById('phone');
            const phone2El = document.getElementById('phone2');
            const emailEl = document.getElementById('email');
            const addressEl = document.getElementById('address');
            const websiteEl = document.getElementById('website');
            const notesEl = document.getElementById('notes');

            if (nameEl) nameEl.value = c.name || '';
            if (phoneEl) phoneEl.value = c.phone || '';
            if (phone2El) phone2El.value = c.phone2 || '';
            if (emailEl) emailEl.value = c.email || '';
            if (addressEl) addressEl.value = c.address || '';
            if (websiteEl) websiteEl.value = c.website || '';
            if (notesEl) notesEl.value = c.notes || '';
        }
    });
}

function saveContacts(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        phone2: document.getElementById('phone2').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        website: document.getElementById('website').value,
        notes: document.getElementById('notes').value
    };

    const msg = document.getElementById('contactMessage');
    msg.textContent = '';
    msg.className = 'message';

    fetch('/api/admin/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            msg.textContent = result.message;
            msg.classList.add('success');
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 3000);
        }
    })
    .catch(error => {
        msg.textContent = 'Fehler beim Speichern.';
        msg.classList.add('error');
        msg.style.display = 'block';
    });
}

function generateCode() {
    fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCodes();
        }
    });
}

function deleteCode(codeId) {
    if (!confirm('Möchten Sie diesen Code wirklich löschen?')) {
        return;
    }

    fetch(`/api/admin/codes/${codeId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCodes();
        }
    });
}

function loadCodes() {
    fetch('/api/admin/codes')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayCodes(data.codes);
        }
    });
}

function displayCodes(codes) {
    const codesList = document.getElementById('codesList');
    if (!codesList) return;

    if (codes.length === 0) {
        codesList.innerHTML = '<p style="color: #666; text-align: center;">Keine Codes vorhanden.</p>';
        return;
    }

    codesList.innerHTML = codes.map(code => `
        <div class="code-item">
            <div>
                <span class="code-value">${code.code}</span>
                <span class="code-date">${new Date(code.created_at).toLocaleDateString('de-DE')}</span>
            </div>
            <button class="code-delete" onclick="deleteCode(${code.id})">Löschen</button>
        </div>
    `).join('');
}

function displayContactCard(contacts) {
    if (!contacts) return;

    const name = contacts.name || '';
    const phone = contacts.phone || '';
    const phone2 = contacts.phone2 || '';
    const email = contacts.email || '';
    const address = contacts.address || '';
    const website = contacts.website || '';
    const notes = contacts.notes || '';

    const nameEl = document.getElementById('contactName');
    const avatarEl = document.getElementById('contactAvatar');

    if (name) {
        nameEl.textContent = name;
        avatarEl.textContent = name.charAt(0).toUpperCase();
    } else {
        nameEl.textContent = 'Kein Name angegeben';
        avatarEl.textContent = '?';
    }

    function showRow(id, condition) {
        const el = document.getElementById(id);
        if (el) el.style.display = condition ? 'flex' : 'none';
    }

    showRow('phoneRow', !!phone);
    showRow('phone2Row', !!phone2);
    showRow('emailRow', !!email);
    showRow('addressRow', !!address);
    showRow('websiteRow', !!website);
    showRow('notesRow', !!notes);

    if (phone) {
        const el = document.getElementById('contactPhone');
        el.textContent = phone;
        el.href = 'tel:' + phone;
    }
    if (phone2) {
        const el = document.getElementById('contactPhone2');
        el.textContent = phone2;
        el.href = 'tel:' + phone2;
    }
    if (email) {
        const el = document.getElementById('contactEmail');
        el.textContent = email;
        el.href = 'mailto:' + email;
    }
    if (address) {
        document.getElementById('contactAddress').textContent = address;
    }
    if (website) {
        const el = document.getElementById('contactWebsite');
        el.textContent = website;
        let url = website;
        if (!url.startsWith('http')) url = 'https://' + url;
        el.href = url;
    }
    if (notes) {
        document.getElementById('contactNotes').textContent = notes;
    }
}

if (window.location.pathname === '/admin') {
    loadContacts();
    loadCodes();
}

if (window.location.pathname === '/welcome') {
    fetch('/api/contacts')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayContactCard(data.contacts);
        }
    });
}

function goBack() {
    window.location.href = '/';
}

window.onclick = function(event) {
    const modal = document.getElementById('adminModal');
    const forgotModal = document.getElementById('forgotModal');
    if (event.target === modal) {
        closeAdminLogin();
    }
    if (event.target === forgotModal) {
        closeForgotPassword();
    }
}