const paymentApi = '/api/payments/';
const studentApi = '/api/students/';
const courseApi = '/api/courses/';
const alertBox = document.getElementById('payments-alert');
let studentsMap = new Map();
let coursesMap = new Map();

const showAlert = (message, type = 'success') => {
  alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
};

const loadSelectors = async () => {
  const [studentsRes, coursesRes] = await Promise.all([fetch(studentApi), fetch(courseApi)]);
  const students = await studentsRes.json();
  const courses = await coursesRes.json();

  const studentSelect = document.getElementById('payment-student');
  const courseSelect = document.getElementById('payment-course');

  studentSelect.innerHTML = '<option value="">Select Student</option>';
  courseSelect.innerHTML = '<option value="">Select Course</option>';

  studentsMap = new Map(students.map((s) => [s.id, `${s.first_name} ${s.last_name}`]));
  coursesMap = new Map(courses.map((c) => [c.id, c.title]));

  students.forEach((student) => {
    studentSelect.innerHTML += `<option value="${student.id}">${student.first_name} ${student.last_name}</option>`;
  });
  courses.forEach((course) => {
    courseSelect.innerHTML += `<option value="${course.id}">${course.title}</option>`;
  });
};

const renderPayments = async () => {
  const res = await fetch(paymentApi);
  const payments = await res.json();
  const tbody = document.querySelector('#payments-table tbody');
  tbody.innerHTML = '';

  payments.forEach((payment) => {
    const studentName = studentsMap.get(payment.student_id) || `Student #${payment.student_id}`;
    const courseTitle = coursesMap.get(payment.course_id) || `Course #${payment.course_id}`;
    tbody.innerHTML += `
      <tr>
        <td>${payment.id}</td>
        <td>${studentName}</td>
        <td>${courseTitle}</td>
        <td>$${payment.amount.toFixed(2)}</td>
        <td><span class="badge ${payment.status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}">${payment.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-success" onclick="markPaid(${payment.id})">Mark Paid</button>
          <button class="btn btn-sm btn-outline-primary" onclick="showQr(${payment.id})">Show QR</button>
        </td>
      </tr>
    `;
  });
};

window.markPaid = async (id) => {
  await fetch(`${paymentApi}${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'paid' }),
  });
  showAlert('Payment marked as paid.');
  renderPayments();
};

window.showQr = async (id) => {
  const res = await fetch(`${paymentApi}${id}/qrcode`);
  const data = await res.json();
  const img = document.getElementById('payment-qr');
  img.src = `data:image/png;base64,${data.qr_image_base64}`;
  img.classList.remove('d-none');
  document.getElementById('payment-qr-payload').textContent = data.payload;
};

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
    showAlert(error.detail || 'Unable to create payment', 'danger');
    return;
  }

  const payment = await res.json();
  showAlert(`Payment #${payment.id} created.`);
  await renderPayments();
  await showQr(payment.id);
});

(async () => {
  await loadSelectors();
  await renderPayments();
})();
