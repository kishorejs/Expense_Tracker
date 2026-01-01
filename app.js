/* ================================
   ORDS API URLs
================================ */
const DASHBOARD_API_URL =
  'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/vw_expense_dashboard_base/';

const CATEGORY_API_URL =
  'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/expense_categories/';

const EXPENSE_API_URL =
  'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/daily_expenses/';

/* store dashboard data globally */
window.dashboardItems = [];

/* ================================
   Page Load
================================ */
function loadDashboard() {
  fetch(DASHBOARD_API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Dashboard API failed');
      }
      return response.json();
    })
    .then(data => {
      console.log('Dashboard API response:', data);

      // Defensive: ensure items always exists
      const items = Array.isArray(data.items) ? data.items : [];

      // Store globally
      window.dashboardItems = items;

      // Populate Month LOV safely
      populateMonthLov(items);

      // Render dashboard safely
      renderDashboard(items);
    })
    .catch(err => {
      console.error('Dashboard load error:', err);

      // User-friendly fallback
      const dashboard = document.getElementById('dashboard');
      dashboard.innerHTML = `
        <p style="color:red;">
          Error loading dashboard. Please refresh the page.
        </p>
      `;

      // Reset month dropdown
      const monthSelect = document.getElementById('monthSelect');
      monthSelect.innerHTML = '<option value="">--</option>';
    });
}


/* ================================
   Month LOV
================================ */
function populateMonthLov(items) {
  const select = document.getElementById('monthSelect');
  select.innerHTML = '';

  const months = [
    ...new Set(
      items
        .filter(i => i.expense_month)
        .map(i => i.expense_month.substring(0, 7))
    )
  ];

  if (months.length === 0) {
    const opt = document.createElement('option');
    opt.text = 'No data';
    opt.value = '';
    select.appendChild(opt);
    return;
  }

  months.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.text = m;
    select.appendChild(opt);
  });
}


/* ================================
   Render Dashboard
================================ */
function renderDashboard(items) {
  const div = document.getElementById('dashboard');
  const selectedMonth = document.getElementById('monthSelect').value;

  div.innerHTML = '';

  const filtered = selectedMonth
    ? items.filter(
        i => i.expense_month && i.expense_month.startsWith(selectedMonth)
      )
    : items;

  if (filtered.length === 0) {
    div.innerHTML = '<p>No expenses recorded yet.</p>';
    return;
  }

  filtered.forEach(cat => {
    const color =
      cat.alert_status === 'RED' ? 'red' : 'green';

    div.innerHTML += `
      <div style="
        border-left:5px solid ${color};
        padding:10px;
        margin:10px;
      ">
        <b>${cat.category_name}</b><br>
        Budget: ₹${cat.monthly_budget}<br>
        Spent: ₹${cat.spent_amount}<br>
        Utilization: ${cat.utilization_pct}%<br><br>

        <button onclick="openEditExpense(
          ${cat.expense_cat_id},
          '${cat.expense_month.substring(0,7)}'
        )">
          Edit Expense
        </button>

        <button onclick="deleteLatestExpense(
          ${cat.expense_cat_id},
          '${cat.expense_month.substring(0,7)}'
        )">
          Delete Last Expense
        </button>
      </div>
    `;
  });
}


/* ================================
   Load Expense Categories (Dropdown)
================================ */
function loadExpenseCategories() {
  fetch(CATEGORY_API_URL)
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('expenseCategory');
      select.innerHTML = '';

      data.items.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.expense_cat_id;
        opt.text = cat.name;
        select.appendChild(opt);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Failed to load categories');
    });
}

