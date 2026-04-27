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
            sessionStorage.setItem('accessLevel', data.level || 'full');
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

    var tabMap = { contacts: 0, codes: 1, guests: 2 };
    var idx = tabMap[tab] !== undefined ? tabMap[tab] : 0;
    document.querySelectorAll('.tab-btn')[idx].classList.add('active');

    if (tab === 'contacts') {
        document.getElementById('contactsTab').classList.add('active');
    } else if (tab === 'codes') {
        document.getElementById('codesTab').classList.add('active');
    } else if (tab === 'guests') {
        document.getElementById('guestsTab').classList.add('active');
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
            const fortniteEl = document.getElementById('fortnite');
            const robloxEl = document.getElementById('roblox');
            const psnEl = document.getElementById('psn');
            const notesEl = document.getElementById('notes');

            if (nameEl) nameEl.value = c.name || '';
            if (phoneEl) phoneEl.value = c.phone || '';
            if (phone2El) phone2El.value = c.phone2 || '';
            if (emailEl) emailEl.value = c.email || '';
            if (addressEl) addressEl.value = c.address || '';
            if (websiteEl) websiteEl.value = c.website || '';
            if (fortniteEl) fortniteEl.value = c.fortnite || '';
            if (robloxEl) robloxEl.value = c.roblox || '';
            if (psnEl) psnEl.value = c.psn || '';
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
        fortnite: document.getElementById('fortnite').value,
        roblox: document.getElementById('roblox').value,
        psn: document.getElementById('psn').value,
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
    const levelSelect = document.getElementById('codeLevel');
    const level = levelSelect ? levelSelect.value : 'full';
    fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level })
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

    const levelLabels = { full: 'Vollzugriff', standard: 'Standard', basic: 'Basis' };
    const levelColors = { full: '#667eea', standard: '#f093fb', basic: '#4ecdc4' };

    codesList.innerHTML = codes.map(code => `
        <div class="code-item">
            <div>
                <span class="code-value">${code.code}</span>
                <span class="code-date">${new Date(code.created_at).toLocaleDateString('de-DE')}</span>
                <span class="code-level" style="background:${levelColors[code.level] || levelColors.full};color:white;padding:2px 8px;border-radius:10px;font-size:0.7rem;margin-left:6px;">${levelLabels[code.level] || levelLabels.full}</span>
            </div>
            <button class="code-delete" onclick="deleteCode(${code.id})">Löschen</button>
        </div>
    `).join('');
}

function displayContactCard(contacts, level) {
    if (!contacts) return;

    var levelFields = {
        full: ['name', 'phone', 'phone2', 'email', 'address', 'website', 'fortnite', 'roblox', 'psn', 'notes'],
        standard: ['name', 'phone', 'email', 'website', 'fortnite', 'roblox', 'psn'],
        basic: ['name', 'phone']
    };
    var allowed = levelFields[level] || levelFields['full'];

    const name = contacts.name || '';
    const phone = contacts.phone || '';
    const phone2 = contacts.phone2 || '';
    const email = contacts.email || '';
    const address = contacts.address || '';
    const website = contacts.website || '';
    const fortnite = contacts.fortnite || '';
    const roblox = contacts.roblox || '';
    const psn = contacts.psn || '';
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

    showRow('phoneRow', !!phone && allowed.includes('phone'));
    showRow('phone2Row', !!phone2 && allowed.includes('phone2'));
    showRow('emailRow', !!email && allowed.includes('email'));
    showRow('addressRow', !!address && allowed.includes('address'));
    showRow('websiteRow', !!website && allowed.includes('website'));
    showRow('fortniteRow', !!fortnite && allowed.includes('fortnite'));
    showRow('robloxRow', !!roblox && allowed.includes('roblox'));
    showRow('psnRow', !!psn && allowed.includes('psn'));
    showRow('notesRow', !!notes && allowed.includes('notes'));

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
    if (fortnite) {
        const el = document.getElementById('contactFortnite');
        el.textContent = fortnite;
        el.href = 'https://fortnitetracker.com/profile/all/' + encodeURIComponent(fortnite);
    }
    if (roblox) {
        const el = document.getElementById('contactRoblox');
        el.textContent = roblox;
        el.href = 'https://www.roblox.com/users/profile?username=' + encodeURIComponent(roblox);
    }
    if (psn) {
        const el = document.getElementById('contactPsn');
        el.textContent = psn;
        el.href = 'https://psnprofiles.com/' + encodeURIComponent(psn);
    }
    if (notes) {
        document.getElementById('contactNotes').textContent = notes;
    }
}

