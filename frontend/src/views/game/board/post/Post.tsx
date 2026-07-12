import { useState, useCallback, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import { colors } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  DeleteForeverOutlined,
  Close,
  DragIndicator,
  InsertPhotoTwoTone,
  Assignment,
  AssignmentOutlined,
  EmojiEmotionsOutlined,
  Clear,
} from '@mui/icons-material';
import { Draggable, DraggableProvided } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import EditableLabel from '../../../../components/EditableLabel';
import { Palette } from '../../../../Theme';
import { Post } from 'common';
import { usePostUserPermissions } from '../usePostUserPermissions';
import { countVotes, enumerateVotes } from '../../utils';
import GiphySearchBox from 'react-giphy-searchbox';
import useGiphy from '../../../../hooks/useGiphy';
import config from '../../../../utils/getConfig';
import useToggle from '../../../../hooks/useToggle';
import VoteButton from './VoteButton';
import ActionButton from './ActionButton';
import ActionsBar from './ActionsBar';
import { trackEvent } from '../../../../track';
import useCrypto from '../../../../crypto/useCrypto';
import { getLorem } from './lorem';
import useCanDecrypt from '../../../../crypto/useCanDecrypt';
import { useConfirm } from 'material-ui-confirm';

interface PostItemProps {
  index: number;
  post: Post;
  color: string;
  onLike: () => void;
  onDislike: () => void;
  onCancelVotes: () => void;
  onEdit: (content: string) => void;
  onEditAction: (action: string) => void;
  onEditGiphy: (giphyId: string | null) => void;
  onDelete: () => void;
}

const useStyles = makeStyles(() => {
  return {
    actionContainer: {
      backgroundColor: colors.grey[100],
    },
    actionIcon: {
      color: colors.blue[400],
    },
    ghipyIcon: {
      color: colors.yellow[700],
    },
  };
});

