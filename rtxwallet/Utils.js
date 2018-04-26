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
