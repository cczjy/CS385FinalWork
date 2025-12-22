from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=1, max_length=50, description="用户名")
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=1, description="密码（测试模式：无长度限制）")
    verification_code: str = Field(..., min_length=6, max_length=6, description="验证码（6位数字）")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码（测试模式：只检查非空）"""
        if len(v) < 1:
            raise ValueError('密码不能为空')
        return v
    
    @field_validator('verification_code')
    @classmethod
    def validate_verification_code(cls, v: str) -> str:
        """验证验证码格式"""
        if not v.isdigit():
            raise ValueError('验证码必须是6位数字')
        if len(v) != 6:
            raise ValueError('验证码必须是6位数字')
        return v
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """验证用户名"""
        if len(v.strip()) == 0:
            raise ValueError('用户名不能为空')
        if len(v) > 50:
            raise ValueError('用户名长度不能超过50个字符')
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, description="密码（测试模式：无长度限制）")

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class VerificationCodeRequest(BaseModel):
    email: EmailStr

