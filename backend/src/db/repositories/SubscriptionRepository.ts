import { UserEntity, SubscriptionEntity } from '../entities';
import { Plan } from '../../common';
import { getBaseRepository, saveAndReload } from './BaseRepository';

export default getBaseRepository(SubscriptionEntity).extend({
  async activate(
    stripeSubscriptionId: string,
    owner: UserEntity,
    plan: Plan,
    domain: string | null
  ): Promise<SubscriptionEntity> {
    const existingSub = await this.findOne({
      where: { id: stripeSubscriptionId },
    });

    if (!existingSub) {
      const newSubscription = new SubscriptionEntity(
        stripeSubscriptionId,
        owner,
        plan
      );
      newSubscription.domain = domain;
      newSubscription.active = true;
      return await saveAndReload(this, newSubscription);
    }
    existingSub.active = true;
    existingSub.domain = domain;
    return await saveAndReload(this, existingSub);
  },

  async cancel(stripeSubscriptionId: string): Promise<SubscriptionEntity> {
    const existingSub = await this.findOne({
      where: { id: stripeSubscriptionId },
    });
    if (!existingSub) {
      throw Error('Cannot cancel a subscription that does not exist');
    }
    existingSub.active = false;
    return await saveAndReload(this, existingSub);
  },
});
