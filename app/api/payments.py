from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.payment import PaymentCreate, PaymentOut, PaymentQRCode, PaymentStatusUpdate
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/", response_model=list[PaymentOut])
def list_payments(db: Session = Depends(get_db)):
    return payment_service.get_payments(db)

@router.post("/", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    try:
        return payment_service.create_payment(db, payload.student_id, payload.course_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.patch("/{payment_id}/status", response_model=PaymentOut)
def set_payment_status(payment_id: int, payload: PaymentStatusUpdate, db: Session = Depends(get_db)):
    payment = payment_service.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment_service.update_payment_status(db, payment, payload.status)

@router.get("/{payment_id}/qrcode", response_model=PaymentQRCode)
def payment_qrcode(payment_id: int, db: Session = Depends(get_db)):
    payment = payment_service.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    image_b64 = payment_service.generate_qr_base64(str(payment.qr_payload))
    return PaymentQRCode(
        payment_id=int(payment.id),
        qr_image_base64=image_b64,
        payload=str(payment.qr_payload)
    )

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = payment_service.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment_service.delete_payment(db, payment)
