from sqlalchemy.orm import Session

from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate


def create_teacher(db: Session, payload: TeacherCreate) -> Teacher:
    teacher = Teacher(**payload.model_dump())
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


def get_teachers(db: Session) -> list[Teacher]:
    return db.query(Teacher).order_by(Teacher.id.desc()).all()


def get_teacher(db: Session, teacher_id: int) -> Teacher | None:
    return db.query(Teacher).filter(Teacher.id == teacher_id).first()


def update_teacher(db: Session, teacher: Teacher, payload: TeacherUpdate) -> Teacher:
    for key, value in payload.model_dump().items():
        setattr(teacher, key, value)
    db.commit()
    db.refresh(teacher)
    return teacher


def delete_teacher(db: Session, teacher: Teacher) -> None:
    db.delete(teacher)
    db.commit()
