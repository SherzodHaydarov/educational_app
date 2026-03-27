from sqlalchemy.orm import Session

from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate


def create_course(db: Session, payload: CourseCreate) -> Course:
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_courses(db: Session) -> list[Course]:
    return db.query(Course).order_by(Course.id.desc()).all()


def get_course(db: Session, course_id: int) -> Course | None:
    return db.query(Course).filter(Course.id == course_id).first()


def update_course(db: Session, course: Course, payload: CourseUpdate) -> Course:
    for key, value in payload.model_dump().items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return course


def delete_course(db: Session, course: Course) -> None:
    db.delete(course)
    db.commit()
