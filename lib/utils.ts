export function sanitize(input: string): string {
  if (!input) return "";
  return input.replace(/<[^>]*>?/gm, "").trim();
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function isVagueNiche(niche: string): boolean {
  const vagueTerms = ["lifestyle", "business", "stuff", "things", "marketing", "content"];
  const sanitized = niche.toLowerCase().trim();
  
  if (sanitized.length < 5) return true;
  if (vagueTerms.includes(sanitized)) return true;
  
  return false;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
