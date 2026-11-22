// Load the report model.
const AnalysisReport = require("../../models/AnalysisReport");

// List reports belonging to the authenticated user.
exports.list = async (req, res) => {
  try {
    return res.json({ reports: await AnalysisReport.listByUser(req.session.user.id) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load analysis reports." });
  }
};

// Retrieve one owned report.
exports.get = async (req, res) => {
  try {
    const report = await AnalysisReport.findByUser(req.params.id, req.session.user.id);
    if (!report) return res.status(404).json({ error: "Report was not found." });
    return res.json({ report });
  } catch (error) {
    return res.status(500).json({ error: "Unable to retrieve the report." });
  }
};

// Delete one owned report.
exports.remove = async (req, res) => {
  try {
    const report = await AnalysisReport.removeByUser(req.params.id, req.session.user.id);
    if (!report) return res.status(404).json({ error: "Report was not found." });
    return res.json({ message: "Report deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to delete the report." });
  }
};

// Export a report as text with an educational disclaimer.
exports.exportText = async (req, res) => {
  try {
    const report = await AnalysisReport.findByUser(req.params.id, req.session.user.id);
    if (!report) return res.status(404).json({ error: "Report was not found." });
    const content = JSON.stringify(report.report_content, null, 2);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="vju-report-${report.id}.txt"`);
    return res.send(`VJU Vision AI Educational Report\nGenerated: ${report.created_at}\n\n${content}\n\nEducational use only.`);
  } catch (error) {
    return res.status(500).json({ error: "Unable to export the report." });
  }
};
