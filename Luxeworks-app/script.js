// Data structures using LocalStorage (for local testing fallback)
let members = JSON.parse(localStorage.getItem('members')) || [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
];
let trainers = JSON.parse(localStorage.getItem('trainers')) || [
    { id: 1, name: 'Trainer A' }
];
let workoutPlans = JSON.parse(localStorage.getItem('workoutPlans')) || [
    { id: 1, name: 'Strength Training', memberId: 1, trainerId: 1, exercises: [{ name: 'Squats', sets: 3, reps: 12 }], logs: [] }
];
let completions = JSON.parse(localStorage.getItem('completions')) || [];
let trainerAvailability = JSON.parse(localStorage.getItem('trainerAvailability')) || [];
let bookedSessions = JSON.parse(localStorage.getItem('bookedSessions')) || [];
let campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];

// Simulated current user (for testing without full auth)
let currentUser = { id: 1, role: 'admin' }; // Adjust as needed for testing

// Save data to LocalStorage (for local fallback)
function saveData() {
    localStorage.setItem('members', JSON.stringify(members));
    localStorage.setItem('trainers', JSON.stringify(trainers));
    localStorage.setItem('workoutPlans', JSON.stringify(workoutPlans));
    localStorage.setItem('completions', JSON.stringify(completions));
    localStorage.setItem('trainerAvailability', JSON.stringify(trainerAvailability));
    localStorage.setItem('bookedSessions', JSON.stringify(bookedSessions));
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
}

