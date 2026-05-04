const STORE_KEYS = {
    MEMBERS: 'magae_members',
    PAYMENTS: 'magae_payments',
    CLAIMS: 'magae_claims',
    SESSION: 'magaye_session',
    TEMP_DEPS: 'magaye_temp_deps'
};

let tempDependants = [];

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : window.location.origin + '/api';

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (response.ok) return await response.json();
        const errData = await response.json();
        return { error: errData.error || 'Server error' };
    } catch (e) {
        return { error: 'Connection failed' };
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

const pricingData = {
    BASIC: {
        '18-64': { 'Principal Only': 100, 'Principal + Spouse': 130, 'Principal + 5': 250 },
        '65-74': { 'Principal Only': 155, 'Principal + Spouse': 190, 'Principal + 5': 360 },
        '75-84': { 'Principal Only': 230, 'Principal + Spouse': 310 },
        '84+': { 'Principal Only': 450 }
    },
    STANDARD: {
        '18-64': { 'Principal Only': 150, 'Principal + Spouse': 170, 'Principal + 5': 275 },
        '65-74': { 'Principal Only': 180, 'Principal + Spouse': 230, 'Principal + 5': 400 },
        '75-84': { 'Principal Only': 260, 'Principal + Spouse': 350 }
    },
    HERITAGE: {
        '18-64': { 'Principal Only': 250, 'Principal + Spouse': 280, 'Principal + 5': 320 },
        '65-74': { 'Principal Only': 280, 'Principal + Spouse': 310, 'Principal + 5': 470 },
        '75-84': { 'Principal Only': 310, 'Principal + Spouse': 380 }
    }
};

// Initial Data Helper
async function initData() {
    const members = await apiRequest('/members');
    if (members && members.length === 0) {
        // Seed database if empty
        const sampleMembers = [
            { id: '8501015000081', firstName: 'Sipho', lastName: 'Mabuza', phone: '0712345678', plan: 'HERITAGE', type: 'Principal Only', status: 'Active', joinDate: '2025-10-12', premium: 250 },
            { id: '9205125111082', firstName: 'Lerato', lastName: 'Khumalo', phone: '0823456789', plan: 'STANDARD', type: 'Principal + Spouse', status: 'Waiting', joinDate: '2026-02-15', premium: 170 },
            { id: '7008245222083', firstName: 'Nomvula', lastName: 'Dlamini', phone: '0634567890', plan: 'BASIC', type: 'Principal Only', status: 'Active', joinDate: '2024-05-20', premium: 155 }
        ];
        for (const m of sampleMembers) {
            await apiRequest('/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(m)
            });
        }
    }
}

function checkStaffAuth() {
    // Only protect admin pages
    const adminPages = ['index.html', 'directory.html', 'payments.html', 'claims.html', 'plans.html', 'registration.html', 'member_details.html'];
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    if (adminPages.includes(currentPath)) {
        const isStaff = localStorage.getItem('magaye_staff_session');
        if (!isStaff) {
            window.location.href = 'staff_login.html';
        }
    }
}

function staffLogout() {
    localStorage.removeItem('magaye_staff_session');
    window.location.href = 'staff_login.html';
}

