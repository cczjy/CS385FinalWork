from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    type = Column(String, nullable=False)  # 'document', 'vote', 'discussion'
    title = Column(String, nullable=False)
    description = Column(Text)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 文档任务字段
    document_url = Column(String, nullable=True)
    document_name = Column(String, nullable=True)

    # 投票任务字段（JSON存储）
    options = Column(JSON, default=list)  # [{"id": "1", "text": "选项1"}]
    votes = Column(JSON, default=dict)  # {"userId": "optionId"}

    # 讨论任务字段（JSON存储）
    comments = Column(JSON, default=list)  # [{"id": "1", "userId": "xxx", "text": "...", "replies": []}]

    # 通用字段（JSON存储）
    completed_by = Column(JSON, default=list)  # ["userId1", "userId2"]

    # 关系
    group = relationship("Group", back_populates="tasks")
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[created_by])

