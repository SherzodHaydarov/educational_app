#payment_service.py
import base64
from io import BytesIO

import qrcode.image.pil
from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.payment import Payment
from app.models.student import Student


def create_payment(db: Session, student_id: int, course_id: int) -> Payment:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError("Student not found")

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise ValueError("Course not found")

    payload = f"EDUCENTER|student:{student.id}|course:{course.id}|amount:{course.price:.2f}"
    payment = Payment(
        student_id=student.id,
        course_id=course.id,
        amount=course.price,
        status="pending",
        qr_payload=payload,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payments(db: Session) -> list[Payment]:
    return db.query(Payment).order_by(Payment.id.desc()).all()


def get_payment(db: Session, payment_id: int) -> Payment | None:
    return db.query(Payment).filter(Payment.id == payment_id).first()


def update_payment_status(db: Session, payment: Payment, new_status: str) -> Payment:
    setattr(payment, "status", new_status)
    db.commit()
    db.refresh(payment)
    return payment


def delete_payment(db: Session, payment: Payment) -> None:
    db.delete(payment)
    db.commit()


def generate_qr_base64(payload: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(image_factory=qrcode.image.pil.PilImage)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")