# 📊 Expense Tracker – PWA (Oracle ATP + ORDS)

A **Progressive Web Application (PWA)** for tracking personal expenses with:

- Category-wise monthly budgets
- Daily expense tracking
- Monthly dashboard & charts
- Oracle Autonomous Transaction Processing (ATP) backend
- ORDS REST APIs
- GitHub Pages hosting
- Installable on Desktop & iPhone

---

## 🌐 Live Application

🔗 **Live URL**  
https://kishorejs.github.io/Expense_Tracker/

---

## 🏗️ Architecture Overview

Browser (PWA)
|
| HTTPS (REST)
▼
Oracle ORDS REST APIs
|
▼
Oracle Autonomous Transaction Processing (ATP)

yaml
Copy code

- **Frontend**: HTML, CSS, JavaScript (PWA)
- **Backend**: Oracle ATP tables & views auto-exposed via ORDS
- **Hosting**: GitHub Pages
- **Charts**: Chart.js (CDN)

---

## 📁 Project Structure

Expense_Tracker/
│
├── index.html # Main UI (Dashboard, Charts, Forms)
├── app.js # Application logic & API calls
├── manifest.json # PWA metadata
├── service-worker.js # Offline cache & install support
├── icon-192.png # App icon (mobile & desktop)
├── icon-512.png # App icon (high resolution)
└── README.md # Project documentation

yaml
Copy code

---

## 🧩 File Responsibilities

### 🔹 index.html
- Defines UI layout
- Loads Chart.js
- Contains embedded CSS
- Hosts:
  - Month selector
  - Dashboard cards
  - Charts
  - Add / Update Expense form

---

### 🔹 app.js
Contains **all client-side logic**:
- Calls ORDS REST APIs
- Renders dashboard
- Manages charts
- Handles CRUD operations
- Filters data by month

---

### 🔹 manifest.json
Required for PWA installation.

Key fields:
- App name & short name
- Icons
- `display: standalone`
- Start URL

---

### 🔹 service-worker.js
- Enables offline caching
- Makes the app installable
- Improves performance

---

## 🗄️ Backend Database Design (Oracle ATP)

### 1️⃣ expense_categories

Stores category-level budgets.

```sql
expense_cat_id   NUMBER (PK)
name             VARCHAR2
monthly_budget   NUMBER
status           VARCHAR2
2️⃣ daily_expenses
Stores individual expense entries.

sql
Copy code
expense_id       NUMBER (PK)
expense_cat_id   NUMBER (FK)
amount           NUMBER
expense_date     DATE
expense_month    DATE
notes            VARCHAR2
created_at       DATE
3️⃣ Dashboard View
vw_expense_dashboard_base

Used by dashboard to fetch:
Category
Monthly budget
Total spent
Utilization percentage
Alert status (GREEN / RED)
This view is auto-exposed via ORDS.

🔗 ORDS REST APIs Used
Purpose	Endpoint
Dashboard	/ords/expense/vw_expense_dashboard_base/
Categories	/ords/expense/expense_categories/
Daily Expenses	/ords/expense/daily_expenses/

⚙️ app.js – Function Documentation
Global Variables
js
Copy code
window.dashboardItems
Stores dashboard data for filtering & charts.

js
Copy code
donutChart, trendChart
Chart.js instances.

loadDashboard()
Main entry point on page load.
Fetches dashboard data
Stores data globally
Populates month dropdown
Renders dashboard cards
Loads category dropdown
Renders charts

populateMonthLov(items)
Extracts unique months
Displays as Jan-26
Keeps internal value as YYYY-MM

renderDashboard(items)
Filters data by selected month
Displays category cards
Shows budget, spent & utilization
Applies alert coloring

loadExpenseCategories()
Fetches categories
Populates category dropdown for expense form

addExpense(event)
Reads form values
Converts dates to ISO format
POSTs expense to ORDS
Reloads dashboard

updateExpense(event)
Updates an existing expense
Sends full payload
Reloads dashboard

deleteLatestExpense(expenseCatId, month)
Fetches latest expense for category & month
Deletes it
Reloads dashboard

renderCharts(items)
Coordinator function:
Calls donut & trend chart functions

renderCategoryDonut(items)
Displays Budget Utilization
Shows Spent vs Remaining
Color logic:
Green < 70%
Orange 70–90%
Red > 90%

renderMonthlyTrend(items)
Aggregates expenses by month
Displays line chart
Formats values in ₹

📱 PWA Installation Guide
💻 Desktop (Chrome / Edge)
Open app URL

Click Install App icon in address bar

📱 iPhone (Safari Only)
Open Safari
Visit app URL
Tap Share
Select Add to Home Screen
Launch from home screen

⚠️ iOS does not show install prompts automatically.

🧪 Sample Data
The app supports:
Multi-month data
Category budget testing
Alert threshold testing
Chart variation testing

Sample SQL scripts were used to seed:
Food
Entertainment
EMI
School expenses

🚀 Future Enhancements
Income & Savings dashboard
Category grouping (Entertainment / EMI / School)
Budget alerts (80% / 100%)
Offline-first dashboard
CSV export
Full expense history

🏁 Conclusion
This project demonstrates:
Real-world PWA development
Oracle ATP + ORDS integration
REST-driven frontend architecture
Cross-platform installable web app

🙌 Author
Kishore J S
Oracle Integration & Middleware Architect