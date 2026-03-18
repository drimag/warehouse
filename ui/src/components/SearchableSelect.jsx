import React, { useState, forwardRef, useMemo } from "react";

const SearchableSelect = forwardRef(
  ({ selected, setSelected, title, options, placeholder }, ref) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      return options.filter((opt) =>
        opt.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }, [options, searchTerm]);

    const handleSelect = (val) => {
      setIsOpen(false);
      setSelected(val);
      setSearchTerm("");
      setIsOpen(false);
    };

    const isPlaceholder = !selected && !searchTerm;
    return (
      <div className="scan-field" style={{ position: "relative" }}>
        <label>{title}</label>

        {/* Search Input */}
        <input
          ref={ref}
          type="text"
          className={`search-input ${isPlaceholder ? "is-placeholder" : ""}`}
          placeholder={placeholder}
          value={searchTerm || selected || ""} // Show search text if typing, otherwise selected value
          onChange={(e) => {
            setSearchTerm(e.target.value); // Update the search term!
            setIsOpen(true);
            setSelected(null);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* Dropdown List */}
        {isOpen && (
          <ul
            className="dropdown-list"
            style={{ position: "absolute", zIndex: 10, top: "100%" }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li style={{ padding: "8px", color: "#999" }}>
                No results found
              </li>
            )}
          </ul>
        )}

        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 9 }}
          />
        )}
      </div>
    );
  },
);

export default SearchableSelect;
