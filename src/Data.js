import distinctColors from "distinct-colors";

const GraphData = async (params) => {
  const TerminusClient = require("@terminusdb/terminusdb-client");

  //Assign your key to environment variable TERMINUSDB_ACCESS_TOKEN
  const client = new TerminusClient.WOQLClient(params.url, {
    organization: params.organization,
    token: params.token,
  });
  client.db(params.db);

  const schema = await client.getSchema();

  const documents = await client.getDocument({ as_list: "true" });

  // Set the schema
  let dataProductSchema = {};

  var palette = distinctColors({ count: schema.length });

  schema.forEach((schemaEntry, i) => {
    if (schemaEntry["@type"] === "Class") {
      dataProductSchema[schemaEntry["@id"]] = {
        schema: schemaEntry,
        color: palette[i],
      };
    }
  });

  let nodes = [];
  let edges = [];
  documents.forEach((document, i) => {
    if (document["@type"] in dataProductSchema) {
      nodes.push({
        id: document["@id"],
        name: document.label,
        color: dataProductSchema[document["@type"]].color.hex(),
      });
    }
  });
  documents.forEach((document, i) => {
    if (document["@type"] in dataProductSchema) {
      let docType = dataProductSchema[document["@type"]].schema;

      for (const [documentKey] of Object.entries(document)) {
        if (
          documentKey in docType &&
          docType[documentKey]["@class"] in dataProductSchema
        ) {
          if (Array.isArray(document[documentKey])) {
            document[documentKey].forEach((elt, eltIndex) => {
              edges.push({
                source: document["@id"],
                target: elt,
                label: docType[documentKey]["@class"],
              });
            });
          } else {
            edges.push({
              source: document["@id"],
              target: document[documentKey],
              label: docType[documentKey]["@class"],
            });
          }
        }
      }
    }
  });
  return {
    schema: dataProductSchema,
    nodes: nodes,
    links: edges,
  };
};

export default GraphData;
