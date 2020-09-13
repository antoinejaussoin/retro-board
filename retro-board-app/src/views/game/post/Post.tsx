import React, { useState, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import {
  Typography,
  makeStyles,
  Popover,
  Card,
  CardContent,
  colors,
} from '@material-ui/core';
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  DeleteForeverOutlined,
  FeedbackOutlined,
  Feedback,
  Close,
  EmojiEmotions,
  DragIndicator,
  InsertPhotoTwoTone,
} from '@material-ui/icons';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import useTranslations from '../../../translations';
import EditableLabel from '../../../components/EditableLabel';
import { Palette } from '../../../Theme';
import { Post } from 'retro-board-common';
import { useUserPermissions } from '../useUserPermissions';
import { countVotes, enumerateVotes } from '../utils';
import GiphySearchBox from 'react-giphy-searchbox';
import useGiphy from '../../../hooks/useGiphy';
import config from '../../../utils/getConfig';
import useToggle from '../../../hooks/useToggle';
import VoteButton from './VoteButton';
import ActionButton from './ActionButton';
import ActionsBar from './ActionsBar';
import { trackEvent } from '../../../track';

interface PostItemProps {
  index: number;
  post: Post;
  color: string;
  onLike: () => void;
  onDislike: () => void;
  onEdit: (content: string) => void;
  onEditAction: (action: string) => void;
  onEditGiphy: (giphyId: string | null) => void;
  onDelete: () => void;
}

const useStyles = makeStyles((theme) => ({
  actionContainer: {
    backgroundColor: theme.palette.grey[100],
  },
  actionIcon: {
    color: theme.palette.primary.main,
  },
  ghipyIcon: {
    color: colors.yellow[700],
  },
}));

const PostItem = ({
  index,
  post,
  color,
  onLike,
  onDislike,
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
    canShowAuthor,
    canReorder,
    canUseGiphy,
  } = useUserPermissions(post);
  const classes = useStyles();
  const { Actions: translations, Post: postTranslations } = useTranslations();
  const [giphyImageUrl, showGiphyImage, toggleShowGiphyImage] = useGiphy(
    post.giphy
  );
  const postElement = useRef(null);
  const [actionsToggled, toggleAction] = useToggle(false);
  const [showGiphyEditor, setShowGiphyEditor] = useState(false);
  const upVotes = useMemo(() => countVotes(post, 'like'), [post]);
  const downVotes = useMemo(() => countVotes(post, 'dislike'), [post]);
  const upVoters = useMemo(() => enumerateVotes(post, 'like'), [post]);
  const downVoters = useMemo(() => enumerateVotes(post, 'dislike'), [post]);
  const displayAction = actionsToggled || !!post.action;
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
  return (
    <>
      <Draggable
        draggableId={post.id}
        index={index}
        isDragDisabled={!canReorder}
      >
        {(provided: DraggableProvided) => (
          <PostCard ref={provided.innerRef} {...provided.draggableProps}>
            {canReorder ? (
              <DragHandle {...provided.dragHandleProps}>
                <DragIndicator />
              </DragHandle>
            ) : null}
            <CardContent>
              <Typography variant="body1">
                <EditableLabel
                  readOnly={!canEdit}
                  value={post.content}
                  onChange={onEdit}
                  label="Post content"
                  multiline
                />
              </Typography>
              {canShowAuthor && (
                <AuthorContainer>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    component="div"
                  >
                    {postTranslations.by}&nbsp;
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
                <Typography variant="caption">{translations.title}:</Typography>
                <Typography variant="body1">
                  <EditableLabel
                    value={post.action || ''}
                    onChange={onEditAction}
                    label={translations.title}
                    focused={actionsToggled && !post.action}
                    multiline
                  />
                </Typography>
              </CardContent>
            )}
            <ActionsBar
              color={color}
              displayExtra={
                canDelete ||
                canCreateAction ||
                (canEdit && config.hasGiphy && canUseGiphy)
              }
              extraActions={
                <>
                  {canDelete && (
                    <ActionButton
                      ariaLabel={postTranslations.deleteButton!}
                      tooltip={postTranslations.deleteButton!}
                      icon={
                        <DeleteForeverOutlined
                          style={{ color: Palette.negative }}
                        />
                      }
                      onClick={onDelete}
                    />
                  )}
                  {canCreateAction && (
                    <ActionButton
                      ariaLabel={postTranslations.setActionButton!}
                      tooltip={postTranslations.setActionButton!}
                      icon={
                        post.action ? (
                          <Feedback className={classes.actionIcon} />
                        ) : (
                          <FeedbackOutlined className={classes.actionIcon} />
                        )
                      }
                      onClick={toggleAction}
                    />
                  )}
                  {canEdit && config.hasGiphy && canUseGiphy && (
                    <ActionButton
                      ariaLabel={postTranslations.setGiphyButton!}
                      tooltip={postTranslations.setGiphyButton!}
                      icon={<EmojiEmotions className={classes.ghipyIcon} />}
                      innerRef={postElement}
                      onClick={handleShowGiphy}
                    />
                  )}
                </>
              }
            >
              <VoteButton
                voters={upVoters}
                canVote={canUpVote}
                count={upVotes}
                icon={<ThumbUpOutlined style={{ color: Palette.positive }} />}
                onClick={onLike}
                showTooltip={canShowAuthor}
                ariaLabel="Like"
              />
              <VoteButton
                voters={downVoters}
                canVote={canDownVote}
                count={downVotes}
                icon={<ThumbDownOutlined style={{ color: Palette.negative }} />}
                onClick={onDislike}
                showTooltip={canShowAuthor}
                ariaLabel="Dislike"
              />
              {giphyImageUrl && (
                <ActionButton
                  ariaLabel={postTranslations.toggleGiphyButton!}
                  tooltip={postTranslations.toggleGiphyButton!}
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
            </ActionsBar>
          </PostCard>
        )}
      </Draggable>
      <Popover
        open={showGiphyEditor}
        anchorEl={postElement.current}
        onClose={handleHideGiphyEditor}
        onEscapeKeyDown={handleHideGiphyEditor}
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
              apiKey={config.GiphyApiKey}
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
    ${DragHandle} {
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

export default PostItem;
