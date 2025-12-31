from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    owned_groups = relationship("Group", back_populates="owner", foreign_keys="Group.owner_id")
    group_members = relationship("GroupMember", back_populates="user")
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    invitations_sent = relationship("Invitation", back_populates="inviter", foreign_keys="Invitation.inviter_id")


