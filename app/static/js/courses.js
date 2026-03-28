const courseApi = '/api/courses/';
const alertBox = document.getElementById('courses-alert');
let coursesCache = [];

const showAlert = (message, type = 'success') => {
  alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
};

const resetForm = () => {
  document.getElementById('course-id').value = '';
  document.getElementById('course-form').reset();
};

const loadCourses = async () => {
  const res = await fetch(courseApi);
  coursesCache = await res.json();
  const tbody = document.querySelector('#courses-table tbody');
  tbody.innerHTML = '';
  coursesCache.forEach((course) => {
    tbody.innerHTML += `
      <tr>
        <td>${course.title}</td>
        <td>$${course.price.toFixed(2)}</td>
        <td>${course.duration_weeks} weeks</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick='editCourse(${course.id})'>Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick='deleteCourse(${course.id})'>Delete</button>
        </td>
      </tr>
    `;
  });
};

window.editCourse = (id) => {
  const course = coursesCache.find((item) => item.id === id);
  if (!course) return;
  document.getElementById('course-id').value = course.id;
  document.getElementById('course-title').value = course.title;
  document.getElementById('course-description').value = course.description || '';
  document.getElementById('course-price').value = course.price;
  document.getElementById('course-duration').value = course.duration_weeks;
};

window.deleteCourse = async (id) => {
  await fetch(`${courseApi}${id}`, { method: 'DELETE' });
  showAlert('Course deleted.', 'warning');
  loadCourses();
};

document.getElementById('course-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('course-id').value;
  const payload = {
    title: document.getElementById('course-title').value,
    description: document.getElementById('course-description').value || null,
    price: Number(document.getElementById('course-price').value),
    duration_weeks: Number(document.getElementById('course-duration').value),
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${courseApi}${id}` : courseApi;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    showAlert(error.detail || 'Unable to save course', 'danger');
    return;
  }

  showAlert('Course saved successfully.');
  resetForm();
  loadCourses();
});

document.getElementById('course-reset').addEventListener('click', resetForm);

loadCourses();
