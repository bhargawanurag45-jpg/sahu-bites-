import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase";
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

/* ---------------------------------------------------------
   SAHU BITES — restaurant ordering + kitchen ticket system
   Design: dark, warm-charcoal + antique gold + deep maroon
   Type: Playfair Display (display) / Jost (body) / JetBrains Mono (data)
--------------------------------------------------------- */

const COLORS = {
  bg: "#121110",
  surface: "#1C1917",
  surface2: "#242019",
  line: "#332D26",
  gold: "#C9A24B",
  goldLight: "#E7CB84",
  maroon: "#7A2331",
  maroonLight: "#9C3040",
  text: "#F3EAD8",
  textMuted: "#A69C8E",
  veg: "#5E9C5B",
  nonveg: "#B33B3B",
  ok: "#5E9C5B",
  warn: "#C9A24B",
  danger: "#B33B3B",
};

const STAFF_PIN = "1";
const ADMIN_PIN = "9999";

const DEFAULT_MENU = [
  { id: "m1", name: "Paneer Tikka", price: 220, category: "Starters", veg: true, desc: "Char-grilled cottage cheese, smoked spices" },
  { id: "m2", name: "Veg Spring Roll", price: 180, category: "Starters", veg: true, desc: "Crisp rolls, julienned vegetables" },
  { id: "m3", name: "Paneer Chilli", price: 230, category: "Starters", veg: true, desc: "Indo-Chinese tossed cottage cheese" },
  { id: "m4", name: "Veg Manchurian", price: 200, category: "Starters", veg: true, desc: "Fried vegetable balls, tangy sauce" },
  { id: "m5", name: "Paneer Butter Masala", price: 260, category: "Main Course", veg: true, desc: "Tomato-cashew gravy, cream finish" },
  { id: "m6", name: "Dal Makhani", price: 220, category: "Main Course", veg: true, desc: "Slow-simmered black lentils, butter" },
  { id: "m7", name: "Kadhai Paneer", price: 260, category: "Main Course", veg: true, desc: "Bell peppers, onion, kadhai masala" },
  { id: "m8", name: "Palak Paneer", price: 240, category: "Main Course", veg: true, desc: "Spinach purée, cottage cheese cubes" },
  { id: "m9", name: "Butter Naan", price: 60, category: "Breads", veg: true, desc: "Tandoor baked, brushed with butter" },
  { id: "m10", name: "Tandoori Roti", price: 40, category: "Breads", veg: true, desc: "Whole-wheat, clay-oven roasted" },
  { id: "m11", name: "Lachha Paratha", price: 70, category: "Breads", veg: true, desc: "Layered, flaky flatbread" },
  { id: "m12", name: "Veg Biryani", price: 220, category: "Rice & Biryani", veg: true, desc: "Aromatic basmati, garden vegetables" },
  { id: "m13", name: "Jeera Rice", price: 160, category: "Rice & Biryani", veg: true, desc: "Cumin-tempered steamed rice" },
  { id: "m20", name: "Veg Chowmein", price: 170, category: "Chinese", veg: true, desc: "Stir-fried noodles, garden vegetables" },
  { id: "m21", name: "Veg Fried Rice", price: 170, category: "Chinese", veg: true, desc: "Wok-tossed rice, soy & vegetables" },
  { id: "m15", name: "Gulab Jamun", price: 100, category: "Desserts", veg: true, desc: "Warm milk dumplings, sugar syrup" },
  { id: "m16", name: "Kulfi", price: 120, category: "Desserts", veg: true, desc: "Traditional Indian ice cream" },
  { id: "m17", name: "Masala Chai", price: 40, category: "Beverages", veg: true, desc: "Spiced milk tea" },
  { id: "m18", name: "Sweet Lassi", price: 90, category: "Beverages", veg: true, desc: "Churned yogurt, cardamom" },
  { id: "m19", name: "Cold Drink", price: 60, category: "Beverages", veg: true, desc: "Chilled aerated beverage" },
];

const CATEGORY_ORDER = ["Starters", "Chinese", "Main Course", "Breads", "Rice & Biryani", "Desserts", "Beverages"];
const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);
const STATUS_FLOW = ["New", "Preparing", "Served", "Paid"];
const STATUS_COLOR = { New: COLORS.gold, Preparing: "#D98A3D", Served: COLORS.veg, Paid: COLORS.textMuted };

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

/* Data layer lives in the Firestore calls inside App() below. */

