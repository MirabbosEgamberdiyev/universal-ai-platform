"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { Users2, Plus, Phone, Mail, DollarSign, Package, CheckCircle } from "lucide-react";

export default function CrmPage() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // New Contact
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // New Product
  const [prodName, setProdName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");

  const stages = ["LEAD", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON"];

  const loadCrmData = async () => {
    try {
      const cList = await apiRequest<any[]>("/crm/contacts");
      setContacts(cList);
      const pList = await apiRequest<any[]>("/crm/products");
      setProducts(pList);
    } catch (e) {
      console.error("CRM load error:", e);
    }
  };

  useEffect(() => {
    loadCrmData();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest<any>("/crm/contacts", {
        method: "POST",
        body: JSON.stringify({ fullName: name, email, phone, stage: "LEAD", notes }),
      });
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setShowAddContact(false);
      loadCrmData();
    } catch (e: any) {
      alert("Error adding contact: " + (e?.detail || e?.message));
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest<any>("/crm/products", {
        method: "POST",
        body: JSON.stringify({ name: prodName, sku, price: parseFloat(price) || 0, currency: "USD" }),
      });
      setProdName("");
      setSku("");
      setPrice("");
      setShowAddProduct(false);
      loadCrmData();
    } catch (e: any) {
      alert("Error adding product: " + (e?.detail || e?.message));
    }
  };

  const handleAdvanceStage = async (contactId: string, currentStage: string) => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      try {
        await apiRequest<any>(`/crm/contacts/${contactId}/stage`, {
          method: "PATCH",
          body: JSON.stringify({ stage: nextStage }),
        });
        loadCrmData();
      } catch (e: any) {
        alert("Failed to advance stage: " + (e?.detail || e?.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.crm}</h1>
          <p className="text-xs text-slate-500">Social customer inquiries, automated lead capture, and product catalog.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddContact(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Lead
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Package className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageContacts = contacts.filter((c) => c.stage === stage);
          return (
            <div key={stage} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[360px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {stageContacts.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleAdvanceStage(contact.id, contact.stage)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer hover:border-indigo-500 transition space-y-2"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{contact.fullName}</p>
                    {contact.email && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> {contact.email}
                      </p>
                    )}
                    {contact.phone && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {contact.phone}
                      </p>
                    )}
                    <span className="text-[9px] text-indigo-500 font-semibold block text-right">
                      Click to advance →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Customer Lead</h3>
            <form onSubmit={handleCreateContact} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Phone Number (+998 ...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <textarea
                placeholder="Notes / Inquired services..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Catalog Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Product Name"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="SKU (e.g. SMM-PRO-01)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="number"
                step="0.01"
                required
                placeholder="Price ($USD)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