// Sidebar Injection
function injectSidebar() {
    const aside = document.querySelector('aside');
    if (!aside) return;

    // Inject mobile overlay and toggle if inside dashboard-grid
    if (document.querySelector('.dashboard-grid')) {
        let overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = () => {
            aside.classList.remove('open');
            overlay.classList.remove('open');
        };
        document.body.appendChild(overlay);

        let toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-toggle-btn';
        toggleBtn.innerHTML = '<i data-lucide="menu" style="width: 24px; height: 24px;"></i>';
        toggleBtn.style.position = 'fixed';
        toggleBtn.style.bottom = '2rem';
        toggleBtn.style.right = '2rem';
        toggleBtn.style.background = 'var(--accent-gold)';
        toggleBtn.style.color = 'var(--bg-dark)';
        toggleBtn.style.borderRadius = '50%';
        toggleBtn.style.width = '60px';
        toggleBtn.style.height = '60px';
        toggleBtn.style.boxShadow = 'var(--shadow-md)';
        toggleBtn.style.zIndex = '1998';
        toggleBtn.onclick = () => {
            aside.classList.add('open');
            overlay.classList.add('open');
        };
        document.body.appendChild(toggleBtn);
    }

    if (document.body.id === 'custDashboard') return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    aside.innerHTML = `
        <div class="logo">
            <a href="guest.html"><img src="logo.png" alt="Magaye Funeral Home" class="logo-img"></a>
        </div>
        <nav>
            <ul>
                <li><a href="index.html" class="${currentPath === 'index.html' ? 'active' : ''}"><i data-lucide="layout-dashboard"></i> Dashboard</a></li>
                <li><a href="registration.html" class="${currentPath === 'registration.html' ? 'active' : ''}"><i data-lucide="user-plus"></i> New Registration</a></li>
                <li><a href="directory.html" class="${currentPath === 'directory.html' ? 'active' : ''}"><i data-lucide="users"></i> Member Directory</a></li>
                <li><a href="payments.html" class="${currentPath === 'payments.html' ? 'active' : ''}"><i data-lucide="credit-card"></i> Payments</a></li>
                <li><a href="claims.html" class="${currentPath === 'claims.html' ? 'active' : ''}"><i data-lucide="clipboard-list"></i> Claims</a></li>
                <li><a href="plans.html" class="${currentPath === 'plans.html' ? 'active' : ''}"><i data-lucide="package"></i> Plans & Benefits</a></li>
            </ul>
        </nav>
        <div style="margin-top: auto;">
            <nav>
                <ul>
                    <li><a href="terms.html"><i data-lucide="shield-check"></i> Terms of Service</a></li>
                    <li><a href="#" onclick="staffLogout()" style="color: var(--danger);"><i data-lucide="log-out"></i> Logout</a></li>
                </ul>
            </nav>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

// Registration Logic
let currentStep = 1;
let selectedPlan = 'BASIC';
let principalAge = 35;

function nextStep(step) {
    if (step === 2) {
        const idNum = document.getElementById('principalID').value;
        if (idNum.length >= 6) {
            const year = parseInt(idNum.substring(0, 2));
            const fullYear = year > 25 ? 1900 + year : 2000 + year;
            principalAge = new Date().getFullYear() - fullYear;
            const ageDisplay = document.getElementById('calcAge');
            if (ageDisplay) ageDisplay.innerText = principalAge;
            updatePrices();
        }
    }

    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById('step' + step);
    if (targetSection) targetSection.classList.add('active');
    
    document.querySelectorAll('.step').forEach((s, idx) => {
        if (idx + 1 < step) s.classList.add('completed');
        else s.classList.remove('completed');
        
        if (idx + 1 === step) s.classList.add('active');
        else s.classList.remove('active');
    });

    currentStep = step;
    if (step === 4) updateSummary();
}

function selectPlan(plan) {
    selectedPlan = plan;
    document.querySelectorAll('.plan-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.innerText.toUpperCase().includes(plan)) {
            opt.classList.add('selected');
        }
    });
    updatePrices();
}

function getAgeGroup(age) {
    if (age >= 18 && age <= 64) return '18-64';
    if (age >= 65 && age <= 74) return '65-74';
    if (age >= 75 && age <= 84) return '75-84';
    if (age > 84) return '84+';
    return '18-64';
}

function updatePrices() {
    const ageGroup = getAgeGroup(principalAge);
    const planTypeElem = document.getElementById('planType');
    if (!planTypeElem) return;
    const planType = planTypeElem.value;

    ['BASIC', 'STANDARD', 'HERITAGE'].forEach(plan => {
        const price = pricingData[plan][ageGroup] ? pricingData[plan][ageGroup][planType] : null;
        const elem = document.getElementById('price' + plan.charAt(0) + plan.slice(1).toLowerCase());
        if (elem) {
            elem.innerText = price ? 'R' + price : 'N/A';
        }
    });
}

function updateSummary() {
    const ageGroup = getAgeGroup(principalAge);
    const planType = document.getElementById('planType').value;
    const finalPrice = pricingData[selectedPlan][ageGroup][planType];
    
    const summaryPlan = document.getElementById('summaryPlan');
    const summaryPrice = document.getElementById('summaryPrice');
    const summaryName = document.getElementById('summaryName');
    
    if (summaryPlan) summaryPlan.innerText = selectedPlan + ' (' + planType + ')';
    if (summaryPrice) summaryPrice.innerText = 'R' + finalPrice + '.00';
    if (summaryName) summaryName.innerText = document.getElementById('firstName')?.value || 'New Member';
    
    // Update Clauses based on Plan
    const clausesList = document.getElementById('policyClauses');
    if (clausesList) {
        let clauses = [
            '6-month waiting period for natural death.',
            'Immediate accidental cover after first premium.'
        ];
        
        if (selectedPlan === 'BASIC') {
            clauses.push('Limited to 1 main member cover.');
        } else if (selectedPlan === 'STANDARD') {
            clauses.push('Covers up to 5 family dependants.');
            clauses.push('Grocery voucher valid for 3 months after claim.');
        } else if (selectedPlan === 'HERITAGE') {
            clauses.push('Accidental waiting period reduced to 3 months.');
            clauses.push('Includes full tent and 50 chair set-up.');
            clauses.push('Personalized water labels included.');
        }
        
        clausesList.innerHTML = clauses.map(c => `<li>${c}</li>`).join('');
    }
}

async function submitForm() {
    const tosCheck = document.getElementById('tosCheck');
    if (tosCheck && !tosCheck.checked) {
        alert('Please agree to the Terms of Service to activate your policy.');
        return;
    }

    const ageGroup = getAgeGroup(principalAge);
    const planType = document.getElementById('planType').value;
    const price = pricingData[selectedPlan][ageGroup][planType];

    const idFileUpload = document.getElementById('principalIDUpload')?.files[0];
    const idBase64 = idFileUpload ? await fileToBase64(idFileUpload) : null;

    const newMember = {
        id: document.getElementById('principalID').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.querySelector('input[type="tel"]').value,
        plan: selectedPlan,
        type: planType,
        status: 'Waiting',
        joinDate: new Date().toISOString().split('T')[0],
        premium: price,
        password: document.getElementById('regPassword').value,
        idUpload: idBase64,
        dependants: []
    };

    // Save to API
    const result = await apiRequest('/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
    });

    if (result && !result.error) {
        // Save temp dependants if any
        for (const dep of tempDependants) {
            await apiRequest(`/members/${newMember.id}/dependants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dep)
            });
        }
        localStorage.removeItem(STORE_KEYS.TEMP_DEPS);
        localStorage.setItem(STORE_KEYS.SESSION, JSON.stringify(newMember));
        window.location.href = 'customer_dashboard.html';
    } else {
        const msg = result ? result.error : 'Connection failed';
        if (msg === 'Member already exists') {
            alert('REGISTRATION ERROR: This ID Number is already registered. Please login instead.');
        } else {
            alert('DATABASE ERROR: ' + msg + '\n\nIf this is a connection issue:\n1. Open your terminal.\n2. Run: python app.py\n3. Keep the terminal open.');
        }
    }
}

