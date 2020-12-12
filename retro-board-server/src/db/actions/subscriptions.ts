import { SubscriptionRepository, UserRepository } from '../repositories';
import { Plan, Currency } from '@retrospected/common';
import { SubscriptionEntity } from '../entities';
import { Connection } from 'typeorm';

export async function activateSubscription(
  connection: Connection,
  userId: string,
  stripeSubscriptionId: string,
  plan: Plan,
  domain: string | null,
  currency: Currency
): Promise<SubscriptionEntity> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const subscriptionRepository = connection.getCustomRepository(
    SubscriptionRepository
  );
  const user = await userRepository.findOne(userId);
  if (!user) {
    throw Error('Cannot activate subscription on a non existing user');
  }
  const existingSubscription = await subscriptionRepository.activate(
    stripeSubscriptionId,
    user,
    plan,
    domain
  );
  user.currency = currency;
  await userRepository.save(user);
  return existingSubscription;
}

export async function cancelSubscription(
  connection: Connection,
  stripeSubscriptionId: string
): Promise<SubscriptionEntity | null> {
  const subscriptionRepository = connection.getCustomRepository(
    SubscriptionRepository
  );
  try {
    const existingSubscription = await subscriptionRepository.cancel(
      stripeSubscriptionId
    );
    return existingSubscription;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getActiveSubscription(
  connection: Connection,
  userId: string
): Promise<SubscriptionEntity | null> {
  const subscriptionRepository = connection.getCustomRepository(
    SubscriptionRepository
  );
  const subscriptions = await subscriptionRepository.find({
    where: {
      owner: {
        id: userId,
      },
      active: true,
    },
    order: {
      updated: 'DESC',
    },
  });
  if (subscriptions.length === 0) {
    return null;
  }
  return subscriptions[0];
}

export async function saveSubscription(
  connection: Connection,
  subscription: SubscriptionEntity
): Promise<void> {
  const subscriptionRepository = connection.getCustomRepository(
    SubscriptionRepository
  );
  await subscriptionRepository.save(subscription);
}
