// Habit Tracker Frontend
(function() {
  'use strict';

  const API = '';  // Same origin
  let habits = [];
  let categories = [];
  let streakData = {};
  let activeCategory = 'all';
  let confirmCallback = null;

  // --- Helpers ---
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function formatDateDisplay(dateStr) {
    const [y,m,d] = dateStr.split('-');
    const date = new Date(Number(y), Number(m)-1, Number(d));
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function dayNames() { return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; }

  // --- API Calls ---
  async function api(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    if (res.status === 204) return null;
    return res.json();
  }

  async function loadHabits() {
    habits = await api('GET', '/api/habits');
    return habits;
  }

  async function loadCategories() {
    categories = await api('GET', '/api/categories');
    return categories;
  }

  async function loadStreaks() {
    streakData = {};
    for (const habit of habits) {
      streakData[habit.id] = await api('GET', `/api/habits/${habit.id}/streaks`);
    }
  }

  async function toggleCheckin(habitId) {
    const result = await api('POST', '/api/checkins', { habitId, date: todayStr() });
    return result;
  }

  // --- Rendering ---
  function renderHeader() {
    const today = new Date();
    document.getElementById('header-date').textContent =
      today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  async function renderStats() {
    const weekly = await api('GET', '/api/stats/weekly');
    const todayData = weekly.days.find(d => d.date === todayStr());

    document.getElementById('stat-today').textContent = todayData ? todayData.completed : 0;
    document.getElementById('stat-total').textContent = habits.length;
    document.getElementById('stat-rate').textContent = weekly.overallRate + '%';

    // Best streak across all habits
    let bestStreak = 0;
    for (const hid in streakData) {
      if (streakData[hid].longestStreak > bestStreak) {
        bestStreak = streakData[hid].longestStreak;
      }
    }
    document.getElementById('stat-best-streak').textContent = bestStreak;
  }

  function renderCategoryTabs() {
    const container = document.getElementById('category-tabs');
    container.innerHTML = '<button class="category-tab ' + (activeCategory === 'all' ? 'active' : '') +
      '" data-category="all">All</button>';

    for (const cat of categories) {
      const active = activeCategory === cat.id ? 'active' : '';
      container.innerHTML += `<button class="category-tab ${active}" data-category="${cat.id}">${cat.emoji || ''} ${cat.name}</button>`;
    }

    // Add manage categories button
    container.innerHTML += '<button class="category-tab" id="manage-categories-btn" style="border-style:dashed;">\u2699\uFE0F Manage</button>';

    // Bind tab clicks
    container.querySelectorAll('.category-tab').forEach(tab => {
      if (tab.id === 'manage-categories-btn') {
        tab.addEventListener('click', openCategoryModal);
      } else {
        tab.addEventListener('click', () => {
          activeCategory = tab.dataset.category;
          renderCategoryTabs();
          renderHabits();
        });
      }
    });
  }

  function openCategoryModal() {
    document.getElementById('category-modal').classList.add('active');
    renderCategoryList();
  }

  function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
  }

  function renderCategoryList() {
    const list = document.getElementById('category-list');
    if (categories.length === 0) {
      list.innerHTML = '<p style="color:#636e72;font-size:0.9rem;">No categories yet</p>';
      return;
    }
    list.innerHTML = categories.map(cat => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #dfe6e9;">
        <span>${cat.emoji || '\uD83D\uDCC1'} ${cat.name}</span>
        <button class="btn btn-secondary" style="padding:4px 12px;font-size:0.8rem;" onclick="deleteCategoryById('${cat.id}')">Delete</button>
      </div>
    `).join('');
  }

  window.deleteCategoryById = async function(id) {
    await api('DELETE', `/api/categories/${id}`);
    await loadCategories();
    renderCategoryList();
    renderCategoryTabs();
    await renderHabits();
  };

  async function renderHabits() {
    const grid = document.getElementById('habits-grid');
    const emptyState = document.getElementById('empty-state');

    // Get today's checkin state for each habit
    const today = todayStr();
    const checkinStates = {};
    for (const habit of habits) {
      const checkins = await api('GET', `/api/checkins/${habit.id}`);
      checkinStates[habit.id] = checkins.some(c => c.date === today);
    }

    // Filter by category
    let filtered = habits;
    if (activeCategory !== 'all') {
      filtered = habits.filter(h => h.categoryId === activeCategory);
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = filtered.map(habit => {
      const isChecked = checkinStates[habit.id];
      const streak = streakData[habit.id] || { currentStreak: 0, longestStreak: 0, completionRate: 0 };
      const streakFire = streak.currentStreak > 0 ? '\uD83D\uDD25' : '';

      return `
        <div class="habit-card ${isChecked ? 'checked' : ''}" data-id="${habit.id}" style="border-left-color: ${habit.color}">
          <div class="habit-actions">
            <button class="edit-btn" onclick="event.stopPropagation(); editHabit('${habit.id}')" title="Edit">\u270F\uFE0F</button>
            <button onclick="event.stopPropagation(); deleteHabit('${habit.id}', '${habit.name.replace(/'/g, "\\'")}')" title="Delete">\uD83D\uDDD1\uFE0F</button>
          </div>
          <div class="habit-header">
            <span class="habit-emoji">${habit.emoji || '\uD83C\uDFAF'}</span>
            <div class="habit-info">
              <div class="habit-name">${habit.name}</div>
              <div class="habit-frequency">${habit.frequency}</div>
            </div>
            <div class="habit-check">${isChecked ? '\u2713' : ''}</div>
          </div>
          <div class="streak-info">
            <span class="streak-badge streak-current">${streakFire} ${streak.currentStreak} day${streak.currentStreak !== 1 ? 's' : ''}</span>
            <span class="streak-badge streak-best">\uD83C\uDFC6 ${streak.longestStreak}</span>
            <span class="streak-badge streak-rate">${streak.completionRate}%</span>
          </div>
        </div>
      `;
    }).join('');

    // Bind card clicks for toggling
    grid.querySelectorAll('.habit-card').forEach(card => {
      card.addEventListener('click', async () => {
        const id = card.dataset.id;
        await toggleCheckin(id);
        // Reload streaks for this habit
        streakData[id] = await api('GET', `/api/habits/${id}/streaks`);
        await renderHabits();
        await renderStats();
        await renderHeatmap();
      });
    });
  }

  async function renderHeatmap() {
    const container = document.getElementById('heatmap-grid');

    if (habits.length === 0) {
      container.innerHTML = '<p style="color:#636e72;font-size:0.9rem;">Add habits to see your activity map</p>';
      return;
    }

    // Aggregate heatmap: a day is "done" if all habits were completed
    const today = todayStr();
    const allCheckins = {};
    for (const habit of habits) {
      const checkins = await api('GET', `/api/checkins/${habit.id}`);
      checkins.forEach(c => {
        if (!allCheckins[c.date]) allCheckins[c.date] = 0;
        allCheckins[c.date]++;
      });
    }

    // Last 7 weeks
    const days = dayNames();
    let html = days.map(d => `<div class="heatmap-label">${d}</div>`).join('');

    for (let i = 48; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const count = allCheckins[dateStr] || 0;
      const isDone = count > 0;
      const isToday = dateStr === today;
      const pct = habits.length > 0 ? Math.round((count / habits.length) * 100) : 0;

      let colorClass = isDone ? 'done' : 'missed';
      let style = '';
      if (isDone && pct < 100) {
        // Partial: lighter green
        const opacity = 0.3 + (pct / 100) * 0.7;
        style = `background: rgba(0,184,148,${opacity})`;
        colorClass = '';
      }

      html += `<div class="heatmap-cell ${colorClass} ${isToday ? 'today' : ''}" style="${style}">
        <span class="tooltip">${formatDateDisplay(dateStr)}: ${count}/${habits.length} (${pct}%)</span>
      </div>`;
    }

    container.innerHTML = html;
  }

  async function renderProgressChart() {
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const monthly = await api('GET', '/api/stats/monthly');
    const days = monthly.days;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (habits.length === 0) {
      ctx.fillStyle = '#636e72';
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Add habits to see progress chart', width / 2, height / 2);
      return;
    }

    // Draw chart
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#636e72';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((100 - i * 25) + '%', padding.left - 8, y + 4);
    }

    // Data line
    const rates = days.map(d => d.rate);
    const stepX = chartW / (rates.length - 1);

    // Area fill
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    rates.forEach((rate, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (rate / 100) * chartH;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + (rates.length - 1) * stepX, padding.top + chartH);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(108, 92, 231, 0.3)');
    gradient.addColorStop(1, 'rgba(108, 92, 231, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    rates.forEach((rate, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (rate / 100) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots on data points (every 5th)
    rates.forEach((rate, i) => {
      if (i % 5 === 0 || i === rates.length - 1) {
        const x = padding.left + i * stepX;
        const y = padding.top + chartH - (rate / 100) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#6c5ce7';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // X-axis labels
    ctx.fillStyle = '#636e72';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < days.length; i += 7) {
      const x = padding.left + i * stepX;
      const date = days[i].date;
      const parts = date.split('-');
      ctx.fillText(`${parts[1]}/${parts[2]}`, x, height - 8);
    }
  }

  // --- Modal ---
  function openModal(habit) {
    const modal = document.getElementById('habit-modal');
    const title = document.getElementById('modal-title');
    const idInput = document.getElementById('habit-id');
    const nameInput = document.getElementById('habit-name');
    const freqInput = document.getElementById('habit-frequency');
    const catSelect = document.getElementById('habit-category');

    if (habit) {
      title.textContent = 'Edit Habit';
      idInput.value = habit.id;
      nameInput.value = habit.name;
      freqInput.value = habit.frequency;
    } else {
      title.textContent = 'New Habit';
      idInput.value = '';
      nameInput.value = '';
      freqInput.value = 'daily';
    }

    // Populate category select
    catSelect.innerHTML = '<option value="">No Category</option>';
    categories.forEach(cat => {
      const selected = habit && habit.categoryId === cat.id ? 'selected' : '';
      catSelect.innerHTML += `<option value="${cat.id}" ${selected}>${cat.emoji || ''} ${cat.name}</option>`;
    });

    // Set color
    const color = habit ? habit.color : '#6c5ce7';
    document.querySelectorAll('.color-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.color === color);
    });

    // Set emoji
    const emoji = habit ? habit.emoji : '\uD83C\uDFAF';
    document.querySelectorAll('.emoji-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.emoji === emoji);
    });

    modal.classList.add('active');
    nameInput.focus();
  }

  function closeModal() {
    document.getElementById('habit-modal').classList.remove('active');
  }

  async function saveHabit() {
    const id = document.getElementById('habit-id').value;
    const name = document.getElementById('habit-name').value.trim();
    const frequency = document.getElementById('habit-frequency').value;
    const categoryId = document.getElementById('habit-category').value || null;
    const color = document.querySelector('.color-option.selected')?.dataset.color || '#6c5ce7';
    const emoji = document.querySelector('.emoji-option.selected')?.dataset.emoji || '\uD83C\uDFAF';

    if (!name) {
      alert('Please enter a habit name');
      return;
    }

    if (id) {
      await api('PUT', `/api/habits/${id}`, { name, frequency, color, emoji, categoryId });
    } else {
      await api('POST', '/api/habits', { name, frequency, color, emoji, categoryId });
    }

    closeModal();
    await refreshAll();
  }

  // --- Confirm Dialog ---
  function showConfirm(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-dialog').classList.add('active');
    confirmCallback = callback;
  }

  function closeConfirm() {
    document.getElementById('confirm-dialog').classList.remove('active');
    confirmCallback = null;
  }

  // --- Global functions for inline handlers ---
  window.editHabit = function(id) {
    const habit = habits.find(h => h.id === id);
    if (habit) openModal(habit);
  };

  window.deleteHabit = function(id, name) {
    showConfirm(`Delete "${name}"? This cannot be undone.`, async () => {
      await api('DELETE', `/api/habits/${id}`);
      closeConfirm();
      await refreshAll();
    });
  };

  // --- Refresh all data ---
  async function refreshAll() {
    await loadHabits();
    await loadCategories();
    await loadStreaks();
    renderCategoryTabs();
    await renderHabits();
    await renderStats();
    await renderHeatmap();
    await renderProgressChart();
  }

  // --- Event Listeners ---
  function bindEvents() {
    // Add habit button
    document.getElementById('add-habit-btn').addEventListener('click', () => openModal(null));

    // Modal save/cancel
    document.getElementById('modal-save').addEventListener('click', saveHabit);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);

    // Color picker
    document.getElementById('color-picker').addEventListener('click', (e) => {
      const opt = e.target.closest('.color-option');
      if (opt) {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      }
    });

    // Emoji picker
    document.getElementById('emoji-picker').addEventListener('click', (e) => {
      const opt = e.target.closest('.emoji-option');
      if (opt) {
        document.querySelectorAll('.emoji-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      }
    });

    // Confirm dialog
    document.getElementById('confirm-ok').addEventListener('click', () => {
      if (confirmCallback) confirmCallback();
    });
    document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);

    // Category management
    document.getElementById('add-category-btn').addEventListener('click', async () => {
      const name = document.getElementById('new-category-name').value.trim();
      if (!name) return;
      await api('POST', '/api/categories', { name });
      document.getElementById('new-category-name').value = '';
      await loadCategories();
      renderCategoryList();
      renderCategoryTabs();
    });
    document.getElementById('category-modal-close').addEventListener('click', closeCategoryModal);
    document.getElementById('new-category-name').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') document.getElementById('add-category-btn').click();
    });

    // Close modals on overlay click
    document.getElementById('habit-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('habit-modal')) closeModal();
    });
    document.getElementById('confirm-dialog').addEventListener('click', (e) => {
      if (e.target === document.getElementById('confirm-dialog')) closeConfirm();
    });
    document.getElementById('category-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('category-modal')) closeCategoryModal();
    });

    // Enter key in modal
    document.getElementById('habit-name').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') saveHabit();
    });

    // Resize chart
    window.addEventListener('resize', () => renderProgressChart());
  }

  // --- Init ---
  async function init() {
    renderHeader();
    bindEvents();
    await refreshAll();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
