import scid from "../scid.js";
import fetch from "node-fetch-commonjs";

var callCount = 0;
const dstport = 4;

const transfersData = JSON.stringify({
    "jsonrpc": "2.0",
    "id": "1",
    "method": "GetTransfers",
    "params": {
        "out": false,
        "in": true
    }
});

const getTransfers = async () => {
    fetch("http://localhost:30000/json_rpc", {
        method: "POST",
        body: transfersData,
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(json => {
        if (!json.result.entries) {
            return;
        };

        const entries = json.result.entries.filter((entry) => {
            return entry.dstport === dstport;
        });

        if (entries && entries.length > callCount) {
            const lastEntry = entries[entries.length - 1];
            callContract(lastEntry.amount);
            callCount += 1;
            console.log("Callcount: ", callCount);
        }
    })
}

const callContract = async (amount) => {
    const contractCallData = JSON.stringify({
        "jsonrpc": "2.0",
        "id": "1",
        "method": "scinvoke",
        "params": {
            "scid": scid,
            "ringsize": 2,
            "sc_rpc": [
                {
                    "name": "entrypoint",
                    "datatype": "S",
                    "value": "AddMessage"
                },
                {
                    "name": "message",
                    "datatype": "S",
                    "value": "Someone sent " + amount / 100000 + " DERO"
                }
            ]
        }
    });

    fetch("http://localhost:30000/json_rpc", {
        method: "POST",
        body: contractCallData,
        headers: {"Content-Type": "application/json"}
    });
}

setInterval(
    getTransfers,
    2000
);
