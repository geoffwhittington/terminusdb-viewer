import { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import GraphData from "./Data";
import TextField from "@mui/material/TextField";
import ForceGraph3D from "react-force-graph-3d";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

function App() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState(
    window.sessionStorage.getItem("url") || process.env.REACT_APP_URL
  );
  const [org, setOrg] = useState(
    window.sessionStorage.getItem("org") || process.env.REACT_APP_ORG
  );
  const [token, setToken] = useState(window.sessionStorage.getItem("token"));
  const [db, setDB] = useState(
    window.sessionStorage.getItem("db") || process.env.REACT_APP_DB
  );

  const [loading, setLoading] = useState(false);

  const getData = () => {
    if (loading) return;
    setLoading(true);
    GraphData({
      url: url,
      organization: org,
      token: token || process.env.REACT_APP_TERMINUSDB_ACCESS_TOKEN,
      db: db,
    }).then((graphData) => {
      setData(graphData);
      console.log("Graph data keys:", Object.keys(graphData));
      console.log("Number of nodes:", graphData.nodes.length);
      console.log("Number of edges:", graphData.links.length);
      window.sessionStorage.setItem("db", db);
      window.sessionStorage.setItem("token", token);
      window.sessionStorage.setItem("org", org);
      window.sessionStorage.setItem("url", url);
    });
  };

  return (
    <div className="App">
      <Grid container>
        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="url"
                value={url}
                variant="standard"
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="org"
                value={org}
                variant="standard"
                onChange={(e) => {
                  setOrg(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="token"
                variant="standard"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="db"
                variant="standard"
                value={db}
                onChange={(e) => {
                  setDB(e.target.value);
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  getData();
                }}
              >
                Draw
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {data && (
          <Grid item xs={12}>
            {Object.keys(data.schema).map((key, index) => (
              <span
                style={{
                  paddingRight: "10px",
                  color: data.schema[key].color.hex(),
                }}
              >
                {key}
              </span>
            ))}
          </Grid>
        )}
        <Grid item xs={12}>
          {data && (
            <ForceGraph3D
              graphData={data}
              cooldownTicks={1000}
              warmupTicks={100}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
