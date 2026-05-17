import { buildSnapshot, resetState } from "../server/store/state.js";

const snapshot = buildSnapshot(resetState());

console.log(JSON.stringify({
  ok: true,
  customers: snapshot.customers.length,
  conversations: snapshot.conversations.length,
  tasks: snapshot.tasks.length,
  opportunities: snapshot.opportunities.length
}, null, 2));
