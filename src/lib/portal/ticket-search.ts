export const ticketSearchDefaults = {
  q: "",
  status: "unresolved",
  org: "",
  category: "",
  assignee: "",
  view: "",
};

export function ticketSearch(partial: Partial<typeof ticketSearchDefaults> = {}) {
  return { ...ticketSearchDefaults, ...partial };
}
