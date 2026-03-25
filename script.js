const salesForm = document.getElementById("salesForm");

const dateInput = document.getElementById("date");
const productInput = document.getElementById("product");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const resetButton = document.getElementById("resetButton");
const sampleDataButton = document.getElementById("sampleDataButton");
const clearAllButton = document.getElementById("clearAllButton");

const salesList = document.getElementById("salesList");

const totalSales = document.getElementById("totalSales");
const averageSales = document.getElementById("averageSales");
const totalCount = document.getElementById("totalCount");

const messageArea = document.getElementById("messageArea");

const dailySalesChartCanvas = document.getElementById("dailySalesChart");
const categorySalesChartCanvas = document.getElementById("categorySalesChart");

let salesData = [];
let dailySalesChart = null;
let categorySalesChart = null;

function saveSales() {
  localStorage.setItem("salesData", JSON.stringify(salesData));
}

function loadSales() {
  const storedData = localStorage.getItem("salesData");
  if (storedData) {
    salesData = JSON.parse(storedData);
  }
}

function setTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

function formatCurrency(value) {
  return `¥${Number(value).toLocaleString()}`;
}

function showMessage(text) {
  messageArea.textContent = text;

  setTimeout(() => {
    messageArea.textContent = "";
  }, 2000);
}

function updateSummary(data) {
  const count = data.length;
  const total = data.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const average = count === 0 ? 0 : Math.round(total / count);

  totalCount.textContent = `${count}件`;
  totalSales.textContent = formatCurrency(total);
  averageSales.textContent = formatCurrency(average);
}

function getDailySalesData(data) {
  const dailyTotals = {};

  data.forEach((sale) => {
    if (!dailyTotals[sale.date]) {
      dailyTotals[sale.date] = 0;
    }
    dailyTotals[sale.date] += Number(sale.amount);
  });

  const labels = Object.keys(dailyTotals).sort();
  const values = labels.map((date) => dailyTotals[date]);

  return { labels, values };
}

function getCategorySalesData(data) {
  const categoryTotals = {};

  data.forEach((sale) => {
    if (!categoryTotals[sale.category]) {
      categoryTotals[sale.category] = 0;
    }
    categoryTotals[sale.category] += Number(sale.amount);
  });

  const labels = Object.keys(categoryTotals);
  const values = labels.map((category) => categoryTotals[category]);

  return { labels, values };
}

function renderCharts(data) {
  const dailyData = getDailySalesData(data);
  const categoryData = getCategorySalesData(data);

  if (dailySalesChart) {
    dailySalesChart.destroy();
  }

  if (categorySalesChart) {
    categorySalesChart.destroy();
  }

  dailySalesChart = new Chart(dailySalesChartCanvas, {
    type: "line",
    data: {
      labels: dailyData.labels,
      datasets: [
        {
          label: "日別売上",
          data: dailyData.values,
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });

  categorySalesChart = new Chart(categorySalesChartCanvas, {
    type: "bar",
    data: {
      labels: categoryData.labels,
      datasets: [
        {
          label: "カテゴリ別売上",
          data: categoryData.values,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
}

function renderSales() {
  salesList.innerHTML = "";

  const keyword = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filteredSales = salesData.filter((sale) => {
    const matchesKeyword = sale.product.toLowerCase().includes(keyword);
    const matchesCategory =
      selectedCategory === "all" || sale.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  if (filteredSales.length === 0) {
    salesList.innerHTML = `
      <tr>
        <td colspan="5">データがありません</td>
      </tr>
    `;
  } else {
    filteredSales.forEach((sale) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${sale.date}</td>
        <td>${sale.product}</td>
        <td>${formatCurrency(sale.amount)}</td>
        <td>${sale.category}</td>
        <td>
          <button class="delete-btn" data-id="${sale.id}">削除</button>
        </td>
      `;

      salesList.appendChild(tr);
    });
  }

  updateSummary(filteredSales);
  renderCharts(filteredSales);
}

function clearForm() {
  salesForm.reset();
  setTodayDate();
}

function addSale() {
  const date = dateInput.value;
  const product = productInput.value.trim();
  const amount = amountInput.value;
  const category = categoryInput.value;

  if (!date || !product || !amount || !category) {
    alert("すべての項目を入力してください。");
    return;
  }

  if (Number(amount) <= 0) {
    alert("売上金額は1以上で入力してください。");
    return;
  }

  const newSale = {
    id: Date.now(),
    date,
    product,
    amount: Number(amount),
    category,
  };

  salesData.push(newSale);
  saveSales();
  clearForm();
  renderSales();
  showMessage("売上データを登録しました。");
}

function deleteSale(id) {
  const isConfirmed = confirm("このデータを削除しますか？");

  if (!isConfirmed) {
    return;
  }

  salesData = salesData.filter((sale) => sale.id !== id);
  saveSales();
  renderSales();
  showMessage("売上データを削除しました。");
}

function insertSampleData() {
  const isConfirmed = confirm("サンプルデータを投入しますか？\n現在のデータは上書きされます。");

  if (!isConfirmed) {
    return;
  }

  salesData = [
    { id: Date.now() + 1, date: "2026-03-01", product: "りんご", amount: 1200, category: "食品" },
    { id: Date.now() + 2, date: "2026-03-01", product: "バナナ", amount: 800, category: "食品" },
    { id: Date.now() + 3, date: "2026-03-02", product: "洗剤", amount: 1500, category: "日用品" },
    { id: Date.now() + 4, date: "2026-03-02", product: "ティッシュ", amount: 600, category: "日用品" },
    { id: Date.now() + 5, date: "2026-03-03", product: "ノート", amount: 400, category: "雑貨" },
    { id: Date.now() + 6, date: "2026-03-03", product: "ボールペン", amount: 300, category: "雑貨" },
    { id: Date.now() + 7, date: "2026-03-04", product: "ギフトセット", amount: 2500, category: "その他" },
    { id: Date.now() + 8, date: "2026-03-05", product: "お茶", amount: 900, category: "食品" }
  ];

  saveSales();
  renderSales();
  showMessage("サンプルデータを投入しました。");
}

function clearAllSales() {
  const isConfirmed = confirm("全データを削除しますか？");

  if (!isConfirmed) {
    return;
  }

  salesData = [];
  saveSales();
  renderSales();
  showMessage("全データを削除しました。");
}

salesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addSale();
});

searchInput.addEventListener("input", renderSales);
categoryFilter.addEventListener("change", renderSales);

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  renderSales();
});

sampleDataButton.addEventListener("click", insertSampleData);
clearAllButton.addEventListener("click", clearAllSales);

salesList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.dataset.id);
    deleteSale(id);
  }
});

loadSales();
setTodayDate();
renderSales();