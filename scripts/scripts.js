document.addEventListener("DOMContentLoaded", () => {
  const fetchData = async () => {
    try {
      const response = await fetch("transactions.json");
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  };

  const processData = (data) => {
    const categories = {};
    const mostPurchased = {};
    const transactionTimes = {};
    let totalRevenue = 0;

    data.forEach((transaction) => {
      totalRevenue += transaction.unit_price * transaction.transaction_qty;

      if (!categories[transaction.product_category]) {
        categories[transaction.product_category] = 0;
      }
      categories[transaction.product_category] += transaction.transaction_qty;

      if (!mostPurchased[transaction.product_id]) {
        mostPurchased[transaction.product_id] = {
          name: transaction.product_detail,
          count: 0,
        };
      }

      mostPurchased[transaction.product_id].count +=
        transaction.transaction_qty;

      if (!transactionTimes[transaction.product_category]) {
        transactionTimes[transaction.product_category] = Array.from(
          { length: 12 },
          () => 0
        );
      }

      const month = new Date(transaction.transaction_date).getMonth();
      transactionTimes[transaction.product_category][month] +=
        transaction.transaction_qty;
    });

    return {
      categories,
      mostPurchased,
      transactionTimes,
      transactions: data,
      totalRevenue,
    };
  };

  const populateStoreLocationSelect = (data) => {
    const storeLocationSelect = document.getElementById(
      "store-location-select"
    );

    const uniqueLocations = [
      ...new Set(data.map((transaction) => transaction.store_location)),
    ];

    uniqueLocations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location;
      option.text = location;
      storeLocationSelect.appendChild(option);
    });
  };

  const populateProductCategorySelect = (data) => {
    const productCategorySelect = document.getElementById(
      "product-category-select"
    );

    const uniqueCategories = [
      ...new Set(data.map((transaction) => transaction.product_category)),
    ];

    uniqueCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.text = category;
      productCategorySelect.appendChild(option);
    });
  };

  let categoryChart, mostPurchasedChart, transactionTimeChart;

  const renderCharts = ({
    categories,
    mostPurchased,
    transactionTimes,
    totalRevenue,
  }) => {
    if (categoryChart) categoryChart.destroy();
    if (mostPurchasedChart) mostPurchasedChart.destroy();
    if (transactionTimeChart) transactionTimeChart.destroy();

    const categoryChartCtx = document
      .getElementById("product-category-chart")
      .getContext("2d");

    categoryChart = new Chart(categoryChartCtx, {
      type: "bar",
      data: {
        labels: Object.keys(categories),
        datasets: [
          {
            label: "Kategori Produk",
            data: Object.values(categories),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    const mostPurchasedChartCtx = document
      .getElementById("most-purchased-product-chart")
      .getContext("2d");

    const mostPurchasedData = Object.values(mostPurchased).sort(
      (a, b) => b.count - a.count
    );

    mostPurchasedChart = new Chart(mostPurchasedChartCtx, {
      type: "pie",
      data: {
        labels: mostPurchasedData.map((item) => item.name),
        datasets: [
          {
            label: "Penjualan Produk Terlaris",
            data: mostPurchasedData.map((item) => item.count),
            backgroundColor: [
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 99, 132, 0.2)",
            ],
            borderColor: [
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 99, 132, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });

    // Transaction Distribution Time Chart
    const transactionTimeChartCtx = document
      .getElementById("transaction-distribution-time-chart")
      .getContext("2d");
    const datasets = Object.keys(transactionTimes).map((category, index) => ({
      label: category,
      data: transactionTimes[category],
      backgroundColor: `rgba(${index * 50}, 159, 64, 0.2)`,
      borderColor: `rgba(${index * 50}, 159, 64, 1)`,
      borderWidth: 1,
    }));

    transactionTimeChart = new Chart(transactionTimeChartCtx, {
      type: "line",
      data: {
        labels: ["January", "February", "March", "April", "May", "June"],
        datasets: datasets,
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    document.getElementById(
      "total-revenue"
    ).innerText = `Total Revenue: $${totalRevenue.toFixed(2)}`;
  };

  const renderTable = (transactions) => {
    const tableBody = document
      .getElementById("transaction-table")
      .getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    transactions.forEach((transaction, index) => {
      const row = tableBody.insertRow();
      row.insertCell(0).innerText = index + 1;
      row.insertCell(1).innerText = transaction.product_detail;
      row.insertCell(2).innerText = `$${transaction.unit_price.toFixed(2)}`;
      row.insertCell(3).innerText = transaction.transaction_qty;
      row.insertCell(4).innerText = transaction.transaction_date;
      row.insertCell(5).innerText = transaction.store_location;
    });

    $("#transaction-table").DataTable({
      pageLength: 10,
      destroy: true,
    });
  };

  const applyFilters = (data) => {
    const storeLocation = document.getElementById(
      "store-location-select"
    ).value;

    const productCategory = document.getElementById(
      "product-category-select"
    ).value;

    let filteredData = data;

    if (storeLocation !== "all") {
      filteredData = filteredData.filter(
        (transaction) => transaction.store_location === storeLocation
      );
    }

    if (productCategory !== "all") {
      filteredData = filteredData.filter(
        (transaction) => transaction.product_category === productCategory
      );
    }

    return filteredData;
  };

  const handleFilters = (data) => {
    const filteredData = applyFilters(data);
    const processedData = processData(filteredData);
    renderCharts(processedData);
    renderTable(processedData.transactions);
  };

  fetchData().then((data) => {
    populateStoreLocationSelect(data);
    populateProductCategorySelect(data);

    const initialProcessedData = processData(data);
    renderCharts(initialProcessedData);
    renderTable(initialProcessedData.transactions);

    const filterElements = ["store-location-select", "product-category-select"];

    filterElements.forEach((filterElementId) => {
      document
        .getElementById(filterElementId)
        .addEventListener("change", () => handleFilters(data));
    });
  });
});
