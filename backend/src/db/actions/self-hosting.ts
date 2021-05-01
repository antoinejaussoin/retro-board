import { UserView } from '../entities';
import { transaction } from './transaction';

export async function checkSelfHostedLicence(key: string): Promise<boolean> {
  const parts = key.split('|');
  if (parts.length !== 2) {
    return false;
  }
  const email = parts[0];
  const id = parts[1];

  return await transaction(async (manager) => {
    const userRepository = manager.getRepository(UserView);
    const users = await userRepository.find({
      where: { email, id },
    });
    if (users.length !== 1) {
      return false;
    }
    const user = users[0];
    return isKeyValid(user, id);
  });
}

function isKeyValid(user: UserView, id: string) {
  if (user.pro && user.plan === 'unlimited' && user.id === id) {
    return true;
  }
  return false;
}
