import React, { useEffect, useState } from "react";
import { getCookie } from "../../getCookie";
import {
    Button,
    FormControl,
    Grid2,
    IconButton,
    InputLabel,
    List,
    ListItemButton,
    ListItemIcon,
    MenuItem,
    Paper,
    Snackbar,
    SnackbarContent,
    Typography,
    Box,
    Select,
    CircularProgress,
    Avatar,
    ListItemAvatar,
    Stack,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { ArrowBack, ArrowForward, ArrowLeft, ArrowRight } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import DoneOutline from '@mui/icons-material/DoneOutline';
import ErrorIcon from "@mui/icons-material/Error";

const AdminPanel = ({ setOccupiedAdmin }) => {
    const [selectedSubordinate, setSelectedSubordinate] = useState("");
    const [subordinates, setSubordinates] = useState([]);
    const [availableDatabases, setAvailableDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState("");
    const [availableTables, setAvailableTables] = useState([]);
    const [allowedTables, setAllowedTables] = useState([]);
    const [initialAvailableTables, setInitialAvailableTables] = useState([]);
    const [initialAllowedTables, setInitialAllowedTables] = useState([]);
    const [checked, setChecked] = useState([]);
    const [message, setMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState("");


    const intersection = (a, b) => a.filter((value) => b.includes(value));

    const leftChecked = intersection(checked, availableTables);
    const rightChecked = intersection(checked, allowedTables);
    const adminName = getCookie("userName");

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const not = (a, b) => a.filter((value) => !b.includes(value));

    const getSubordinates = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(
                `http://localhost:8080/api/userinfo/getsubordinates/${adminName}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            setSubordinates(data);
        } catch (error) {
            setErrorMessage("Failed to get subordinates!");
            setOpenErrorSnackbar(true);
            return [];
        }
    };

    const getDatabase = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(
                `http://localhost:8080/api/tableinfo/getAvailableDatabasesObject/${adminName}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            setAvailableDatabases(data);
        } catch (error) {
            setErrorMessage("Failed to get subordinates!");
            setOpenErrorSnackbar(true);
            return [];
        }
    };

    useEffect(() => {
        getSubordinates();
        getDatabase();
    }, []);

    const handleSelect = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(
                `http://localhost:8080/api/tableinfo/getAvailableTablesAndDatabases/${adminName}/${selectedSubordinate}/${selectedDatabase}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                setMessage("Failed to get subordinates!");
                setOpenSnackbar(true);
                return [];
            }
            const availableTables = await response.json();

            const response2 = await fetch(
                `http://localhost:8080/api/tableinfo/getAllowedTablesAndDatabases/${adminName}/${selectedSubordinate}/${selectedDatabase}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response2.ok) {
                setMessage("Failed to get subordinates!");
                setOpenSnackbar(true);
                return [];
            }

            const allowedTables = await response2.json();

            setAvailableTables(availableTables);
            setAllowedTables(allowedTables);
            setInitialAvailableTables(availableTables);
            setInitialAllowedTables(allowedTables);
        } catch (error) {
            setOpenErrorSnackbar(true);
            setErrorMessage("Failed to fetch data");
        }
    };

    useEffect(() => {
        if (selectedDatabase !== "" && selectedSubordinate !== "") {
            handleSelect().then(r => {});
        }
    }, [selectedSubordinate, selectedDatabase]);

    const handleAllRight = () => {
        setAllowedTables(allowedTables.concat(availableTables));
        setAvailableTables([]);
        setOccupiedAdmin(false);
    };

    const handleCheckedRight = () => {
        setAllowedTables(allowedTables.concat(leftChecked));
        setAvailableTables(not(availableTables, leftChecked));
        setChecked(not(checked, leftChecked));
        setOccupiedAdmin(false);
    };

    const handleCheckedLeft = () => {
        setAvailableTables(availableTables.concat(rightChecked));
        setAllowedTables(not(allowedTables, rightChecked));
        setChecked(not(checked, rightChecked));
        setOccupiedAdmin(false);
    };

    const handleAllLeft = () => {
        setAvailableTables(availableTables.concat(allowedTables));
        setAllowedTables([]);
        setOccupiedAdmin(false);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleCloseErrorSnackbar = () => {
        setOpenErrorSnackbar(false);
    };

    const DEBUG = async () => {
        setLoading(true);
        let toRemoveTables = availableTables.filter(item => !initialAllowedTables.includes(item));
        let toInsertTables = initialAllowedTables.filter(item => !availableTables.includes(item));

        toRemoveTables = availableTables.filter(item => !toRemoveTables.includes(item));
        toInsertTables = allowedTables.filter(item => !toInsertTables.includes(item));

        if (toRemoveTables.length === 0 && toInsertTables.length === 0) {
            setMessage('No changes!');
            setOpenSnackbar(true);
            setLoading(false);
            return;
        }

        try {
            await fetch(`http://localhost:8080/api/ownershipdetails/delete/${selectedSubordinate}/${adminName}/${selectedDatabase}?tableNames=${toRemoveTables.join('&tableNames=')} `, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`
                }
            });

            await fetch(`http://localhost:8080/api/ownershipdetails/add/${selectedSubordinate}/${adminName}/${selectedDatabase}?tableNames=${toInsertTables.join('&tableNames=')} `, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`
                }
            });

            setMessage('Ownership has been updated!');
            setOpenSnackbar(true);
            setOccupiedAdmin(true);
        } catch (error) {
            setErrorMessage('An error occurred when updating ownership!');
            setOpenErrorSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const customList = (tablesInfo, title) => (
        <Paper sx={{ width: 300, height: 360, overflow: 'auto' }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold', margin: '16px' }}>
                {title}
            </Typography>
            <List dense component="div" role="list">
                {tablesInfo.map((val) => {
                    const labelID = `list-${val}`;

                    return (
                        <ListItemButton
                            key={val}
                            onClick={handleToggle(val)}
                            role="listitem"
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.includes(val)}
                                    inputProps={{
                                        'aria-labelledby': labelID,
                                    }}
                                    tabIndex={-1}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemText id={labelID} primary={`Table: ${val}`} />
                        </ListItemButton>
                    );
                })}
            </List>
        </Paper>
    );

    return (
        <Paper sx={{ width: 'calc(80vw)', height: 'calc(86vh)', overflow: 'auto' }} elevation={3} style={{ padding: '10px', margin: '10px', borderRadius: '8px' }}>
            <Box sx={{ marginLeft: '20px' }}>
                <Typography variant="h6" gutterBottom>Select subordinate and tables</Typography>
                <Stack direction="row" spacing={2} sx={{ marginBottom: '16px' }}>
                    <FormControl variant="outlined" sx={{ width: '300px' }}>
                        <InputLabel id="select-subordinate-label">Select subordinate</InputLabel>
                        <Select
                            labelId="select-subordinate-label"
                            id="select-subordinate"
                            label="Select Subordinate"
                            value={selectedSubordinate}
                            onChange={(e) => setSelectedSubordinate(e.target.value)}
                        >
                            <MenuItem value=""><em>Select a subordinate</em></MenuItem>
                            {subordinates.map((subordinate) => (
                                <MenuItem key={subordinate.id} value={subordinate.username}>
                                    {subordinate.username}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" sx={{ width: '300px' }}>
                        <InputLabel id="select-database-label">Select a Database</InputLabel>
                        <Select
                            labelId="select-database-label"
                            id="select-database"
                            label="Select Table"
                            value={selectedDatabase}
                            onChange={(e) => setSelectedDatabase(e.target.value)}
                        >
                            <MenuItem value=""><em>Select a database</em></MenuItem>
                            {availableDatabases.map((database) => (
                                <MenuItem key={database.id} value={database.databaseName}>
                                    {database.databaseName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                {selectedDatabase && selectedSubordinate && (
                    <Box>
                        <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            Selected Subordinate: <span style={{ color: '#3f51b5' }}>{selectedSubordinate}</span>
                        </Typography>
                        <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '16px' }}>
                            Selected Database: <span style={{ color: '#3f51b5' }}>{selectedDatabase}</span>
                        </Typography>
                        <Button variant="contained" color="primary" onClick={DEBUG} disabled={loading} style={{ margin: '10px 0' }}>
                            {loading ? <CircularProgress size={24} /> : 'Commit Changes'}
                        </Button>
                        <Grid2 container spacing={2} justifyContent="center" alignItems="center">
                            <Grid2 item xs={5}>
                                {customList(availableTables, `Tables Unassigned to ${selectedSubordinate}`)}
                            </Grid2>
                            <Grid2 item xs={2}>
                                <Grid2 container direction="column" alignItems="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleAllRight}
                                        disabled={availableTables.length === 0}
                                        aria-label="move all right"
                                        style={{ margin: '5px 0' }}
                                    >
                                        <ArrowForward />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleCheckedRight}
                                        disabled={leftChecked.length === 0}
                                        aria-label="move selected right"
                                        style={{ margin: '5px 0' }}
                                    >
                                        <ArrowRight />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleCheckedLeft}
                                        disabled={rightChecked.length === 0}
                                        aria-label="move selected left"
                                        style={{ margin: '5px 0' }}
                                    >
                                        <ArrowLeft />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleAllLeft}
                                        disabled={allowedTables.length === 0}
                                        aria-label="move all left"
                                        style={{ margin: '5px 0' }}
                                    >
                                        <ArrowBack />
                                    </Button>
                                </Grid2>
                            </Grid2>
                            <Grid2 item xs={5}>
                                {customList(allowedTables, `Tables Assigned to ${selectedSubordinate}`)}
                            </Grid2>
                        </Grid2>
                    </Box>
                )}
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <SnackbarContent
                    style={{ backgroundColor: '#117311' }}
                    message={
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <DoneOutline style={{ marginRight: 8 }} />
                            {message}
                        </span>
                    }
                    action={[
                        <IconButton
                            key="close"
                            aria-label="close"
                            color="inherit"
                            onClick={handleCloseSnackbar}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            </Snackbar>

            <Snackbar
                open={openErrorSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseErrorSnackbar}
            >
                <SnackbarContent
                    style={{ backgroundColor: '#ff0000' }}
                    message={
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <ErrorIcon style={{ marginRight: 8 }} />
                            {errorMessage}
                        </span>
                    }
                    action={[
                        <IconButton
                            key="close"
                            aria-label="close"
                            color="inherit"
                            onClick={handleCloseErrorSnackbar}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            </Snackbar>
        </Paper>
    );
};

export default AdminPanel;
