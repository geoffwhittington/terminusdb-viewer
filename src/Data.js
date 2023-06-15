import distinctColors from "distinct-colors";

function getDocumentUrl(orgName, dbName, type, fullId) {
  let fullIdEncode = btoa(fullId);
  return `https://dashboard.terminusdb.com/${orgName}/${dbName}/documents/${type}/${fullIdEncode}`;
}

const GraphData = async (params) => {
  const TerminusClient = require("@terminusdb/terminusdb-client");
  //Assign your key to environment variable TERMINUSDB_ACCESS_TOKEN
  const client = new TerminusClient.WOQLClient(params.url, {
    organization: params.organization,
    token: params.token,
  });

  const Apollo = require("@apollo/client");
  const { ApolloClient, InMemoryCache, concat, gql, HttpLink, ApolloLink } =
    Apollo;

  const myBranch = "main";

  const terminusdbURL = `https://cloud.terminusdb.com/${params.organization}/api/graphql/${params.organization}/${params.db}/local/branch/${myBranch}/`;

  const httpLink = new HttpLink({ uri: terminusdbURL });
  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Token ${params.token}`,
      },
    }));
    return forward(operation);
  });

  const cache = new InMemoryCache({
    addTypename: false,
  });

  const value = concat(authMiddleware, httpLink);

  /*
  const apolloClient = new ApolloClient({
    cache: cache,
    link: value,
  });

  // Query your database
  
  apolloClient
    .query({
      query: gql`
        query {
          Countermeasure {
            name
          }
        }
      `,
    })
    .then((result) => console.log(result.data))
    .catch((err) => console.log(err.message));
    */
  client.db(params.db);

  debugger;
  const schema = await client.getSchema();

  const documents = await client.getDocument({ as_list: "true" });

  // Set the schema
  let dataProductSchema = {};

  var palette = distinctColors({ count: schema.length });
  //sort the schema by @type
  schema.sort((a, b) => {
    return a["@type"] > b["@type"] ? 1 : -1;
  });
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
      const [type, documentId] = document["@id"].split("/");

      nodes.push({
        id: document["@id"],
        name: `${document.name}`,
        type: document["@type"],
        _doc: document,
        nodeVisibility: true,
        neighbors: [],
        color: dataProductSchema[document["@type"]].color.hex(),
        url: getDocumentUrl(
          params.organization,
          params.db,
          document["@type"],
          `terminusdb:///data/${type}/${documentId}`
        ),
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
                label: documentKey,
              });
            });
          } else {
            edges.push({
              source: document["@id"],
              target: document[documentKey],
              label: documentKey,
            });
          }
        }
      }
    }
  });

  const getNode = (id) => {
    return nodes.find((node) => node.id === id);
  };
  edges.forEach((link) => {
    const a = getNode(link.source);
    const b = getNode(link.target);
    a.neighbors.push(b);
  });
  return {
    schema: dataProductSchema,
    nodes: nodes,
    links: edges,
  };
};

export default GraphData;
