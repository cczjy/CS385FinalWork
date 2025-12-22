from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.group import Group, GroupMember
from app.models.invitation import Invitation
from app.schemas.invitation import InvitationCreate, InvitationResponse, InvitationUpdate
# 已移除认证依赖

router = APIRouter()

@router.post("", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    invitation_data: InvitationCreate,
    user_id: str,  # 从查询参数获取用户ID
    db: Session = Depends(get_db)
):
    """创建邀请"""
    # 验证用户是否存在
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查群组是否存在
    group = db.query(Group).filter(Group.id == invitation_data.group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="群组不存在"
        )
    
    # 检查用户是否有权限邀请（群主或管理员）
    member = db.query(GroupMember).filter(
        GroupMember.group_id == invitation_data.group_id,
        GroupMember.user_id == user_id
    ).first()
    if not member or member.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您没有权限邀请成员"
        )
    
    # 检查被邀请用户是否已经是成员
    invitee = db.query(User).filter(User.email == invitation_data.invitee_email).first()
    if invitee:
        existing_member = db.query(GroupMember).filter(
            GroupMember.group_id == invitation_data.group_id,
            GroupMember.user_id == invitee.id
        ).first()
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该用户已经是群组成员"
            )
    
    # 检查是否已有待处理的邀请
    existing_invitation = db.query(Invitation).filter(
        Invitation.group_id == invitation_data.group_id,
        Invitation.invitee_email == invitation_data.invitee_email,
        Invitation.status == "pending"
    ).first()
    if existing_invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该用户已有待处理的邀请"
        )
    
    db_invitation = Invitation(
        group_id=invitation_data.group_id,
        inviter_id=user_id,
        invitee_email=invitation_data.invitee_email,
        status="pending"
    )
    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)
    
    return format_invitation_response(db_invitation, db)

@router.get("", response_model=List[InvitationResponse])
async def get_user_invitations(
    user_email: str,  # 从查询参数获取用户邮箱
    db: Session = Depends(get_db)
):
    """获取用户的邀请列表"""
    # 验证用户是否存在
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    invitations = db.query(Invitation).filter(
        Invitation.invitee_email == user_email
    ).order_by(Invitation.created_at.desc()).all()
    
    return [format_invitation_response(inv, db) for inv in invitations]

@router.put("/{invitation_id}", response_model=InvitationResponse)
async def update_invitation(
    invitation_id: str,
    invitation_data: InvitationUpdate,
    user_email: str,  # 从查询参数获取用户邮箱
    db: Session = Depends(get_db)
):
    """更新邀请状态（接受或拒绝）"""
    invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="邀请不存在"
        )
    
    # 检查是否是邀请对象
    if invitation.invitee_email != user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该邀请的对象"
        )
    
    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邀请已被处理"
        )
    
    if invitation_data.status not in ["accepted", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的状态"
        )
    
    invitation.status = invitation_data.status
    
    # 如果接受邀请，将用户添加到群组
    if invitation_data.status == "accepted":
        invitee = db.query(User).filter(User.email == invitation.invitee_email).first()
        if invitee:
            # 检查是否已经是成员（防止重复添加）
            existing_member = db.query(GroupMember).filter(
                GroupMember.group_id == invitation.group_id,
                GroupMember.user_id == invitee.id
            ).first()
            if not existing_member:
                member = GroupMember(
                    group_id=invitation.group_id,
                    user_id=invitee.id,
                    role="member"
                )
                db.add(member)
    
    db.commit()
    db.refresh(invitation)
    return format_invitation_response(invitation, db)

def format_invitation_response(invitation: Invitation, db: Session) -> dict:
    """格式化邀请响应"""
    group = db.query(Group).filter(Group.id == invitation.group_id).first()
    inviter = db.query(User).filter(User.id == invitation.inviter_id).first()
    
    return {
        "id": invitation.id,
        "group_id": invitation.group_id,
        "group_name": group.name if group else None,
        "inviter_id": invitation.inviter_id,
        "inviter_username": inviter.username if inviter else None,
        "invitee_email": invitation.invitee_email,
        "status": invitation.status,
        "created_at": invitation.created_at
    }

