const API_URL = 'https://v2mwsyt98qpxgak-demoatptraining.adb.eu-frankfurt-1.oraclecloudapps.com/ords/expense/vw_expense_dashboard';


fetch(API_URL)
.then(res => res.json())
.then(data => renderDashboard(data));


function renderDashboard(data) {
const div = document.getElementById('dashboard');
div.innerHTML = '';
data.items.forEach(cat => {
const color = cat.utilization > 80 ? 'red' : 'green';
div.innerHTML += `
<div style="border-left:5px solid ${color}; padding:10px; margin:10px">
<b>${cat.name}</b><br>
Budget: ₹${cat.monthly_budget}<br>
Spent: ₹${cat.spent}<br>
Utilization: ${cat.utilization}%
</div>`;
});
}