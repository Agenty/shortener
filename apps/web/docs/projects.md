---
title: Organize short links into projects
nav: Projects
description: Group short links by campaign, client or brand with projects, and read click analytics for one project at a time.
section: Short links
order: 6
updated: 2026-11-15
---

A project groups short links that belong together, such as every link in a product launch, all links for one client, or one brand's social posts. You can filter the **Links** page and [click analytics](/docs/click-analytics) by project instead of adding up links one by one.

Projects are available on paid plans: 3 projects on Starter, 5 on Pro and 10 on Business.

## Create a project

1. Open **Projects** in the sidebar and click **New project**.

   ![Projects page with the New project button](/docs/images/projects-new.webp)

2. Enter a **Name**, up to 64 characters, such as "Spring launch".
3. Pick a **Color** to tell projects apart at a glance, or leave it empty to get a random one.
4. Click **Create project**.

![New project dialog with a name filled in](/docs/images/project-dialog.webp)

The **Projects** page shows each project with its number of links, and the **Links** and **Analytics** buttons open both pages filtered to that project.

![Projects page with two projects and their number of links](/docs/images/projects-list.webp)

## Put links in a project

In the **Short Link Builder**, choose the project in **Project** under the back-half. The field only shows once you have a project. If the **Links** page is filtered by a project, new links go into that project by default.

![Project field under the back-half in the Short Link Builder](/docs/images/create-link-project.webp)

To move a link you already have, click the **...** menu on its row, open **Move to project** and pick a project, or **No project** to take it out. The link's back-half and settings don't change.

![Move to project in the actions menu of a short link](/docs/images/link-move-to-project.webp)

## Filter links and analytics

Pick a project in the **All projects** menu at the top of the **Links** or **Analytics** page. The choice is kept in the page URL as `?project=`, so you can bookmark the filtered view or share it with a teammate.

![Links page filtered to one project](/docs/images/links-project-filter.webp)

Clicks are counted toward the project a link was in at the time of the click. If you move a link, its older clicks stay with the previous project.

## Use projects with the API

Create a project with `POST /v1/projects`:

```bash
curl -X POST https://api.shortener.dev/v1/projects \
  -H "Authorization: Bearer $SHORTENER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Spring launch", "color": "#E0F2FE" }'
```

`name` is required. `color` is a hex code, and `icon` takes the URL of a PNG, JPG or SVG image. The response includes the `project_id`.

Add `project_id` when you create a link:

```json
{
  "url": "https://example.com/blog/spring-launch",
  "key": "spring-launch",
  "project_id": 1
}
```

To move an existing link, read it with `GET /v1/links/{key}`, set `project_id`, and send it back with `PUT /v1/links/{key}`. Send the full link, because an update replaces its settings. See [Change where a short link goes](/docs/edit-short-link). To list one project's links, add `project_id` to `GET /v1/links`.

## Clicks for one project in the API

Pass `project_id` to the analytics endpoints. This returns daily clicks for the last 30 days across every link in project 1:

```bash
curl "https://api.shortener.dev/v1/analytics?project_id=1&interval=30" \
  -H "Authorization: Bearer $SHORTENER_API_KEY"
```

The breakdowns work the same way, for example `/v1/analytics/country?project_id=1` or `/v1/analytics/referer?project_id=1`. How many days you can look back depends on your plan.

## Edit or delete a project

On the **Projects** page, open the **...** menu on a project and choose **Edit** to rename it or change its color.

![Edit and Delete in the menu of a project](/docs/images/project-menu.webp)

**Delete** removes the project and every short link in it. Those links stop redirecting, and QR codes made from them stop working. The confirmation shows how many links will be deleted. To keep the links, move them to **No project** first.

In the API, `PUT /v1/projects/{id}` edits a project, `GET /v1/projects` lists projects with their number of links (`total_links`), and `DELETE /v1/projects/{id}` deletes a project along with its links.
