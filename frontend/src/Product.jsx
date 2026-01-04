// 🔹 throttle helper (outside component)
function throttle(fn, delay) {
  let lastcall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastcall >= delay) {
      lastcall = now;
      fn(...args);
    }
  };
}

import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./config/api.js";
import { useAuth } from "./context/AuthContext.jsx";
import "./styles/Product.css";


function Product() {
  const { authFetch } = useAuth();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalpages, setTotalpages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const limit = 3;
      const res = await authFetch(
        `${API_BASE_URL}/api/products?page=${page}&limit=${limit}&search=${search}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();

      setProducts(data.data || []);
      setTotalpages(data.totalPages || 1);
    } catch (error) {
      console.error("error in fetching product", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, search]);

  // 🔹 THROTTLED pagination handlers
  const throttledNext = useMemo(
    () =>
      throttle(() => {
        setPage((p) => p + 1);
      }, 500),
    []
  );

  const throttledPrev = useMemo(
    () =>
      throttle(() => {
        setPage((p) => p - 1);
      }, 500),
    []
  );

  return (
    <div className="product-page">
      <input
        className="product-search"
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {/* Loading state */}
      {loading && <p className="product-loading">Loading products...</p>}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <p className="product-empty">No products found</p>
      )}

      <div className="product-grid">
        {!loading &&
          products.map((p) => (
            <div key={p._id} className="product-card">
              <p className="product-name">{p.name}</p>
              <p className="product-quantity">
                Quantity: {p.quantity}
              </p>
            </div>
          ))}
      </div>

      <div className="product-pagination">
        <button disabled={page === 1} onClick={throttledPrev}>
          Prev
        </button>

        <span>
          Page {page} of {totalpages}
        </span>

        <button
          disabled={page === totalpages}
          onClick={throttledNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Product;
