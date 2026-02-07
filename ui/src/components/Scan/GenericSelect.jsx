export default function GenericSelect({ selected, setSelected, title, options, placeholder }) {
  return (
    <div className="scan-field">
      <label>{title}</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </div>
  );
}