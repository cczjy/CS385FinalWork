"""
数据库连接测试脚本
运行此脚本可以测试数据库连接是否正常
"""
from app.database import engine
from sqlalchemy import text

def test_connection():
    """测试数据库连接"""
    try:
        print("正在测试数据库连接...")
        with engine.connect() as conn:
            # 测试基本连接
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print("✅ 数据库连接成功！")
            print(f"PostgreSQL 版本: {version.split(',')[0]}")
            
            # 测试当前数据库
            result = conn.execute(text("SELECT current_database()"))
            db_name = result.fetchone()[0]
            print(f"当前数据库: {db_name}")
            
            # 测试当前用户
            result = conn.execute(text("SELECT current_user"))
            user = result.fetchone()[0]
            print(f"当前用户: {user}")
            
            return True
    except Exception as e:
        print("❌ 数据库连接失败！")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误信息: {e}")
        print("\n请检查：")
        print("1. PostgreSQL 服务是否运行")
        print("2. .env 文件中的 DATABASE_URL 是否正确")
        print("3. 数据库和用户是否存在")
        return False

if __name__ == "__main__":
    test_connection()

