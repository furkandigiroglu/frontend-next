"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, Check, X, Clock, AlertCircle, Calendar, Plus, Edit2, Search, Trash2 } from "lucide-react";
import { Reservation } from "@/types/reservation";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";

interface ProductSimple {
  id: string;
  name: string;
  sku: string;
  sale_price?: number;
  regular_price?: number;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);

  // Manual Creation State
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualProducts, setManualProducts] = useState<ProductSimple[]>([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSimple | null>(null);

  // Edit State
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const API_BASE = "http://185.96.163.183:8000/api/v1";

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_BASE}/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (error) {
      console.error("Failed to fetch reservations", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProducts = async () => {
    setManualLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products?status=active&limit=100`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setManualProducts(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setManualLoading(false);
    }
  };

  const handleOpenManual = () => {
     setIsManualOpen(true);
     setSelectedProduct(null);
     setSearchTerm("");
     fetchActiveProducts();
  };

  const handleManualCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedProduct) {
        alert("Valitse tuote listalta");
        return;
    }

    setManualLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
       product_id: formData.get("product_id"),
       customer_name: formData.get("name"),
       customer_email: formData.get("email"),
       customer_phone: formData.get("phone"),
       message: formData.get("message"),
       expires_at: formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : undefined,
    };

    try {
        const res = await fetch(`${API_BASE}/reservations/manual`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || "Varauksen luomisessa virhe");
            return;
        }
        
        setIsManualOpen(false);
        fetchReservations();
    } catch (err) {
        alert("Virhe lähetyksessä");
    } finally {
        setManualLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingReservation) return;
      
      setManualLoading(true);
      const formData = new FormData(e.currentTarget);
      const newExpiresAt = formData.get("expires_at") 
          ? new Date(formData.get("expires_at") as string).toISOString() 
          : editingReservation.expires_at;

      try {
          const res = await fetch(`${API_BASE}/reservations/${editingReservation.id}`, {
              method: "PATCH",
              headers: {
                 "Content-Type": "application/json",
                 Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                  expires_at: newExpiresAt,
                  status: formData.get("status") || editingReservation.status,
                  message: formData.get("message")
              })
          });
          
          if (!res.ok) throw new Error("Update failed");
          
          setEditingReservation(null);
          fetchReservations();
      } catch (err) {
          alert("Päivitys epäonnistui");
      } finally {
          setManualLoading(false);
      }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
        const method = status === 'cancelled' ? 'DELETE' : 'PATCH';
        const url = `${API_BASE}/reservations/${id}`;
        const body = status === 'cancelled' ? undefined : JSON.stringify({ status });
        
        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: body,
        });

        if (res.ok) {
            fetchReservations();
        }
    } catch (error) {
        console.error("Failed to update reservation", error);
    } finally {
        setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Varaukset</h1>
        <button 
            onClick={handleOpenManual}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
            <Plus className="h-4 w-4" />
            Uusi Varaus
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Tuote
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Asiakas
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Tila
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Voimassa
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Toiminnot
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{reservation.product_name}</div>
                  {reservation.product_sku && (
                    <div className="text-xs text-slate-500">SKU: {reservation.product_sku}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">{reservation.customer_name}</div>
                  <div className="text-xs text-slate-500">{reservation.customer_email}</div>
                  <div className="text-xs text-slate-500">{reservation.customer_phone}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      reservation.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      reservation.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {reservation.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    <div className="flex flex-col">
                        <span>{format(new Date(reservation.expires_at), "d.M.yyyy HH:mm")}</span>
                        {new Date(reservation.expires_at) < new Date() && reservation.status !== 'cancelled' && (
                            <span className="text-red-500 text-xs font-semibold">Vanhentunut</span>
                        )}
                    </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                        {/* Edit Button */}
                        <button
                            onClick={() => setEditingReservation(reservation)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
                            title="Muokkaa"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>

                  {reservation.status === 'pending' && (
                    <>
                         <button
                            onClick={() => updateStatus(reservation.id, 'confirmed')}
                            disabled={updating === reservation.id}
                            className="inline-flex items-center justify-center rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                        >
                            Vahvista
                        </button>
                        <button
                            onClick={() => updateStatus(reservation.id, 'cancelled')}
                            disabled={updating === reservation.id}
                            className="inline-flex items-center justify-center rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                            Peruuta
                        </button>
                    </>
                  )}
                  {(reservation.status === 'confirmed' || reservation.status === 'expired') && (
                      <button
                        onClick={() => updateStatus(reservation.id, 'cancelled')}
                        disabled={updating === reservation.id}
                        className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
                    >
                        Peruuta
                    </button>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Creation Modal */}
      <Modal 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
        title="Luo Uusi Varaus (Admin)"
      >
          <form onSubmit={handleManualCreate} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tuote</label>
                  <input type="hidden" name="product_id" value={selectedProduct?.id || ''} />
                  
                  {!selectedProduct ? (
                      <div className="relative">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                  type="text"
                                  placeholder="Hae tuotetta nimellä, SKU:lla tai hinnalla..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-sm focus:border-slate-500 focus:outline-none"
                              />
                          </div>
                          
                          {searchTerm.length > 0 && (
                             <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                                  {manualProducts
                                    .filter(p => {
                                        const term = searchTerm.toLowerCase();
                                        const price = (p.sale_price || p.regular_price || 0).toString();
                                        return (
                                            p.name.toLowerCase().includes(term) || 
                                            p.sku.toLowerCase().includes(term) ||
                                            price.includes(term)
                                        );
                                    })
                                    .map(p => (
                                      <button
                                          key={p.id}
                                          type="button"
                                          onClick={() => {
                                              setSelectedProduct(p);
                                              setSearchTerm("");
                                          }}
                                          className="flex w-full flex-col items-start px-4 py-2 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0"
                                      >
                                          <div className="flex w-full justify-between items-center">
                                              <span className="text-sm font-medium text-slate-900">{p.name}</span>
                                              <span className="text-sm font-bold text-slate-900">
                                                  {p.sale_price || p.regular_price || 0} €
                                              </span>
                                          </div>
                                          <span className="text-xs text-slate-500">SKU: {p.sku}</span>
                                      </button>
                                  ))}
                                  {manualProducts.filter(p => {
                                        const term = searchTerm.toLowerCase();
                                        const price = (p.sale_price || p.regular_price || 0).toString();
                                        return (
                                            p.name.toLowerCase().includes(term) || 
                                            p.sku.toLowerCase().includes(term) ||
                                            price.includes(term)
                                        );
                                    }).length === 0 && (
                                      <div className="p-4 text-center text-sm text-slate-500">
                                          Ei tuloksia
                                      </div>
                                  )}
                             </div>
                          )}
                      </div>
                  ) : (
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div>
                              <p className="text-sm font-medium text-slate-900">{selectedProduct.name}</p>
                              <p className="text-xs text-slate-500">SKU: {selectedProduct.sku}</p>
                          </div>
                          <button
                              type="button"
                              onClick={() => setSelectedProduct(null)}
                              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          >
                              <X className="h-4 w-4" />
                          </button>
                      </div>
                  )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Nimi</label>
                    <input name="name" required className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Puhelin</label>
                    <input name="phone" required className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
                 </div>
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-700">Sähköposti</label>
                    <input name="email" type="email" required className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-700">Voimassa Asti (Valinnainen)</label>
                    <input name="expires_at" type="datetime-local" className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
                    <p className="text-xs text-slate-500">Jätä tyhjäksi automaattista 48h varten</p>
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-700">Viesti / Huomio</label>
                    <textarea name="message" className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <button 
                  type="submit" 
                  disabled={manualLoading}
                  className="w-full rounded-lg bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                  {manualLoading ? "Tallennetaan..." : "Luo Varaus"}
              </button>
          </form>
      </Modal>

      {/* Edit Modal */}
      {editingReservation && (
          <Modal
             isOpen={!!editingReservation}
             onClose={() => setEditingReservation(null)}
             title="Muokkaa Varausta"
          >
              <form onSubmit={handleUpdate} className="space-y-4">
                   <div className="rounded bg-slate-50 p-3 text-sm">
                       <p className="font-medium text-slate-900">{editingReservation.product_name}</p>
                       <p className="text-slate-500">{editingReservation.customer_name}</p>
                   </div>
                   
                   <div>
                        <label className="block text-sm font-medium text-slate-700">Voimassa Asti</label>
                        <input 
                            name="expires_at" 
                            type="datetime-local" 
                            defaultValue={new Date(editingReservation.expires_at).toISOString().slice(0, 16)}
                            className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                        />
                   </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tila</label>
                        <select 
                            name="status" 
                            defaultValue={editingReservation.status}
                            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                   </div>
                   
                   <div>
                        <label className="block text-sm font-medium text-slate-700">Viesti</label>
                        <textarea 
                            name="message" 
                            defaultValue={editingReservation.message || ""}
                            className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                        />
                   </div>

                   <button 
                      type="submit" 
                      disabled={manualLoading}
                      className="w-full rounded-lg bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                      {manualLoading ? "Päivitetään..." : "Päivitä Tiedot"}
                  </button>
              </form>
          </Modal>
      )}
    </div>
  );
}
