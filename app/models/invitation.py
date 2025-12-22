from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    inviter_id = Column(String, ForeignKey("users.id"), nullable=False)
    invitee_email = Column(String, nullable=False, index=True)
    status = Column(String, default="pending")  # 'pending', 'accepted', 'rejected'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    group = relationship("Group", back_populates="invitations")
    inviter = relationship("User", back_populates="invitations_sent", foreign_keys=[inviter_id])