// Customer Auth & Dashboard Logic
async function loginCustomer() {
    const idNum = document.getElementById('loginID').value;
    const pass = document.getElementById('loginPass').value;
    const user = await apiRequest(`/members/${idNum}`);

    if (user && !user.error && user.password === pass) {
        localStorage.setItem(STORE_KEYS.SESSION, JSON.stringify(user));
        window.location.href = 'customer_dashboard.html';
    } else {
        alert(user && user.error ? user.error : 'Invalid ID Number or Password.');
    }
}

function logoutCustomer() {
    localStorage.removeItem(STORE_KEYS.SESSION);
    window.location.href = 'guest.html';
}

async function loadMemberDetails() {
    const user = JSON.parse(localStorage.getItem(STORE_KEYS.SESSION));
    if (!user) {
        window.location.href = 'customer_login.html';
        return;
    }

    const member = await apiRequest(`/members/${user.id}`);
    if (member && !member.error) {
        document.getElementById('custName').innerText = member.firstName + ' ' + member.lastName;
        document.getElementById('custID').innerText = member.id;
        document.getElementById('custJoinDate').innerText = member.joinDate;
        document.getElementById('custPlan').innerText = member.plan + ' PLAN';
        document.getElementById('custType').innerText = member.type;
        document.getElementById('custPremium').innerText = 'R' + member.premium.toFixed(2);
        document.getElementById('custStatus').innerText = member.status;
        document.getElementById('custStatus').className = 'status-badge ' + (member.status === 'Active' ? 'status-active' : 'status-waiting');

        renderCustomerBenefits(member.plan);
        renderDashboardDependants(member.dependants || []);
        renderDashboardMessages(user.id, member);
    }
}

