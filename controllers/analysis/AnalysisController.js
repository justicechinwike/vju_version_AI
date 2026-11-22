// Load the report model.
const AnalysisReport = require("../../models/AnalysisReport");

// Return supported platform definitions.
exports.platforms = (req, res) => {
  res.json({
    platforms: ["MetaTrader 4", "MetaTrader 5", "TradingView", "Binance", "Bybit", "Coinbase"],
    chartTypes: ["Candlestick", "Line", "Bar", "Area"]
  });
};

// Create a clearly labeled educational analysis report.
exports.run = async (req, res) => {
  try {
    const {
      sessionId,
      platform = "Unknown",
      asset = "Unknown asset",
      timeframe = "Unknown",
      recognizedIndicators = [],
      recognizedPatterns = [],
      recognitionConfidence = 50,
      chartOverview = "The visible chart structure could not be fully confirmed."
    } = req.body;

    // Build a structured educational report without trade recommendations.
    const reportContent = {
      assetInformation: { asset, platform, timeframe },
      chartOverview,
      trendExplanation: "The visible price structure should be interpreted as an educational observation, not a market prediction.",
      indicatorInterpretation: recognizedIndicators.length
        ? recognizedIndicators.map((indicator) => `${indicator}: ${indicator} was detected; interpretation requires the indicator's visible settings and context.`)
        : ["No indicators could be confirmed."],
      patternInterpretation: recognizedPatterns.length
        ? recognizedPatterns.map((pattern) => `${pattern}: suspected formation requires confirmation of all visible chart structure.`)
        : ["No sufficiently recognizable completed pattern was confirmed."],
      timeframeContext: `The visible timeframe is recorded as ${timeframe}. Additional timeframes should not be inferred.`,
      riskEducation: "Markets are volatile and uncertain. This explanation is educational and does not provide a personalized financial recommendation.",
      recognitionLimitations: "The result may contain OCR or visual-recognition uncertainty. Verify information against the source chart.",
      educationalDisclaimer: "Educational analysis only. No guaranteed outcome or trade instruction."
    };

    // Persist the report for the authenticated user.
    const report = await AnalysisReport.create({
      userId: req.session.user.id,
      sessionId,
      platform,
      asset,
      timeframe,
      reportContent,
      confidence: Math.max(0, Math.min(100, Number(recognitionConfidence))),
      modelVersion: "v1",
      dataSources: ["screenshot"]
    });

    return res.status(201).json({
      message: "Educational analysis report generated.",
      report
    });
  } catch (error) {
    console.error("Analysis generation failed:", error.message);
    return res.status(500).json({ error: "Educational analysis is temporarily unavailable." });
  }
};
