# 已完全禁用所有加密和认证功能，仅用于测试
# 注意：生产环境必须启用加密和认证！

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码（测试模式：直接比较明文，不加密）"""
    # 完全禁用加密，直接比较明文
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """加密密码（测试模式：直接返回明文，不加密）"""
    # 完全禁用加密，直接返回明文
    # 警告：生产环境必须使用加密！
    return password

