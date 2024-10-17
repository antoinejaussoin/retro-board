import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import Glide from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';

import GlideWrapper, {
  ButtonControlWrapper,
  ButtonWrapper,
  BulletControlWrapper,
  BulletButton,
  DefaultBtn,
} from './glide.style';

const GlideCarousel = ({
  className,
  children,
  options,
  controls,
  prevButton,
  nextButton,
  prevWrapper,
  nextWrapper,
  bullets,
  numberOfBullets,
  buttonWrapperStyle,
  bulletWrapperStyle,
  bulletButtonStyle,
  carouselSelector,
}) => {
  // Add all classs to an array
  const addAllClasses = ['glide'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  // number of bullets loop
  const totalBullets = [];
  for (let i = 0; i < numberOfBullets; i++) {
    totalBullets.push(i);
  }

  // Load glide
  useEffect(() => {
    const glide = new Glide(
      carouselSelector ? `#${carouselSelector}` : '#glide',
      {
        ...options,
      },
    );
    glide.mount();
  });

  return (
    <GlideWrapper
      className={addAllClasses.join(' ')}
      id={carouselSelector || 'glide'}
    >
      <div className="glide__track" data-glide-el="track">
        <ul className="glide__slides">{children}</ul>
      </div>

      {/** if controls prop true then show glide controls nav */}
      {controls && (
        <ButtonControlWrapper
          className="glide__controls"
          data-glide-el="controls"
          {...buttonWrapperStyle}
        >
          <ButtonWrapper
            {...prevWrapper}
            className="glide__prev--area"
            data-glide-dir="<"
            aria-label="prev"
          >
            {prevButton ? prevButton : <DefaultBtn>Prev</DefaultBtn>}
          </ButtonWrapper>
          <ButtonWrapper
            {...nextWrapper}
            className="glide__next--area"
            data-glide-dir=">"
            aria-label="next"
          >
            {nextButton ? nextButton : <DefaultBtn>Next</DefaultBtn>}
          </ButtonWrapper>
        </ButtonControlWrapper>
      )}

      {/** if bullets prop true then show glide bullets nav */}
      {bullets && (
        <BulletControlWrapper
          className="glide__bullets"
          data-glide-el="controls[nav]"
          {...bulletWrapperStyle}
        >
          <Fragment>
            {totalBullets.map((index) => (
              <BulletButton
                key={index}
                className="glide__bullet"
                data-glide-dir={`=${index}`}
                aria-label={`bullet${index + 1}`}
                {...bulletButtonStyle}
              />
            ))}
          </Fragment>
        </BulletControlWrapper>
      )}
    </GlideWrapper>
  );
};

GlideCarousel.propTypes = {
  /** className of the GlideCarousel. */
  className: PropTypes.string,

  /** Children. */
  children: PropTypes.element,

  /** You can add your custom glid options using this prop. */
  options: PropTypes.object,

  /** Hide || show controls nav. */
  controls: PropTypes.bool,

  /** Hide || show bullets nav. */
  bullets: PropTypes.bool,

  /** This prop only take your slider / carousel / testimonials data length. */
  numberOfBullets: PropTypes.number,

  /** bulletWrapperStyle is a bullet control wrapper style object prop.
   * It's contain display, space, alignItems,
   * justifyContent and flexWrap style-system prop.
   */
  bulletWrapperStyle: PropTypes.object,

  /** buttonWrapperStyle is a button control wrapper style object prop.
   * It's contain same as buttonWrapperStyle style-system prop and
   * position, left, right, top and bottom.
   */
  buttonWrapperStyle: PropTypes.object,

  /** prevWrapper is a previous button wrapper style object prop.
   * It's contain display, space, bg, borders, boxShadow, borderRadius,
   * position, top, left, right and bottom style-system prop.
   */
  prevWrapper: PropTypes.object,

  /** nextWrapper is a next button wrapper style object prop.
   * It's contain same as prevWrapper style-system prop.
   */
  nextWrapper: PropTypes.object,

  /** Set previous button for glide carousel. */
  prevButton: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  /** Set next button for glide carousel. */
  nextButton: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  /** bulletButtonStyle is a bullet button style object prop.
   * It's contain  display, width, height, space,
   * bg, borders, boxShadow and borderRadius style-system prop.
   */
  bulletButtonStyle: PropTypes.object,
};

// GlideCarousel default props
GlideCarousel.defaultProps = {
  controls: true,
  bullets: false,
};

export default GlideCarousel;
