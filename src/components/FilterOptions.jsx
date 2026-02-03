import React from 'react';

function FilterOptions() {
  return (
    <div className="filter-options">
      <label>
        价格范围:
        <input type="range" min="0" max="1000" />
      </label>
      <label>
        星级:
        <select>
          <option value="all">所有</option>
          <option value="1">1星</option>
          <option value="2">2星</option>
          <option value="3">3星</option>
          <option value="4">4星</option>
          <option value="5">5星</option>
        </select>
      </label>
    </div>
  );
}

export default FilterOptions;