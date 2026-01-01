/* ================================
   ORDS API URLs
================================ */
const DASHBOARD_API_URL =
  'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/vw_expense_dashboard_base/';

const CATEGORY_API_URL =
  'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/expense_categories/';

const EXPENSE_POST_URL =
  'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/daily_expenses/';

/* store dashboard data globally */
window.dashboardItems = [];

/* ================================
   Page Load
================================ */
function loadDashboard() {
  fetch(DASHBOARD_API_URL)
    .then(response => response.json())
    .then(data => {
      window.dashboardItems = data.items || [];
      populateMonthLov(window.dashboardItems);
      renderDashboard(window.dashboardItems);
      loadExpenseCategories();
    })
    .catch(err => {
      console.error(err);
      document.getElementById('dashboard').innerHTML =
        '<p>Error loading dashboard</p>';
    });
}

/* ================================
   Month LOV
================================ */
function populateMonthLov(items) {
  const select = document.getElementById('monthSelect');
  select.innerHTML = '';

  const months = [...new Set(
    items.map(i => i.expense_month.substring(0, 7))
  )];

  if (months.length === 0) {
    const opt = document.createElement('option');
    opt.text = 'No data';
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
    ? items.filter(i => i.expense_month.startsWith(selectedMonth))
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
        Utilization: ${cat.utilization_pct}%
      </div>
    `;
  });
}

/* ================================
   Load Expense Categories
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

  const expenseMonth = expenseDate.substring(0, 7) + '-01';

  const payload = {
    expense_cat_id: catId,
    amount: amount,
    expense_date: expenseDate,
    expense_month: expenseMonth,
    notes: notes
  };

  fetch(EXPENSE_POST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) throw new Error('Insert failed');
    alert('Expense added successfully');
    document.getElementById('expenseForm').reset();
    loadDashboard();
  })
  .catch(err => {
    console.error(err);
    alert('Error adding expense');
  });
}
