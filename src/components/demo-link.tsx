/**
 * A link to /demo. It must be a plain <a>, never next/link: /demo signs the visitor in to the demo account,
 * and Link prefetches its target as soon as it scrolls into view, which signed people in without a click.
 * (The route also ignores prefetch requests, as a second guard.)
 */
export function DemoLink(props: Omit<React.ComponentProps<"a">, "href">) {
  // eslint-disable-next-line @next/next/no-html-link-for-pages -- /demo is a route handler, see above
  return <a href="/demo" {...props} />
}
