/* ================================
   1. ORDS API URL
================================ */
const API_URL =
  'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/vw_expense_dashboard_base/';


/* ================================
   2. Page Load Entry Point
================================ */
function loadDashboard() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      populateMonthLov(data.items);
      renderDashboard(data.items);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('dashboard').innerHTML =
        '<p>Error loading data</p>';
    });
}


/* ================================
   3. Populate Month LOV
================================ */
function populateMonthLov(items) {
  const select = document.getElementById('monthSelect');

  // Clear existing options (VERY IMPORTANT)
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
   4. Render Dashboard Cards
================================ */
function renderDashboard(items) {
  const div = document.getElementById('dashboard');
  const selectedMonth =
    document.getElementById('monthSelect').value;

  div.innerHTML = '';

  const filteredItems = selectedMonth
    ? items.filter(i => i.expense_month.startsWith(selectedMonth))
    : items;

  if (filteredItems.length === 0) {
    div.innerHTML = '<p>No data for selected month</p>';
    return;
  }

  filteredItems.forEach(cat => {
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
