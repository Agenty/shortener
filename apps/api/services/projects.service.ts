import { AuthUser } from '../models/auth-user';
import { Project } from '../models/project';
import { getRandomColor } from '../helper/utility';

export const getProjects = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  offset: number = 0,
  limit: number = 25
): Promise<Array<Project>> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT p.project_id, p.user_id, p.name, p.color, p.icon, p.created_at, p.updated_at, 
        COALESCE(l.total_links, 0) AS total_links
        FROM Projects as p
        LEFT JOIN (
          SELECT project_id, COUNT(key) AS total_links
          FROM Links
          Where account_id = ?
          GROUP BY project_id
        ) AS l
        on p.project_id = l.project_id
        WHERE p.account_id = ?
        ORDER BY p.created_at DESC
        LIMIT ?, ?`
  ).bind(authUser.account_id, authUser.account_id, offset, limit);
  const { results } = await sqlQuery.all();
  return results as unknown as Array<Project>;
};

export const getProjectCount = async (env: CloudflareBindings, authUser: AuthUser) => {
  const sqlQuery = env.DB.prepare(
    `Select count(1) as total from Projects Where account_id = ?`
  ).bind(authUser.account_id);

  const { total } = await sqlQuery.first();
  return Number(total);
};

export const getProjectById = async (
  env: CloudflareBindings,
  projectId: number,
  authUser: AuthUser
): Promise<Project | null> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT project_id, user_id, name, color, icon, created_at, updated_at
        FROM Projects
        WHERE project_id = ? AND account_id = ?`
  ).bind(projectId, authUser.account_id);

  const project: Project = await sqlQuery.first();
  return project;
};

export const createProject = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  project: Project
): Promise<Project> => {
  project.account_id = authUser.account_id;
  project.user_id = authUser.user_id;
  project.created_at = new Date().toISOString();
  project.color = project.color || getRandomColor();

  const { meta } = await env.DB.prepare(
    `
        INSERT INTO Projects (account_id, user_id, name, color, icon, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      project.account_id,
      project.user_id,
      project.name,
      project.color,
      project.icon || null,
      project.created_at
    )
    .run();
  project.project_id = meta.last_row_id;
  return project;
};

export const updateProject = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  projectId: number,
  project: Project
): Promise<Project> => {
  project.updated_at = new Date().toISOString();
  project.color = project.color || getRandomColor();
  const { meta } = await env.DB.prepare(
    `
      UPDATE Projects 
      SET name = ?, icon = ?, color = ?, updated_at = ?
      WHERE project_id = ? AND account_id = ?`
  )
    .bind(
      project.name,
      project.icon || null,
      project.color,
      project.updated_at,
      projectId,
      authUser.account_id
    )
    .run();
  return meta.changes > 0 ? project : null;
};

export const deleteProject = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  projectId: number
): Promise<boolean> => {
  const { meta } = await env.DB.prepare(
    `
      DELETE FROM Projects 
      WHERE project_id = ? AND account_id = ?`
  )
    .bind(projectId, authUser.account_id)
    .run();

  return meta.changes > 0;
};
