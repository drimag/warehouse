const { runArchive } = require("../services/archiveService");
const db = require("../config/db");

// POST /admin/archive/run
// Manually triggers the archive process. ADMIN only.
const triggerArchive = async (req, res) => {
  try {
    const triggeredBy = req.user.email;
    const result = await runArchive(triggeredBy);

    if (result.skipped) {
      return res.status(200).json({ message: result.message });
    }

    return res.status(200).json({
      message: `Archive complete. ${result.waybillCount} waybill(s) archived.`,
      fileName: result.fileName,
      fileUrl: result.fileUrl,
    });
  } catch (err) {
    console.error("❌ Archive error:", err);
    return res.status(500).json({ error: "Archive failed. No data was deleted." });
  }
};

// GET /admin/archive
// Returns a list of all past archive records. ADMIN only.
const listArchives = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        created_at,
        created_by,
        file_name,
        file_url,
        waybill_count,
        date_from,
        date_to
      FROM archives
      ORDER BY created_at DESC;
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch archives:", err);
    return res.status(500).json({ error: "Failed to fetch archive records." });
  }
};

const downloadArchive = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT file_url, file_name FROM archives WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Archive not found." });

    const { file_url, file_name } = result.rows[0];

    const response = await fetch(file_url);
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Disposition", `attachment; filename="${file_name}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("❌ Archive download error:", err);
    res.status(500).json({ error: "Failed to download archive." });
  }
};

module.exports = { triggerArchive, listArchives, downloadArchive };
