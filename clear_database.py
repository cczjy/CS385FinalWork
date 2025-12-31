"""
清除数据库数据脚本
使用此脚本可以安全地清除数据库中的所有数据

⚠️ 警告：此脚本会删除所有数据，请谨慎使用！
"""

from app.database import SessionLocal, engine
from app.models import User, Group, GroupMember, Task, Invitation
from sqlalchemy import text

def clear_database():
    """清除数据库中的所有数据"""
    db = SessionLocal()
    
    try:
        print("=" * 50)
        print("清除数据库数据脚本")
        print("=" * 50)
        print()
        
        # 显示当前数据统计
        print("📊 当前数据统计：")
        user_count = db.query(User).count()
        group_count = db.query(Group).count()
        member_count = db.query(GroupMember).count()
        task_count = db.query(Task).count()
        invitation_count = db.query(Invitation).count()
        
        print(f"  用户数: {user_count}")
        print(f"  群组数: {group_count}")
        print(f"  成员关系数: {member_count}")
        print(f"  任务数: {task_count}")
        print(f"  邀请数: {invitation_count}")
        print()
        
        # 如果所有表都是空的，直接返回
        if user_count == 0 and group_count == 0 and member_count == 0 and task_count == 0 and invitation_count == 0:
            print("✅ 数据库已经是空的了，无需清除。")
            return
        
        # 确认操作
        print("⚠️  警告：此操作将删除所有数据！")
        confirm = input("确认要继续吗？(输入 'yes' 确认): ")
        
        if confirm.lower() != 'yes':
            print("❌ 操作已取消。")
            return
        
        print()
        print("🗑️  正在清除数据...")
        print()
        
        # 按照外键依赖关系的顺序删除
        # 1. 先删除依赖表的数据
        deleted_invitations = db.query(Invitation).delete()
        print(f"   ✓ 已删除 {deleted_invitations} 条邀请记录")
        
        deleted_tasks = db.query(Task).delete()
        print(f"   ✓ 已删除 {deleted_tasks} 条任务记录")
        
        deleted_members = db.query(GroupMember).delete()
        print(f"   ✓ 已删除 {deleted_members} 条成员关系记录")
        
        # 2. 再删除主表的数据
        deleted_groups = db.query(Group).delete()
        print(f"   ✓ 已删除 {deleted_groups} 条群组记录")
        
        deleted_users = db.query(User).delete()
        print(f"   ✓ 已删除 {deleted_users} 条用户记录")
        
        # 提交事务
        db.commit()
        
        print()
        print("=" * 50)
        print("✅ 数据清除完成！")
        print("=" * 50)
        
        # 验证清除结果
        print()
        print("📊 清除后的数据统计：")
        final_user_count = db.query(User).count()
        final_group_count = db.query(Group).count()
        final_member_count = db.query(GroupMember).count()
        final_task_count = db.query(Task).count()
        final_invitation_count = db.query(Invitation).count()
        
        print(f"  用户数: {final_user_count}")
        print(f"  群组数: {final_group_count}")
        print(f"  成员关系数: {final_member_count}")
        print(f"  任务数: {final_task_count}")
        print(f"  邀请数: {final_invitation_count}")
        
        if final_user_count == 0 and final_group_count == 0 and final_member_count == 0 and final_task_count == 0 and final_invitation_count == 0:
            print()
            print("✅ 所有数据已成功清除！")
        else:
            print()
            print("⚠️  警告：仍有数据未清除，请检查！")
        
    except Exception as e:
        db.rollback()
        print()
        print("❌ 清除数据时发生错误：")
        print(f"   {str(e)}")
        print()
        print("💡 提示：如果出现外键约束错误，请确保按照正确的顺序删除数据。")
        raise
    finally:
        db.close()


def reset_sequences():
    """
    重置 PostgreSQL 序列（如果使用自增ID）
    注意：本项目中使用的是 UUID，所以不需要重置序列
    """
    # 本项目使用 UUID，不需要重置序列
    pass


if __name__ == "__main__":
    try:
        clear_database()
    except KeyboardInterrupt:
        print()
        print("❌ 操作被用户中断。")
    except Exception as e:
        print()
        print(f"❌ 发生错误：{str(e)}")
        print()
        print("💡 请检查：")
        print("   1. 数据库连接是否正常")
        print("   2. 数据库配置是否正确")
        print("   3. 是否有其他程序正在使用数据库")

