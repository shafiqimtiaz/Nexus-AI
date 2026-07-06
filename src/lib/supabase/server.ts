import "server-only";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MockSupabaseQueryBuilder } from "./mock-db";

export function createServerClient() {
  // If Supabase keys are not set, fall back to mock database immediately
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      from(table: string) {
        return new MockSupabaseQueryBuilder(table);
      }
    } as any;
  }

  return {
    from(table: string) {
      const calls: { prop: string | symbol; args: any[] }[] = [];
      
      const builderProxy = new Proxy({} as any, {
        get(target, prop, receiver) {
          // If the caller awaits the promise, resolve the client dynamically
          if (prop === "then") {
            return (resolve: any, reject: any) => {
              (async () => {
                try {
                  const cookieStore = await cookies();
                  // Check if there is an active Supabase session cookie
                  const hasSession = cookieStore.getAll().some(c => c.name.startsWith("sb-"));
                  
                  let client: any;
                  if (hasSession) {
                    client = createSupabaseServerClient(
                      process.env.NEXT_PUBLIC_SUPABASE_URL!,
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                      {
                        cookies: {
                          getAll() {
                            return cookieStore.getAll();
                          },
                          setAll(cookiesToSet) {
                            try {
                              cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                              );
                            } catch {}
                          }
                        }
                      }
                    ).from(table);
                  } else {
                    client = new MockSupabaseQueryBuilder(table);
                  }

                  // Replay all the chained method calls on the resolved client
                  let current = client;
                  for (const call of calls) {
                    current = current[call.prop](...call.args);
                  }
                  
                  const result = await current;
                  resolve(result);
                } catch (err) {
                  reject(err);
                }
              })();
            };
          }

          // Otherwise, collect the method call and return the proxy again for chaining
          return (...args: any[]) => {
            calls.push({ prop, args });
            return builderProxy;
          };
        }
      });

      return builderProxy;
    }
  } as any;
}
