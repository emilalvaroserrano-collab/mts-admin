//#region node_modules/.nitro/vite/services/ssr/assets/ticket-search-CEf18BGL.js
var ticketSearchDefaults = {
	q: "",
	status: "unresolved",
	org: "",
	category: "",
	assignee: "",
	view: ""
};
function ticketSearch(partial = {}) {
	return {
		...ticketSearchDefaults,
		...partial
	};
}
//#endregion
export { ticketSearch as t };