const PostItem = ({
  index,
  post,
  color,
  onLike,
  onDislike,
  onCancelVotes,
  onEdit,
  onEditAction,
  onEditGiphy,
  onDelete,
}: PostItemProps) => {
  const {
    canCreateAction,
    canEdit,
    canDelete,
    canUpVote,
    canDownVote,
    canDisplayUpVote,
    canDisplayDownVote,
    canCancelVote,
    canShowAuthor,
    canReorder,
    canUseGiphy,
    isBlurred,
  } = usePostUserPermissions(post);
  const classes = useStyles();
  const { t } = useTranslation();
  const { encrypt, decrypt } = useCrypto();
  const canDecrypt = useCanDecrypt();
  const [giphyImageUrl, showGiphyImage, toggleShowGiphyImage] = useGiphy(
    post.giphy
  );
  const postElement = useRef(null);
  const [actionsToggled, toggleAction] = useToggle(false);
  const [showGiphyEditor, setShowGiphyEditor] = useState(false);
  const confirm = useConfirm();

  const upVotes = useMemo(() => countVotes(post, 'like'), [post]);
  const downVotes = useMemo(() => countVotes(post, 'dislike'), [post]);
  const upVoters = useMemo(() => enumerateVotes(post, 'like'), [post]);
  const downVoters = useMemo(() => enumerateVotes(post, 'dislike'), [post]);
  const displayAction = actionsToggled || !!post.action;
  const readOnly = !canEdit || isBlurred || !canDecrypt;
  const handleShowGiphy = useCallback(() => {
    setShowGiphyEditor(true);
    trackEvent('game/post/giphy/open');
  }, []);
  const handleHideGiphyEditor = useCallback(() => {
    setShowGiphyEditor(false);
  }, []);
  const handleChooseGiphyEditor = useCallback(
    (giphyItem: any) => {
      onEditGiphy(giphyItem.id);
      trackEvent('game/post/giphy/choose');
    },
    [onEditGiphy]
  );

  const handleEdit = useCallback(
    (postContent: string) => {
      onEdit(encrypt(postContent));
    },
    [onEdit, encrypt]
  );
  const handleEditAction = useCallback(
    (action: string) => {
      onEditAction(encrypt(action));
    },
    [onEditAction, encrypt]
  );
  const handleDelete = useCallback(() => {
    const buttonProps = {
      color: 'error',
      variant: 'contained',
      'data-cy': 'delete-post-confirm',
    };
    confirm({
      title: t('PostBoard.deleteConfirmation.title'),
      description: t('PostBoard.deleteConfirmation.description'),
      confirmationText: t('PostBoard.deleteConfirmation.confirm'),
      cancellationText: t('PostBoard.deleteConfirmation.cancel'),
      confirmationButtonProps: buttonProps as any,
    }).then(() => {
      onDelete();
      trackEvent('game/post/delete');
    });
  }, [onDelete, confirm, t]);

  const actualContent = useMemo(() => {
    return isBlurred ? generateLoremIpsum(post.content) : decrypt(post.content);
  }, [decrypt, isBlurred, post.content]);

  return (
    <>
      <Draggable
        draggableId={post.id}
        index={index}
        isDragDisabled={!canReorder}
      >
        {(provided: DraggableProvided) => (
          <PostCard ref={provided.innerRef} {...provided.draggableProps}>
            {isBlurred ? (
              <Tooltip title="Cards from other people will be shown when the moderator chooses to reveal them.">
                <BlurOverlay />
              </Tooltip>
            ) : null}
            {canReorder ? (
              <DragHandle {...provided.dragHandleProps} className="drag-handle">
                <DragIndicator />
              </DragHandle>
            ) : null}
            <CardContent>
              <LabelContainer blurred={isBlurred}>
                <Typography variant="body1">
                  <EditableLabel
                    wrapText
                    readOnly={readOnly}
                    value={actualContent}
                    onChange={handleEdit}
                    label="Post content"
                    multiline
                  />
                </Typography>
              </LabelContainer>
              {canShowAuthor && (
                <AuthorContainer>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    component="div"
                  >
                    {t('Post.by')}&nbsp;
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textPrimary"
                    component="div"
                  >
                    {post.user.name}
                  </Typography>
                </AuthorContainer>
              )}
              {giphyImageUrl && showGiphyImage && (
                <GiphyContainer>
                  <CloseButtonContainer>
                    <Close onClick={toggleShowGiphyImage} fontSize="small" />
                  </CloseButtonContainer>
                  <img src={giphyImageUrl} alt="Giphy" height="200px" />
                </GiphyContainer>
              )}
            </CardContent>
            {displayAction && canCreateAction && (
              <CardContent className={classes.actionContainer}>
                <Typography variant="caption">{t('Actions.title')}:</Typography>
                <Typography variant="body1">
                  <EditableLabel
                    wrapText
                    value={decrypt(post.action || '')}
                    onChange={handleEditAction}
                    label={t('Actions.title')!}
                    focused={actionsToggled && !post.action}
                    multiline
                  />
                </Typography>
              </CardContent>
            )}
            <ActionsBar
              color={color}
              rightActions={
                <>
                  {giphyImageUrl && (
                    <ActionButton
                      ariaLabel={t('Post.toggleGiphyButton')}
                      tooltip={t('Post.toggleGiphyButton')!}
                      icon={
                        <InsertPhotoTwoTone
                          style={{
                            color: !showGiphyImage
                              ? colors.green[200]
                              : colors.red[200],
                          }}
                        />
                      }
                      onClick={toggleShowGiphyImage}
                    />
                  )}
                  {canCreateAction && (
                    <ActionButton
                      ariaLabel={t('Post.setActionButton')}
                      tooltip={t('Post.setActionButton')!}
                      icon={
                        post.action ? (
                          <Assignment className={classes.actionIcon} />
                        ) : (
                          <AssignmentOutlined className={classes.actionIcon} />
                        )
                      }
                      onClick={toggleAction}
                    />
                  )}
                  {canEdit && !!config.GIPHY_API_KEY && canUseGiphy && (
                    <ActionButton
                      ariaLabel={t('Post.setGiphyButton')}
                      tooltip={t('Post.setGiphyButton')!}
                      icon={
                        <EmojiEmotionsOutlined className={classes.ghipyIcon} />
                      }
                      innerRef={postElement}
                      onClick={handleShowGiphy}
                    />
                  )}
                  {canDelete && (
                    <ActionButton
                      ariaLabel={t('Post.deleteButton')}
                      tooltip={t('Post.deleteButton')!}
                      icon={
                        <DeleteForeverOutlined
                          style={{
                            color: Palette.negative,
                          }}
                        />
                      }
                      onClick={handleDelete}
                    />
                  )}
                </>
              }
            >
              {canDisplayUpVote ? (
                <VoteButton
                  voters={upVoters}
                  canVote={canUpVote}
                  count={upVotes}
                  icon={<ThumbUpOutlined style={{ color: Palette.positive }} />}
                  onClick={onLike}
                  showTooltip={canShowAuthor}
                  ariaLabel="Like"
                />
              ) : null}
              {canDisplayDownVote ? (
                <VoteButton
                  voters={downVoters}
                  canVote={canDownVote}
                  count={downVotes}
                  icon={
                    <ThumbDownOutlined style={{ color: Palette.negative }} />
                  }
                  onClick={onDislike}
                  showTooltip={canShowAuthor}
                  ariaLabel="Dislike"
                />
              ) : null}
              {canCancelVote ? (
                <ActionButton
                  icon={<Clear htmlColor={Palette.negative} />}
                  tooltip={t('Post.cancelVote')!}
                  ariaLabel={t('Post.cancelVote')}
                  onClick={onCancelVotes}
                />
              ) : null}
            </ActionsBar>
          </PostCard>
        )}
      </Draggable>
      <Popover
        open={showGiphyEditor}
        anchorEl={postElement.current}
        onClose={handleHideGiphyEditor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Card>
          <CardContent>
            <GiphySearchBox
              apiKey={config.GIPHY_API_KEY}
              onSelect={handleChooseGiphyEditor}
            />
          </CardContent>
        </Card>
      </Popover>
    </>
  );
};

const DragHandle = styled.div`
  cursor: move;
  position: absolute;
  top: 3px;
  right: 3px;
  visibility: hidden;
  color: ${colors.grey[500]};
`;

const PostCard = styled(Card)`
  margin: 10px 5px;
  margin-bottom: 20px;
  position: relative;

  :hover {
    & .drag-handle {
      visibility: visible;
    }
  }
`;

const AuthorContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
  margin-top: -10px;
  top: 10px;
  right: -5px;
`;

const GiphyContainer = styled.div`
  position: relative;
  img {
    width: 100%;
    object-fit: fit;
    height: 100%;
  }

  margin: -20px;
  margin-top: 30px;
`;

const CloseButtonContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 8px;
  top: 5px;
  width: 20px;
  height: 20px;
  border-radius: 15px;
  color: white;
  font-size: 0.5em;
  background-color: ${colors.red[400]};
  cursor: pointer;
`;

const BlurOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 2;
  @supports (backdrop-filter: blur(3px)) or (-webkit-backdrop-filter: blur(3px)) {
    background-color: rgba(255, 255, 255, 0.3);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }
`;

const LabelContainer = styled.div<{ blurred: boolean }>`
  ${(props) =>
    props.blurred
      ? `
  > * {
    display: none;
  }

  &::before {
    content: '(hidden for now)';
  }

  @supports (backdrop-filter: blur(3px)) or (-webkit-backdrop-filter: blur(3px)) {
    > * {
      display: block;
    }

    &::before {
      content: unset;
    }
  }`
      : null}
`;

function generateLoremIpsum(originalText: string) {
  const count = originalText.split(' ').length;
  return getLorem(count);
}

export default PostItem;