// Fetch API wrapper
async function fetchAPI(url, options = {}) {
    const response = await fetch(`http://localhost:5000/api${url}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
}

// Show sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Navigation event listeners
document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showSection(btn.dataset.section);
        if (btn.dataset.section === 'marketing') renderCampaigns();
    });
});

// Tab navigation
document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).style.display = 'block';
        if (tab.dataset.tab === 'plans') renderWorkoutPlans();
        if (tab.dataset.tab === 'scheduling') {
            renderAvailability();
            renderSessions();
            populateMemberDropdown('booking-member');
            populateDayDropdown('booking-day');
        }
    });
});

// Render workout plans
function renderWorkoutPlans() {
    const list = document.getElementById('workout-plans-list');
    list.innerHTML = workoutPlans.map(plan => `
        <li>
            ${plan.name} 
            <button class="view-plan-btn" data-id="${plan.id}">View</button>
        </li>
    `).join('');
    document.querySelectorAll('.view-plan-btn').forEach(btn => {
        btn.addEventListener('click', () => showWorkoutPlanDetails(parseInt(btn.dataset.id)));
    });
}

// Show workout plan details
function showWorkoutPlanDetails(planId) {
    const plan = workoutPlans.find(p => p.id === planId);
    if (plan) {
        const member = members.find(m => m.id === plan.memberId);
        document.getElementById('plan-name').textContent = plan.name;
        document.getElementById('assigned-member').textContent = member ? member.name : 'Unassigned';
        document.getElementById('workout-plan-details').dataset.planId = planId;

        const exercisesList = document.getElementById('exercises-list');
        exercisesList.innerHTML = plan.exercises.map(ex => `<li>${ex.name} - ${ex.sets} sets x ${ex.reps} reps</li>`).join('');

        const completionTbody = document.querySelector('#completion-history tbody');
        completionTbody.innerHTML = '';
        const planCompletions = completions.filter(c => c.planId === planId).sort((a, b) => new Date(b.date) - new Date(a.date));
        if (planCompletions.length === 0) {
            completionTbody.innerHTML = '<tr><td colspan="2">No completions logged yet.</td></tr>';
        } else {
            planCompletions.forEach(completion => {
                completionTbody.innerHTML += `<tr><td>${completion.date}</td><td>${completion.notes || 'No notes'}</td></tr>`;
            });
        }

        document.getElementById('workout-plan-details').style.display = 'block';
    }
}

// Training initialization
function initializeTraining() {
    document.getElementById('log-completion-btn').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('completion-date').value = today;
        document.getElementById('completion-notes').value = '';
        document.getElementById('log-completion-form').style.display = 'block';
    });

    document.getElementById('submit-completion-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const planId = parseInt(document.getElementById('workout-plan-details').dataset.planId);
        const completion = {
            id: completions.length ? Math.max(...completions.map(c => c.id)) + 1 : 1,
            planId,
            date: document.getElementById('completion-date').value,
            notes: document.getElementById('completion-notes').value.trim()
        };
        completions.push(completion);
        saveData();
        showWorkoutPlanDetails(planId);
        document.getElementById('log-completion-form').style.display = 'none';
    });

    document.getElementById('cancel-log-btn').addEventListener('click', () => {
        document.getElementById('log-completion-form').style.display = 'none';
    });

    document.getElementById('close-details-btn').addEventListener('click', () => {
        document.getElementById('workout-plan-details').style.display = 'none';
    });
}

// Scheduling initialization
function initializeScheduling() {
    document.getElementById('set-availability-btn').addEventListener('click', () => {
        document.getElementById('set-availability-form').style.display = 'block';
    });

    document.getElementById('availability-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const day = document.getElementById('availability-day').value;
        const start = document.getElementById('start-time').value;
        const end = document.getElementById('end-time').value;
        if (start >= end) {
            alert('Start time must be before end time.');
            return;
        }
        trainerAvailability.push({ day, start, end });
        saveData();
        renderAvailability();
        document.getElementById('set-availability-form').style.display = 'none';
    });

    document.getElementById('cancel-availability-btn').addEventListener('click', () => {
        document.getElementById('set-availability-form').style.display = 'none';
    });

    document.getElementById('booking-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const memberId = parseInt(document.getElementById('booking-member').value);
        const day = document.getElementById('booking-day').value;
        const time = document.getElementById('booking-time').value;
        if (isSlotBooked(day, time)) {
            alert('This slot is already booked.');
            return;
        }
        bookedSessions.push({ memberId, day, time });
        saveData();
        renderSessions();
        alert('Session booked successfully!');
    });

    document.getElementById('booking-day').addEventListener('change', function() {
        populateTimeDropdown('booking-time', this.value);
    });
}

// Render availability
function renderAvailability() {
    const tbody = document.querySelector('#availability-table tbody');
    tbody.innerHTML = trainerAvailability.map((slot, index) => `
        <tr>
            <td>${slot.day}</td>
            <td>${slot.start}</td>
            <td>${slot.end}</td>
            <td><button class="delete-availability" data-index="${index}">Delete</button></td>
        </tr>
    `).join('');
    document.querySelectorAll('.delete-availability').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            trainerAvailability.splice(index, 1);
            saveData();
            renderAvailability();
        });
    });
}

// Render booked sessions
function renderSessions() {
    const tbody = document.querySelector('#sessions-table tbody');
    tbody.innerHTML = bookedSessions.map((session, index) => {
        const member = members.find(m => m.id === session.memberId);
        return `
            <tr>
                <td>${member ? member.name : 'Unknown'}</td>
                <td>${session.day}</td>
                <td>${session.time}</td>
                <td><button class="cancel-session" data-index="${index}">Cancel</button></td>
            </tr>
        `;
    }).join('');
    document.querySelectorAll('.cancel-session').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            bookedSessions.splice(index, 1);
            saveData();
            renderSessions();
        });
    });
}

// Populate dropdowns
function populateMemberDropdown(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
}

function populateDayDropdown(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        .map(day => `<option value="${day}">${day}</option>`).join('');
}

function populateTimeDropdown(selectId, day) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';
    const availableSlots = trainerAvailability.filter(slot => slot.day === day);
    if (availableSlots.length === 0) {
        select.innerHTML = '<option>No slots available</option>';
        return;
    }
    availableSlots.forEach(slot => {
        const bookedTimes = bookedSessions.filter(s => s.day === day && s.time >= slot.start && s.time < slot.end);
        const startTime = new Date(`1970-01-01T${slot.start}:00`);
        const endTime = new Date(`1970-01-01T${slot.end}:00`);
        while (startTime < endTime) {
            const timeStr = startTime.toTimeString().slice(0, 5);
            if (!bookedTimes.some(b => b.time === timeStr)) {
                select.innerHTML += `<option value="${timeStr}">${timeStr}</option>`;
            }
            startTime.setMinutes(startTime.getMinutes() + 30);
        }
    });
}

// Check for double-booking
function isSlotBooked(day, time) {
    return bookedSessions.some(s => s.day === day && s.time === time);
}

// Render Admin Dashboard
async function renderAdminDashboard() {
    try {
        const metrics = await fetchAPI('/dashboard');
        document.getElementById('admin-active-members').textContent = metrics.activeMembers;
        document.getElementById('admin-total-revenue').textContent = metrics.totalRevenue.toFixed(2);
        document.getElementById('admin-quick-stat').textContent = metrics.quickStat;
        document.getElementById('admin-trainer-utilization').innerHTML = metrics.trainerUtilization
            .map(t => `<li>Trainer ${t.trainerId}: ${t.bookings} bookings</li>`).join('');
    } catch (err) {
        document.querySelector('#dashboard .metrics').innerHTML = '<p>Failed to load metrics.</p>';
    }
}

// Render Trainer Dashboard
async function renderTrainerDashboard() {
    try {
        const metrics = await fetchAPI('/dashboard');
        document.getElementById('trainer-assigned-members').textContent = metrics.assignedMembers;
        document.getElementById('trainer-engagement').textContent = metrics.memberEngagement;
        document.getElementById('trainer-quick-stat').textContent = metrics.quickStat;
        document.getElementById('trainer-upcoming-sessions').innerHTML = metrics.upcomingSessions
            .map(s => `<li>${new Date(s.date).toLocaleDateString()} - Member ${s.memberId}</li>`).join('');
        renderMyMembers();
    } catch (err) {
        document.querySelector('#trainer-dashboard .metrics').innerHTML = '<p>Failed to load metrics.</p>';
    }
}

// Render Member Dashboard
async function renderMemberDashboard() {
    try {
        const metrics = await fetchAPI('/dashboard');
        document.getElementById('member-sessions-attended').textContent = metrics.sessionsAttended;
        document.getElementById('member-active-plans').textContent = metrics.activePlans;
        document.getElementById('member-streak').textContent = metrics.streak;
        document.getElementById('member-quick-stat').textContent = metrics.quickStat;
        document.getElementById('member-action').innerHTML = `<button onclick="showSection('training')">${metrics.action}</button>`;
        renderMyPlans();
    } catch (err) {
        document.querySelector('#member-dashboard .metrics').innerHTML = '<p>Failed to load metrics.</p>';
    }
}

// Render Member Dashboard - My Plans with Analytics
async function renderMyPlans() {
    try {
        const plans = await fetchAPI('/workout-plans');
        const myPlansDiv = document.getElementById('my-plans');
        myPlansDiv.innerHTML = await Promise.all(plans.map(async plan => {
            const analytics = await fetchAPI(`/workout-plans/${plan._id}/analytics`);
            return `
                <div class="plan">
                    <h3>${plan.name}</h3>
                    <p>Trainer: ${plan.trainerId.username}</p>
                    <p>Exercises: ${plan.exercises.map(e => `${e.name} (${e.sets}x${e.reps})`).join(', ')}</p>
                    <h4>Progress Analytics</h4>
                    <div class="progress-bar" style="width: ${analytics.completionRate}%;">${analytics.completionRate}% Complete</div>
                    <p>Weekly Frequency: ${analytics.frequency} workouts/week</p>
                    <p>Streak: ${analytics.streak} days</p>
                    <p>Tip: ${analytics.tip}</p>
                    <h4>Workout Logs</h4>
                    <ul>
                        ${plan.logs.length ? plan.logs.map(log => `
                            <li>${new Date(log.date).toLocaleDateString()} - ${log.completed ? 'Completed' : 'Not Completed'} ${log.notes ? `- ${log.notes}` : ''}</li>
                        `).join('') : '<li>No logs yet</li>'}
                    </ul>
                    <button class="log-workout-btn" data-id="${plan._id}">Log Workout</button>
                    <div class="log-form" id="log-form-${plan._id}" style="display: none;">
                        <form class="workout-log-form" data-id="${plan._id}">
                            <label>Date: <input type="date" name="date" required></label><br>
                            <label>Completed: <input type="checkbox" name="completed"></label><br>
                            <label>Notes: <textarea name="notes"></textarea></label><br>
                            <button type="submit">Save Log</button>
                            <button type="button" class="cancel-log">Cancel</button>
                        </form>
                    </div>
                </div>
            `;
        })).then(html => html.join(''));

        document.querySelectorAll('.log-workout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const planId = btn.dataset.id;
                document.getElementById(`log-form-${planId}`).style.display = 'block';
            });
        });

        document.querySelectorAll('.workout-log-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const planId = form.dataset.id;
                const formData = new FormData(form);
                const logData = {
                    date: formData.get('date'),
                    completed: formData.get('completed') === 'on',
                    notes: formData.get('notes'),
                };
                try {
                    await fetchAPI(`/workout-plans/${planId}/log`, {
                        method: 'POST',
                        body: JSON.stringify(logData),
                    });
                    alert('Workout logged successfully!');
                    renderMyPlans();
                } catch (err) {
                    alert('Failed to log workout.');
                }
            });
        });

        document.querySelectorAll('.cancel-log').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.log-form').style.display = 'none';
            });
        });
    } catch (err) {
        document.getElementById('my-plans').innerHTML = '<p>Failed to load plans.</p>';
    }
}

// Render Trainer Dashboard - My Members with Analytics
async function renderMyMembers() {
    try {
        const plans = await fetchAPI('/workout-plans');
        const myMembersDiv = document.getElementById('my-members');
        myMembersDiv.innerHTML = await Promise.all(plans.map(async plan => {
            const analytics = await fetchAPI(`/workout-plans/${plan._id}/analytics`);
            return `
                <div class="plan">
                    <h3>${plan.name}</h3>
                    <p>Member: ${plan.memberId.name}</p>
                    <p>Exercises: ${plan.exercises.map(e => `${e.name} (${e.sets}x${e.reps})`).join(', ')}</p>
                    <h4>Member Progress</h4>
                    <div class="progress-bar" style="width: ${analytics.completionRate}%;">${analytics.completionRate}% Complete</div>
                    <p>Weekly Frequency: ${analytics.frequency} workouts/week</p>
                    <p>Engagement Score: ${analytics.engagementScore}/100</p>
                    <h4>Workout Logs</h4>
                    <ul>
                        ${plan.logs.length ? plan.logs.map(log => `
                            <li>${new Date(log.date).toLocaleDateString()} - ${log.completed ? 'Completed' : 'Not Completed'} ${log.notes ? `- ${log.notes}` : ''}</li>
                        `).join('') : '<li>No logs yet</li>'}
                    </ul>
                </div>
            `;
        })).then(html => html.join(''));
    } catch (err) {
        document.getElementById('my-members').innerHTML = '<p>Failed to load members.</p>';
    }
}

// Render Marketing Campaigns
async function renderCampaigns() {
    try {
        const campaigns = await fetchAPI('/campaigns');
        const tbody = document.querySelector('#campaigns-table tbody');
        tbody.innerHTML = campaigns.map(campaign => `
            <tr>
                <td>${campaign.title}</td>
                <td>${campaign.targetAudience}</td>
                <td>${new Date(campaign.startDate).toLocaleDateString()}</td>
                <td>${new Date(campaign.endDate).toLocaleDateString()}</td>
                <td>${campaign.status}</td>
                <td>
                    <button class="edit-campaign-btn" data-id="${campaign._id}">Edit</button>
                    <button class="delete-campaign-btn" data-id="${campaign._id}">Delete</button>
                    <button class="analytics-campaign-btn" data-id="${campaign._id}">Analytics</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.edit-campaign-btn').forEach(btn => {
            btn.addEventListener('click', () => editCampaign(btn.dataset.id));
        });

        document.querySelectorAll('.delete-campaign-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteCampaign(btn.dataset.id));
        });

        document.querySelectorAll('.analytics-campaign-btn').forEach(btn => {
            btn.addEventListener('click', () => showCampaignAnalytics(btn.dataset.id));
        });
    } catch (err) {
        document.querySelector('#campaigns-table tbody').innerHTML = '<tr><td colspan="6">Failed to load campaigns.</td></tr>';
    }
}

