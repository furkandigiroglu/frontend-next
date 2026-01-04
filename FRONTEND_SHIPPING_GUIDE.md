# 🚚 Frontend Shipping Sistemi Entegrasyon Rehberi

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [API Endpoints](#api-endpoints)
3. [Checkout Entegrasyonu](#checkout-entegrasyonu)
4. [Admin Panel Entegrasyonu](#admin-panel-entegrasyonu)
5. [React Örnek Componentler](#react-örnek-componentler)

---

## 🎯 Genel Bakış

Backend'de 3 tip shipping hesaplama modeli var:

### 1. **Distance-Based (Mesafe Bazlı)**
- Örnek: Sofa teslimatı
- Formül: `base_price + (distance_km × price_per_km)`
- Kullanım: Büyük ürünler, max mesafe limiti ile (örn: 300km)
- Seed Data: 25€ + (mesafe × 0.50€), max 300km

### 2. **Flat Rate (Sabit Fiyat)**
- Örnek: Küçük ürünler
- Formül: Sabit fiyat
- Kullanım: Standart paket gönderileri
- Seed Data: 15€ sabit

### 3. **Zone-Based (Bölge Bazlı)**
- Örnek: Şehir içi özel fiyatlar
- Formül: Bölgeye göre özel fiyat
- Kullanım: Zone override ile özel kampanyalar
- Seed Data: Helsinki sofa teslimatı ÜCRETSİZ (0€)

---

## 🔌 API Endpoints

### PUBLIC ENDPOINT (Authentication GEREKMİYOR)

#### 1. Shipping Hesaplama
```http
POST /api/v1/shipping/calculate
Content-Type: application/json

{
  "postal_code": "00100",
  "product_ids": ["uuid-1", "uuid-2"]
}
```

**Response (Success):**
```json
{
  "available": true,
  "postal_code": "00100",
  "zone_name": "Helsinki Metro Area",
  "total_cost": "0.00",
  "delivery_days": 5,
  "details": [
    {
      "rule_name": "Sofa Delivery",
      "product_count": 1,
      "products": ["Kulmasohva Premium"],
      "cost": "0.00",
      "reason": "Ilmainen toimitus Helsinki-alueelle"
    }
  ],
  "message": null
}
```

**Response (Not Available):**
```json
{
  "available": false,
  "postal_code": "96100",
  "zone_name": null,
  "total_cost": "0",
  "delivery_days": 0,
  "details": [],
  "message": "Toimitusta ei ole saatavilla tälle postinumerolle."
}
```

**Response (No Rule for Product):**
```json
{
  "available": false,
  "postal_code": "00100",
  "zone_name": "Helsinki Metro Area",
  "total_cost": "0",
  "delivery_days": 0,
  "details": [],
  "message": "Joillekin tuotteille ei ole toimitussääntöä."
}
```

### ADMIN ENDPOINTS (Authentication GEREKLI)

#### 2. Shipping Rules Management

**List Rules:**
```http
GET /api/v1/shipping/rules
Authorization: Bearer {token}
```

**Create Rule:**
```http
POST /api/v1/shipping/rules
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Express Delivery",
  "description": "Fast delivery for small items",
  "rule_type": "flat_rate",
  "flat_rate_price": 25.00,
  "estimated_delivery_days": 1,
  "is_active": true,
  "priority": 5,
  "category_ids": ["category-uuid-1", "category-uuid-2"]
}
```

**Update Rule:**
```http
PATCH /api/v1/shipping/rules/{rule_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_active": false,
  "priority": 3
}
```

**Delete Rule:**
```http
DELETE /api/v1/shipping/rules/{rule_id}
Authorization: Bearer {token}
```

#### 3. Shipping Zones Management

**List Zones:**
```http
GET /api/v1/shipping/zones
Authorization: Bearer {token}
```

**Create Zone:**
```http
POST /api/v1/shipping/zones
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Oulu Area",
  "zone_group": "oulu",
  "distance_from_store_km": 600,
  "is_active": true,
  "postal_codes": [
    {
      "postal_code_start": "90100",
      "postal_code_end": "90990",
      "city": "Oulu"
    }
  ]
}
```

#### 4. Zone Price Overrides Management

**Create Override:**
```http
POST /api/v1/shipping/zone-prices
Authorization: Bearer {token}
Content-Type: application/json

{
  "shipping_rule_id": "rule-uuid",
  "shipping_zone_id": "zone-uuid",
  "override_price": 0.00,
  "override_enabled": true
}
```

---

## 🛒 Checkout Entegrasyonu

### Kullanıcı Akışı

1. **Checkout sayfasına giriş**
   - Cart'taki product_ids'leri topla
   - Initial state: shipping = null

2. **Postal Code girişi**
   - User 5 haneli postal code girer (örn: "00100")
   - Real-time validation (5 digit, numeric)
   - "Hesapla" butonu aktif olur

3. **Shipping Hesaplama**
   - `POST /api/v1/shipping/calculate` çağrısı
   - Loading state göster
   - Response'u parse et

4. **Sonuç Gösterimi**
   - **Başarılı:** Toplam cost + delivery time + details
   - **Başarısız:** Error message (available: false)
   - **Kısmi Başarı:** Bazı ürünler için kural yok warning

5. **Order Placement**
   - Shipping cost'u order total'e ekle
   - Backend'e shipping_cost field'ı ile gönder

### UI/UX Önerileri

```
┌────────────────────────────────────┐
│  Teslimat Bilgileri                │
├────────────────────────────────────┤
│                                    │
│  Postinumero: [00100] [Hesapla]   │
│                                    │
│  ✅ Toimitus saatavilla            │
│  📍 Helsinki Metro Area            │
│  💰 Toimituskulu: ILMAINEN         │
│  📦 Toimitus: 5 päivää             │
│                                    │
│  Toimituskulut tuotteittain:       │
│  • Sofa (1 kpl): 0,00 €           │
│    Ilmainen toimitus Helsinki      │
│                                    │
└────────────────────────────────────┘
```

**Error States:**
```
❌ Toimitusta ei ole saatavilla tälle postinumerolle.
⚠️  Joillekin tuotteille ei ole toimitussääntöä.
```

---

## 👨‍💼 Admin Panel Entegrasyonu

### 1. Shipping Rules Manager

**Görüntüleme Tablosu:**

| Kural Adı | Tip | Fiyat | Öncelik | Kategoriler | Durum | İşlemler |
|-----------|-----|-------|---------|-------------|-------|----------|
| Sofa Delivery | Distance | 25€ + 0.50€/km | 1 | Kulmasohvat | ✅ | Edit/Delete |
| Small Items | Flat Rate | 15€ | 10 | - | ✅ | Edit/Delete |

**Create/Edit Form:**
```
┌─────────────────────────────────────────┐
│  Kural Adı: [__________________]        │
│  Açıklama:  [__________________]        │
│                                         │
│  Kural Tipi:                            │
│  ○ Distance-Based (Mesafe Bazlı)        │
│  ○ Flat Rate (Sabit Fiyat)              │
│  ○ Zone-Based (Bölge Bazlı)             │
│                                         │
│  [Distance-Based seçiliyse:]            │
│  Temel Fiyat: [25] €                    │
│  Km Başına:   [0.50] €                  │
│  Max Mesafe:  [300] km                  │
│                                         │
│  [Flat Rate seçiliyse:]                 │
│  Sabit Fiyat: [15] €                    │
│                                         │
│  Teslimat Süresi: [5] gün               │
│  Öncelik: [1] (düşük = önce uygulanır)  │
│                                         │
│  Kategoriler:                           │
│  ☑ Kulmasohvat                          │
│  ☐ Vuodesohvat                          │
│  ☐ Hyllyt                               │
│                                         │
│  Durum: ☑ Aktif                         │
│                                         │
│  [İptal] [Kaydet]                       │
└─────────────────────────────────────────┘
```

### 2. Shipping Zones Manager

**Görüntüleme:**

| Bölge Adı | Mesafe | Posta Kodları | Durum | İşlemler |
|-----------|--------|---------------|-------|----------|
| Helsinki Metro | 0 km | 00100-00990 (3 aralık) | ✅ | Edit/Delete |
| Turku Area | 160 km | 20100-20960 | ✅ | Edit/Delete |

**Create/Edit Form:**
```
┌─────────────────────────────────────────┐
│  Bölge Adı: [__________________]        │
│  Grup Kodu: [__________________]        │
│  Mesafe:    [160] km                    │
│                                         │
│  Posta Kodu Aralıkları:                 │
│  ┌───────────────────────────────────┐  │
│  │ Başlangıç  Bitiş    Şehir         │  │
│  │ [20100] - [20960]  [Turku]  [Sil] │  │
│  │ [+Yeni Aralık Ekle]               │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Durum: ☑ Aktif                         │
│                                         │
│  [İptal] [Kaydet]                       │
└─────────────────────────────────────────┘
```

### 3. Zone Price Overrides

**Görüntüleme:**

| Kural | Bölge | Özel Fiyat | Durum | İşlemler |
|-------|-------|------------|-------|----------|
| Sofa Delivery | Helsinki Metro | 0,00 € (ÜCRETSIZ) | ✅ | Edit/Delete |

**Create Form:**
```
┌─────────────────────────────────────────┐
│  Kural Seç:  [Sofa Delivery ▼]          │
│  Bölge Seç:  [Helsinki Metro ▼]         │
│  Özel Fiyat: [0.00] €                   │
│  Durum: ☑ Aktif                         │
│                                         │
│  💡 Bu bölge için kurala özel fiyat     │
│     belirler. 0.00 = Ücretsiz teslimat  │
│                                         │
│  [İptal] [Kaydet]                       │
└─────────────────────────────────────────┘
```

---

## ⚛️ React Örnek Componentler

### 1. ShippingCalculator Component (Checkout)

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const ShippingCalculator = ({ productIds, onShippingCalculated }) => {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    if (postalCode.length !== 5) {
      setError('Postinumero tulee olla 5 numeroa');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/shipping/calculate',
        {
          postal_code: postalCode,
          product_ids: productIds,
        }
      );

      setResult(response.data);
      
      if (response.data.available) {
        onShippingCalculated({
          cost: parseFloat(response.data.total_cost),
          days: response.data.delivery_days,
          zone: response.data.zone_name,
        });
      }
    } catch (err) {
      setError('Virhe laskettaessa toimituskuluja');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="shipping-calculator">
      <h3>Teslimat Bilgileri</h3>
      
      <div className="postal-code-input">
        <label>Postinumero:</label>
        <input
          type="text"
          maxLength="5"
          pattern="[0-9]{5}"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
          placeholder="00100"
        />
        <button 
          onClick={handleCalculate} 
          disabled={loading || postalCode.length !== 5}
        >
          {loading ? 'Lasketaan...' : 'Laske Toimituskulut'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {result && !result.available && (
        <div className="alert alert-warning">
          ⚠️ {result.message}
        </div>
      )}

      {result && result.available && (
        <div className="shipping-result">
          <div className="success-badge">
            ✅ Toimitus saatavilla
          </div>
          
          <div className="shipping-info">
            <div className="info-row">
              <span className="label">📍 Alue:</span>
              <span className="value">{result.zone_name}</span>
            </div>
            
            <div className="info-row">
              <span className="label">💰 Toimituskulu:</span>
              <span className="value price">
                {parseFloat(result.total_cost) === 0 
                  ? 'ILMAINEN' 
                  : formatPrice(result.total_cost)
                }
              </span>
            </div>
            
            <div className="info-row">
              <span className="label">📦 Toimitusaika:</span>
              <span className="value">{result.delivery_days} päivää</span>
            </div>
          </div>

          {result.details && result.details.length > 0 && (
            <div className="shipping-details">
              <h4>Toimituskulut tuotteittain:</h4>
              {result.details.map((detail, idx) => (
                <div key={idx} className="detail-item">
                  <div className="detail-header">
                    <strong>{detail.rule_name}</strong>
                    <span>{formatPrice(detail.cost)}</span>
                  </div>
                  <div className="detail-products">
                    {detail.products.join(', ')} ({detail.product_count} kpl)
                  </div>
                  {detail.reason && (
                    <div className="detail-reason">
                      💡 {detail.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
```

**Kullanım (Checkout Page):**
```jsx
const CheckoutPage = () => {
  const [cart, setCart] = useState([...]); // Cart items
  const [shippingCost, setShippingCost] = useState(0);

  const productIds = cart.map(item => item.product_id);
  
  const handleShippingCalculated = (shipping) => {
    setShippingCost(shipping.cost);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  return (
    <div className="checkout-page">
      <CartSummary items={cart} />
      
      <ShippingCalculator 
        productIds={productIds}
        onShippingCalculated={handleShippingCalculated}
      />
      
      <OrderSummary 
        subtotal={subtotal}
        shipping={shippingCost}
        total={total}
      />
      
      <button onClick={handlePlaceOrder}>
        Vahvista Tilaus ({formatPrice(total)})
      </button>
    </div>
  );
};
```

### 2. ShippingRulesManager Component (Admin)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShippingRulesManager = () => {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    fetchRules();
    fetchCategories();
  }, []);

  const fetchRules = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      'http://localhost:8000/api/v1/shipping/rules',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRules(response.data);
  };

  const fetchCategories = async () => {
    const response = await axios.get(
      'http://localhost:8000/api/v1/categories'
    );
    setCategories(response.data);
  };

  const handleDelete = async (ruleId) => {
    if (!confirm('Bu kuralı silmek istediğinize emin misiniz?')) return;
    
    const token = localStorage.getItem('authToken');
    await axios.delete(
      `http://localhost:8000/api/v1/shipping/rules/${ruleId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    fetchRules();
  };

  return (
    <div className="shipping-rules-manager">
      <div className="header">
        <h2>Teslimat Kuralları</h2>
        <button onClick={() => setShowForm(true)}>
          + Yeni Kural Ekle
        </button>
      </div>

      <table className="rules-table">
        <thead>
          <tr>
            <th>Kural Adı</th>
            <th>Tip</th>
            <th>Fiyat</th>
            <th>Öncelik</th>
            <th>Teslimat</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id}>
              <td>
                <strong>{rule.name}</strong>
                {rule.description && (
                  <div className="description">{rule.description}</div>
                )}
              </td>
              <td>
                {rule.rule_type === 'distance_based' && '📏 Mesafe Bazlı'}
                {rule.rule_type === 'flat_rate' && '💰 Sabit Fiyat'}
                {rule.rule_type === 'zone_based' && '📍 Bölge Bazlı'}
              </td>
              <td>
                {rule.rule_type === 'distance_based' && (
                  <>
                    {rule.base_price}€ + {rule.price_per_km}€/km
                    <br />
                    <small>Max: {rule.max_distance_km}km</small>
                  </>
                )}
                {rule.rule_type === 'flat_rate' && (
                  <>{rule.flat_rate_price}€</>
                )}
              </td>
              <td>{rule.priority}</td>
              <td>{rule.estimated_delivery_days} gün</td>
              <td>
                {rule.is_active ? (
                  <span className="badge success">✅ Aktif</span>
                ) : (
                  <span className="badge inactive">❌ Pasif</span>
                )}
              </td>
              <td className="actions">
                <button onClick={() => { setEditingRule(rule); setShowForm(true); }}>
                  ✏️ Düzenle
                </button>
                <button onClick={() => handleDelete(rule.id)}>
                  🗑️ Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <ShippingRuleForm
          rule={editingRule}
          categories={categories}
          onClose={() => { setShowForm(false); setEditingRule(null); }}
          onSave={() => { fetchRules(); setShowForm(false); setEditingRule(null); }}
        />
      )}
    </div>
  );
};

export default ShippingRulesManager;
```

### 3. ShippingZonesManager Component (Admin)

```jsx
const ShippingZonesManager = () => {
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      'http://localhost:8000/api/v1/shipping/zones',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setZones(response.data);
  };

  return (
    <div className="shipping-zones-manager">
      <div className="header">
        <h2>Teslimat Bölgeleri</h2>
        <button onClick={() => setShowForm(true)}>
          + Yeni Bölge Ekle
        </button>
      </div>

      <div className="zones-grid">
        {zones.map(zone => (
          <div key={zone.id} className="zone-card">
            <div className="zone-header">
              <h3>{zone.name}</h3>
              <span className="distance">{zone.distance_from_store_km} km</span>
            </div>
            
            <div className="postal-codes">
              <h4>Posta Kodları:</h4>
              {zone.postal_codes.map((pc, idx) => (
                <div key={idx} className="postal-range">
                  📮 {pc.postal_code_start} - {pc.postal_code_end}
                  <span className="city">{pc.city}</span>
                </div>
              ))}
            </div>

            <div className="zone-actions">
              <button>✏️ Düzenle</button>
              <button>🗑️ Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 📊 Test Senaryoları

### Mevcut Seed Data ile Test:

**Senaryo 1: Helsinki Sofa (Ücretsiz)**
```bash
curl -X POST http://localhost:8000/api/v1/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "postal_code": "00100",
    "product_ids": ["sofa-uuid"]
  }'

# Beklenen: available: true, total_cost: "0.00", message: "Ilmainen toimitus"
```

**Senaryo 2: Turku Sofa (Mesafe Bazlı)**
```bash
curl -X POST http://localhost:8000/api/v1/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "postal_code": "20100",
    "product_ids": ["sofa-uuid"]
  }'

# Beklenen: available: true, total_cost: "105.00" (25 + 160*0.5)
```

**Senaryo 3: Küçük Ürün (Sabit Fiyat)**
```bash
curl -X POST http://localhost:8000/api/v1/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "postal_code": "00100",
    "product_ids": ["small-item-uuid"]
  }'

# Beklenen: available: true, total_cost: "15.00"
```

**Senaryo 4: Desteklenmeyen Alan**
```bash
curl -X POST http://localhost:8000/api/v1/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "postal_code": "99999",
    "product_ids": ["sofa-uuid"]
  }'

# Beklenen: available: false, message: "Toimitusta ei ole saatavilla..."
```

---

## 🎨 CSS Stil Önerileri

```css
/* Shipping Calculator */
.shipping-calculator {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  margin: 20px 0;
}

.postal-code-input {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.postal-code-input input {
  flex: 1;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 16px;
}

.postal-code-input button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.postal-code-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.shipping-result {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 2px solid #28a745;
}

.success-badge {
  background: #28a745;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
  font-weight: 600;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.info-row .price {
  font-size: 24px;
  font-weight: bold;
  color: #28a745;
}

.shipping-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #eee;
}

.detail-item {
  background: #f8f9fa;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 6px;
}

.detail-reason {
  color: #6c757d;
  font-size: 14px;
  margin-top: 8px;
}

/* Alert Styles */
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}
```

---

## 🔒 Güvenlik Notları

1. **Public Endpoint:**
   - `/shipping/calculate` authentication gerektirmez
   - Rate limiting var (SlowAPI)
   - Sadece okuma işlemi yapar

2. **Admin Endpoints:**
   - Tüm CRUD işlemler authentication gerektirir
   - JWT token ile `Authorization: Bearer {token}`
   - Admin role kontrolü yapılmalı (get_current_user dependency)

3. **Input Validation:**
   - Postal code: 5 digit numeric
   - Product IDs: Valid UUID format
   - Backend otomatik validasyon yapar

---

## 📱 Mobil Responsive Öneriler

```css
@media (max-width: 768px) {
  .postal-code-input {
    flex-direction: column;
  }
  
  .postal-code-input button {
    width: 100%;
  }
  
  .shipping-details {
    font-size: 14px;
  }
  
  .rules-table {
    display: block;
    overflow-x: auto;
  }
}
```

---

## 🚀 Production Checklist

Frontend deploy öncesi:

- [ ] Environment variables ayarlandı (API_BASE_URL)
- [ ] Error handling tüm API calls'da mevcut
- [ ] Loading states tüm async işlemlerde
- [ ] Success/Error toasts kullanıcıya feedback veriyor
- [ ] Admin panel sadece authenticated users erişebiliyor
- [ ] Postal code validation client-side yapılıyor
- [ ] Shipping cost checkout'ta doğru hesaplanıyor
- [ ] Multi-language support (fi/en) hazır
- [ ] Mobile responsive test edildi
- [ ] Accessibility (ARIA labels) eklendi

---

## 📞 Backend Support

Sorun olursa kontrol edilecekler:

1. **Server çalışıyor mu?**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Shipping router registered mi?**
   ```bash
   curl http://localhost:8000/api/v1/shipping/rules
   ```

3. **Seed data var mı?**
   ```bash
   # PostgreSQL'de kontrol:
   SELECT COUNT(*) FROM shipping_zones;
   SELECT COUNT(*) FROM shipping_rules;
   ```

4. **Logs:**
   ```bash
   # Terminal'de backend logs'u izle
   # SQLAlchemy queries göreceksin
   ```

---

**Son Güncelleme:** 2026-01-04
**Backend Version:** 0.1.0
**API Version:** v1
