import { useState, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import makeStyles from '@material-ui/core/styles/makeStyles';
import blue from '@material-ui/core/colors/blue';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import grey from '@material-ui/core/colors/grey';
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
} from '@material-ui/icons';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import useTranslations from '../../../../translations';
import EditableLabel from '../../../../components/EditableLabel';
import { Palette } from '../../../../Theme';
import { Post } from '@retrospected/common';
import { useUserPermissions } from '../useUserPermissions';
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
import isSearchMatch from '../../is-search-match';

interface PostItemProps {
  index: number;
  post: Post;
  color: string;
  search: string;
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
    color: blue[400],
  },
  ghipyIcon: {
    color: yellow[700],
  },
}));

const PostItem = ({
  index,
  post,
  color,
  search,
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
    canDisplayUpVote,
    canDisplayDownVote,
    canShowAuthor,
    canReorder,
    canUseGiphy,
    isBlurred,
  } = useUserPermissions(post);
  const classes = useStyles();
  const { Actions: translations, Post: postTranslations } = useTranslations();
  const { encrypt, decrypt } = useCrypto();
  const canDecrypt = useCanDecrypt();
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

  const actualContent = useMemo(() => {
    return isBlurred ? generateLoremIpsum(post.content) : decrypt(post.content);
  }, [decrypt, isBlurred, post.content]);

  const faded = !isSearchMatch(
    post.content,
    canShowAuthor ? post.user.name : null,
    search,
    isBlurred
  );

  return (
    <>
      <Draggable
        draggableId={post.id}
        index={index}
        isDragDisabled={!canReorder}
      >
        {(provided: DraggableProvided) => (
          <PostCard
            elevation={search ? (faded ? 0 : 3) : 2}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            {isBlurred ? (
              <Tooltip title="Cards from other people will be shown when the moderator chooses to reveal them.">
                <BlurOverlay />
              </Tooltip>
            ) : null}
            {canReorder ? (
              <DragHandle {...provided.dragHandleProps}>
                <DragIndicator />
              </DragHandle>
            ) : null}
            <CardContent>
              <LabelContainer blurred={isBlurred}>
                <Typography variant="body1">
                  <EditableLabel
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
                    value={decrypt(post.action || '')}
                    onChange={handleEditAction}
                    label={translations.title}
                    focused={actionsToggled && !post.action}
                    multiline
                  />
                </Typography>
              </CardContent>
            )}
            <ActionsBar
              color={faded ? grey[100] : color}
              rightActions={
                <>
                  {giphyImageUrl && (
                    <ActionButton
                      ariaLabel={postTranslations.toggleGiphyButton!}
                      tooltip={postTranslations.toggleGiphyButton!}
                      icon={
                        <InsertPhotoTwoTone
                          style={{
                            color: !showGiphyImage ? green[200] : red[200],
                          }}
                        />
                      }
                      onClick={toggleShowGiphyImage}
                    />
                  )}

                  {canCreateAction && (
                    <ActionButton
                      ariaLabel={postTranslations.setActionButton!}
                      tooltip={postTranslations.setActionButton!}
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
                  {canEdit && config.hasGiphy && canUseGiphy && (
                    <ActionButton
                      ariaLabel={postTranslations.setGiphyButton!}
                      tooltip={postTranslations.setGiphyButton!}
                      icon={
                        <EmojiEmotionsOutlined className={classes.ghipyIcon} />
                      }
                      innerRef={postElement}
                      onClick={handleShowGiphy}
                    />
                  )}
                  {canDelete && (
                    <ActionButton
                      ariaLabel={postTranslations.deleteButton!}
                      tooltip={postTranslations.deleteButton!}
                      icon={
                        <DeleteForeverOutlined
                          style={{
                            color: Palette.negative,
                          }}
                        />
                      }
                      onClick={onDelete}
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
  color: ${grey[500]};
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
  background-color: ${red[400]};
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
  @supports (backdrop-filter: blur(3px)) {
    background-color: rgba(255, 255, 255, 0.3);
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

  @supports (backdrop-filter: blur(3px)) {
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
