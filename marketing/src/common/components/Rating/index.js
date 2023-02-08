import React from 'react';
import { Icon } from 'react-icons-kit';
import { star } from 'react-icons-kit/fa/star';
import { starO } from 'react-icons-kit/fa/starO';

const Rating = ({ rating }) => {
  const totalRating = [];
  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      totalRating.push(
        <Icon key={`rating-key${i}`} icon={star} className="star" />
      );
    } else {
      totalRating.push(
        <Icon key={`rating-key${i}`} icon={starO} className="star-o" />
      );
    }
  }

  return <div className="rating">{totalRating}</div>;
};

export default Rating;
