const { ForbiddenError, NotFoundError, BadRequestError } = require('../../shared/error');
const workspaceService = require('./workspaces.service');

/**
 * 워크스페이스를 로드하고, 멤버 여부와 역할을 req.workspace에 저장합니다.
 */
exports.loadWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.id || req.params.workspaceId; // :id 또는 :workspaceId 사용
    if (!workspaceId) {
      return next(new NotFoundError('WORKSPACE_NOT_FOUND', 'Workspace ID is missing.'));
    }

    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      return next(new NotFoundError('WORKSPACE_NOT_FOUND', 'Workspace not found.'));
    }

    req.workspace = workspace;

    // 현재 사용자 역할 확인 (로그인 필요)
    if (req.user) {
      const memberRole = await workspaceService.getMemberRole(workspaceId, req.user.id);
      req.workspace.currentUserRole = memberRole; // 'admin', 'editor', 'viewer', or null
    } else {
      req.workspace.currentUserRole = null;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 워크스페이스에 접근하는 사용자가 멤버인지 확인합니다. (스펙 3번)
 */
exports.isMember = (req, res, next) => {
  if (req.workspace.kind === 'personal' && req.user.id === req.workspace.created_by) {
    return next();
  }

  if (!req.workspace.currentUserRole) {
    return next(new ForbiddenError('FORBIDDEN_ACCESS', 'User is not a member of this workspace.'));
  }
  next();
};

/**
 * 프롬프트 공유 권한 확인 (멤버면 전원 가능)
 */
exports.canSharePrompt = (req, res, next) => {
  // isMember 후에 붙여 사용
  next();
};


/**
 * 워크스페이스 설정 변경 및 멤버 관리를 위한 admin/owner 권한을 확인합니다.
 */
exports.isAdminOrOwner = (req, res, next) => {
  const role = req.workspace.currentUserRole;
  const isOwner = req.user.id === req.workspace.created_by;

  if (role === 'admin' || isOwner) {
    return next();
  }
  next(new ForbiddenError('FORBIDDEN_ACTION', 'Requires admin or owner role.'));
};

/**
 * 멤버 제거 시, 본인 탈퇴이거나 admin/owner 권한인지 확인합니다.
 */
exports.canRemoveMember = (req, res, next) => {
  const targetUserId = parseInt(req.params.userId, 10);
  const role = req.workspace.currentUserRole;
  const isOwner = req.user.id === req.workspace.created_by;

  if (req.user.id === targetUserId) {
    return next();
  }

  if (role === 'admin' || isOwner) {
    return next();
  }

  next(new ForbiddenError('FORBIDDEN_ACTION', 'Requires admin/owner role or self-removal.'));
};


/**
 * 초대 취소 권한 확인은 더 이상 사용하지 않습니다.
 * 초대는 생성 시점에 바로 멤버로 추가되므로, 토큰 기반 초대 취소 플로우는 비활성화되었습니다.
 *
 * 이 엔드포인트를 호출하면 항상 에러를 반환합니다.
 */
exports.canCancelInvite = async (req, res, next) => {
  return next(
    new BadRequestError(
      'INVITE_FLOW_DISABLED',
      'Workspace invites are auto-applied when sent. Manual invite cancellation is disabled.'
    )
  );
};
