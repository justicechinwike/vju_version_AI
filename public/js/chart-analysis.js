// Submit a chart-analysis request and render its educational result.
document.getElementById("analysisForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const result = document.getElementById("result");
  result.innerHTML = "<h2>Analysis Report</h2><p>Generating educational analysis...</p>";
  try {
    const response = await fetch("/api/analysis/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: document.getElementById("platform").value,
        asset: document.getElementById("asset").value,
        timeframe: document.getElementById("timeframe").value,
        chartOverview: document.getElementById("overview").value,
        recognitionConfidence: 50
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    const content = data.report.report_content;
    result.innerHTML = "<h2>Analysis Report</h2>" +
      `<div class="result-section"><strong>Asset:</strong> ${content.assetInformation.asset}</div>` +
      `<div class="result-section"><strong>Chart overview:</strong> ${content.chartOverview}</div>` +
      `<div class="result-section"><strong>Trend education:</strong> ${content.trendExplanation}</div>` +
      `<div class="result-section"><strong>Risk education:</strong> ${content.riskEducation}</div>` +
      `<div class="result-section"><strong>Limitations:</strong> ${content.recognitionLimitations}</div>`;
  } catch (error) {
    result.innerHTML = `<h2>Analysis unavailable</h2><p>${error.message}</p>`;
  }
});
