"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, Eye, EyeOff, Search, Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { deleteProduct } from "@/lib/products";
import Link from "next/link";

type ProductsTableProps = {
  products: Product[];
  locale: string;
  token: string;
};

export function ProductsTable({ products, locale, token }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "sold" | "draft" | "archived">("all");
  const [allProducts, setAllProducts] = useState(products);
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Re-run filter when search or status changes
  const applyFilters = (term: string, status: string, source = allProducts) => {
    const lower = term.toLowerCase();
    const filtered = source.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower) ||
        p.id.toLowerCase().includes(lower);
      
      const matchesStatus = status === "all" || p.status === status;

      return matchesSearch && matchesStatus;
    });
    setFilteredProducts(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleStatusChange = (status: "all" | "active" | "sold" | "draft" | "archived") => {
    setStatusFilter(status);
    applyFilters(searchTerm, status);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Haluatko varmasti poistaa tuotteen "${name}"?`)) return;

    try {
      await deleteProduct(id, token);
      
      // Update local state
      const newAllProducts = allProducts.filter(p => p.id !== id);
      setAllProducts(newAllProducts);
      
      // Re-apply filters to current view
      applyFilters(searchTerm, statusFilter, newAllProducts);
    } catch (error) {
      console.error(error);
      alert("Tuotteen poistaminen epäonnistui.");
    }
  };

  const getCoverImage = (product: Product) => {
    if (product.files && product.files.length > 0) {
      const file = product.files[0];
      return `http://185.96.163.183:8000/api/v1/storage/${file.namespace}/${file.entity_id}/${file.filename}`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Hae tuotteita..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="all">Kaikki</option>
            <option value="active">Aktiiviset</option>
            <option value="sold">Myydyt</option>
            <option value="draft">Luonnokset</option>
            <option value="archived">Arkistoidut</option>
          </select>
        </div>

        <Link
          href={`/${locale}/dashboard/products/new`}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Lisää uusi
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Tuote</th>
              <th className="px-6 py-3 font-medium">Kategoria</th>
              <th className="px-6 py-3 font-medium">Stok</th>
              <th className="px-6 py-3 font-medium">Hinta</th>
              <th className="px-6 py-3 font-medium">Tila</th>
              <th className="px-6 py-3 font-medium text-right">Toiminnot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.map((product) => {
              const cover = getCoverImage(product);
              return (
                <tr key={product.id} className="group hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">SKU: {product.sku || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{product.category || "-"}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">
                    {product.quantity !== undefined ? product.quantity : 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {product.sale_price ? `${product.sale_price} €` : "-"}
                    {product.regular_price && (
                      <span className="ml-2 text-xs text-slate-400 line-through">
                        {product.regular_price} €
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === "sold"
                          ? "bg-red-100 text-red-800"
                          : product.status === "draft"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/${locale}/dashboard/products/${product.id}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        type="button"
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
