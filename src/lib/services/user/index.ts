import { AccountRegisterDocument, MeDocument } from '$lib/graphql/schema';
import { AccountRegisterError } from '$lib/errors/AccountCreateError';

import type { Client } from '@urql/svelte';
import type { AccountRegisterInput, UserFragmentFragment } from '$lib/graphql/schema';

export type AccountRegister = (input: AccountRegisterInput) => Promise<UserFragmentFragment>;

export type Me = () => Promise<UserFragmentFragment>;

export type UserService = {
  accountRegister: AccountRegister;
  me: Me;
};

export function makeUserService(urqlClient: Client): UserService {
  const accountRegister: AccountRegister = async (input: AccountRegisterInput) => {
    const { data = {}, error } = await urqlClient
      .mutation(AccountRegisterDocument, {
        input
      })
      .toPromise();

    if (data.accountRegister.error) {
      const err = AccountRegisterError.from(error[0]);

      throw err;
    }

    if (error) {
      throw error;
    }

    return data.accountRegister.user;
  };

  const me: Me = async () => {
    const { data, error } = await urqlClient.query(MeDocument).toPromise();

    if (data?.me.error) {
      const err = AccountRegisterError.from(error[0]);

      throw err;
    }

    if (error) {
      throw error;
    }

    // TODO: Fix schemas in the Back-End to avoid repeition
    return data.me.me;
  };

  return {
    accountRegister,
    me
  };
}
