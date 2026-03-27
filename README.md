# Educational Center Management App

A complete web application to manage an educational center with FastAPI + Bootstrap.

## Features

- Student Management (CRUD)
- Course Management (CRUD)
- Teacher Management (CRUD)
- Payment management
  - Create payment records linked to student and course
  - Generate QR codes for payment payloads
  - Simulate payment completion by marking status as `paid`
- Google Maps integration on the Home page

## Tech Stack

- **Backend:** Python 3, FastAPI, SQLAlchemy, Pydantic
- **Database:** SQLite (`educational_center.db`)
- **Frontend:** Jinja2 templates, HTML/CSS, Bootstrap, vanilla JavaScript (Fetch API)

## Project Structure

```text
app/
  api/                # REST API routers
  db/                 # DB connection/session setup
  models/             # SQLAlchemy models
  schemas/            # Pydantic schemas
  services/           # Business logic and DB operations
  static/
    css/
    js/
  templates/          # UI pages
  main.py             # FastAPI application entrypoint
requirements.txt
```

## Setup & Run (Step-by-step)

1. **Clone the repository** and enter project folder:
   ```bash
   git clone <your-repo-url>
   cd educational_app
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv .venv
   ```

3. **Activate virtual environment:**
   - Linux/macOS:
     ```bash
     source .venv/bin/activate
     ```
   - Windows (PowerShell):
     ```powershell
     .venv\Scripts\Activate.ps1
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the app:**
   ```bash
   uvicorn app.main:app --reload
   ```

6. **Open in browser:**
   - App UI: `http://127.0.0.1:8000`
   - API docs: `http://127.0.0.1:8000/docs`

> The SQLite database file (`educational_center.db`) is automatically created on first run.

## API Endpoints

### Students
- `GET /api/students/`
- `POST /api/students/`
- `GET /api/students/{student_id}`
- `PUT /api/students/{student_id}`
- `DELETE /api/students/{student_id}`

### Courses
- `GET /api/courses/`
- `POST /api/courses/`
- `GET /api/courses/{course_id}`
- `PUT /api/courses/{course_id}`
- `DELETE /api/courses/{course_id}`

### Teachers
- `GET /api/teachers/`
- `POST /api/teachers/`
- `GET /api/teachers/{teacher_id}`
- `PUT /api/teachers/{teacher_id}`
- `DELETE /api/teachers/{teacher_id}`

### Payments
- `GET /api/payments/`
- `POST /api/payments/`
- `PATCH /api/payments/{payment_id}/status`
- `GET /api/payments/{payment_id}/qrcode`

## Notes

- Validation is handled with Pydantic schemas.
- Error handling is included for not-found resources and duplicate unique fields.
- Payment flow is simulated while preserving a realistic API contract for future gateway integration.
