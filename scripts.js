async function fetchStockData() {
    const symbol = "AAPL"; // Example stock symbol
    const apiKey = "2OKH7O22GDSQXKGI"; // Replace with your Alpha Vantage API Key
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const timeSeries = data["Monthly Time Series"];
        const labels = Object.keys(timeSeries).slice(0, 5).reverse();
        const prices = labels.map(label => parseFloat(timeSeries[label]["4. close"]));

        return { labels, prices };
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const option = urlParams.get('option');
    const trendTitle = document.getElementById("trend-title");
    const suggestionDiv = document.getElementById("suggestion");

    trendTitle.textContent = option === "buy" ? "Trends for Buying" : "Trends for Selling";

    const stockData = await fetchStockData();
    if (stockData) {
        const { labels, prices } = stockData;

        const ctx = document.getElementById('trend-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Stock Prices (USD)',
                    data: prices,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2
                }]
            }
        });

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const bestBuyYear = labels[prices.indexOf(minPrice)];
        const bestSellYear = labels[prices.indexOf(maxPrice)];

        suggestionDiv.innerHTML = option === "buy"
            ? `Suggestion: Consider buying in ${bestBuyYear} at $${minPrice.toFixed(2)}.`
            : `Suggestion: Consider selling in ${bestSellYear} at $${maxPrice.toFixed(2)}.`;
    }
});