// Initialize Marketing Section
function initializeMarketing() {
    // Create Campaign
    document.getElementById('create-campaign-btn').addEventListener('click', () => {
        document.getElementById('campaign-form').reset();
        document.getElementById('create-campaign-form').style.display = 'block';
    });

    document.getElementById('campaign-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const campaignData = {
            title: formData.get('title'),
            description: formData.get('description'),
            targetAudience: formData.get('targetAudience'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            status: formData.get('status'),
        };
        try {
            await fetchAPI('/campaigns', {
                method: 'POST',
                body: JSON.stringify(campaignData),
            });
            alert('Campaign created successfully!');
            document.getElementById('create-campaign-form').style.display = 'none';
            renderCampaigns();
        } catch (err) {
            alert('Failed to create campaign.');
        }
    });

    document.getElementById('cancel-campaign-btn').addEventListener('click', () => {
        document.getElementById('create-campaign-form').style.display = 'none';
    });

    // Edit Campaign
    document.getElementById('edit-campaign-form-inner').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const campaignData = {
            title: formData.get('title'),
            description: formData.get('description'),
            targetAudience: formData.get('targetAudience'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            status: formData.get('status'),
        };
        const campaignId = document.getElementById('edit-campaign-id').value;
        try {
            await fetchAPI(`/campaigns/${campaignId}`, {
                method: 'PUT',
                body: JSON.stringify(campaignData),
            });
            alert('Campaign updated successfully!');
            document.getElementById('edit-campaign-form').style.display = 'none';
            renderCampaigns();
        } catch (err) {
            alert('Failed to update campaign.');
        }
    });

    document.getElementById('cancel-edit-campaign-btn').addEventListener('click', () => {
        document.getElementById('edit-campaign-form').style.display = 'none';
    });
}

