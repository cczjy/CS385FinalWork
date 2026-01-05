from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class TaskBase(BaseModel):
    type: str = Field(..., description="任务类型")
    title: str = Field(..., min_length=1, max_length=200, description="任务标题")
    description: Optional[str] = Field(None, max_length=1000, description="任务描述")
    
    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ['vote', 'discussion']:
            raise ValueError('任务类型必须是 vote 或 discussion')
        return v
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        if len(v.strip()) == 0:
            raise ValueError('任务标题不能为空')
        if len(v) > 200:
            raise ValueError('任务标题长度不能超过200个字符')
        return v.strip()
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 1000:
            raise ValueError('任务描述长度不能超过1000个字符')
        return v.strip() if v else None

class TaskCreate(TaskBase):
    group_id: str
    options: Optional[List[Dict[str, Any]]] = Field(None, description="投票任务选项（仅投票任务需要）")

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    document_url: Optional[str] = None
    document_name: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None

class TaskResponse(TaskBase):
    id: str
    group_id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # 文档任务
    document_url: Optional[str] = None
    document_name: Optional[str] = None
    
    # 投票任务（所有任务都有这些字段，但只有投票任务使用）
    options: List[Dict[str, Any]] = Field(default_factory=list)
    votes: Dict[str, str] = Field(default_factory=dict)
    
    # 讨论任务（所有任务都有这些字段，但只有讨论任务使用）
    comments: List[Dict[str, Any]] = Field(default_factory=list)
    
    # 通用
    completed_by: List[str] = []

    class Config:
        from_attributes = True

class VoteRequest(BaseModel):
    option_id: str

class CommentCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="评论内容")
    parent_id: Optional[str] = Field(None, description="父评论ID（用于回复）")
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        if len(v.strip()) == 0:
            raise ValueError('评论内容不能为空')
        if len(v) > 1000:
            raise ValueError('评论内容长度不能超过1000个字符')
        return v.strip()