async function renderDashboardMessages(memberId, member) {
    const res = await apiRequest(`/messages/${memberId}`);
    const container = document.getElementById('dashboardMessages');
    if (!container) return;

    if (!res || res.error || !Array.isArray(res) || res.length === 0) {
        container.innerHTML = '<div class="subtitle" style="text-align: center; padding: 1rem;">No new notifications.</div>';
        return;
    }

    container.innerHTML = res.map(m => `
        <div style="background: rgba(197, 160, 89, 0.05); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid var(--accent-gold);">
            <div style="font-weight: 700; margin-bottom: 0.25rem;">${m.title}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${m.content}</div>
            <div class="flex justify-between items-center">
                <span style="font-size: 0.75rem; color: var(--text-muted);">${m.date}</span>
                ${m.title.includes('Activated') ? `
                    <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;" onclick="viewPolicyCertificate('${member.firstName} ${member.lastName}', '${member.id}', '${member.plan}', '${member.premium}', '${m.date}')">
                        <i data-lucide="download" style="width: 12px;"></i> View Certificate
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function viewPolicyCertificate(name, id, plan, premium, date) {
    const url = `active_policy.html?name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}&plan=${encodeURIComponent(plan)}&premium=${encodeURIComponent(premium)}&date=${encodeURIComponent(date)}`;
    window.open(url, '_blank');
}

async function addDependantUI() {
    const name = document.getElementById('depName').value;
    const rel = document.getElementById('depRel').value;
    const id = document.getElementById('depID').value;
    const file = document.getElementById('depIDUpload')?.files[0];

    if (!name || !rel || !id) {
        alert('Please fill all dependant fields.');
        return;
    }

    const idBase64 = file ? await fileToBase64(file) : null;
    const dep = { name, relationship: rel, idNumber: id, idUpload: idBase64 };
    
    // Check if we are in registration or dashboard
    if (document.body.id === 'custRegistration') {
        tempDependants.push(dep);
        renderTempDependants();
    } else {
        submitDependantToAPI(dep);
    }

    // Reset form
    document.getElementById('depName').value = '';
    document.getElementById('depRel').value = '';
    document.getElementById('depID').value = '';
}

function renderTempDependants() {
    const list = document.getElementById('dependentsList');
    if (!list) return;

    if (tempDependants.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem; border: 2px dashed var(--border); border-radius: 12px;">No dependants added yet.</p>`;
        return;
    }

    list.innerHTML = tempDependants.map((d, i) => `
        <div class="card" style="margin-bottom: 1rem; background: var(--surface-light); padding: 1rem;">
            <div class="flex justify-between items-center">
                <div>
                    <div style="font-weight: 600;">${d.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${d.relationship} | ${d.idNumber}</div>
                </div>
                <button type="button" class="btn btn-outline" style="padding: 0.4rem; color: var(--danger);" onclick="removeTempDep(${i})"><i data-lucide="trash-2" style="width: 16px;"></i></button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

window.removeTempDep = (i) => {
    tempDependants.splice(i, 1);
    renderTempDependants();
};

async function submitDependantToAPI(dep) {
    const user = JSON.parse(localStorage.getItem(STORE_KEYS.SESSION));
    const result = await apiRequest(`/members/${user.id}/dependants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dep)
    });

    if (result && !result.error) {
        alert('Dependant added successfully!');
        loadMemberDetails(); // Refresh
        closeDepModal();
    } else {
        alert('Error adding dependant: ' + (result ? result.error : 'Connection failed'));
    }
}

