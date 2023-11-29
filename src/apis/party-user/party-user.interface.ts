import { QueryRunner } from 'typeorm';

export interface IPartyUserServiceFindAllWithUserID {
  userID: string;
}

export interface IPartyUserServiceFindAllWithPartyID {
  partyID: string;
}

export interface IPartyUserServiceCreate {
  partyUserRelations: { party: { id: string }; user: { id: string } }[];
  queryRunner: QueryRunner;
}