/* ---------------------------- LOGO ---------------------------- */
function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Sahu Bites logo">
      <circle cx="50" cy="50" r="48" fill={COLORS.surface2} stroke={COLORS.gold} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS.gold} strokeWidth="0.75" opacity="0.5" />
      <path
        d="M32 30 C32 30 30 45 32 55 C33.5 62 38 64 38 64 L38 78"
        fill="none" stroke={COLORS.goldLight} strokeWidth="2.4" strokeLinecap="round"
      />
      <path d="M32 30 L32 48" fill="none" stroke={COLORS.goldLight} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M35.5 30 L35.5 48" fill="none" stroke={COLORS.goldLight} strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M67 30 C60 30 58 37 58 44 C58 50 62 54 66 54.5 L66 78"
        fill="none" stroke={COLORS.goldLight} strokeWidth="2.4" strokeLinecap="round"
      />
      <text x="50" y="47" textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="15" fill={COLORS.text} fontWeight="700">
        SB
      </text>
      <text x="50" y="60" textAnchor="middle" fontFamily="'Jost', sans-serif" fontSize="6.5" letterSpacing="2" fill={COLORS.textMuted}>
        SAHU BITES
      </text>
    </svg>
  );
}

/* ---------------------------- APP SHELL ---------------------------- */
export default function App() {
  const [role, setRole] = useState("customer"); // customer | staff | admin
  const [pinOk, setPinOk] = useState({ staff: false, admin: false });
  const [menuItems, setMenuItems] = useState(null);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const toastTimer = useRef(null);
  const roleRef = useRef(role);
  useEffect(() => { roleRef.current = role; }, [role]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Real-time sync: menu + orders. Any change on any device appears
  // instantly on every other device (customer / staff / admin).
  useEffect(() => {
    const menuRef = doc(db, "meta", "menu");
    const unsubMenu = onSnapshot(menuRef, async (snap) => {
      const data = snap.exists() ? snap.data() : null;
      if (data && Array.isArray(data.items) && data.items.length) {
        setMenuItems(data.items);
      } else {
        try { await setDoc(menuRef, { items: DEFAULT_MENU }); } catch (e) { /* will retry on next write */ }
        setMenuItems(DEFAULT_MENU);
      }
    });

    const ordersRef = query(collection(db, "orders"), orderBy("time", "asc"));
    const unsubOrders = onSnapshot(ordersRef, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders((prev) => {
        if (list.length > prev.length && roleRef.current !== "customer") {
          const newest = list[list.length - 1];
          showToast(`🔔 New order — Table ${newest.table} · ${formatINR(newest.total)}`);
        }
        return list;
      });
    });

    return () => { unsubMenu(); unsubOrders(); };
  }, [showToast]);

  async function persistMenu(next) {
    setMenuItems(next);
    try { await setDoc(doc(db, "meta", "menu"), { items: next }); } catch (e) { showToast("⚠️ Could not save — check internet connection"); }
  }

  async function placeOrder(table, items, paymentMethod) {
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const orderData = {
      invoiceNo: "SB-" + Date.now().toString().slice(-6),
      table,
      items,
      total,
      paymentMethod: paymentMethod || "Cash",
      status: "New",
      time: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, "orders"), orderData);
      showToast(`✅ Order placed for Table ${table}. Owner & staff notified.`);
      return { id: docRef.id, ...orderData };
    } catch (e) {
      showToast("⚠️ Order could not be sent — check internet connection");
      return { id: "local_" + Date.now(), ...orderData };
    }
  }

  async function updateStatus(orderId, status) {
    try { await updateDoc(doc(db, "orders", orderId), { status }); } catch (e) { showToast("⚠️ Could not update — check internet connection"); }
  }

  const newCount = orders.filter((o) => o.status === "New").length;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Jost:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .sb-btn { transition: transform .12s ease, opacity .12s ease, background .12s ease; cursor: pointer; }
        .sb-btn:hover { opacity: .9; }
        .sb-btn:active { transform: scale(0.97); }
        .sb-btn:focus-visible, .sb-tab:focus-visible, .sb-card:focus-visible, input:focus-visible, select:focus-visible, button:focus-visible {
          outline: 2px solid ${COLORS.gold}; outline-offset: 2px;
        }
        .sb-card { transition: transform .15s ease, border-color .15s ease; }
        .sb-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 8px; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
        @keyframes sbFadeUp { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes sbPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,162,75,0.5);} 50% { box-shadow: 0 0 0 6px rgba(201,162,75,0);} }
        .sb-ticket {
          background: repeating-linear-gradient(-45deg, ${COLORS.surface2} 0 8px, ${COLORS.surface} 8px 16px) bottom / 100% 8px no-repeat, ${COLORS.surface2};
          border: 1px dashed ${COLORS.gold};
        }
        @media print {
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {toast && (
        <div
          className="hide-on-print"
          style={{
            position: "fixed", top: 16, right: 16, zIndex: 200,
            background: COLORS.surface2, border: `1px solid ${COLORS.gold}`,
            padding: "12px 18px", borderRadius: 10, fontSize: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)", animation: "sbFadeUp .25s ease",
            maxWidth: 320,
          }}
        >
          {toast}
        </div>
      )}

      <div className="hide-on-print">
        <TopNav role={role} setRole={setRole} newCount={newCount} />

        {role === "customer" && menuItems && (
          <CustomerView menuItems={menuItems} onOrder={placeOrder} onShowInvoice={setPrintOrder} />
        )}

        {role === "staff" && (
          pinOk.staff ? (
            <StaffView orders={orders} onUpdateStatus={updateStatus} onShowInvoice={setPrintOrder} />
          ) : (
            <PinGate title="Staff Dashboard" hint="Ask the owner for the staff PIN" onSubmit={(p) => {
              const ok = p === STAFF_PIN;
              if (ok) setPinOk((s) => ({ ...s, staff: true }));
              else showToast("❌ Incorrect PIN");
              return ok;
            }} />
          )
        )}

        {role === "admin" && (
          pinOk.admin ? (
            menuItems && <AdminView menuItems={menuItems} onSave={persistMenu} showToast={showToast} orders={orders} />
          ) : (
            <PinGate title="Admin Panel" hint="Owner-only access" onSubmit={(p) => {
              const ok = p === ADMIN_PIN;
              if (ok) setPinOk((s) => ({ ...s, admin: true }));
              else showToast("❌ Incorrect PIN");
              return ok;
            }} />
          )
        )}
      </div>

      {printOrder && <InvoiceOverlay order={printOrder} onClose={() => setPrintOrder(null)} />}
    </div>
  );
}

