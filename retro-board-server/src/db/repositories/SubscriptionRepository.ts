import { EntityRepository, Repository } from 'typeorm';
import { UserEntity, SubscriptionEntity } from '../entities';
import { Plan } from '@retrospected/common';
import { v4 } from 'uuid';
import { addDays } from 'date-fns';
@EntityRepository(SubscriptionEntity)
export default class SubscriptionRepository extends Repository<SubscriptionEntity> {
  async activate(
    stripeSubscriptionId: string,
    owner: UserEntity,
    plan: Plan,
    domain: string | null
  ): Promise<SubscriptionEntity> {
    const existingSub = await this.findOne(stripeSubscriptionId);

    if (!existingSub) {
      const newSubscription = new SubscriptionEntity(
        stripeSubscriptionId,
        owner,
        plan
      );
      newSubscription.domain = domain;
      newSubscription.active = true;
      return await this.save(newSubscription);
    }
    existingSub.active = true;
    existingSub.domain = domain;
    return await this.save(existingSub);
  }

  async cancel(stripeSubscriptionId: string): Promise<SubscriptionEntity> {
    const existingSub = await this.findOne(stripeSubscriptionId);
    if (!existingSub) {
      throw Error('Cannot cancel a subscription that does not exist');
    }
    existingSub.active = false;
    return await this.save(existingSub);
  }

  async startTrial(
    owner: UserEntity,
    plan: Plan,
    domain: string | null
  ): Promise<SubscriptionEntity> {
    const newSubscription = new SubscriptionEntity(v4(), owner, plan);
    newSubscription.trial = addDays(new Date(), 30);
    newSubscription.domain = domain;
    newSubscription.active = true;
    return await this.save(newSubscription);
  }
}
