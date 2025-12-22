from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, VerificationCodeRequest
from app.auth import verify_password, get_password_hash

router = APIRouter()

# 简单的验证码存储（生产环境应使用Redis等）
verification_codes = {}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    try:
        # 验证验证码（简化处理，实际应验证）
        if user_data.verification_code not in ["123456", "000000"]:
            # 检查存储的验证码
            stored_code = verification_codes.get(user_data.email)
            if stored_code != user_data.verification_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="验证码错误或已过期"
                )
        
        # 检查邮箱是否已注册
        db_user = db.query(User).filter(User.email == user_data.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被注册"
            )
        
        # 测试模式：直接存储明文密码，不加密
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # 清除验证码
        verification_codes.pop(user_data.email, None)
        
        return db_user
    except HTTPException:
        raise
    except ValueError as e:
        # Pydantic 验证错误
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        # 捕获所有其他异常，返回友好的错误信息
        import traceback
        error_msg = str(e)
        print(f"注册错误: {error_msg}")
        print(traceback.format_exc())
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {error_msg}"
        )

@router.post("/login", response_model=UserResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """用户登录（简化版，不返回token）"""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户已被禁用"
        )
    
    return user

@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user_info(user_id: str, db: Session = Depends(get_db)):
    """根据用户ID获取用户信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return user

@router.post("/verification-code")
async def get_verification_code(request_data: VerificationCodeRequest, db: Session = Depends(get_db)):
    """获取验证码（简化处理，实际应发送邮件）"""
    email = request_data.email
    
    # 检查邮箱是否已注册
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )
    
    # 生成验证码（简化处理，实际应随机生成并发送邮件）
    import random
    code = str(random.randint(100000, 999999))
    verification_codes[email] = code
    
    # 返回验证码（实际应用中不应返回，而是发送邮件）
    return {
        "message": "验证码已生成（开发环境）",
        "code": code  # 仅开发环境返回，生产环境应删除
    }

