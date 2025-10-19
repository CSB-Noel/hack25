# Supabase Integration Guide

This project includes small helpers to use Supabase in both browser and server environments.

## Install

Run in the `my-app` folder:

```bash
npm install @supabase/supabase-js
```

## Environment

Copy `.env.local.example` to `.env.local` and fill in values:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Client

Use `lib/supabase-client.ts` in browser code:

```ts
import { supabase } from '@/lib/supabase-client'

const { data, error } = await supabase.from('notes').select('*')
```

## Server

Use `lib/supabase-server.ts` for server operations (service-role):

```ts
import { createSupabaseServerClient } from '@/lib/supabase-server'

const supabaseAdmin = createSupabaseServerClient()
const { data, error } = await supabaseAdmin.from('private_table').select('*')
```

To perform RLS-secured requests on behalf of the caller, pass the bearer token from the request:

```ts
import { createSupabaseServerClientFromRequest } from '@/lib/supabase-server'

export async function handler(req) {
  const supabaseClient = createSupabaseServerClientFromRequest(req)
  const { data } = await supabaseClient.from('notes').select('*')
}
```

## Notes

- Service role key has full privileges; keep it out of client bundles.
- For edge runtime, use the anon key and RLS with JWTs.
