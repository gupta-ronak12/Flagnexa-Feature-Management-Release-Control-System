from pydantic import BaseModel


class UserGroupCreate(BaseModel):
    name: str


class UserGroupResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True