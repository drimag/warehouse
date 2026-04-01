export default function GenericTable({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
}) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr
              key={item.id || index}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? "clickable" : ""}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="empty">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