/* ================================
   Add Expense (POST)
================================ */
function addExpense(event) {
  event.preventDefault();

  const catId = document.getElementById('expenseCategory').value;
  const amount = document.getElementById('amount').value;
  const expenseDate = document.getElementById('expenseDate').value;
  const notes = document.getElementById('notes').value;

  const expenseDateISO = expenseDate + 'T00:00:00Z';
  const expenseMonthISO = expenseDate.substring(0, 7) + '-01T00:00:00Z';
  const createdAtISO = new Date().toISOString(); // system date/time

  const payload = {
    expense_cat_id: catId,
    amount: amount,
    expense_date: expenseDateISO,
    expense_month: expenseMonthISO,
    notes: notes,
    created_at: createdAtISO
  };

  fetch(EXPENSE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(t => {
          console.error(t);
          throw new Error('Insert failed');
        });
      }
      alert('Expense added successfully');
      document.getElementById('expenseForm').reset();
      loadDashboard();
    })
    .catch(err => {
      console.error(err);
      alert('Error adding expense');
    });
}



/* ================================
   Delete Latest Expense (POST → DELETE)
================================ */
function deleteLatestExpense(expenseCatId, month) {
  if (!confirm('Delete the latest expense for this category?')) {
    return;
  }

  const expenseMonth = month + '-01';

  // 1️⃣ Get latest expense for category & month
  fetch(
    `${EXPENSE_API_URL}?expense_cat_id=${expenseCatId}&expense_month=${expenseMonth}&orderBy=created_at:desc`
  )
    .then(response => response.json())
    .then(data => {
      if (!data.items || data.items.length === 0) {
        alert('No expense found to delete');
        return;
      }

      const expenseId = data.items[0].expense_id;

      // 2️⃣ Delete that expense
      return fetch(`${EXPENSE_API_URL}${expenseId}`, {
        method: 'DELETE'
      });
    })
    .then(response => {
      if (!response) return;
      if (!response.ok) throw new Error('Delete failed');
      alert('Expense deleted');
      loadDashboard();
    })
    .catch(err => {
      console.error(err);
      alert('Error deleting expense');
    });
}


function openEditExpense(expenseCatId, month) {
  const expenseMonth = month + '-01';

  fetch(
    `${EXPENSE_API_URL}?expense_cat_id=${expenseCatId}&expense_month=${expenseMonth}&orderBy=created_at:desc`
  )
    .then(res => res.json())
    .then(data => {
      if (!data.items || data.items.length === 0) {
        alert('No expense found to edit');
        return;
      }

      const exp = data.items[0]; // latest expense

      // Prefill form
      document.getElementById('expenseCategory').value = exp.expense_cat_id;
      document.getElementById('amount').value = exp.amount;
      document.getElementById('expenseDate').value =
        exp.expense_date.substring(0, 10);
      document.getElementById('notes').value = exp.notes || '';

      // store expense_id globally
      window.editExpenseId = exp.expense_id;

      alert('Modify the details and click "Update Expense"');
    })
    .catch(err => {
      console.error(err);
      alert('Error loading expense for edit');
    });
}


function updateExpense(event) {
  event.preventDefault();

  if (!window.editExpenseId) {
    alert('No expense selected for update');
    return;
  }

  const catId = document.getElementById('expenseCategory').value;
  const amount = document.getElementById('amount').value;
  const expenseDate = document.getElementById('expenseDate').value;
  const notes = document.getElementById('notes').value;

  const expenseDateISO = expenseDate + 'T00:00:00Z';
  const expenseMonthISO = expenseDate.substring(0, 7) + '-01T00:00:00Z';
  const createdAtISO = new Date().toISOString(); // system date/time

  const payload = {
    expense_cat_id: catId,
    amount: amount,
    expense_date: expenseDateISO,
    expense_month: expenseMonthISO,
    notes: notes,
    created_at: createdAtISO
  };

  fetch(`${EXPENSE_API_URL}${window.editExpenseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error('Update failed');
      alert('Expense updated successfully');
      window.editExpenseId = null;
      document.getElementById('expenseForm').reset();
      loadDashboard();
    })
    .catch(err => {
      console.error(err);
      alert('Error updating expense');
    });
}