// Edit Campaign
async function editCampaign(id) {
    try {
        const campaign = await fetchAPI(`/campaigns/${id}`);
        document.getElementById('edit-campaign-id').value = campaign._id;
        document.getElementById('edit-campaign-title').value = campaign.title;
        document.getElementById('edit-campaign-description').value = campaign.description || '';
        document.getElementById('edit-campaign-audience').value = campaign.targetAudience;
        document.getElementById('edit-campaign-start').value = new Date(campaign.startDate).toISOString().split('T')[0];
        document.getElementById('edit-campaign-end').value = new Date(campaign.endDate).toISOString().split('T')[0];
        document.getElementById('edit-campaign-status').value = campaign.status;
        document.getElementById('edit-campaign-form').style.display = 'block';
    } catch (err) {
        alert('Failed to load campaign for editing.');
    }
}

// Delete Campaign
async function deleteCampaign(id) {
    if (confirm('Are you sure you want to delete this campaign?')) {
        try {
            await fetchAPI(`/campaigns/${id}`, { method: 'DELETE' });
            alert('Campaign deleted successfully!');
            renderCampaigns();
        } catch (err) {
            alert('Failed to delete campaign.');
        }
    }
}

// Show Campaign Analytics
async function showCampaignAnalytics(id) {
    try {
        const analytics = await fetchAPI(`/campaigns/${id}/analytics`);
        document.getElementById('campaign-reach').textContent = analytics.reach;
        document.getElementById('campaign-engagement').textContent = analytics.engagement.workoutLogs + analytics.engagement.bookings;
        document.getElementById('campaign-workouts').textContent = analytics.engagement.workoutLogs;
        document.getElementById('campaign-bookings').textContent = analytics.engagement.bookings;
        document.getElementById('campaign-rate').textContent = analytics.engagementRate;
        document.getElementById('campaign-tip').textContent = analytics.tip;
        document.getElementById('campaign-analytics').style.display = 'block';
    } catch (err) {
        document.getElementById('campaign-analytics').innerHTML = '<p>Failed to load analytics.</p>';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeTraining();
    initializeScheduling();
    initializeMarketing();
    renderWorkoutPlans();
    if (currentUser.role === 'admin') {
        showSection('dashboard');
        renderAdminDashboard();
    } else if (currentUser.role === 'trainer') {
        showSection('trainer-dashboard');
        renderTrainerDashboard();
    } else if (currentUser.role === 'member') {
        showSection('member-dashboard');
        renderMemberDashboard();
    }
});