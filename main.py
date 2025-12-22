from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.config import settings
import traceback

app = FastAPI(
    title="Team Project API",
    description="群组任务管理后端API",
    version="1.0.0"
)

# 配置CORS，允许移动应用访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # 从配置文件读取
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Team Project API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/favicon.ico")
async def favicon():
    """处理 favicon 请求，避免 404 日志"""
    from fastapi.responses import Response
    return Response(status_code=204)  # No Content

# 导入路由
from app.routers import auth, groups, tasks, invitations

# 注册异常处理器（必须在路由导入之后）
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器，确保所有错误都返回 JSON 格式"""
    import traceback
    error_detail = str(exc)
    traceback_str = traceback.format_exc()
    print(f"未处理的异常: {error_detail}")
    print(traceback_str)
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"服务器内部错误: {error_detail}",
            "type": type(exc).__name__
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """请求验证异常处理器"""
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body
        }
    )

app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(groups.router, prefix="/api/groups", tags=["群组"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["任务"])
app.include_router(invitations.router, prefix="/api/invitations", tags=["邀请"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

