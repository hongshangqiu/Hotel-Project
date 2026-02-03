import React from 'react';

function SearchBar() {
  return (
    <div className="search-bar">
      <input type="text" placeholder="目的地" />
      <input type="date" placeholder="入住日期" />
      <input type="date" placeholder="退房日期" />
      <button>搜索</button>
    </div>
  );
}

export default SearchBar;