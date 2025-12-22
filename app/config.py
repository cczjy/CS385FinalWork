from pydantic_settings import BaseSettings
from typing import List
from pydantic import field_validator

class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "Team Project API"
    DEBUG: bool = True
    
    # 数据库配置
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/teamproject"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS配置（支持逗号分隔的字符串，如 "http://localhost:3000,http://localhost:8080" 或 "*"）
    CORS_ORIGINS: str = "*"
    
    @field_validator('CORS_ORIGINS')
    @classmethod
    def parse_cors_origins(cls, v):
        """解析 CORS_ORIGINS，支持字符串和列表格式"""
        if isinstance(v, str):
            # 如果是 "*"，直接返回 ["*"]
            if v.strip() == "*":
                return ["*"]
            # 如果是逗号分隔的字符串，分割成列表
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        # 如果已经是列表，直接返回
        return v if isinstance(v, list) else ["*"]
    
    @property
    def cors_origins_list(self) -> List[str]:
        """获取 CORS origins 列表"""
        return self.parse_cors_origins(self.CORS_ORIGINS)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

