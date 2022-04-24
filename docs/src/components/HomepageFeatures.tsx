/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import Link from '@docusaurus/Link';

type FeatureItem = {
  title: string;
  image: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Self Hosting',
    image: '/img/home/self-hosted.svg',
    description: (
      <>
        Find all the help you might need for your self-hosted software. From{' '}
        <Link to="/docs/self-hosting/quick-start">installation</Link> to{' '}
        <Link to="/docs/self-hosting/backup">backup</Link>.
      </>
    ),
  },
  {
    title: 'Features',
    image: '/img/home/books.svg',
    description: (
      <>
        Learn about Retrospected's features, from{' '}
        <Link to="/docs/features/encryption">local encryption</Link> to{' '}
        <Link to="/docs/features/private-sessions">private sessions</Link>.
      </>
    ),
  },
];

function Feature({ title, image, description }: FeatureItem) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center">
        <img className={styles.featureSvg} alt={title} src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
