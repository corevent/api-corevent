export function getOffset(currentPage: number, itemsPerPage: number): number {
  return (currentPage - 1) * itemsPerPage
}
