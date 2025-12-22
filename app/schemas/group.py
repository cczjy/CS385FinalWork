from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class GroupMemberBase(BaseModel):
    user_id: str
    role: str  # 'owner', 'admin', 'member'

class GroupMemberResponse(GroupMemberBase):
    id: str
    joined_at: datetime
    username: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="群组名称")
    description: Optional[str] = Field(None, max_length=500, description="群组描述")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) == 0:
            raise ValueError('群组名称不能为空')
        if len(v) > 100:
            raise ValueError('群组名称长度不能超过100个字符')
        return v.strip()
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 500:
            raise ValueError('群组描述长度不能超过500个字符')
        return v.strip() if v else None

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: str
    owner_id: str
    created_at: datetime
    members: List[GroupMemberResponse] = []
    member_count: int = 0

    class Config:
        from_attributes = True

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

