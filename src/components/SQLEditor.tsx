import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
} from "@mui/material";

const SQLEditor: React.FC = () => {
  const [query, setQuery] = useState<string>("SELECT * FROM system.tables;");
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const executeQuery = async () => {
    const queries = query.split(";").filter((q) => q.trim());

    try {
      let combinedResults: any[] = [];

      for (const singleQuery of queries) {
        const response = await axios.post("http://localhost:8080/query", {
          query: singleQuery,
        });
        combinedResults = [...combinedResults, ...response.data.rows];
      }

      setResult(combinedResults);
      setError(null);
    } catch (err: any) {
      console.log("error", error);
      setError(err.response?.data?.error || "An error occurred");
      setResult([]);
    }
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>SQL Editor</h2>
      <Editor
        height="400px"
        language="sql"
        value={query}
        onChange={(value) => setQuery(value || "")}
        theme="vs-dark"
      />

      <button
        onClick={executeQuery}
        style={{ marginTop: "10px", padding: "10px 20px" }}
      >
        Run Query
      </button>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      <div style={{ marginTop: "20px" }}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {result.length > 0 ? (
                    Object.keys(result[0]).map((col, index) => (
                      <TableCell key={index}>{col}</TableCell>
                    ))
                  ) : (
                    <TableCell>No data available</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {result.length > 0 ? (
                  result
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((val, colIndex) => (
                          <TableCell key={colIndex}>{String(val)}</TableCell>
                        ))}
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={Object.keys(result[0] || {}).length}>
                      <Typography align="center" color="textSecondary">
                        No results for the query.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {result.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={result.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Paper>
      </div>
    </div>
  );
};

export default SQLEditor;
