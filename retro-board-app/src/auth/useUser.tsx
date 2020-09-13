import { useContext } from 'react';
import UserContext from './Context';
import { User } from 'retro-board-common';

function useUser(): User | null {
    const { user } = useContext(UserContext);

    return user;
}

export default useUser;
