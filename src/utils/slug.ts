// Biến tên tiếng Việt thành đường dẫn không dấu: "Màng co PE" -> "mang-co-pe"
export function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // mọi ký tự lạ thành dấu gạch ngang
    .replace(/^-+|-+$/g, ""); // bỏ gạch ngang thừa ở hai đầu
}

// Nếu trùng slug đã có thì thêm -2, -3... cho khỏi đụng nhau
export function uniqueSlug(base: string, takenSlugs: string[]): string {
  const root = base || "san-pham";
  let candidate = root;
  let n = 2;
  while (takenSlugs.includes(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}