export const timeout = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isHex = function(str) {
  var a = parseInt(str, 16);
  return a.toString(16) === str.toLowerCase();
};

// Graph object operation
// Graph is considered to have the following format:
// {
//   "nodes": [
//     {
//       "last_update": 0,
//       "pub_key": "string",
//       "alias": "string",
//       "addresses": [
//         {
//           "network": "string", = tcp
//           "addr": "string" = ip:port
//         }
//       ],
//       "color": "string"
//     }
//   ],
//   "edges": [
//     {
//       "channel_id": "string",
//       "chan_point": "string",
//       "last_update": 0,
//       "node1_pub": "string",
//       "node2_pub": "string",
//       "capacity": "string",
//       "node1_policy": {
//         "time_lock_delta": 0,
//         "min_htlc": "string",
//         "fee_base_msat": "string",
//         "fee_rate_milli_msat": "string"
//       },
//       "node2_policy": {
//         "time_lock_delta": 0,
//         "min_htlc": "string",
//         "fee_base_msat": "string",
//         "fee_rate_milli_msat": "string"
//       }
//     }
//   ]
// }

export const orderNodesByLastUpdate = function(graph) {
  if (!graph || !graph.nodes) return;
  graph.nodes.sort((a, b) => {
    if (b.last_update == undefined) {
      return -1;
    } else if (a.last_update == undefined) {
      return 1;
    }
    return parseInt(b.last_update) - parseInt(a.last_update);
  });
};

export const orderNodesByRtxScore = function(graph) {
  generateScoresForNodes_(graph);
  if (!graph || !graph.nodes) return;
  graph.nodes.sort((a, b) => {
    if (b.rtx_score == undefined) {
      return -1;
    } else if (a.rtx_score == undefined) {
      return 1;
    }
    return b.rtx_score - a.rtx_score;
  });
};

// Rtx score is how likely that node is to behave good
// if we make a channel to it.
const generateScoresForNodes_ = function(graph) {
  if (!graph || !graph.nodes || graph.nodes.length == 0) {
    return;
  }
  let least_updated = graph.nodes[0].last_update;
  let most_updated = graph.nodes[0].last_update;
  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];
    if (node.last_update < least_updated) {
      least_updated = node.last_update;
    } else if (node.last_update > most_updated) {
      most_updated = node.last_update;
    }
  }

  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];

    // TODO: this is a relatively stupid scoring, do better.
    let freshness = 0;
    if (node.last_update && most_updated != least_updated) {
      freshness =
        (node.last_update - least_updated) / (most_updated - least_updated);
    }

    let channel = 0;
    if (node.in_count && node.in_count > 20) {
      channel += 0.4;
    } else if (node.in_count && node.in_count > 10) {
      channel += 0.2;
    } else {
      channel -= 0.2;
    }

    if (node.out_count && node.out_count > 20) {
      channel += 0.4;
    } else if (node.out_count && node.out_count > 10) {
      channel += 0.2;
    } else {
      // if there is limited out channels, that node could have problem routing our payments
      channel -= 0.9;
    }

    node.rtx_score = freshness + 1.3 * channel;
  }
};

// This function adds an extra field to nodes object with
// in_count and out_count fields which describes number of
// incoming and outgoing channels.
// It also adds in_capacity which is a sum of all the capacity
// for incoming channels.
export const updateNodesInAndOutCounts = function(graph) {
  if (!graph || !graph.nodes || !graph.edges) return;

  pubkey_to_in_count = {};
  pubkey_to_out_count = {};
  pubkey_to_in_capacity = {};

  // Process the edges
  for (let i = 0; i < graph.edges.length; i++) {
    const e = graph.edges[i];
    const out_pubkey = e.node1_pub;
    const in_pubkey = e.node2_pub;
    if (out_pubkey in pubkey_to_out_count) {
      pubkey_to_out_count[out_pubkey] += 1;
    } else {
      pubkey_to_out_count[out_pubkey] = 1;
    }

    if (in_pubkey in pubkey_to_in_count) {
      pubkey_to_in_count[in_pubkey] += 1;
    } else {
      pubkey_to_in_count[in_pubkey] = 1;
    }

    if (in_pubkey in pubkey_to_in_capacity) {
      pubkey_to_in_capacity[in_pubkey] += parseInt(e.capacity);
    } else {
      pubkey_to_in_capacity[in_pubkey] = parseInt(e.capacity);
    }
  }

  // Copy the counts back to original node object
  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];
    const pubkey = node.pub_key;
    if (pubkey in pubkey_to_in_count) {
      node.in_count = pubkey_to_in_count[pubkey];
    } else {
      node.in_count = 0;
    }

    if (pubkey in pubkey_to_out_count) {
      node.out_count = pubkey_to_out_count[pubkey];
    } else {
      node.out_count = 0;
    }

    if (pubkey in pubkey_to_in_capacity) {
      node.in_capacity = pubkey_to_in_capacity[pubkey];
    } else {
      node.in_capacity = 0;
    }
  }
};

// nodes is an array of node pubkeys to look for.
// result will be {nodeInfo: {...}, found_nodes:[], missing_nodes:[]}
export const findNodesInGraph = function(graph, nodes) {
  let result = { nodeInfo: {}, found_nodes: [], missing_nodes: [] };

  let looking_for = {};
  for (let i = 0; i < nodes.length; i++) {
    looking_for[nodes[i]] = true;
  }

  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];
    if (looking_for[node.pub_key]) {
      result.nodeInfo[node.pub_key] = node;
      result.found_nodes.push(node.pub_key);
      looking_for[node.pub_key] = false;
    }
  }

  for (const [key, value] of Object.entries(looking_for)) {
    if (value) {
      result.missing_nodes.push(key);
    }
  }

  return result;
};

export const sortPaymentsByCreationDateDescending = payments => {
  if (!payments) return;
  payments.sort((a, b) => {
    if (b.creation_date == undefined) {
      return -1;
    } else if (a.creation_date == undefined) {
      return 1;
    }
    return parseInt(b.creation_date) - parseInt(a.creation_date);
  });
};

export const sortBySettleDateDescending = payments => {
  if (!payments) return;
  payments.sort((a, b) => {
    if (b.settle_date == undefined) {
      return -1;
    } else if (a.settle_date == undefined) {
      return 1;
    }
    return parseInt(b.settle_date) - parseInt(a.settle_date);
  });
};

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
