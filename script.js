let salary = 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Load saved data
window.onload = function () {
  const savedSalary = localStorage.getItem("salary");

  if (savedSalary) {
    salary = Number(savedSalary);
    document.getElementById("totalSalary").innerText = salary;
  }

  renderExpenses();
  updateUI();
};

function setSalary() {
  const input = document.getElementById("salary").value;

  if (input <= 0) return alert("Enter valid salary");

  salary = Number(input);

  localStorage.setItem("salary", salary);

  updateUI();
}

function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);

  localStorage.setItem("expenses", JSON.stringify(expenses));

  renderExpenses();
  updateUI();

   showToast("Expense deleted 🗑️", "error");
}

function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  const symbol = getSymbol();

  expenses.forEach(exp => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${exp.name} - ${symbol}${(exp.amount * rate).toFixed(2)}
      <button onclick="deleteExpense(${exp.id})">❌</button>
    `;

    list.appendChild(li);
  });
}

function addExpense() {
  const name = document.getElementById("expenseName").value;
  const amount = document.getElementById("expenseAmount").value;

  if (!name || amount <= 0) {
    return showToast("Invalid input ❌", "error");
  }

  const expense = {
    id: Date.now(),
    name,
    amount: Number(amount),
  };

  expenses.push(expense);

  localStorage.setItem("expenses", JSON.stringify(expenses));

  renderExpenses();

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = salary - totalExpense;
  const threshold = salary * 0.1;

  updateUI();

  if (salary && balance < threshold) {
    showToast("⚠️ Warning: Expense limit crossed!", "warning");
  } else {
    showToast("Expense added successfully ✅", "success");
  }
}

function updateUI() {
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = salary - totalExpense;

  const symbol = getSymbol();

  document.getElementById("totalSalary").innerText =
    `${symbol} ${(salary * rate).toFixed(2)}`;

  document.getElementById("totalExpense").innerText =
    `${symbol} ${(totalExpense * rate).toFixed(2)}`;

  document.getElementById("balance").innerText =
    `${symbol} ${(balance * rate).toFixed(2)}`;

  const threshold = salary * 0.1;

  let isWarning = false;

  // 🔥 Direct condition (no prevBalance needed)
  if (salary && balance < threshold) {
    document.getElementById("balance").style.color = "red";

    showToast("⚠️ Warning: Expense limit crossed!", "warning");
    isWarning = true;

  } else {
    document.getElementById("balance").style.color = "black";
  }

  updateChart(totalExpense * rate, balance * rate);

  return isWarning;
}

let chart;

function updateChart(expense, balance) {
  const ctx = document.getElementById("myChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Expenses", "Balance"],
      datasets: [{
        data: [expense, balance]
      }]
    }
  });
}




function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Expense Report", 10, 10);

  let y = 20;

  expenses.forEach((exp, index) => {
    doc.text(
      `${index + 1}. ${exp.name} - ${(exp.amount * rate).toFixed(2)} ${currentCurrency}`,
      10,
      y
    );
    y += 10;
  });

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = salary - totalExpense;

  doc.text(
    `Remaining Balance: ${(balance * rate).toFixed(2)} ${currentCurrency}`,
    10,
    y + 10
  );

  doc.save("report.pdf");
}

let currentCurrency = "INR";
let rate = 1;

async function changeCurrency() {
  const selected = document.getElementById("currency").value;

  if (selected === "INR") {
    rate = 1;
    currentCurrency = "INR";
    updateUI();
    return;
  }

  const res = await fetch(
    `https://api.frankfurter.app/latest?from=INR&to=${selected}`
  );

  const data = await res.json();

  rate = data.rates[selected];
  currentCurrency = selected;

  updateUI();
}

function getSymbol() {
  if (currentCurrency === "USD") return "$";
  if (currentCurrency === "EUR") return "€";
  return "₹";
}




document.getElementById("balance").style.fontWeight = "bold";

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.className = "show " + type;

  setTimeout(() => {
    toast.className = "";
  }, 3000);
}