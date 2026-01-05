from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.group import Group, GroupMember
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate, VoteRequest, CommentCreate
import uuid
import copy

router = APIRouter()

def check_group_member(group_id: str, user_id: str, db: Session) -> bool:
    """检查用户是否是群组成员"""
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()
    return member is not None

def check_group_permission(group_id: str, user_id: str, db: Session, required_roles: List[str] = None) -> bool:
    """检查用户是否有群组权限"""
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()
    if not member:
        return False
    if required_roles:
        return member.role in required_roles
    return True

def ensure_task_fields_not_none(task: Task) -> Task:
    """确保任务的JSON字段不是None，避免验证错误"""
    if task.options is None:
        task.options = []
    if task.votes is None:
        task.votes = {}
    if task.comments is None:
        task.comments = []
    if task.completed_by is None:
        task.completed_by = []
    return task

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    创建任务（vote / discussion）
    所有群组成员都可以创建任务
    """
    try:
        # 1. 验证用户是否存在
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        # 2. 检查群组是否存在
        group = db.query(Group).filter(Group.id == task_data.group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="群组不存在"
            )
        
        # 3. 检查用户是否是群组成员
        member = db.query(GroupMember).filter(
            GroupMember.group_id == task_data.group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该群组的成员，无法创建任务"
            )
        
        # 4. 验证任务类型（已在 schema 中验证，这里再次确认）
        if task_data.type not in ["vote", "discussion"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的任务类型: {task_data.type}。支持的类型: vote, discussion"
            )
        
        # 5. 根据任务类型初始化不同的字段
        # 所有字段都初始化为默认值，避免 None 值导致验证错误
        task_kwargs = {
            "group_id": task_data.group_id,
            "type": task_data.type,
            "title": task_data.title,
            "description": task_data.description,
            "created_by": user_id,
            "completed_by": [],
            "document_url": None,
            "document_name": None,
            "options": task_data.options if task_data.type == "vote" and task_data.options else [],
            "votes": {},
            "comments": []
        }
        
        # 验证投票任务的选项
        if task_data.type == "vote":
            if not task_kwargs["options"] or len(task_kwargs["options"]) < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="投票任务至少需要2个选项"
                )
        
        # 6. 创建任务
        db_task = Task(**task_kwargs)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        # 确保JSON字段不是None（SQLAlchemy可能返回None）
        ensure_task_fields_not_none(db_task)
        
        print(f"✅ 任务创建成功: ID={db_task.id}, 类型={db_task.type}, 标题={db_task.title}")
        return db_task
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        print(f"❌ 创建任务失败: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建任务时发生错误: {error_msg}"
        )

@router.get("/group/{group_id}", response_model=List[TaskResponse])
async def get_group_tasks(
    group_id: str,
    user_id: str = Query(None, description="用户ID（可选）"),
    db: Session = Depends(get_db)
):
    """获取群组任务列表"""
    # 如果提供了用户ID，检查用户是否是群组成员（可选验证）
    if user_id:
        if not check_group_member(group_id, user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该群组的成员"
            )
    
    tasks = db.query(Task).filter(Task.group_id == group_id).order_by(Task.created_at.desc()).all()
    # 确保所有任务的JSON字段不是None
    for task in tasks:
        ensure_task_fields_not_none(task)
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    user_id: str = Query(None, description="用户ID（可选）"),
    db: Session = Depends(get_db)
):
    """获取任务详情"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 如果提供了用户ID，检查用户是否是群组成员（可选验证）
    if user_id:
        if not check_group_member(task.group_id, user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该群组的成员"
            )
    
    # 确保JSON字段不是None
    ensure_task_fields_not_none(task)
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """更新任务"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 验证用户是否存在
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查权限（创建者或群主/管理员可以更新）
    is_creator = task.created_by == user_id
    has_permission = check_group_permission(task.group_id, user_id, db, ["owner", "admin"])
    
    if not is_creator and not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您没有权限修改该任务"
        )
    
    if task_data.title:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.document_url is not None:
        task.document_url = task_data.document_url
    if task_data.document_name is not None:
        task.document_name = task_data.document_name
    if task_data.options is not None:
        task.options = task_data.options
    
    db.commit()
    db.refresh(task)
    # 确保JSON字段不是None
    ensure_task_fields_not_none(task)
    return task

@router.post("/{task_id}/complete")
async def complete_task(
    task_id: str,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """标记任务完成"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 检查用户是否是群组成员
    if not check_group_member(task.group_id, user_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该群组的成员"
        )
    
    completed_by = task.completed_by or []
    if user_id not in completed_by:
        completed_by.append(user_id)
        task.completed_by = completed_by
        db.commit()
        db.refresh(task)
    
    # 确保JSON字段不是None
    ensure_task_fields_not_none(task)
    return {"message": "任务已标记为完成", "task": task}

@router.post("/{task_id}/vote")
async def vote_task(
    task_id: str,
    vote_data: VoteRequest,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """投票"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    if task.type != "vote":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该任务不是投票任务"
        )
    
    # 检查用户是否是群组成员
    if not check_group_member(task.group_id, user_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该群组的成员"
        )
    
    # 检查选项是否存在
    option_ids = [opt.get("id") for opt in (task.options or [])]
    if vote_data.option_id not in option_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的选项"
        )
    
    # 更新投票（允许修改投票）
    votes = task.votes or {}
    votes[user_id] = vote_data.option_id
    task.votes = votes
    db.commit()
    db.refresh(task)
    
    # 确保JSON字段不是None
    ensure_task_fields_not_none(task)
    return {"message": "投票成功", "task": task}

@router.post("/{task_id}/comment")
async def add_comment(
    task_id: str,
    comment_data: CommentCreate,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """添加评论"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    if task.type != "discussion":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该任务不是讨论任务"
        )
    
    # 检查用户是否是群组成员
    if not check_group_member(task.group_id, user_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该群组的成员"
        )
    
    # 验证用户是否存在
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 获取现有评论，确保是列表
    comments = task.comments if task.comments is not None else []
    # 深拷贝评论列表，确保SQLAlchemy能检测到变化
    comments = copy.deepcopy(comments)
    
    new_comment = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "username": user.username,
        "text": comment_data.text,
        "created_at": datetime.now().isoformat(),
        "replies": []
    }
    
    if comment_data.parent_id:
        # 回复评论：找到父评论并添加回复
        found = False
        for comment in comments:
            if comment.get("id") == comment_data.parent_id:
                # 确保replies字段存在
                if "replies" not in comment:
                    comment["replies"] = []
                comment["replies"].append(new_comment)
                found = True
                break
        if not found:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="父评论不存在"
            )
    else:
        # 新评论：添加到评论列表
        comments.append(new_comment)
    
    # 更新任务的comments字段
    task.comments = comments
    db.commit()
    db.refresh(task)
    
    # 确保JSON字段不是None
    ensure_task_fields_not_none(task)
    return {"message": "评论添加成功", "task": task}

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """删除任务（只有群主或任务创建者可以删除）"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    # 检查用户是否是群组成员
    if not check_group_member(task.group_id, user_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该群组的成员"
        )
    
    # 检查权限：群主或任务创建者
    member = db.query(GroupMember).filter(
        GroupMember.group_id == task.group_id,
        GroupMember.user_id == user_id
    ).first()
    
    is_owner = member and member.role == "owner"
    is_creator = task.created_by == user_id
    
    if not (is_owner or is_creator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有群主或任务创建者可以删除任务"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "任务已删除"}

