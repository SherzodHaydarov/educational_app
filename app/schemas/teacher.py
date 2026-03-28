from pydantic import BaseModel, EmailStr, Field


class TeacherBase(BaseModel):
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    specialization: str = Field(min_length=2, max_length=150)


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(TeacherBase):
    pass


class TeacherOut(TeacherBase):
    id: int

    class Config:
        from_attributes = True