function renderDashboardDependants(deps) {
    const container = document.getElementById('dashboardDepsList');
    if (!container) return;

    if (deps.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No dependants registered on this policy.</p>`;
        return;
    }

    container.innerHTML = deps.map(d => `
        <div class="flex justify-between items-center" style="padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
            <div>
                <div style="font-weight: 500; font-size: 0.9rem;">${d.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${d.relationship}</div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${d.idNumber}</div>
        </div>
    `).join('');
}

function openDepModal() {
    const modal = document.getElementById('depModal');
    if (modal) modal.style.display = 'flex';
}

function closeDepModal() {
    const modal = document.getElementById('depModal');
    if (modal) modal.style.display = 'none';
}

function renderCustomerDashboard() {
    const user = JSON.parse(localStorage.getItem(STORE_KEYS.SESSION));
    if (!user) {
        window.location.href = 'customer_login.html';
        return;
    }

    // Populate profile info
    const elements = {
        'custName': user.firstName + ' ' + user.lastName,
        'custPlan': user.plan + ' PLAN',
        'custType': user.type,
        'custStatus': user.status,
        'custPremium': 'R' + user.premium,
        'custID': user.id,
        'custJoinDate': user.joinDate
    };

    for (const [id, val] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    }

    // Status styling
    const statusEl = document.getElementById('custStatus');
    if (statusEl) {
        statusEl.className = 'status-badge status-' + user.status.toLowerCase();
    }

    // Render benefits based on plan
    renderCustomerBenefits(user.plan);
}

async function submitDigitalClaim() {
    const user = JSON.parse(localStorage.getItem(STORE_KEYS.SESSION));
    if (!user) return;

    const deceasedName = document.getElementById('deceasedName').value;
    const reportDate = document.getElementById('claimDate').value;
    const idFile = document.getElementById('claimIDUpload')?.files[0];

    if (!deceasedName || !reportDate) {
        alert('Please fill in all fields.');
        return;
    }

    const idBase64 = idFile ? await fileToBase64(idFile) : null;

    const claimData = {
        memberId: user.id,
        deceasedName: deceasedName,
        reportDate: reportDate,
        status: 'Pending',
        idUpload: idBase64
    };

    const result = await apiRequest('/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
    });

    if (result) {
        alert('Claim submitted successfully. Our team will review it and contact you.');
        closeClaimModal();
    }
}

function openClaimModal() {
    const modal = document.getElementById('claimModal');
    if (modal) modal.style.display = 'flex';
}

function closeClaimModal() {
    const modal = document.getElementById('claimModal');
    if (modal) modal.style.display = 'none';
}

function switchDashboardTab(tab) {
    const overview = document.getElementById('overviewTab');
    const plans = document.getElementById('plansTab');
    const navLinks = document.querySelectorAll('.dashboard-nav-link');

    navLinks.forEach(l => l.classList.remove('active'));

    if (tab === 'overview') {
        overview.style.display = 'grid';
        plans.style.display = 'none';
        document.getElementById('navOverview').classList.add('active');
    } else {
        overview.style.display = 'none';
        plans.style.display = 'block';
        document.getElementById('navPlans').classList.add('active');
    }
}

function renderCustomerBenefits(plan) {
    const benefitsList = document.getElementById('benefitsList');
    if (!benefitsList) return;

    const benefits = {
        'BASIC': [
            'Collection & same-day storage',
            'Basic Plan Coffin',
            '50x B&W Funeral Programs',
            'Poster Photo & Decoration',
            'Hearse & Family Car',
            'Grave Site Décor',
            '50x Bottled Water',
            'R200 Airtime Included'
        ],
        'STANDARD': [
            'Everything in Basic Plan',
            'Gold Range Coffin Upgrade',
            '50x Full-Colour Programs',
            'Hearse & 2x Family Cars',
            '100x Bottled Water',
            'R1000 Grocery / Cash Voucher'
        ],
        'HERITAGE': [
            'Everything in Standard Plan',
            'Heritage Range Casket Upgrade',
            'Casket Spray & Upright Flowers',
            '100x Full-Colour Programs',
            'Tent & 50 Chairs Included',
            'Personalized Bottled Water'
        ]
    };

    benefitsList.innerHTML = benefits[plan].map(b => `
        <div class="benefit-item">
            <i data-lucide="check-circle" class="text-success"></i>
            <span>${b}</span>
        </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
}

// Global Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error('PWA Error:', err));
    }

    checkStaffAuth();
    await initData();
    injectSidebar();
    
    if (document.getElementById('regForm')) {
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = urlParams.get('plan');
        if (planParam && ['BASIC', 'STANDARD', 'HERITAGE'].includes(planParam.toUpperCase())) {
            selectPlan(planParam.toUpperCase());
        } else {
            selectPlan('BASIC');
        }
    }
    
    if (document.getElementById('custDashboard')) {
        renderCustomerDashboard();
    }
});

// Admin Member Management Functions
async function stopMember(id) {
    const result = await apiRequest(`/members/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Stopped' })
    });
    if (result) {
        alert('Policy Stopped');
        location.reload();
    }
}

async function freezeMember(id) {
    const result = await apiRequest(`/members/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Frozen' })
    });
    if (result) {
        alert('Policy Frozen');
        location.reload();
    }
}

async function deactivateMember(id) {
    if (!confirm('Are you sure you want to deactivate this member? They will no longer be active in the scheme.')) return;
    const result = await apiRequest(`/members/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Deactivated' })
    });
    if (result) {
        alert('Member Deactivated');
        location.reload();
    }
}

async function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
        const result = await apiRequest(`/members/${id}`, { method: 'DELETE' });
        if (result) {
            window.location.href = 'directory.html';
        }
    }
}
