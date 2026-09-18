import React, { useState } from 'react';

const SearchBox = ({ onSearch, initialValue = '' }) => {
  const [keyword, setKeyword] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2 w-100">
      <input
        type="text"
        className="form-control"
        placeholder="Tìm sản phẩm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button type="submit" className="btn btn-success px-4">
        Tìm
      </button>
    </form>
  );
};

export default SearchBox;