/* ---------------------------- NAV ---------------------------- */
function TopNav({ role, setRole, newCount }) {
  const items = [
    { id: "customer", label: "Order" },
    { id: "staff", label: "Staff Dashboard" },
    { id: "admin", label: "Admin Panel" },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 24px", borderBottom: `1px solid ${COLORS.line}`,
      position: "sticky", top: 0, background: "rgba(18,17,16,0.92)", backdropFilter: "blur(6px)", zIndex: 100,
      flexWrap: "wrap", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Logo size={40} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>Sahu Bites</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
              padding: "2px 7px", borderRadius: 999, border: `1px solid ${COLORS.veg}`, color: COLORS.veg,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.veg }} />PURE VEG
            </span>
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 1 }}>स्वाद जो दिल तक पहुंचे</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {items.map((it) => (
          <button
            key={it.id}
            className="sb-btn sb-tab"
            onClick={() => setRole(it.id)}
            style={{
              position: "relative",
              padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500,
              border: `1px solid ${role === it.id ? COLORS.gold : COLORS.line}`,
              background: role === it.id ? COLORS.gold : "transparent",
              color: role === it.id ? "#1A1512" : COLORS.text,
            }}
          >
            {it.label}
            {it.id === "staff" && newCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6, background: COLORS.maroonLight,
                color: "#fff", fontSize: 10, borderRadius: 999, minWidth: 18, height: 18,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                animation: "sbPulse 1.6s infinite",
              }}>{newCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- PIN GATE ---------------------------- */
function PinGate({ title, hint, onSubmit }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function attempt() {
    const clean = pin.trim();
    if (!clean) { setError(true); return; }
    const ok = onSubmit(clean);
    if (!ok) {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 400);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <style>{`@keyframes sbShake { 10%,90%{transform:translateX(-1px);} 20%,80%{transform:translateX(2px);} 30%,50%,70%{transform:translateX(-4px);} 40%,60%{transform:translateX(4px);} }`}</style>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 6 }}>{title}</div>
      <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24 }}>{hint}</div>
      <div style={{ animation: shake ? "sbShake .4s" : "none" }}>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete="off"
          value={pin}
          onChange={(e) => { setError(false); setPin(e.target.value.replace(/[^0-9]/g, "")); }}
          onKeyDown={(e) => { if (e.key === "Enter") attempt(); }}
          placeholder="Enter PIN"
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 8, marginBottom: 10,
            background: COLORS.surface, border: `1px solid ${error ? COLORS.nonveg : COLORS.line}`, color: COLORS.text,
            fontSize: 16, letterSpacing: 4, textAlign: "center", fontFamily: "'JetBrains Mono', monospace",
          }}
        />
      </div>
      {error && (
        <div style={{ color: COLORS.nonveg, fontSize: 12, marginBottom: 12 }}>Galat PIN — dobara try karein</div>
      )}
      <button type="button" className="sb-btn" onClick={attempt} style={{
        width: "100%", padding: "12px 16px", borderRadius: 8, border: "none",
        background: COLORS.gold, color: "#1A1512", fontWeight: 600, fontSize: 14, marginTop: error ? 0 : 12,
      }}>Unlock</button>
    </div>
  );
}

