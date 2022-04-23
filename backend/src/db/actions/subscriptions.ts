import { SubscriptionRepository, UserRepository } from '../repositories';
import { Plan, Currency } from '../../common';
import { SubscriptionEntity, UserEntity, UserView } from '../entities';
import { transaction } from './transaction';

export async function activateSubscription(
  userId: string,
  stripeSubscriptionId: string,
  plan: Plan,
  domain: string | null,
  currency: Currency
): Promise<SubscriptionEntity> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const subscriptionRepository = manager.getCustomRepository(
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
  });
}

export async function cancelSubscription(
  stripeSubscriptionId: string
): Promise<SubscriptionEntity | null> {
  return await transaction(async (manager) => {
    const subscriptionRepository = manager.getCustomRepository(
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
  });
}

export async function getActiveSubscription(
  userId: string
): Promise<SubscriptionEntity | null> {
  return await transaction(async (manager) => {
    const subscriptionRepository = manager.getCustomRepository(
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
  });
}

export async function saveSubscription(
  subscription: SubscriptionEntity
): Promise<void> {
  return await transaction(async (manager) => {
    const subscriptionRepository = manager.getCustomRepository(
      SubscriptionRepository
    );
    await subscriptionRepository.save(subscription);
  });
}

export async function startTrial(userId: string): Promise<UserEntity | null> {
  return await transaction(async (manager) => {
    const userViewRepository = manager.getRepository(UserView);
    const fullUser = await userViewRepository.findOne({ id: userId });
    if (fullUser) {
      const userRepository = manager.getCustomRepository(UserRepository);
      const user = await userRepository.startTrial(fullUser);
      return user;
    }
    return null;
  });
}
