# Terminusdb-viewer

A simple viewer for [TerminusDB](https://terminusdb.com)

## Configuration

You'll need:

* API Token
* Team name
* TerminusDB URL
* Target DB (slug)

### Setup Environment

Copy `.env.sample` to `.env`

Populate the values. For example,

```
REACT_APP_TERMINUSDB_ACCESS_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_URL=https://cloud.terminusdb.com/TEAM/
REACT_APP_ORG=TEAM
REACT_APP_DB=star_wars
```

### Run the app

```
yarn start
```

Go to http://localhost:3000 and click **Draw**
