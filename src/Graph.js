import React, { useState, useEffect, useRef } from "react";

import ForceGraph2D from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import { Button, Grid } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Drawer from "@mui/material/Drawer";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Switch from "@mui/material/Switch";

export default function Graph(props) {
  const fgRef = useRef(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [checkedDocuments, setCheckedDocuments] = useState({});
  const [parentNds, setParentNodes] = useState([]);
  const [nodeLabels, setNodeLabels] = useState(true);

  const [url, setUrl] = useState(
    window.sessionStorage.getItem("url") || process.env.REACT_APP_URL
  );
  const [db, setDB] = useState(
    window.sessionStorage.getItem("db") || process.env.REACT_APP_DB
  );

  useEffect(() => {
    let checkedDocuments = {};
    if (!props.data) return;
    Object.keys(props.data.schema).forEach((key) => {
      checkedDocuments[key] = true;
    });
    setCheckedDocuments(checkedDocuments);
  }, [props.data]);

  const getParentNodes = (parentNodes) => {
    let nodes = [];
    for (let j = 0; j < parentNodes.length; j++) {
      const parentNode = parentNodes[j];
      nodes.push(parentNode);
      let newParentNodes = nodes.concat(
        ...getParentNodes(parentNode.neighbors)
      );
      nodes = [...newParentNodes];
    }
    return nodes;
  };
  const toggleNode = (params) => {
    if (params.documentType) {
      for (let i = 0; i < props.data.nodes.length; i++) {
        if (props.data.nodes[i].type === params.documentType) {
          if (checkedDocuments[params.documentType] === false) {
            props.data.nodes[i].nodeVisibility = params.visible;
          } else {
            props.data.nodes[i].nodeVisibility = params.visible;
          }
        }
      }
    } else if (params.searchText) {
      for (let i = 0; i < props.data.nodes.length; i++) {
        Object.keys(props.data.nodes[i]._doc).forEach((key) => {
          if (
            typeof props.data.nodes[i]._doc[key] === "string" &&
            props.data.nodes[i]._doc[key].includes(params.searchText)
          ) {
            props.data.nodes[i].nodeVisibility = params.visible;
          }
        });
      }
    } else {
      for (let i = 0; i < props.data.nodes.length; i++) {
        props.data.nodes[i].nodeVisibility = params.visible;
      }
    }
  };

  const toggleNeighbors = (params) => {
    if (params.node) {
      for (let i = 0; i < params.node.neighbors.length; i++) {
        params.node.neighbors[i].nodeVisibility =
          !params.node.neighbors[i].nodeVisibility;
      }
    }
  };
  const handleFilterDialogClose = () => {
    props.setOpenFilterDialog(false);
  };

  return (
    <Grid container sx={{ width: "100%", position: "relative" }}>
      {/*
      <Grid item xs={12}>
        <Button
          onClick={() => {
            toggleNode({ searchText: props.searchText, visible: true });
          }}
        >
          Show
        </Button>
        <Button
          onClick={() => {
            toggleNode({ searchText: props.searchText, visible: false });
          }}
        >
          Hide
        </Button>
        <Button
          onClick={() => {
            toggleNode({ visible: true });
          }}
        >
          Show All
        </Button>
        <Button
          onClick={() => {
            toggleNode({ visible: false });
          }}
        >
          Hide All
        </Button>
      </Grid>
        */}
      <Grid item xs={12}>
        <Dialog open={props.filterDialogOpen} onClose={handleFilterDialogClose}>
          <DialogTitle>Display Settings</DialogTitle>
          <DialogContent>
            <Grid container>
              <Grid item xs="12">
                <FormGroup
                  aria-label="position"
                  sx={{ textAlign: "center" }}
                  row
                >
                  {checkedDocuments &&
                    Object.keys(checkedDocuments).map((key, index) => (
                      <FormControlLabel
                        value={key}
                        control={
                          <Checkbox
                            key={index}
                            checked={checkedDocuments[key]}
                            onChange={() => {
                              const newCheckboxValues = { ...checkedDocuments };
                              newCheckboxValues[key] = !newCheckboxValues[key];
                              console.log(newCheckboxValues);
                              setCheckedDocuments(newCheckboxValues);
                              toggleNode({
                                documentType: key,
                                visible: !checkedDocuments[key],
                              });
                            }}
                          />
                        }
                        label={key}
                        labelPlacement="top"
                      />
                    ))}
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFilterDialogClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Grid>
      <Grid item xs={8}>
        {props.threeDimension && (
          <ForceGraph3D
            ref={fgRef}
            graphData={props.data}
            onNodeClick={(node, event) => {
              if (event.ctrlKey) {
                console.log(node);
                selectedNodes.push(node);
                setOpenSnackbar(true);
                setSelectedNodes(selectedNodes);
                props.setSelectedNodeCount(selectedNodes.length);
                setParentNodes(getParentNodes(selectedNodes));
              } else if (event.shiftKey) {
                toggleNeighbors({ node: node });
              }
            }}
            nodeVisibility={(node) => {
              return node.nodeVisibility;
            }}
            nodeLabel={(node) => {
              return node.name;
            }}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            onNodeDragEnd={(node) => {
              node.fx = node.x;
              node.fy = node.y;
              node.fz = node.z;
            }}
          />
        )}
        {!props.threeDimension && (
          <ForceGraph2D
            ref={fgRef}
            graphData={props.data}
            cooldownTicks={1000}
            warmupTicks={100}
            onNodeClick={(node, event) => {
              if (event.ctrlKey) {
                selectedNodes.push(node);
                setOpenSnackbar(true);
                setSelectedNodes(selectedNodes);
                props.setSelectedNodeCount(selectedNodes.length);
                setParentNodes(getParentNodes(selectedNodes));
              } else if (event.shiftKey) {
                toggleNeighbors({ node: node });
              }
            }}
            forceEngine="ngraph"
            nodeVisibility={(node) => {
              return node.nodeVisibility;
            }}
            nodeLabel={(node) => {
              return node.name;
            }}
            onNodeDragEnd={(node) => {
              node.fx = node.x;
              node.fy = node.y;
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              if (!nodeLabels) return;
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(
                (n) => n + fontSize * 0.2
              ); // some padding

              ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                ...bckgDimensions
              );

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = node.color;
              ctx.fillText(label, node.x, node.y);

              node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
            }}
          />
        )}
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: "20%",
        }}
      >
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => {
            setOpenSnackbar(false);
          }}
        >
          <Alert severity="success">Added document to clipboard</Alert>
        </Snackbar>
        <Drawer
          anchor="right"
          open={props.drawerOpen}
          onClose={() => props.setDrawerOpen(false)}
        >
          <Grid container>
            <Grid item xs={12}>
              {selectedNodes && (
                <TableContainer>
                  <Table>
                    <TableBody>
                      {selectedNodes.map((node, key) => (
                        <TableRow
                          key={node.id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Button
                              variant="contained"
                              onClick={() => {
                                console.log("removing", node);
                                const nodeCount = selectedNodes.length;
                                const newSelectedNodes = selectedNodes.filter(
                                  (n) => n.id !== node.id
                                );
                                setSelectedNodes(newSelectedNodes);
                                props.setSelectedNodeCount(nodeCount - 1);
                                setParentNodes(
                                  getParentNodes(newSelectedNodes)
                                );
                              }}
                            >
                              X
                            </Button>
                          </TableCell>
                          <TableCell align="right">{node.type}</TableCell>
                          <TableCell align="right">
                            <a
                              href={node.url}
                              rel="noreferrer"
                              target={"_blank"}
                            >
                              {node.name}
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
            <Grid item xs={12}>
              {parentNds && (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell align="right">Type</TableCell>
                          <TableCell align="right">Document</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parentNds.map((item, key) => (
                          <TableRow key={`${key}`}>
                            <TableCell></TableCell>
                            <TableCell align="right">{item.type}</TableCell>
                            <TableCell align="right">{item.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Grid>
          </Grid>
        </Drawer>
      </Grid>
    </Grid>
  );
}
