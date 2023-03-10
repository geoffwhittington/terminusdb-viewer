import { useEffect, useRef, useState } from "react";
import G6 from "@antv/g6";

const TerminusDBClient = require("@terminusdb/terminusdb-client");

let graph = null;

const Graph = () => {
  const [data, setData] = useState({
    nodes: [],
    edges: [],
  });
  const team = "geoff.whittington+term1|82c3";
  const client = new TerminusDBClient.WOQLClient(
    `https://cloud.terminusdb.com/${team}/`,
    {
      user: "geoff.whittington+term1@gmail.com",
      organization: team,
    }
  );

  const loadData = () => {
    // TODO: change the team name

    //set the key as an environment variable.
    client.setApiKey(process.env.REACT_APP_TERMINUSDB_ACCESS_TOKEN);

    client.db("star_wars");
  };

  const test = async () => {
    const TerminusClient = require("@terminusdb/terminusdb-client");

    console.log(process.env.REACT_APP_TERMINUSDB_ACCESS_TOKEN);
    //Assign your key to environment variable TERMINUSDB_ACCESS_TOKEN
    const client = new TerminusClient.WOQLClient(
      "https://cloud.terminusdb.com/geoff.whittington+term1|82c3/",
      {
        user: "geoff.whittington+term1@gmail.com",
        organization: "geoff.whittington+term1|82c3",
        token: process.env.REACT_APP_TERMINUSDB_ACCESS_TOKEN,
      }
    );
    client.db("star_wars");

    const schema = await client.getSchema();

    const documents = await client.getDocument({ as_list: "true" });
    await populateDocuments(schema, documents);
  };

  const getSchemaType = (schema, documentClass) => {
    schema.forEach((schemaEntry, i) => {
      if (schemaEntry["@id"] == documentClass) return schemaEntry;
    });
    return null;
  };
  const populateDocuments = async (schema, documents) => {
    console.log(schema);

    // Set the schema
    let dataProductSchema = {};

    schema.forEach((schemaEntry, i) => {
      if (schemaEntry["@type"] == "Class") {
        dataProductSchema[schemaEntry["@id"]] = schemaEntry;
      }
    });

    let nodes = [];
    let edges = [];
    documents.forEach((document, i) => {
      console.log(document);
      nodes.push({
        id: document["@id"],
        label: document.label,
      });
    });
    documents.forEach((document, i) => {
      if (document["@type"] in dataProductSchema) {
        let docType = dataProductSchema[document["@type"]];

        for (const [documentKey, documentValue] of Object.entries(document)) {
          if (
            documentKey in docType &&
            docType[documentKey]["@class"] in dataProductSchema
          ) {
            if (Array.isArray(document[documentKey])) {
              document[documentKey].forEach((elt, eltIndex) => {
                edges.push({
                  source: document["@id"],
                  target: elt,
                });
              });
            } else {
              edges.push({
                source: document["@id"],
                target: document[documentKey],
              });
            }
          }
        }
      }
    });
    setData({
      nodes: nodes,
      edges: edges,
    });
  };

  const ref = useRef(null);

  useEffect(() => {
    /*
    loadData();*/
    const fetchData = async () => {
      await test();
    };

    fetchData();

    if (!graph) {
      graph = new G6.Graph({
        layout: "comboForce",
        container: ref.current,
        width: "1000",
        height: "1000",
        modes: {
          default: ["drag-canvas", "zoom-canvas", "drag-node"],
        },
        nodeStateStyles: {
          // The node style when the state 'hover' is true
          hover: {
            fill: "lightsteelblue",
          },
          // The node style when the state 'click' is true
          click: {
            stroke: "#000",
            lineWidth: 3,
          },
        },
      });
    }

    graph.on("node:mouseenter", (e) => {
      const nodeItem = e.item; // Get the target item
      graph.setItemState(nodeItem, "hover", true); // Set the state 'hover' of the item to be true
    });

    graph.on("node:mouseleave", (e) => {
      const nodeItem = e.item; // Get the target item
      graph.setItemState(nodeItem, "hover", false); // Set the state 'hover' of the item to be false
    });

    // Click a node
    graph.on("node:click", (e) => {
      // Swich the 'click' state of the node to be false
      const clickNodes = graph.findAllByState("node", "click");
      clickNodes.forEach((cn) => {
        graph.setItemState(cn, "click", false);
      });
      const nodeItem = e.item; // et the clicked item
      graph.setItemState(nodeItem, "click", true); // Set the state 'click' of the item to be true
    });
    graph.data(data);
    graph.render();

    return () => {
      graph.changeData(data);
    };
  }, [data]);

  const handleClick = async () => {
    await test();
  };
  return (
    <>
      <button onClick={handleClick}>changeData</button>
      <div ref={ref}></div>
    </>
  );
};

export default Graph;
