import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const CategoryMenu = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/api/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Lỗi lấy danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="card mb-4">
      <div className="card-header bg-success text-white fw-bold">Danh mục sản phẩm</div>
      <div className="list-group list-group-flush">
        <button
          className={`list-group-item list-group-item-action ${
            selectedCategory === null ? 'active' : ''
          }`}
          onClick={() => onSelectCategory(null)}
        >
          Tất cả sản phẩm
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`list-group-item list-group-item-action ${
              selectedCategory === cat.id ? 'active' : ''
            }`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;