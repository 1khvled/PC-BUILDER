export function normalize(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/12\s?go/g, "12gb")
    .replace(/8\s?go/g, "8gb")
    .replace(/16\s?go/g, "16gb")
    .replace(/32\s?go/g, "32gb")
    .replace(/rtx\s?3060/g, "rtx3060")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
