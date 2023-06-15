import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import GraphData from "./Data";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { styled } from "@mui/material";
import Graph from "./Graph";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import SearchIcon from "@mui/icons-material/Search";
import Toolbar from "@mui/material/Toolbar";
import { IconButton } from "@mui/material";
import { Badge } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import SettingsIcon from "@mui/icons-material/Settings";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TuneIcon from "@mui/icons-material/Tune";

function App() {
  const [threeDimension, setThreeDimension] = useState(false);

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
  const [searchText, setSearchText] = useState("");
  const [selectedNodeCount, setSelectedNodeCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openConnectDialog, setOpenConnectDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const getData = () => {
    if (loading) return;
    setLoading(true);
    GraphData({
      url: url,
      organization: org,
      token: token || process.env.REACT_APP_TERMINUSDB_ACCESS_TOKEN,
      db: db,
      searchText: searchText,
    }).then((graphData) => {
      setData(graphData);
      console.log(graphData);
      console.log("Graph data keys:", Object.keys(graphData));
      console.log("Number of nodes:", graphData.nodes.length);
      console.log("Number of edges:", graphData.links.length);
      window.sessionStorage.setItem("db", db);
      window.sessionStorage.setItem("token", token);
      window.sessionStorage.setItem("org", org);
      window.sessionStorage.setItem("url", url);
      setLoading(false);
    });
  };

  const handleConnectDialogClose = () => {
    setOpenConnectDialog(false);
  };
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          {/*
          <input
            sx={{ width: "100%" }}
            width={"100%"}
            type="text"
            value={searchText}
            placeholder="Search"
            onChange={(e) => {
              console.log(e);
              setSearchText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("searching for", searchText);
                getData();
              }
            }}
          />
          <IconButton
            onClick={() => {
              setDrawerOpen(!drawerOpen);
            }}
          >
            <Badge badgeContent={selectedNodeCount} color="secondary">
              <ArticleIcon style={{ color: "white" }} />
            </Badge>
          </IconButton>
          */}
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              getData();
            }}
          >
            Load Documents
          </Button>
          <IconButton
            onClick={() => {
              setDrawerOpen(!drawerOpen);
            }}
          >
            <Badge badgeContent={selectedNodeCount} color="secondary">
              <ArticleIcon style={{ color: "white" }} />
            </Badge>
          </IconButton>
          <IconButton
            onClick={() => {
              setOpenConnectDialog(true);
            }}
          >
            <SettingsIcon style={{ color: "white" }} />
          </IconButton>

          <IconButton
            onClick={() => {
              setOpenFilterDialog(true);
            }}
          >
            <TuneIcon style={{ color: "white" }} />
          </IconButton>
          <div>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={threeDimension}
                    onChange={() => {
                      setThreeDimension(!threeDimension);
                    }}
                  />
                }
                label="3D"
              />
            </FormGroup>
          </div>
        </Toolbar>
      </AppBar>
      <Grid container style={{ width: "100%" }}>
        <Grid item xs={12}>
          <Dialog open={openConnectDialog} onClose={handleConnectDialogClose}>
            <DialogTitle>Connection</DialogTitle>
            <DialogContent>
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={12}>
                  <TextField
                    id="outlined-basic"
                    label="url"
                    value={url}
                    fullWidth
                    variant="standard"
                    onChange={(e) => {
                      setUrl(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="outlined-basic"
                    label="org"
                    value={org}
                    fullWidth
                    variant="standard"
                    onChange={(e) => {
                      setOrg(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="outlined-basic"
                    label="token"
                    fullWidth
                    variant="standard"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="outlined-basic"
                    label="db"
                    variant="standard"
                    fullWidth
                    value={db}
                    onChange={(e) => {
                      setDB(e.target.value);
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleConnectDialogClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </Grid>

        <Grid item xs={12}>
          {loading && <LinearProgress />}
        </Grid>

        {data && (
          <Grid item xs={12}>
            <Graph
              data={data}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              setSelectedNodeCount={setSelectedNodeCount}
              threeDimension={threeDimension}
              searchText={searchText}
              filterDialogOpen={openFilterDialog}
              setOpenFilterDialog={setOpenFilterDialog}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default App;
