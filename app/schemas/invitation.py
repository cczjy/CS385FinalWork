from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class InvitationBase(BaseModel):
    invitee_email: EmailStr = Field(..., description="被邀请人邮箱")

class InvitationCreate(InvitationBase):
    group_id: str

class InvitationResponse(InvitationBase):
    id: str
    group_id: str
    group_name: Optional[str] = None
    inviter_id: str
    inviter_username: Optional[str] = None
    status: str  # 'pending', 'accepted', 'rejected'
    created_at: datetime

    class Config:
        from_attributes = True

class InvitationUpdate(BaseModel):
    status: str  # 'accepted', 'rejected'

