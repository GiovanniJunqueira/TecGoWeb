export function getInitials(name: string | undefined): string {
  if (!name) return "";

  const nameParts = name?.split(" ");

  if (nameParts.length > 1) {
    return `${nameParts?.[0]?.[0]}${nameParts?.[1]?.[0]}`?.toUpperCase();
  } else {
    return name.substring(0, 2).toUpperCase();
  }
}
