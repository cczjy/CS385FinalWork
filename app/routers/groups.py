from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.group import Group, GroupMember
from app.schemas.group import GroupCreate, GroupResponse, GroupUpdate, GroupMemberResponse

router = APIRouter()

@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    group_data: GroupCreate,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """创建群组"""
    # 验证用户是否存在
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    db_group = Group(
        name=group_data.name,
        description=group_data.description,
        owner_id=user_id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # 添加创建者为群主
    member = GroupMember(
        group_id=db_group.id,
        user_id=user_id,
        role="owner"
    )
    db.add(member)
    db.commit()
    
    # 加载成员信息
    db.refresh(db_group)
    return format_group_response(db_group, db)

@router.get("", response_model=List[GroupResponse])
async def get_user_groups(
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """获取用户的群组列表"""
    # 验证用户是否存在
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    groups = db.query(Group).join(GroupMember).filter(
        GroupMember.user_id == user_id
    ).all()
    
    return [format_group_response(group, db) for group in groups]

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(
    group_id: str,
    user_id: str = Query(None, description="用户ID（可选）"),
    db: Session = Depends(get_db)
):
    """获取群组详情"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="群组不存在"
        )
    
    # 如果提供了用户ID，检查用户是否是群组成员（可选验证）
    if user_id:
        member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该群组的成员"
            )
    
    return format_group_response(group, db)

@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: str,
    group_data: GroupUpdate,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """更新群组信息"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="群组不存在"
        )
    
    # 检查权限（只有群主或管理员可以更新）
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()
    if not member or member.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您没有权限修改该群组"
        )
    
    if group_data.name:
        group.name = group_data.name
    if group_data.description is not None:
        group.description = group_data.description
    
    db.commit()
    db.refresh(group)
    return format_group_response(group, db)

@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
async def get_group_members(
    group_id: str,
    user_id: str = Query(None, description="用户ID（可选）"),
    db: Session = Depends(get_db)
):
    """获取群组成员列表"""
    # 如果提供了用户ID，检查用户是否是群组成员（可选验证）
    if user_id:
        member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该群组的成员"
            )
    
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    result = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append({
            "id": m.id,
            "user_id": m.user_id,
            "role": m.role,
            "joined_at": m.joined_at,
            "username": user.username if user else None,
            "email": user.email if user else None
        })
    return result

def format_group_response(group: Group, db: Session) -> dict:
    """格式化群组响应"""
    members = db.query(GroupMember).filter(GroupMember.group_id == group.id).all()
    member_list = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        member_list.append({
            "id": m.id,
            "user_id": m.user_id,
            "role": m.role,
            "joined_at": m.joined_at,
            "username": user.username if user else None,
            "email": user.email if user else None
        })
    
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "owner_id": group.owner_id,
        "created_at": group.created_at,
        "members": member_list,
        "member_count": len(member_list)
    }

@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """删除群组（只有群主可以删除）"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="群组不存在"
        )
    
    # 检查用户是否是群主
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()
    
    if not member or member.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有群主可以删除群组"
        )
    
    # 删除所有成员关系
    db.query(GroupMember).filter(GroupMember.group_id == group_id).delete()
    
    # 删除群组
    db.delete(group)
    db.commit()
    
    return {"message": "群组已删除"}

