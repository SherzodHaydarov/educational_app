const studentApi = '/api/students/';
const teacherApi = '/api/teachers/';
const alertBox = document.getElementById('students-alert');
let studentsCache = [];
let teachersCache = [];

const showAlert = (message, type = 'success') => {
  alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
};

const resetStudentForm = () => {
  document.getElementById('student-id').value = '';
  document.getElementById('student-form').reset();
};

const resetTeacherForm = () => {
  document.getElementById('teacher-id').value = '';
  document.getElementById('teacher-form').reset();
};

const loadStudents = async () => {
  const res = await fetch(studentApi);
  studentsCache = await res.json();
  const tbody = document.querySelector('#students-table tbody');
  tbody.innerHTML = '';
  studentsCache.forEach((student) => {
    tbody.innerHTML += `
      <tr>
        <td>${student.first_name} ${student.last_name}</td>
        <td>${student.email}</td>
        <td>${student.phone}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick='editStudent(${student.id})'>Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick='deleteStudent(${student.id})'>Delete</button>
        </td>
      </tr>
    `;
  });
};

const loadTeachers = async () => {
  const res = await fetch(teacherApi);
  teachersCache = await res.json();
  const tbody = document.querySelector('#teachers-table tbody');
  tbody.innerHTML = '';
  teachersCache.forEach((teacher) => {
    tbody.innerHTML += `
      <tr>
        <td>${teacher.first_name} ${teacher.last_name}</td>
        <td>${teacher.email}</td>
        <td>${teacher.specialization}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick='editTeacher(${teacher.id})'>Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick='deleteTeacher(${teacher.id})'>Delete</button>
        </td>
      </tr>
    `;
  });
};

window.editStudent = (id) => {
  const student = studentsCache.find((item) => item.id === id);
  if (!student) return;
  document.getElementById('student-id').value = student.id;
  document.getElementById('student-first-name').value = student.first_name;
  document.getElementById('student-last-name').value = student.last_name;
  document.getElementById('student-email').value = student.email;
  document.getElementById('student-phone').value = student.phone;
};

window.deleteStudent = async (id) => {
  await fetch(`${studentApi}${id}`, { method: 'DELETE' });
  showAlert('Student deleted.', 'warning');
  loadStudents();
};

window.editTeacher = (id) => {
  const teacher = teachersCache.find((item) => item.id === id);
  if (!teacher) return;
  document.getElementById('teacher-id').value = teacher.id;
  document.getElementById('teacher-first-name').value = teacher.first_name;
  document.getElementById('teacher-last-name').value = teacher.last_name;
  document.getElementById('teacher-email').value = teacher.email;
  document.getElementById('teacher-specialization').value = teacher.specialization;
};

window.deleteTeacher = async (id) => {
  await fetch(`${teacherApi}${id}`, { method: 'DELETE' });
  showAlert('Teacher deleted.', 'warning');
  loadTeachers();
};

document.getElementById('student-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('student-id').value;
  const payload = {
    first_name: document.getElementById('student-first-name').value,
    last_name: document.getElementById('student-last-name').value,
    email: document.getElementById('student-email').value,
    phone: document.getElementById('student-phone').value,
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${studentApi}${id}` : studentApi;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    showAlert(error.detail || 'Unable to save student', 'danger');
    return;
  }

  showAlert('Student saved successfully.');
  resetStudentForm();
  loadStudents();
});

document.getElementById('teacher-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('teacher-id').value;
  const payload = {
    first_name: document.getElementById('teacher-first-name').value,
    last_name: document.getElementById('teacher-last-name').value,
    email: document.getElementById('teacher-email').value,
    specialization: document.getElementById('teacher-specialization').value,
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${teacherApi}${id}` : teacherApi;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    showAlert(error.detail || 'Unable to save teacher', 'danger');
    return;
  }

  showAlert('Teacher saved successfully.');
  resetTeacherForm();
  loadTeachers();
});

document.getElementById('student-reset').addEventListener('click', resetStudentForm);
document.getElementById('teacher-reset').addEventListener('click', resetTeacherForm);

loadStudents();
loadTeachers();
