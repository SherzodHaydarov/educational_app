from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    student_id: int = Field(gt=0)
    course_id: int = Field(gt=0)


class PaymentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    amount: float
    status: str
    qr_payload: str

    class Config:
        from_attributes = True


class PaymentStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|paid|failed)$")


class PaymentQRCode(BaseModel):
    payment_id: int
    qr_image_base64: str
    payload: str