function submitGuest(event) {
    event.preventDefault();
    var name = document.getElementById('guestName').value.trim();
    if (!name) return;
    var data = {
        name: name,
        phone: document.getElementById('guestPhone').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        fortnite: document.getElementById('guestFortnite').value.trim(),
        roblox: document.getElementById('guestRoblox').value.trim(),
        psn: document.getElementById('guestPsn').value.trim(),
        notes: document.getElementById('guestNotes').value.trim()
    };
    var msg = document.getElementById('guestMessage');
    msg.textContent = '';
    msg.className = 'message';
    fetch('/api/guests', {
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
            document.getElementById('guestForm').style.display = 'none';
        } else {
            msg.textContent = result.message;
            msg.classList.add('error');
            msg.style.display = 'block';
        }
    })
    .catch(error => {
        msg.textContent = 'Ein Fehler ist aufgetreten.';
        msg.classList.add('error');
        msg.style.display = 'block';
    });
}

function loadGuests() {
    fetch('/api/admin/guests')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayGuests(data.guests);
        }
    });
}

function displayGuests(guests) {
    var guestsList = document.getElementById('guestsList');
    if (!guestsList) return;
    if (guests.length === 0) {
        guestsList.innerHTML = '<p style="color: #666; text-align: center;">Noch keine Gästedaten.</p>';
        return;
    }
    guestsList.innerHTML = guests.map(function(guest) {
        var details = [];
        if (guest.phone) details.push('📞 ' + guest.phone);
        if (guest.email) details.push('✉️ ' + guest.email);
        if (guest.fortnite) details.push('🎮 Fortnite: ' + guest.fortnite);
        if (guest.roblox) details.push('🧱 Roblox: ' + guest.roblox);
        if (guest.psn) details.push('🎯 PlayStation: ' + guest.psn);
        if (guest.notes) details.push('📝 ' + guest.notes);
        var detailsHtml = details.length > 0 ? details.map(function(d) { return '<div class="guest-detail">' + d + '</div>'; }).join('') : '';
        return '<div class="guest-list-item">' +
            '<div class="guest-info">' +
                '<div class="guest-name">' + guest.name + '</div>' +
                detailsHtml +
                '<div class="guest-date">' + new Date(guest.created_at).toLocaleDateString('de-DE') + '</div>' +
            '</div>' +
            '<button class="guest-delete" onclick="deleteGuest(' + guest.id + ')">Löschen</button>' +
        '</div>';
    }).join('');
}

function deleteGuest(guestId) {
    if (!confirm('Möchten Sie diesen Gast wirklich löschen?')) return;
    fetch('/admin/guests/' + guestId, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadGuests();
        }
    });
}

if (window.location.pathname === '/admin') {
    loadContacts();
    loadCodes();
    loadGuests();
}

if (window.location.pathname === '/welcome') {
    var accessLevel = sessionStorage.getItem('accessLevel');
    if (!accessLevel) {
        window.location.href = '/';
    }
    var levelLabels = { full: 'Vollzugriff', standard: 'Standard', basic: 'Basis' };
    var levelColors = { full: '#667eea', standard: '#f093fb', basic: '#4ecdc4' };
    var badge = document.getElementById('levelBadge');
    if (badge && levelLabels[accessLevel]) {
        badge.textContent = levelLabels[accessLevel];
        badge.style.background = levelColors[accessLevel];
    }
    fetch('/api/contacts')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayContactCard(data.contacts, accessLevel);
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