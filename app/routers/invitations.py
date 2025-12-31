from fastapi import APIRouter, Depends, HTTPException, status, Query
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
    user_id: str = Query(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    创建群组邀请（WORKSPACE_INVITATIONS）
    只有群主或管理员可以邀请成员
    """
    try:
        # 1. 验证邀请者（用户）是否存在
        inviter = db.query(User).filter(User.id == user_id).first()
        if not inviter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        # 2. 检查群组是否存在
        group = db.query(Group).filter(Group.id == invitation_data.group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="群组不存在"
            )
        
        # 3. 检查用户是否是群组成员
        member = db.query(GroupMember).filter(
            GroupMember.group_id == invitation_data.group_id,
            GroupMember.user_id == user_id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该群组的成员，无法邀请其他成员"
            )
        
        # 4. 检查用户是否有权限邀请（群主或管理员）
        if member.role not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只有群主或管理员可以邀请成员"
            )
        
        # 5. 验证被邀请邮箱格式（已在 schema 中验证）
        invitee_email = invitation_data.invitee_email.strip().lower()
        
        # 6. 检查被邀请用户是否已注册
        invitee = db.query(User).filter(User.email == invitee_email).first()
        
        # 7. 如果用户已注册，检查是否已经是群组成员
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
        
        # 8. 检查是否已有待处理的邀请
        existing_invitation = db.query(Invitation).filter(
            Invitation.group_id == invitation_data.group_id,
            Invitation.invitee_email == invitee_email,
            Invitation.status == "pending"
        ).first()
        
        if existing_invitation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该用户已有待处理的邀请，请等待其处理"
            )
        
        # 9. 创建邀请
        db_invitation = Invitation(
            group_id=invitation_data.group_id,
            inviter_id=user_id,
            invitee_email=invitee_email,
            status="pending"
        )
        db.add(db_invitation)
        db.commit()
        db.refresh(db_invitation)
        
        print(f"✅ 邀请创建成功: ID={db_invitation.id}, 群组={group.name}, 被邀请人={invitee_email}")
        return format_invitation_response(db_invitation, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        print(f"❌ 创建邀请失败: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建邀请时发生错误: {error_msg}"
        )

@router.get("", response_model=List[InvitationResponse])
async def get_user_invitations(
    user_email: str = Query(..., description="用户邮箱"),
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
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """
    更新邀请状态（INVITATIONS_ACCEPT / INVITATIONS_DECLINE）
    接受或拒绝群组邀请
    """
    try:
        # 1. 查找邀请
        invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="邀请不存在"
            )
        
        # 2. 验证邮箱格式并转换为小写
        user_email = user_email.strip().lower()
        
        # 3. 检查是否是邀请对象
        if invitation.invitee_email.lower() != user_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="您不是该邀请的对象，无法处理此邀请"
            )
        
        # 4. 检查邀请状态
        if invitation.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"该邀请已被处理，当前状态: {invitation.status}"
            )
        
        # 5. 验证新状态
        if invitation_data.status not in ["accepted", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的状态: {invitation_data.status}。支持的状态: accepted, rejected"
            )
        
        # 6. 更新邀请状态
        invitation.status = invitation_data.status
        
        # 7. 如果接受邀请，将用户添加到群组
        if invitation_data.status == "accepted":
            invitee = db.query(User).filter(User.email == user_email).first()
            
            if not invitee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="被邀请的用户不存在，请先注册账户"
                )
            
            # 检查是否已经是成员（防止重复添加）
            existing_member = db.query(GroupMember).filter(
                GroupMember.group_id == invitation.group_id,
                GroupMember.user_id == invitee.id
            ).first()
            
            if existing_member:
                # 如果已经是成员，仍然更新邀请状态，但不重复添加
                print(f"⚠️ 用户 {invitee.email} 已经是群组成员，跳过添加")
            else:
                # 添加为新成员（默认角色为 member）
                member = GroupMember(
                    group_id=invitation.group_id,
                    user_id=invitee.id,
                    role="member"
                )
                db.add(member)
                print(f"✅ 用户 {invitee.email} 已加入群组 {invitation.group_id}")
        
        db.commit()
        db.refresh(invitation)
        
        status_text = "已接受" if invitation_data.status == "accepted" else "已拒绝"
        print(f"✅ 邀请状态更新: ID={invitation_id}, 状态={status_text}")
        
        return format_invitation_response(invitation, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        print(f"❌ 更新邀请状态失败: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新邀请状态时发生错误: {error_msg}"
        )

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

