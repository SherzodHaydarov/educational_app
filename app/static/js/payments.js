const paymentApi = '/api/payments/';
const studentApi = '/api/students/';
const courseApi = '/api/courses/';
const alertBox = document.getElementById('payments-alert');
let studentsMap = new Map();
let coursesMap = new Map();
let paymentsCache = [];

const showAlert = (message, type = 'success') => {
  alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { alertBox.innerHTML = ''; }, 4000);
};

const loadSelectors = async () => {
  const [studentsRes, coursesRes] = await Promise.all([fetch(studentApi), fetch(courseApi)]);
  const students = await studentsRes.json();
  const courses = await coursesRes.json();

  const studentSelect = document.getElementById('payment-student');
  const courseSelect = document.getElementById('payment-course');

  studentSelect.innerHTML = '<option value="">Talabani tanlang</option>';
  courseSelect.innerHTML = '<option value="">Kursni tanlang</option>';

  studentsMap = new Map(students.map((s) => [s.id, `${s.first_name} ${s.last_name}`]));
  coursesMap = new Map(courses.map((c) => [c.id, c.title]));

  students.forEach((s) => {
    studentSelect.innerHTML += `<option value="${s.id}">${s.first_name} ${s.last_name}</option>`;
  });
  courses.forEach((c) => {
    courseSelect.innerHTML += `<option value="${c.id}">${c.title}</option>`;
  });
};

const renderPayments = async () => {
  const res = await fetch(paymentApi);
  paymentsCache = await res.json();
  const tbody = document.querySelector('#payments-table tbody');
  tbody.innerHTML = '';

  paymentsCache.forEach((payment) => {
    const studentName = studentsMap.get(payment.student_id) || `Student #${payment.student_id}`;
    const courseTitle = coursesMap.get(payment.course_id) || `Course #${payment.course_id}`;
    const isPaid = payment.status === 'paid';

    tbody.innerHTML += `
      <tr>
        <td>${payment.id}</td>
        <td>${studentName}</td>
        <td>${courseTitle}</td>
        <td>$${payment.amount.toFixed(2)}</td>
        <td>
          <span class="badge ${isPaid ? 'bg-success' : 'bg-warning'}">
            ${isPaid ? "✓ To'langan" : '⏳ Kutilmoqda'}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${!isPaid
              ? `<button class="btn btn-sm btn-outline-success" onclick="markPaid(${payment.id})">To'landi</button>`
              : `<button class="btn btn-sm btn-outline-primary" onclick="showReceiptFor(${payment.id})">Chek</button>`
            }
            <button class="btn btn-sm btn-outline-primary" onclick="showQr(${payment.id})">QR</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deletePayment(${payment.id})">O'chir</button>
          </div>
        </td>
      </tr>
    `;
  });
};

// ── Show QR in left panel ────────────────────────────────────
window.showQr = async (id) => {
  const res = await fetch(`${paymentApi}${id}/qrcode`);
  const data = await res.json();
  const img = document.getElementById('payment-qr');
  img.src = `data:image/png;base64,${data.qr_image_base64}`;
  document.getElementById('payment-qr-payload').textContent = data.payload;
  document.getElementById('qr-card').style.display = 'block';
};

// ── Delete payment ───────────────────────────────────────────
window.deletePayment = async (id) => {
  if (!confirm(`To'lov #${id} ni o'chirishni tasdiqlaysizmi?`)) return;
  const res = await fetch(`${paymentApi}${id}`, { method: 'DELETE' });
  if (res.ok || res.status === 204) {
    showAlert(`To'lov #${id} o'chirildi.`, 'warning');
    await renderPayments();
  } else {
    showAlert("O'chirishda xatolik yuz berdi.", 'danger');
  }
};

// ── Mark as paid → show receipt ──────────────────────────────
window.markPaid = async (id) => {
  // 1) Cache dan payment ma'lumotini OLDIN olish
  const payment = paymentsCache.find(p => p.id === id);
  const studentName = payment ? (studentsMap.get(payment.student_id) || `#${payment.student_id}`) : '—';
  const courseTitle = payment ? (coursesMap.get(payment.course_id) || `#${payment.course_id}`) : '—';
  const amount = payment ? `$${payment.amount.toFixed(2)}` : '—';

  // 2) API ga PATCH
  const res = await fetch(`${paymentApi}${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'paid' }),
  });

  if (!res.ok) {
    showAlert("To'lovni tasdiqlashda xatolik.", 'danger');
    return;
  }

  // 3) Jadvalni yangilash
  await renderPayments();

  // 4) QR olish
  const qrRes = await fetch(`${paymentApi}${id}/qrcode`);
  const qrData = await qrRes.json();

  // 5) Chekni ko'rsatish
  openReceipt({ id, studentName, courseTitle, amount, qrBase64: qrData.qr_image_base64, payload: qrData.payload });
};

// ── Show receipt for already paid payment ────────────────────
window.showReceiptFor = async (id) => {
  const payment = paymentsCache.find(p => p.id === id);
  const studentName = payment ? (studentsMap.get(payment.student_id) || `#${payment.student_id}`) : '—';
  const courseTitle = payment ? (coursesMap.get(payment.course_id) || `#${payment.course_id}`) : '—';
  const amount = payment ? `$${payment.amount.toFixed(2)}` : '—';

  const qrRes = await fetch(`${paymentApi}${id}/qrcode`);
  const qrData = await qrRes.json();

  openReceipt({ id, studentName, courseTitle, amount, qrBase64: qrData.qr_image_base64, payload: qrData.payload });
};

// ── Receipt modal ────────────────────────────────────────────
function openReceipt({ id, studentName, courseTitle, amount, qrBase64, payload }) {
  document.getElementById('receipt-id').textContent = `#${id}`;
  document.getElementById('receipt-amount').textContent = amount;
  document.getElementById('receipt-student').textContent = studentName;
  document.getElementById('receipt-course').textContent = courseTitle;
  document.getElementById('receipt-date').textContent = new Date().toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  document.getElementById('receipt-qr').src = `data:image/png;base64,${qrBase64}`;
  document.getElementById('receipt-payload').textContent = payload;

  const overlay = document.getElementById('receipt-overlay');
  overlay.style.display = 'flex';

  // Re-trigger animation
  const box = document.getElementById('receipt-box');
  box.style.animation = 'none';
  requestAnimationFrame(() => { box.style.animation = ''; });
}

window.closeReceipt = () => {
  document.getElementById('receipt-overlay').style.display = 'none';
};

window.printReceipt = () => { window.print(); };

// Close on backdrop click
document.getElementById('receipt-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('receipt-overlay')) closeReceipt();
});

// Esc tugmasi bilan yopish
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeReceipt();
});

// ── Payment form ─────────────────────────────────────────────
document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    student_id: Number(document.getElementById('payment-student').value),
    course_id: Number(document.getElementById('payment-course').value),
  };

  const res = await fetch(paymentApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    showAlert(error.detail || "To'lovni yaratishda xatolik.", 'danger');
    return;
  }

  const payment = await res.json();
  showAlert(`To'lov #${payment.id} yaratildi.`);
  await renderPayments();
  await showQr(payment.id);
});

// ── Init ─────────────────────────────────────────────────────
(async () => {
  await loadSelectors();
  await renderPayments();
})();