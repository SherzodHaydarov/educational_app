from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.teacher import TeacherCreate, TeacherOut, TeacherUpdate
from app.services import teacher_service

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("/", response_model=list[TeacherOut])
def list_teachers(db: Session = Depends(get_db)):
    return teacher_service.get_teachers(db)


@router.get("/{teacher_id}", response_model=TeacherOut)
def retrieve_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = teacher_service.get_teacher(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.post("/", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
def create_teacher(payload: TeacherCreate, db: Session = Depends(get_db)):
    try:
        return teacher_service.create_teacher(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Teacher email already exists") from exc


@router.put("/{teacher_id}", response_model=TeacherOut)
def update_teacher(teacher_id: int, payload: TeacherUpdate, db: Session = Depends(get_db)):
    teacher = teacher_service.get_teacher(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    try:
        return teacher_service.update_teacher(db, teacher, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Teacher email already exists") from exc


@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = teacher_service.get_teacher(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    teacher_service.delete_teacher(db, teacher)
