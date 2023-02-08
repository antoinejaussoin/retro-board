import React from 'react';
import PropTypes from 'prop-types';
import Box from '../Box';
import Button from '../Button';
import Loader from '../Loader';
import Text from '../Text';

const LoadMore = ({
  handleLoadMore,
  showButton,
  buttonText,
  buttonVariant,
  loaderColor,
  isLoading,
  loadMoreComponent,
  loadMoreWrapperStyle,
  loadMoreButtonStyle,
}) => {
  return (
    <>
      {showButton ? (
        <Box {...loadMoreWrapperStyle}>
          {loadMoreComponent ? (
            loadMoreComponent
          ) : (
            <Button
              variant={buttonVariant}
              title={buttonText || 'Load More'}
              isLoading={isLoading}
              loader={<Loader loaderColor={loaderColor} />}
              onClick={handleLoadMore}
              {...loadMoreButtonStyle}
            />
          )}
        </Box>
      ) : null}
    </>
  );
};

const ListGrid = ({
  data = [],
  total,
  component,
  columnWidth,
  postCount,
  totalPost,
  pagination,
  paginationComponent,
  handleLoadMore,
  loadMoreComponent,
  infinityScroll,
  placeholder,
  loading,
  isLoading,
  limit,
  buttonText,
  buttonVariant,
  loaderColor,
  componentWrapperStyle,
  componentContainerStyle,
  loadMoreWrapperStyle,
  loadMoreButtonStyle,
  paginationWrapperStyle,
  className,
}) => {
  const Limit = limit ? Number(limit) : 1;
  const limits = [];
  for (let i = 0; i < Limit; i++) {
    limits.push(i);
  }
  // const grabPostNumber = data.length;
  let showButton = postCount < totalPost;

  return (
    <>
      <Box {...componentWrapperStyle} className={className}>
        {data.length ? (
          <>
            {data.map((item, index) => (
              <Box
                width={columnWidth}
                key={index}
                {...componentContainerStyle}
                className="singleGridBox"
              >
                {component(item, index)}
              </Box>
            ))}
          </>
        ) : null}
        {loading && (
          <>
            {limits.map((index) => (
              <Box width={columnWidth} key={index} {...componentContainerStyle}>
                {placeholder ? placeholder : <Text content="Loading ..." />}
              </Box>
            ))}
          </>
        )}
      </Box>
      {postCount < totalPost && (
        <LoadMore
          showButton={showButton}
          handleLoadMore={handleLoadMore}
          isLoading={isLoading}
          buttonText={buttonText}
          buttonVariant={buttonVariant}
          loaderColor={loaderColor}
          loadMoreComponent={loadMoreComponent}
          loadMoreButtonStyle={loadMoreButtonStyle}
          loadMoreWrapperStyle={loadMoreWrapperStyle}
        />
      )}
      {paginationComponent && (
        <Box {...paginationWrapperStyle}>{paginationComponent}</Box>
      )}
    </>
  );
};

ListGrid.propTypes = {
  data: PropTypes.array.isRequired,
  totalPost: PropTypes.number,
  component: PropTypes.func.isRequired,
  columnWidth: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
  pagination: PropTypes.bool,
  paginationComponent: PropTypes.element,
  handleLoadMore: PropTypes.func,
  loadMoreComponent: PropTypes.element,
  infinityScroll: PropTypes.bool,
  placeholder: PropTypes.element,
  loading: PropTypes.bool,
  limit: PropTypes.number,
  buttonText: PropTypes.string,
  listWrapperStyle: PropTypes.object,
  componentWrapperStyle: PropTypes.object,
  componentContainerStyle: PropTypes.object,
  loadMoreWrapperStyle: PropTypes.object,
  loadMoreStyle: PropTypes.object,
  paginationWrapperStyle: PropTypes.object,
};

ListGrid.defaultProps = {
  componentWrapperStyle: {
    flexBox: true,
    flexWrap: 'wrap',
    mr: '-1rem',
    ml: '-1rem',
  },
  componentContainerStyle: {
    pr: '1rem',
    pl: '1rem',
  },
  loadMoreWrapperStyle: {
    flexBox: true,
    justifyContent: 'center',
    mt: '1rem',
  },
};

export default ListGrid;
