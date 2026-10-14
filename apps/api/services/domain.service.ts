import { AuthUser } from '../models/auth-user';
import { Domain } from '../models/domain';
import { Bindings } from '../types/bindings';

export const getDomains = async (
  env: Bindings,
  authUser: AuthUser,
  offset: number = 0,
  limit: number = 25
): Promise<Array<Domain>> => {
  const sqlQuery = env.DB.prepare(
    `
          SELECT domain_id, user_id, domain, is_default, created_at, updated_at
          FROM Domains
          WHERE account_id = ?
          ORDER BY created_at DESC
          LIMIT ?, ?`
  ).bind(authUser.account_id, offset, limit);

  const { results } = await sqlQuery.all();
  return results as unknown as Array<Domain>;
};

export const getDomainById = async (
  env: Bindings,
  domainId: number,
  authUser: AuthUser
): Promise<Domain | null> => {
  const sqlQuery = env.DB.prepare(
    `
          SELECT domain_id, user_id, domain, is_default, created_at, updated_at
          FROM Domains
          WHERE domain_id = ? AND account_id = ?`
  ).bind(domainId, authUser.account_id);

  const domain: Domain = await sqlQuery.first();
  return domain;
};

export const createDomain = async (
  env: Bindings,
  authUser: AuthUser,
  domain: Domain
): Promise<Domain> => {
  domain.account_id = authUser.account_id;
  domain.user_id = domain.user_id || authUser.user_id;
  domain.created_at = new Date().toISOString();

  const { meta } = await env.DB.prepare(
    `
          INSERT INTO Domains (account_id, user_id, domain, is_default, created_at) 
          VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      domain.account_id,
      domain.user_id,
      domain.domain || null,
      domain.is_default || false,
      domain.created_at
    )
    .run();

  domain.domain_id = meta.last_row_id;
  return domain;
};

export const updateDomain = async (
  env: Bindings,
  authUser: AuthUser,
  domainId: number,
  domain: Domain
): Promise<Domain> => {
  domain.updated_at = new Date().toISOString();

  const { meta } = await env.DB.prepare(
    `
        UPDATE Domains 
        SET domain = ?, is_default = ?, updated_at = ?
        WHERE domain_id = ? AND account_id = ?`
  )
    .bind(
      domain.domain || null,
      domain.is_default || false,
      domain.updated_at,
      domainId,
      authUser.account_id
    )
    .run();

  return meta.changes ? domain : null;
};

export const deleteDomain = async (
  env: Bindings,
  authUser: AuthUser,
  domainId: number
): Promise<boolean> => {
  const { meta } = await env.DB.prepare(
    `
        DELETE FROM Domains 
        WHERE domain_id = ? AND account_id = ?`
  )
    .bind(domainId, authUser.account_id)
    .run();
  return meta.changes > 0;
};
