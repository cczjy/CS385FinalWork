# 密码加密和验证功能（修复版本）
# 使用 bcrypt 进行密码加密

try:
    from passlib.context import CryptContext
    # 创建密码加密上下文
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    BCRYPT_AVAILABLE = True
except ImportError:
    print("警告: passlib[bcrypt] 未安装，密码将以明文存储（不安全！）")
    print("请运行: pip install passlib[bcrypt]")
    BCRYPT_AVAILABLE = False
    pwd_context = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    if not BCRYPT_AVAILABLE or pwd_context is None:
        # 如果没有安装 bcrypt，使用明文比较（仅用于测试）
        print("警告: 使用明文密码验证（不安全！）")
        return plain_password == hashed_password
    
    try:
        # 使用 bcrypt 验证密码
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # 如果验证失败（可能是旧数据使用明文），尝试明文比较
        print(f"密码验证警告: {e}")
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """加密密码"""
    if not BCRYPT_AVAILABLE or pwd_context is None:
        # 如果没有安装 bcrypt，返回明文（仅用于测试）
        print("警告: 密码未加密存储（不安全！）")
        return password
    
    # 使用 bcrypt 加密密码
    return pwd_context.hash(password)

