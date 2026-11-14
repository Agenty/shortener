---
title: Create short links from AI agents and assistants
nav: AI agents
description: Let Claude, ChatGPT, Cursor or your own AI agent create Shortener.dev short links and read click stats, using the agent skill, llms.txt and the OpenAPI spec.
section: Integrations
order: 4
updated: 2026-11-14
---

AI coding agents and assistants can use Shortener.dev directly: they read the docs in a format made for them, then call the [API](/docs/url-shortener-api) with your key. Ask "shorten this URL with a utm_source of newsletter" or "which of my links got the most clicks this week" and the agent sends the right request.

## What's available to agents

| Resource | URL | Use it for |
| --- | --- | --- |
| Agent skill | `https://shortener.dev/.well-known/agent-skills/SKILL.md` | Instructions for an agent: authentication, fields, limits and rules |
| Skill index | `https://shortener.dev/.well-known/agent-skills/index.json` | Discovery by agents that support the agent skills format |
| llms.txt | `https://shortener.dev/llms.txt` | An index of every docs page, each as markdown |
| llms-full.txt | `https://shortener.dev/llms-full.txt` | All docs pages in one file |
| OpenAPI spec | `https://api.shortener.dev/openapi.json` | Every endpoint and field, for tools that generate API clients or actions |
| Markdown docs | Any docs URL plus `.md` | A single page as plain markdown, for example `https://shortener.dev/docs/geo-targeting.md` |

## Give the agent your API key

Create an [API key](/docs/api-keys) just for the agent, so you can revoke it on its own. API access is included on paid plans.

Put the key in an environment variable instead of pasting it into the chat:

```bash
export SHORTENER_API_KEY=your-key
```

The skill tells agents to read the key from `SHORTENER_API_KEY`, to never print it back, and never to commit it to a repository.

## Coding agents

In Claude Code, Cursor, Codex or a similar agent working in your terminal, point it at the skill once:

```text
Read https://shortener.dev/.well-known/agent-skills/SKILL.md and use the
Shortener.dev API with the key in SHORTENER_API_KEY. Create a short link for
https://example.com/blog/spring-launch with the back-half spring-launch and
utm_source=newsletter.
```

The agent sends `POST /v1/links` and gives you the `short_url` from the response. In the same session you can follow up with requests like "add an expiration of December 31" or "show clicks by country for that link for the last 7 days".

To use this in every session, add the first sentence to your project's agent instructions file, such as `CLAUDE.md` or `AGENTS.md`.

## Chat assistants and custom GPTs

Assistants that can import an OpenAPI spec as an action or tool can use `https://api.shortener.dev/openapi.json`. Set authentication to an API key sent as a bearer token. The spec describes each field, including the rules for back-halves, expiration and domains, so the assistant can fill requests in correctly.

## What the agent can and can't do

Anything the API supports: create, list, update and delete links, add and verify domains, read analytics and the raw click log, and manage projects. The same rules apply as in the dashboard. Destinations must be on a [verified](/docs/verify-domain) or whitelisted domain, and the API allows 150 requests a minute.

Deleting a link is permanent. The skill tells agents to confirm with you before they delete anything, but review what an agent is about to do when it works on links people are already using.
