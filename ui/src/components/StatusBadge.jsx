import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StatusBadge({ status }) {
  let color =
    status === "STORED"
      ? "bg-green-200 text-green-800"
      : status === "IN_TRANSIT"
      ? "bg-yellow-200 text-yellow-800"
      : "bg-red-200 text-red-800";

  return (
    <span className={`px-2 py-1 rounded text-sm font-semibold ${color}`}>
      {status}
    </span>
  );
}