/* ---------------------------- CUSTOMER VIEW ---------------------------- */
const PAYMENT_METHODS = [
  { id: "Cash", label: "Cash", icon: "💵" },
  { id: "UPI", label: "UPI", icon: "📱" },
  { id: "Card", label: "Card", icon: "💳" },
];

function CustomerView({ menuItems, onOrder, onShowInvoice }) {
  const [table, setTable] = useState(null);
  const [cart, setCart] = useState({}); // id -> qty
  const [activeCat, setActiveCat] = useState("All");
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Auto-select table when opened via a table QR code, e.g. yourdomain.com/?table=5
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = parseInt(params.get("table"), 10);
      if (t && TABLES.includes(t)) setTable(t);
    } catch (e) { /* no-op: manual table selection still available */ }
  }, []);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function decFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return c;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return item ? { id, name: item.name, price: item.price, qty } : null;
  }).filter(Boolean);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const categories = [...new Set(menuItems.map((m) => m.category))];
  const orderedCats = ["All", ...CATEGORY_ORDER.filter((c) => categories.includes(c)).concat(categories.filter((c) => !CATEGORY_ORDER.includes(c)))];

  async function handlePlaceOrder() {
    if (!table || cartItems.length === 0) return;
    setPlacing(true);
    const order = await onOrder(table, cartItems, paymentMethod);
    setLastOrder(order);
    setCart({});
    setPlacing(false);
  }

  if (!table) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Welcome to Sahu Bites
        </div>
        <div style={{ color: COLORS.textMuted, marginBottom: 32, fontSize: 14 }}>
          Please select your table to view the menu and order.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {TABLES.map((t) => (
            <button
              key={t}
              className="sb-btn"
              onClick={() => setTable(t)}
              style={{
                aspectRatio: "1", borderRadius: 12, border: `1px solid ${COLORS.line}`,
                background: COLORS.surface, color: COLORS.text, fontSize: 18,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (lastOrder) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 8 }}>Order placed!</div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
          Table {lastOrder.table} · Invoice {lastOrder.invoiceNo}<br />
          Payment: <span style={{ color: COLORS.goldLight }}>{lastOrder.paymentMethod}</span> {lastOrder.paymentMethod !== "Cash" ? "(pay at counter)" : "(pay at table)"}<br />
          Owner & kitchen staff have been notified.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="sb-btn" onClick={() => onShowInvoice(lastOrder)} style={{
            padding: "12px 20px", borderRadius: 8, border: `1px solid ${COLORS.gold}`, background: "transparent",
            color: COLORS.goldLight, fontWeight: 500,
          }}>View / Print Invoice</button>
          <button className="sb-btn" onClick={() => setLastOrder(null)} style={{
            padding: "12px 20px", borderRadius: 8, border: "none", background: COLORS.gold, color: "#1A1512", fontWeight: 600,
          }}>Order More</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      <div style={{ flex: 1, padding: "24px 24px 120px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>Menu</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Table {table} · <button className="sb-btn" onClick={() => setTable(null)} style={{ background: "none", border: "none", color: COLORS.gold, padding: 0, fontSize: 12, textDecoration: "underline" }}>change</button></div>
          </div>
        </div>

        <div className="sb-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
          {orderedCats.map((c) => (
            <button
              key={c}
              className="sb-btn sb-tab"
              onClick={() => setActiveCat(c)}
              style={{
                whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 999, fontSize: 13,
                border: `1px solid ${activeCat === c ? COLORS.gold : COLORS.line}`,
                background: activeCat === c ? COLORS.surface2 : "transparent",
                color: activeCat === c ? COLORS.goldLight : COLORS.textMuted,
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {(() => {
          const renderCard = (item) => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className="sb-card" style={{
                background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span title={item.veg ? "Veg" : "Non-veg"} style={{
                      width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${item.veg ? COLORS.veg : COLORS.nonveg}`,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 3, flexShrink: 0,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.veg ? COLORS.veg : COLORS.nonveg }} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.goldLight, fontSize: 15 }}>{formatINR(item.price)}</div>
                  {qty === 0 ? (
                    <button className="sb-btn" onClick={() => addToCart(item.id)} style={{
                      padding: "7px 16px", borderRadius: 8, border: `1px solid ${COLORS.gold}`, background: "transparent",
                      color: COLORS.goldLight, fontSize: 13, fontWeight: 500,
                    }}>Add</button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface2, borderRadius: 8, padding: "4px 8px" }}>
                      <button className="sb-btn" onClick={() => decFromCart(item.id)} aria-label={`Remove one ${item.name}`} style={{ background: "none", border: "none", color: COLORS.text, fontSize: 16, width: 20 }}>−</button>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 16, textAlign: "center" }}>{qty}</span>
                      <button className="sb-btn" onClick={() => addToCart(item.id)} aria-label={`Add one more ${item.name}`} style={{ background: "none", border: "none", color: COLORS.text, fontSize: 16, width: 20 }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          };

          if (activeCat === "All") {
            return orderedCats.filter((c) => c !== "All").map((cat) => {
              const items = menuItems.filter((m) => m.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: 26 }}>
                  <div style={{ fontSize: 13, color: COLORS.gold, fontWeight: 600, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>{cat}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                    {items.map(renderCard)}
                  </div>
                </div>
              );
            });
          }

          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {menuItems.filter((m) => m.category === activeCat).map(renderCard)}
            </div>
          );
        })()}
      </div>

      {cartCount > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.surface2,
          borderTop: `1px solid ${COLORS.gold}`, padding: "14px 20px", zIndex: 90,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.5 }}>PAY WITH</span>
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                className="sb-btn"
                onClick={() => setPaymentMethod(pm.id)}
                aria-pressed={paymentMethod === pm.id}
                style={{
                  padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${paymentMethod === pm.id ? COLORS.gold : COLORS.line}`,
                  background: paymentMethod === pm.id ? COLORS.gold : "transparent",
                  color: paymentMethod === pm.id ? "#1A1512" : COLORS.text,
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <span>{pm.icon}</span>{pm.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>
              <span style={{ color: COLORS.text, fontWeight: 500 }}>{cartCount} item{cartCount > 1 ? "s" : ""}</span> · <span style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.goldLight }}>{formatINR(cartTotal)}</span>
            </div>
            <button className="sb-btn" disabled={placing} onClick={handlePlaceOrder} style={{
              padding: "12px 28px", borderRadius: 8, border: "none", background: COLORS.gold,
              color: "#1A1512", fontWeight: 600, fontSize: 14, opacity: placing ? 0.6 : 1,
            }}>{placing ? "Placing order…" : `Place Order — Table ${table}`}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- STAFF VIEW ---------------------------- */
function StaffView({ orders, onUpdateStatus, onShowInvoice }) {
  const [filter, setFilter] = useState("Active");
  const sorted = [...orders].sort((a, b) => new Date(b.time) - new Date(a.time));
  const filtered = sorted.filter((o) => {
    if (filter === "All") return true;
    if (filter === "Active") return o.status !== "Paid";
    return o.status === filter;
  });

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>Kitchen & Order Tickets</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Active", "All", ...STATUS_FLOW].map((f) => (
            <button key={f} className="sb-btn" onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12,
              border: `1px solid ${filter === f ? COLORS.gold : COLORS.line}`,
              background: filter === f ? COLORS.surface2 : "transparent",
              color: filter === f ? COLORS.goldLight : COLORS.textMuted,
            }}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ color: COLORS.textMuted, textAlign: "center", padding: "60px 0", fontSize: 14 }}>
          No orders here yet. New table orders will appear automatically.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((o) => (
          <div key={o.id} className="sb-ticket" style={{ borderRadius: 10, padding: 16, animation: "sbFadeUp .25s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.textMuted }}>{o.invoiceNo}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>Table {o.table}</div>
              </div>
              <span style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 600,
                background: STATUS_COLOR[o.status] + "22", color: STATUS_COLOR[o.status],
                border: `1px solid ${STATUS_COLOR[o.status]}55`,
              }}>{o.status}</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>{new Date(o.time).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</span>
              <span style={{ padding: "1px 8px", borderRadius: 999, border: `1px solid ${COLORS.line}`, color: COLORS.goldLight }}>{o.paymentMethod || "Cash"}</span>
            </div>
            <div style={{ borderTop: `1px dashed ${COLORS.line}`, margin: "12px 0" }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.9 }}>
              {o.items.map((it) => (
                <div key={it.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{it.qty} × {it.name}</span>
                  <span>{formatINR(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px dashed ${COLORS.line}`, margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
              <span>Total</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.goldLight }}>{formatINR(o.total)}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {STATUS_FLOW.filter((s) => s !== o.status).map((s) => (
                <button key={s} className="sb-btn" onClick={() => onUpdateStatus(o.id, s)} style={{
                  fontSize: 11, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.line}`,
                  background: COLORS.surface, color: COLORS.text,
                }}>Mark {s}</button>
              ))}
              <button className="sb-btn" onClick={() => onShowInvoice(o)} style={{
                fontSize: 11, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.gold}`,
                background: "transparent", color: COLORS.goldLight, marginLeft: "auto",
              }}>Invoice</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- ADMIN VIEW ---------------------------- */
function AdminView({ menuItems, onSave, showToast, orders }) {
  const [form, setForm] = useState({ name: "", price: "", category: CATEGORY_ORDER[0], veg: true, desc: "" });
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [fieldError, setFieldError] = useState("");

  const revenue = orders.filter((o) => o.status === "Paid").reduce((s, o) => s + o.total, 0);

  function resetForm() {
    setForm({ name: "", price: "", category: CATEGORY_ORDER[0], veg: true, desc: "" });
    setEditingId(null);
    setFieldError("");
  }

  function startEdit(item) {
    setForm({ name: item.name, price: String(item.price), category: item.category, veg: item.veg, desc: item.desc || "" });
    setEditingId(item.id);
    setFieldError("");
  }

  function handleSubmit() {
    const name = form.name.trim();
    const price = parseFloat(form.price);
    if (!name) { setFieldError("Item name is required"); showToast("⚠️ Item name is required"); return; }
    if (isNaN(price) || price <= 0) { setFieldError("Enter a valid price"); showToast("⚠️ Enter a valid price"); return; }
    setFieldError("");

    if (editingId) {
      const next = menuItems.map((m) => m.id === editingId ? { ...m, name, price, category: form.category, veg: form.veg, desc: form.desc.trim() } : m);
      onSave(next);
      showToast(`✅ Updated "${name}"`);
    } else {
      const next = [...menuItems, {
        id: "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), name, price, category: form.category, veg: form.veg, desc: form.desc.trim(),
      }];
      onSave(next);
      showToast(`✅ Added "${name}" to menu`);
    }
    resetForm();
  }

  function handleDelete(id) {
    const next = menuItems.filter((m) => m.id !== id);
    onSave(next);
    setConfirmDelete(null);
    showToast("🗑️ Item removed from menu");
  }

  const handleEnter = (e) => { if (e.key === "Enter") handleSubmit(); };

  const grouped = CATEGORY_ORDER.map((cat) => ({ cat, items: menuItems.filter((m) => m.category === cat) })).filter((g) => g.items.length);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Admin Panel</div>
      <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24 }}>
        Manage menu items and prices · Paid revenue so far: <span style={{ color: COLORS.goldLight, fontFamily: "'JetBrains Mono', monospace" }}>{formatINR(revenue)}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 24, alignItems: "flex-start" }}>
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 20,
          position: "sticky", top: 90,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>{editingId ? "Edit Item" : "Add New Item"}</div>
          <FieldLabel>Item name</FieldLabel>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onKeyDown={handleEnter} placeholder="e.g. Malai Kofta" style={inputStyle} />
          <FieldLabel>Price (₹)</FieldLabel>
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} onKeyDown={handleEnter} placeholder="e.g. 240" inputMode="decimal" style={inputStyle} />
          <FieldLabel>Category</FieldLabel>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
            {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldLabel>Description (optional)</FieldLabel>
          <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} onKeyDown={handleEnter} placeholder="short description" style={inputStyle} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 12px" }}>
            <input type="checkbox" id="veg" checked={form.veg} onChange={(e) => setForm({ ...form, veg: e.target.checked })} />
            <label htmlFor="veg" style={{ fontSize: 13, color: COLORS.textMuted }}>Vegetarian</label>
          </div>
          {fieldError && <div style={{ color: COLORS.nonveg, fontSize: 12, marginBottom: 10 }}>{fieldError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="sb-btn" onClick={handleSubmit} style={{
              flex: 1, padding: "11px", borderRadius: 8, border: "none", background: COLORS.gold, color: "#1A1512", fontWeight: 600, fontSize: 13,
            }}>{editingId ? "Save Changes" : "Add to Menu"}</button>
            {editingId && (
              <button type="button" className="sb-btn" onClick={resetForm} style={{
                padding: "11px 16px", borderRadius: 8, border: `1px solid ${COLORS.line}`, background: "transparent", color: COLORS.text, fontSize: 13,
              }}>Cancel</button>
            )}
          </div>
        </div>

        <div>
          {grouped.map(({ cat, items }) => (
            <div key={cat} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, color: COLORS.gold, fontWeight: 600, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>{cat}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 3, border: `1.5px solid ${item.veg ? COLORS.veg : COLORS.nonveg}`, flexShrink: 0,
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{formatINR(item.price)}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button className="sb-btn" onClick={() => startEdit(item)} style={{
                        fontSize: 11, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.line}`, background: "transparent", color: COLORS.text,
                      }}>Edit</button>
                      {confirmDelete === item.id ? (
                        <button className="sb-btn" onClick={() => handleDelete(item.id)} style={{
                          fontSize: 11, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.nonveg}`, background: COLORS.nonveg + "22", color: "#F3A9A9",
                        }}>Confirm?</button>
                      ) : (
                        <button className="sb-btn" onClick={() => setConfirmDelete(item.id)} style={{
                          fontSize: 11, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.line}`, background: "transparent", color: COLORS.textMuted,
                        }}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {menuItems.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 14, padding: 40, textAlign: "center" }}>Menu is empty — add your first item.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 5, marginTop: 12, letterSpacing: 0.5 }}>{children}</div>;
}
const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 7, background: COLORS.surface2,
  border: `1px solid ${COLORS.line}`, color: COLORS.text, fontSize: 13, fontFamily: "'Jost', sans-serif",
};

/* ---------------------------- INVOICE ---------------------------- */
function InvoiceOverlay({ order, onClose }) {
  const tax = Math.round(order.total * 0.05);
  const grand = order.total + tax;
  return (
    <div className="invoice-overlay" style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#fff", color: "#1A1512", width: "100%", maxWidth: 420, borderRadius: 10,
        padding: 28, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>SAHU BITES</div>
          <div style={{ fontSize: 11, color: "#666" }}>Tax Invoice</div>
        </div>
        <div style={{ borderTop: "1px dashed #999", borderBottom: "1px dashed #999", padding: "10px 0", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Invoice No.</span><span>{order.invoiceNo}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Table</span><span>{order.table}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Date</span><span>{new Date(order.time).toLocaleString("en-IN")}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Payment</span><span>{order.paymentMethod || "Cash"}</span></div>
        </div>
        {order.items.map((it) => (
          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span>{it.qty} × {it.name}</span>
            <span>{formatINR(it.price * it.qty)}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px dashed #999", marginTop: 10, paddingTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{formatINR(order.total)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tax (5%)</span><span>{formatINR(tax)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, marginTop: 6 }}><span>Total</span><span>{formatINR(grand)}</span></div>
        </div>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "#666" }}>Thank you for dining with us!</div>
        <div className="hide-on-print" style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button className="sb-btn" onClick={() => window.print()} style={{
            flex: 1, padding: 10, borderRadius: 7, border: "none", background: "#1A1512", color: "#fff", fontFamily: "'Jost', sans-serif", fontSize: 13,
          }}>Print</button>
          <button className="sb-btn" onClick={onClose} style={{
            flex: 1, padding: 10, borderRadius: 7, border: "1px solid #ccc", background: "#fff", color: "#1A1512", fontFamily: "'Jost', sans-serif", fontSize: 13,
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}
