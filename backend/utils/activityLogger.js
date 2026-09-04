const db = require("../config/db");

/**
 * Writes a row to activity_logs.
 * Pass `client` when inside an existing transaction so the log
 * rolls back together with the main operation if something fails.
 *
 * @param {object} opts
 * @param {object}  [opts.client]      - pg transaction client (optional)
 * @param {string}   opts.userEmail    - req.user.email from JWT
 * @param {string}   opts.entityType   - "unit" | "waybill" | "bulk_upload" etc.
 * @param {string}   opts.entityId     - UUID or waybill VARCHAR id
 * @param {string}   opts.eventType    - e.g. "MANUAL_STATUS_UPDATE", "MANUAL_CLOSE"
 * @param {object}  [opts.metadata]    - free-form before/after or extra context
 * @param {string}  [opts.description] - human-readable summary
 */
const logActivity = async ({
  client,
  userEmail,
  entityType,
  entityId,
  eventType,
  metadata = {},
  description = null,
}) => {
  const runner = client || db;
  await runner.query(
    `INSERT INTO activity_logs
       (user_id, entity_type, entity_id, event_type, metadata, description)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userEmail, entityType, String(entityId), eventType, JSON.stringify(metadata), description]
  );
};

module.exports = { logActivity };
