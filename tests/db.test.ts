import fs from "node:fs"
import path from "node:path"

import { PGlite } from "@electric-sql/pglite"
import { beforeAll, describe, expect, it } from "vitest"

// Runs every migration on an in-memory Postgres and checks the rules the money path depends on.
const MAYA = "00000000-0000-0000-0000-00000000000a"
const OTHER = "00000000-0000-0000-0000-00000000000b"

let db: PGlite

async function as<T>(user: string | null, sql: string, params: unknown[] = []) {
  await db.exec(user ? `set request.jwt.claim.sub = '${user}'; set role authenticated;` : `set request.jwt.claim.sub = ''; set role anon;`)
  try {
    return (await db.query<T>(sql, params)).rows
  } finally {
    await db.exec("reset role;")
  }
}

async function admin<T>(sql: string, params: unknown[] = []) {
  return (await db.query<T>(sql, params)).rows
}

beforeAll(async () => {
  db = new PGlite()
  await db.exec(fs.readFileSync(path.join(import.meta.dirname, "support/supabase-stub.sql"), "utf8"))
  const dir = path.join(import.meta.dirname, "../supabase/migrations")
  for (const file of fs.readdirSync(dir).sort()) await db.exec(fs.readFileSync(path.join(dir, file), "utf8"))
  await db.exec(`insert into auth.users (id, raw_user_meta_data) values
    ('${MAYA}', '{"username":"Maya","full_name":"Maya Okafor"}'),
    ('${OTHER}', '{"username":"maya"}')`)
})

describe("sign-up", () => {
  it("creates a profile with the chosen name, lower-cased, on the free plan", async () => {
    const [maya] = await admin<{ username: string; plan: string; display_name: string }>(
      `select username, plan, display_name from public.profiles where id = $1`,
      [MAYA]
    )
    expect(maya).toEqual({ username: "maya", plan: "free", display_name: "Maya Okafor" })
  })

  it("leaves the name empty when it is already taken", async () => {
    const [other] = await admin<{ username: string | null }>(`select username from public.profiles where id = $1`, [OTHER])
    expect(other.username).toBeNull()
  })
})

describe("free plan limits", () => {
  it("allows five links and refuses the sixth", async () => {
    for (let i = 1; i <= 5; i++) {
      await as(MAYA, `insert into public.links (title, url, position) values ($1, $2, $3)`, [`Link ${i}`, `https://example.com/${i}`, i])
    }
    await expect(
      as(MAYA, `insert into public.links (title, url) values ('Six', 'https://example.com/6')`)
    ).rejects.toThrow(/free plan allows 5 links/)
  })

  it("refuses Pro themes", async () => {
    await expect(as(MAYA, `update public.profiles set theme_id = 'cyberpunk' where id = $1`, [MAYA])).rejects.toThrow(/needs Pro/)
  })

  it("does not let users give themselves Pro", async () => {
    await expect(as(MAYA, `update public.profiles set plan = 'pro' where id = $1`, [MAYA])).rejects.toThrow(/permission denied/)
    await expect(
      as(MAYA, `update public.profiles set stripe_customer_id = 'cus_fake' where id = $1`, [MAYA])
    ).rejects.toThrow(/permission denied/)
  })

  it("keeps analytics for Pro", async () => {
    await expect(as(MAYA, `select public.get_click_stats(30)`)).rejects.toThrow(/need Pro/)
  })
})

describe("pro plan", () => {
  it("lifts the link limit and unlocks themes once the webhook sets Pro", async () => {
    await admin(`update public.profiles set plan = 'pro' where id = $1`, [MAYA])
    await as(MAYA, `insert into public.links (title, url, layout) values ('Six', 'https://youtube.com/watch?v=abcdefghijk', 'featured')`)
    const [row] = await as<{ theme_id: string }>(MAYA, `update public.profiles set theme_id = 'cyberpunk' where id = $1 returning theme_id`, [MAYA])
    expect(row.theme_id).toBe("cyberpunk")
  })

  it("falls back to five links and a free theme when Pro lapses, without deleting anything", async () => {
    await admin(`update public.profiles set plan = 'free' where id = $1`, [MAYA])
    const [page] = await as<{ page: { themeId: string; links: unknown[] } }>(null, `select public.public_page('MAYA') as page`)
    expect(page.page.themeId).toBe("vercel")
    expect(page.page.links).toHaveLength(5)
    const [{ count }] = await admin<{ count: number }>(`select count(*)::int as count from public.links where user_id = $1`, [MAYA])
    expect(count).toBe(6)
  })
})

describe("privacy", () => {
  it("keeps each user's links to themselves", async () => {
    expect(await as(OTHER, `select * from public.links`)).toHaveLength(0)
    expect(await as(OTHER, `update public.links set title = 'hacked' returning id`)).toHaveLength(0)
  })

  it("gives visitors no direct table access", async () => {
    await expect(as(null, `select * from public.profiles`)).rejects.toThrow(/permission denied/)
    await expect(as(null, `select * from public.clicks`)).rejects.toThrow(/permission denied/)
    await expect(as(null, `select * from public.reports`)).rejects.toThrow(/permission denied/)
  })

  it("counts clicks on enabled links only, without storing who clicked", async () => {
    const [link] = await admin<{ id: string }>(`select id from public.links where user_id = $1 order by position limit 1`, [MAYA])
    const [hit] = await as<{ url: string }>(null, `select public.record_click($1, 'instagram.com', 'tr') as url`, [link.id])
    expect(hit.url).toMatch(/^https:\/\//)
    await admin(`update public.links set enabled = false where id = $1`, [link.id])
    const [miss] = await as<{ url: string | null }>(null, `select public.record_click($1) as url`, [link.id])
    expect(miss.url).toBeNull()
    const [click] = await admin<{ country: string }>(`select country from public.clicks limit 1`)
    expect(click.country).toBe("TR")
  })

  it("accepts reports for existing pages only", async () => {
    const [ok] = await as<{ ok: boolean }>(null, `select public.report_page('maya', 'spam') as ok`)
    const [missing] = await as<{ ok: boolean }>(null, `select public.report_page('nobody', 'spam') as ok`)
    expect([ok.ok, missing.ok]).toEqual([true, false])
  })
})

describe("usernames", () => {
  it("knows which names are free", async () => {
    const [row] = await as<{ taken: boolean; free: boolean; reserved: boolean }>(
      null,
      `select public.username_available('maya') as taken, public.username_available('someone') as free, public.username_available('dashboard') as reserved`
    )
    expect(row).toEqual({ taken: false, free: true, reserved: false })
  })
})
