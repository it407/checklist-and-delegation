//Tasks Update Page
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { CheckCircle2, Upload, X, Search, History, ArrowLeft } from "lucide-react"
import AdminLayout from "../../components/layout/AdminLayout"

// Configuration object - Move all configurations here
const CONFIG = {
    // Google Apps Script URL
    APPS_SCRIPT_URL:
        "https://script.google.com/a/macros/zofffoods.com/s/AKfycbwhk-Y25IZbYn9V3hfhf3c7WvJ0v9GIDuWDBpo-YCN3gumep3h5USTFw_86cHIZ2aUs/exec",

    // Google Drive folder ID for file uploads
    DRIVE_FOLDER_ID: "1tsHjLO0EC1TQ2Ry542eP46Ty_9m__0x0",

    // Sheet name to work with

    // Page configuration
    PAGE_CONFIG: {
        title: "Task Update",
        description: "Showing today, tomorrow's tasks and past due tasks",
        historyDescription: "Read-only view of completed tasks with submission history",
    },
}

function AccountDataPage() {
    const [accountData, setAccountData] = useState([])
    const [selectedItems, setSelectedItems] = useState(new Set())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [additionalData, setAdditionalData] = useState({})
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [remarksData, setRemarksData] = useState({})
    const [selectedTaskDescription, setSelectedTaskDescription] = useState("All Tasks");
    const [taskDescriptionList, setTaskDescriptionList] = useState([]);

    const [membersList, setMembersList] = useState([])

    // मौजूदा state variables के बाद (लगभग लाइन 41-42 के आसपास)
    const [selectedName, setSelectedName] = useState("All Names");

    const [userRole, setUserRole] = useState("")
    const [username, setUsername] = useState("")

    const [leaveInputs, setLeaveInputs] = useState({})
    const [showLeaveInput, setShowLeaveInput] = useState({})
    const [leaveSubmitting, setLeaveSubmitting] = useState({})


    const [editingTaskIds, setEditingTaskIds] = useState(new Set()); // Multiple edit के लिए
    const [editedTaskDescriptions, setEditedTaskDescriptions] = useState({});

    const [uniqueDepartmentsFromTable, setUniqueDepartmentsFromTable] = useState([]);


    // State for dropdowns
    const [dashboardType, setDashboardType] = useState("checklist")
    const [selectedMasterOption, setSelectedMasterOption] = useState("")
    const [masterSheetOptions, setMasterSheetOptions] = useState([])
    const [isFetchingMaster, setIsFetchingMaster] = useState(false)

    // Existing state variables के बाद जोड़ें:

    const [selectedRowsForDate, setSelectedRowsForDate] = useState(new Set());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);


    const [deleteMode, setDeleteMode] = useState(""); // "individual", "dateRange", or ""
    // Existing state variables के बाद जोड़ें:
    const [hasDateSelection, setHasDateSelection] = useState(false);

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTaskDescription, setEditedTaskDescription] = useState("");

    const [savingTaskId, setSavingTaskId] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const [selectedDepartment, setSelectedDepartment] = useState("Select Department")
    const [departmentList, setDepartmentList] = useState([
        "Select Department",
        "Business Strategy",
        "Administration Facilities",
        "Finance Accounts",
        "Information Technology",
        "Claims Reconciliation",
        "Operations Supply Chain",
        "Order Processing",
        "Procurement",
        "Warehousing Logistics",
        "Maintenance",
        "Plant Operations",
        "Production",
        "Quality",
        "Store",
        "Quality Assurance Control",
        "Customer Service",
        "Brand Marketing",
        "Sales",
        "Data Analytics",
        "Process Excellence PMO",
        "Supply Chain Coordination",
        "Performance Marketing",
        "Human Resources"
    ])


    // Function to fetch column A from master sheet
    // const fetchMasterSheetColumnA = async () => {
    //     try {
    //         setIsFetchingMaster(true)
    //         const response = await fetch(`https://docs.google.com/spreadsheets/d/1QJzboxloPluqZg15GWL3Y13ymUw_iCydxmpY7Njqtb8/gviz/tq?tqx=out:json&sheet=MASTER`)

    //         if (!response.ok) {
    //             throw new Error(`Failed to fetch master sheet data: ${response.status}`)
    //         }

    //         const text = await response.text()
    //         const jsonStart = text.indexOf('{')
    //         const jsonEnd = text.lastIndexOf('}')
    //         const jsonString = text.substring(jsonStart, jsonEnd + 1)
    //         const data = JSON.parse(jsonString)

    //         // Extract column A values (first column), skipping the first row (header)
    //         const columnAValues = data.table.rows
    //             .slice(1)
    //             .map(row => {
    //                 if (row && row.c && row.c[0]) {
    //                     return row.c[0].v || null
    //                 }
    //                 return null
    //             })
    //             .filter(value => value !== null && value !== '')

    //         // Get user's page access from sessionStorage
    //         const userPages = (sessionStorage.getItem('page') || '').toLowerCase().trim();
    //         const allowedPages = userPages
    //             .split(',')
    //             .map(page => page.trim())
    //             .filter(page => page !== '');

    //         // Filter departments based on user's page access
    //         let filteredDepartments = [...columnAValues];
    //         if (allowedPages.length > 0 && !allowedPages.includes('all')) {
    //             filteredDepartments = filteredDepartments.filter(dept => {
    //                 const deptLower = dept.toLowerCase().trim();
    //                 return allowedPages.some(page => deptLower === page);
    //             });
    //         }

    //         // Add default option
    //         const options = ["Select Department", ...filteredDepartments]
    //         setMasterSheetOptions(options)

    //         if (!selectedMasterOption) {
    //             setSelectedMasterOption(options[0])
    //         }

    //     } catch (error) {
    //         console.error("Error fetching master sheet data:", error)
    //         setMasterSheetOptions(["Error loading master data"])
    //     } finally {
    //         setIsFetchingMaster(false)
    //     }
    // }


    // Function to fetch column A from master sheet
    // const fetchMasterSheetColumnA = async () => {
    //     try {
    //         setIsFetchingMaster(true);

    //         // Determine which sheet and column to fetch based on dashboardType
    //         let sheetName, columnIndex;

    //         if (dashboardType === "delegation") {
    //             sheetName = "DELEGATION";
    //             columnIndex = 2; // Column C (0-based index: A=0, B=1, C=2)
    //         } else {
    //             sheetName = "MASTER";
    //             columnIndex = 0; // Column A
    //         }

    //         const response = await fetch(`https://docs.google.com/spreadsheets/d/1QJzboxloPluqZg15GWL3Y13ymUw_iCydxmpY7Njqtb8/gviz/tq?tqx=out:json&sheet=${sheetName}`);

    //         if (!response.ok) {
    //             throw new Error(`Failed to fetch ${sheetName} sheet data: ${response.status}`);
    //         }

    //         const text = await response.text();
    //         const jsonStart = text.indexOf('{');
    //         const jsonEnd = text.lastIndexOf('}');
    //         const jsonString = text.substring(jsonStart, jsonEnd + 1);
    //         const data = JSON.parse(jsonString);

    //         // Extract values from specified column, skipping the first row (header)
    //         const columnValues = data.table.rows
    //             .slice(1)
    //             .map(row => {
    //                 if (row && row.c && row.c[columnIndex]) {
    //                     return row.c[columnIndex].v || null;
    //                 }
    //                 return null;
    //             })
    //             .filter(value => value !== null && value !== '');

    //         // Get user's page access from sessionStorage
    //         const userPages = (sessionStorage.getItem('page') || '').toLowerCase().trim();
    //         const allowedPages = userPages
    //             .split(',')
    //             .map(page => page.trim())
    //             .filter(page => page !== '');

    //         // Filter departments based on user's page access
    //         let filteredDepartments = [...columnValues];
    //         if (allowedPages.length > 0 && !allowedPages.includes('all')) {
    //             filteredDepartments = filteredDepartments.filter(dept => {
    //                 const deptLower = dept.toLowerCase().trim();
    //                 return allowedPages.some(page => deptLower === page);
    //             });
    //         }

    //         // Remove duplicates and sort
    //         const uniqueDepartments = [...new Set(filteredDepartments)].sort();

    //         // Add default option
    //         const options = ["Select Department", ...uniqueDepartments];
    //         setMasterSheetOptions(options);

    //         if (!selectedMasterOption) {
    //             setSelectedMasterOption(options[0]);
    //         }

    //     } catch (error) {
    //         console.error(`Error fetching ${dashboardType === "delegation" ? "DELEGATION" : "master"} sheet data:`, error);
    //         setMasterSheetOptions(["Error loading department data"]);
    //     } finally {
    //         setIsFetchingMaster(false);
    //     }
    // }

    // Add dashboardType to useEffect dependency array
    useEffect(() => {
        fetchMasterSheetColumnA();
    }, [dashboardType]); // Add dashboardType here

    // Add to useEffect
    useEffect(() => {
        fetchMasterSheetColumnA();
    }, []);


    const handleLeaveButtonClick = (id) => {
        // Find the current task
        const task = accountData.find(item => item._id === id);

        if (task) {
            setEditingTaskId(id);
            setEditedTaskDescription(task["col5"] || "");
        }

        // Disable checkbox when edit button is clicked
        setSelectedItems((prev) => {
            const newSelected = new Set(prev);
            newSelected.delete(id);
            return newSelected;
        });
    };


    const handleSaveEdit = async (id, description = null) => {
        try {
            const task = accountData.find(item => item._id === id);
            if (!task) return;

            // Set loading state
            setSavingTaskId(id);
            setSaveLoading(true);

            const descToSave = description || editedTaskDescription;

            console.log("Sending update request:", {
                action: "updateTaskDescription",
                sheetName: task._sheetName,
                taskId: task["col1"],
                rowIndex: task._rowIndex,
                newDescription: descToSave
            });

            // Google Apps Script को data भेजने का सही तरीका
            const formData = new FormData();
            formData.append("action", "updateTaskDescription");
            formData.append("sheetName", task._sheetName);
            formData.append("taskId", task["col1"]);
            formData.append("rowIndex", task._rowIndex.toString());
            formData.append("newDescription", descToSave);

            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: "POST",
                body: formData,
            });

            let result;
            try {
                const responseText = await response.text();
                let cleanedText = responseText;
                if (cleanedText.startsWith("/*O_o*/") && cleanedText.includes("google.visualization.Query.setResponse")) {
                    cleanedText = cleanedText.substring(
                        cleanedText.indexOf("(") + 1,
                        cleanedText.lastIndexOf(")")
                    );
                }
                result = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error("Error parsing response:", parseError);
                throw new Error(`Failed to parse response: ${parseError.message}`);
            }

            if (result.success) {
                // Update local state
                setAccountData(prev =>
                    prev.map(item =>
                        item._id === id
                            ? { ...item, col5: descToSave }
                            : item
                    )
                );

                // Update task description list
                setTaskDescriptionList(prev => {
                    const updatedList = new Set(prev);
                    if (task["col5"] && task["col5"].trim() !== "") {
                        updatedList.delete(task["col5"]);
                    }
                    if (descToSave.trim() !== "") {
                        updatedList.add(descToSave);
                    }
                    return Array.from(updatedList).sort();
                });

                return true; // Success
            } else {
                throw new Error(result.error || result.message || "Unknown error");
            }
        } catch (error) {
            console.error("Error updating task description:", error);
            throw error;
        } finally {
            // Reset loading state
            setSavingTaskId(null);
            setSaveLoading(false);
        }
    };


    const formatDateToDDMMYYYY = (date) => {
        const day = date.getDate().toString().padStart(2, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }


    useEffect(() => {
        const role = sessionStorage.getItem("role")
        const user = sessionStorage.getItem("username")
        setUserRole(role || "")
        setUsername(user || "")
    }, [])

    const parseGoogleSheetsDate = (dateStr) => {
        if (!dateStr) return ""

        if (typeof dateStr === "string" && dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateStr
        }

        if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
            const match = /Date$$(\d+),(\d+),(\d+)$$/.exec(dateStr)
            if (match) {
                const year = Number.parseInt(match[1], 10)
                const month = Number.parseInt(match[2], 10)
                const day = Number.parseInt(match[3], 10)
                return `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${year}`
            }
        }

        try {
            const date = new Date(dateStr)
            if (!isNaN(date.getTime())) {
                return formatDateToDDMMYYYY(date)
            }
        } catch (error) {
            console.error("Error parsing date:", error)
        }

        return dateStr
    }

    const parseDateFromDDMMYYYY = (dateStr) => {
        if (!dateStr || typeof dateStr !== "string") return null
        const parts = dateStr.split("/")
        if (parts.length !== 3) return null
        return new Date(parts[2], parts[1] - 1, parts[0])
    }

    const sortDateWise = (a, b) => {
        const dateStrA = a["col6"] || ""
        const dateStrB = b["col6"] || ""
        const dateA = parseDateFromDDMMYYYY(dateStrA)
        const dateB = parseDateFromDDMMYYYY(dateStrB)
        if (!dateA) return 1
        if (!dateB) return -1
        return dateA.getTime() - dateB.getTime()
    }


    // Memoized filtered data to prevent unnecessary re-renders
    // const filteredAccountData = useMemo(() => {
    //     const filtered = searchTerm
    //         ? accountData.filter((account) =>
    //             Object.values(account).some(
    //                 (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    //             ),
    //         )
    //         : accountData;

    //     // नया: Name फिल्टर लागू करें
    //     const nameFiltered = selectedName !== "All Names"
    //         ? filtered.filter((account) => account["col4"] === selectedName)
    //         : filtered;

    //     // नया: Task Description फिल्टर लागू करें
    //     const taskFiltered = selectedTaskDescription !== "All Tasks"
    //         ? nameFiltered.filter((account) => account["col5"] === selectedTaskDescription)
    //         : nameFiltered;

    //     return taskFiltered.sort(sortDateWise);
    // }, [accountData, searchTerm, selectedName, selectedTaskDescription]); // selectedTaskDescription को dependencies में जोड़ें


    // filteredAccountData function को update करें:

    // filteredAccountData और related lists को update करें:

    const filteredAccountData = useMemo(() => {
        let filtered = accountData;

        // ✅ Department filter (delegation mode में)
        if (dashboardType === "delegation" && selectedDepartment !== "Select Department") {
            filtered = filtered.filter((account) => account["col2"] === selectedDepartment);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((account) =>
                Object.values(account).some(
                    (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
                ),
            );
        }

        // Name filter
        const nameFiltered = selectedName !== "All Names"
            ? filtered.filter((account) => account["col4"] === selectedName)
            : filtered;

        // Task Description filter
        const taskFiltered = selectedTaskDescription !== "All Tasks"
            ? nameFiltered.filter((account) => account["col5"] === selectedTaskDescription)
            : nameFiltered;

        return taskFiltered.sort(sortDateWise);
    }, [accountData, searchTerm, selectedName, selectedTaskDescription, dashboardType, selectedDepartment]);

    // ✅ NEW: Filtered Names based on selected department
    const filteredMembersList = useMemo(() => {
        if (dashboardType === "delegation" && selectedDepartment !== "Select Department") {
            const filtered = accountData.filter((account) => account["col2"] === selectedDepartment);
            const membersSet = new Set();
            filtered.forEach(account => {
                const name = account["col4"];
                if (name && name.trim() !== "") {
                    membersSet.add(name);
                }
            });
            return Array.from(membersSet).sort();
        }
        return membersList;
    }, [dashboardType, selectedDepartment, accountData, membersList]);

    // ✅ NEW: Filtered Task Descriptions based on selected department
    const filteredTaskDescriptionList = useMemo(() => {
        if (dashboardType === "delegation" && selectedDepartment !== "Select Department") {
            const filtered = accountData.filter((account) => account["col2"] === selectedDepartment);
            const taskSet = new Set();
            filtered.forEach(account => {
                const task = account["col5"];
                if (task && task.trim() !== "") {
                    taskSet.add(task);
                }
            });
            return Array.from(taskSet).sort();
        }
        return taskDescriptionList;
    }, [dashboardType, selectedDepartment, accountData, taskDescriptionList]);

    // ✅ Department change होने पर Name और Task Description reset करें
    useEffect(() => {
        if (dashboardType === "delegation") {
            setSelectedName("All Names");
            setSelectedTaskDescription("All Tasks");
        }
    }, [selectedDepartment, dashboardType]);


    // const fetchSheetData = useCallback(async () => {
    //     try {
    //         if (selectedDepartment === departmentList) {
    //             setAccountData([]);
    //             setLoading(false);
    //             return;
    //         }

    //         setLoading(true);

    //         const sheetName = dashboardType === "delegation" ? "DELEGATION" : selectedDepartment;
    //         console.log(`📋 Fetching sheet: ${sheetName}, Dashboard type: ${dashboardType}`);

    //         const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=${sheetName}&action=fetch`);

    //         if (!response.ok) {
    //             throw new Error(`Failed to fetch data: ${response.status}`);
    //         }

    //         const text = await response.text();
    //         console.log("📥 Raw response text (first 500 chars):", text.substring(0, 500));

    //         let data;
    //         try {
    //             data = JSON.parse(text);
    //             console.log("✅ Successfully parsed JSON");
    //         } catch (parseError) {
    //             console.error("❌ JSON parse error:", parseError);
    //             const jsonStart = text.indexOf("{");
    //             const jsonEnd = text.lastIndexOf("}");
    //             if (jsonStart !== -1 && jsonEnd !== -1) {
    //                 const jsonString = text.substring(jsonStart, jsonEnd + 1);
    //                 console.log("🔄 Trying to parse extracted JSON string");
    //                 data = JSON.parse(jsonString);
    //             } else {
    //                 throw new Error("Invalid JSON response from server");
    //             }
    //         }

    //         const membersSet = new Set();
    //         const taskDescriptionSet = new Set(); // ✅ NEW: Task Description Set
    //         let rows = [];

    //         if (data.table && data.table.rows) {
    //             rows = data.table.rows;
    //             console.log(`📊 Found ${rows.length} rows in data.table.rows`);
    //         } else if (Array.isArray(data)) {
    //             rows = data;
    //             console.log(`📊 Found ${rows.length} rows in array data`);
    //         } else if (data.values) {
    //             rows = data.values.map((row) => ({ c: row.map((val) => ({ v: val })) }));
    //             console.log(`📊 Found ${rows.length} rows in data.values`);
    //         } else {
    //             console.warn("⚠️ Unknown data structure:", Object.keys(data));
    //         }

    //         console.log(`📈 Total rows before filtering: ${rows.length}`);

    //         const pendingAccounts = [];
    //         let checklistFilteredCount = 0;
    //         let delegationFilteredCount = 0;
    //         let processedCount = 0;

    //         rows.forEach((row, rowIndex) => {
    //             if (rowIndex === 0) {
    //                 console.log("📑 Header row data:", row);
    //                 return; // Skip header
    //             }

    //             let rowValues = [];
    //             if (row.c) {
    //                 rowValues = row.c.map((cell) => (cell && cell.v !== undefined ? cell.v : ""));
    //             } else if (Array.isArray(row)) {
    //                 rowValues = row;
    //             }

    //             // Debug: Check delay values based on dashboard type
    //             if (dashboardType === "delegation") {
    //                 const delayValue = rowValues[13]; // Column N
    //                 console.log(`Row ${rowIndex}: Delegation - Column N delay value = "${delayValue}"`);

    //                 // Check if should be filtered
    //                 if (delayValue && delayValue.toString().trim() !== "") {
    //                     delegationFilteredCount++;
    //                     console.log(`Row ${rowIndex}: SKIPPING - Delay has value: "${delayValue}"`);
    //                     return;
    //                 }
    //             } else {
    //                 const delayValue = rowValues[11]; // Column L
    //                 console.log(`Row ${rowIndex}: Checklist - Column L delay value = "${delayValue}"`);

    //                 // Check if should be filtered
    //                 if (!delayValue || !delayValue.toString().trim().startsWith('-')) {
    //                     checklistFilteredCount++;
    //                     console.log(`Row ${rowIndex}: SKIPPING - Delay not negative: "${delayValue}"`);
    //                     return;
    //                 }
    //             }

    //             processedCount++;
    //             const assignedTo = rowValues[4] || "Unassigned";
    //             membersSet.add(assignedTo);

    //             // ✅ NEW: Extract Task Description for filter list
    //             const taskDescription = rowValues[5] || ""; // col5 is Task Description
    //             if (taskDescription && taskDescription.trim() !== "") {
    //                 taskDescriptionSet.add(taskDescription);
    //             }

    //             const googleSheetsRowIndex = rowIndex + 1;
    //             const taskId = rowValues[1] || "";
    //             const stableId = taskId
    //                 ? `task_${taskId}_${googleSheetsRowIndex}`
    //                 : `row_${googleSheetsRowIndex}_${Math.random().toString(36).substring(2, 15)}`;

    //             const rowData = {
    //                 _id: stableId,
    //                 _rowIndex: googleSheetsRowIndex,
    //                 _taskId: taskId,
    //                 _sheetName: sheetName
    //             };

    //             // Column mapping stays exactly as before
    //             const columnHeaders = [
    //                 { id: "col0", label: "Timestamp", type: "string" },
    //                 { id: "col1", label: "Task ID", type: "string" },
    //                 // { id: "col2", label: "Firm", type: "string" },
    //                 { id: "col2", label: dashboardType === "delegation" ? "Department" : "Firm", type: "string" },
    //                 { id: "col3", label: "Given By", type: "string" },
    //                 { id: "col4", label: "Name", type: "string" },
    //                 { id: "col5", label: "Task Description", type: "string" },
    //                 { id: "col6", label: "Task Start Date", type: "date" },
    //                 { id: "col7", label: "Freq", type: "string" },
    //                 { id: "col8", label: "Enable Reminders", type: "string" },
    //                 { id: "col9", label: "Require Attachment", type: "string" },
    //                 { id: "col10", label: "Actual", type: "date" },
    //                 { id: "col11", label: "Column L", type: "string" },
    //                 { id: "col12", label: "Status", type: "string" },
    //                 { id: "col13", label: "Remarks", type: "string" },
    //                 { id: "col14", label: "Uploaded Image", type: "string" },
    //                 { id: "col15", label: "Admin Reminder", type: "string" },
    //                 { id: "col16", label: "Admin Status", type: "string" }
    //             ];

    //             columnHeaders.forEach((header, index) => {
    //                 const cellValue = rowValues[index];
    //                 if (header.type === "date" || (cellValue && String(cellValue).startsWith("Date("))) {
    //                     rowData[header.id] = cellValue ? parseGoogleSheetsDate(String(cellValue)) : "";
    //                 } else if (header.type === "number" && cellValue !== null && cellValue !== "") {
    //                     rowData[header.id] = cellValue;
    //                 } else {
    //                     rowData[header.id] = cellValue !== null ? cellValue : "";
    //                 }

    //                 // Debug delay columns
    //                 if (index === 11 && dashboardType !== "delegation") {
    //                     console.log(`Row ${rowIndex}: col11 (Column L) value = "${rowData[header.id]}"`);
    //                 }
    //                 if (index === 13 && dashboardType === "delegation") {
    //                     console.log(`Row ${rowIndex}: col13 (Remarks/Column N) value = "${rowData[header.id]}"`);
    //                 }
    //             });

    //             pendingAccounts.push(rowData);
    //         });

    //         console.log("📊 FILTERING SUMMARY:");
    //         console.log(`Total rows: ${rows.length}`);
    //         console.log(`Processed rows: ${processedCount}`);
    //         console.log(`Skipped (Checklist - not negative): ${checklistFilteredCount}`);
    //         console.log(`Skipped (Delegation - has value): ${delegationFilteredCount}`);
    //         console.log(`Final accounts: ${pendingAccounts.length}`);

    //         setMembersList(Array.from(membersSet).sort());
    //         setTaskDescriptionList(Array.from(taskDescriptionSet).sort()); // ✅ NEW: Set task description list
    //         setAccountData(pendingAccounts);
    //         setLoading(false);

    //         console.log("✅ Fetch completed successfully");

    //     } catch (error) {
    //         console.error(`❌ Error fetching ${selectedDepartment} sheet data:`, error);
    //         setError("Failed to load account data: " + error.message);
    //         setLoading(false);
    //     }
    // }, [selectedDepartment, dashboardType]);




    // Existing state variables के बाद जोड़ें:

    // fetchSheetData function में, जहां membersList और taskDescriptionList set हो रहा है, वहां ये add करें:

    const fetchSheetData = useCallback(async () => {
        try {
            if (selectedDepartment === departmentList) {
                setAccountData([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            const sheetName = dashboardType === "delegation" ? "DELEGATION" : selectedDepartment;
            console.log(`📋 Fetching sheet: ${sheetName}, Dashboard type: ${dashboardType}`);

            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=${sheetName}&action=fetch`);

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }

            const text = await response.text();
            console.log("📥 Raw response text (first 500 chars):", text.substring(0, 500));

            let data;
            try {
                data = JSON.parse(text);
                console.log("✅ Successfully parsed JSON");
            } catch (parseError) {
                console.error("❌ JSON parse error:", parseError);
                const jsonStart = text.indexOf("{");
                const jsonEnd = text.lastIndexOf("}");
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonString = text.substring(jsonStart, jsonEnd + 1);
                    console.log("🔄 Trying to parse extracted JSON string");
                    data = JSON.parse(jsonString);
                } else {
                    throw new Error("Invalid JSON response from server");
                }
            }

            const membersSet = new Set();
            const taskDescriptionSet = new Set();
            const departmentsSet = new Set(); // ✅ NEW: Department Set for filtering
            let rows = [];

            if (data.table && data.table.rows) {
                rows = data.table.rows;
                console.log(`📊 Found ${rows.length} rows in data.table.rows`);
            } else if (Array.isArray(data)) {
                rows = data;
                console.log(`📊 Found ${rows.length} rows in array data`);
            } else if (data.values) {
                rows = data.values.map((row) => ({ c: row.map((val) => ({ v: val })) }));
                console.log(`📊 Found ${rows.length} rows in data.values`);
            } else {
                console.warn("⚠️ Unknown data structure:", Object.keys(data));
            }

            console.log(`📈 Total rows before filtering: ${rows.length}`);

            const pendingAccounts = [];
            let checklistFilteredCount = 0;
            let delegationFilteredCount = 0;
            let processedCount = 0;

            rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) {
                    console.log("📑 Header row data:", row);
                    return; // Skip header
                }

                let rowValues = [];
                if (row.c) {
                    rowValues = row.c.map((cell) => (cell && cell.v !== undefined ? cell.v : ""));
                } else if (Array.isArray(row)) {
                    rowValues = row;
                }

                // Debug: Check delay values based on dashboard type
                if (dashboardType === "delegation") {
                    const delayValue = rowValues[13]; // Column N
                    console.log(`Row ${rowIndex}: Delegation - Column N delay value = "${delayValue}"`);

                    // Check if should be filtered
                    if (delayValue && delayValue.toString().trim() !== "") {
                        delegationFilteredCount++;
                        console.log(`Row ${rowIndex}: SKIPPING - Delay has value: "${delayValue}"`);
                        return;
                    }
                } else {
                    const delayValue = rowValues[11]; // Column L
                    console.log(`Row ${rowIndex}: Checklist - Column L delay value = "${delayValue}"`);

                    // Check if should be filtered
                    if (!delayValue || !delayValue.toString().trim().startsWith('-')) {
                        checklistFilteredCount++;
                        console.log(`Row ${rowIndex}: SKIPPING - Delay not negative: "${delayValue}"`);
                        return;
                    }
                }

                processedCount++;
                const assignedTo = rowValues[4] || "Unassigned";
                membersSet.add(assignedTo);

                const taskDescription = rowValues[5] || "";
                if (taskDescription && taskDescription.trim() !== "") {
                    taskDescriptionSet.add(taskDescription);
                }

                // ✅ NEW: Extract department from Column C (rowValues[2])
                const department = rowValues[2] || "";
                if (department && department.trim() !== "") {
                    departmentsSet.add(department);
                }

                const googleSheetsRowIndex = rowIndex + 1;
                const taskId = rowValues[1] || "";
                const stableId = taskId
                    ? `task_${taskId}_${googleSheetsRowIndex}`
                    : `row_${googleSheetsRowIndex}_${Math.random().toString(36).substring(2, 15)}`;

                const rowData = {
                    _id: stableId,
                    _rowIndex: googleSheetsRowIndex,
                    _taskId: taskId,
                    _sheetName: sheetName
                };

                const columnHeaders = [
                    { id: "col0", label: "Timestamp", type: "string" },
                    { id: "col1", label: "Task ID", type: "string" },
                    { id: "col2", label: dashboardType === "delegation" ? "Department" : "Firm", type: "string" },
                    { id: "col3", label: "Given By", type: "string" },
                    { id: "col4", label: "Name", type: "string" },
                    { id: "col5", label: "Task Description", type: "string" },
                    { id: "col6", label: "Task Start Date", type: "date" },
                    { id: "col7", label: "Freq", type: "string" },
                    { id: "col8", label: "Enable Reminders", type: "string" },
                    { id: "col9", label: "Require Attachment", type: "string" },
                    { id: "col10", label: "Actual", type: "date" },
                    { id: "col11", label: "Column L", type: "string" },
                    { id: "col12", label: "Status", type: "string" },
                    { id: "col13", label: "Remarks", type: "string" },
                    { id: "col14", label: "Uploaded Image", type: "string" },
                    { id: "col15", label: "Admin Reminder", type: "string" },
                    { id: "col16", label: "Admin Status", type: "string" }
                ];

                columnHeaders.forEach((header, index) => {
                    const cellValue = rowValues[index];
                    if (header.type === "date" || (cellValue && String(cellValue).startsWith("Date("))) {
                        rowData[header.id] = cellValue ? parseGoogleSheetsDate(String(cellValue)) : "";
                    } else if (header.type === "number" && cellValue !== null && cellValue !== "") {
                        rowData[header.id] = cellValue;
                    } else {
                        rowData[header.id] = cellValue !== null ? cellValue : "";
                    }

                    if (index === 11 && dashboardType !== "delegation") {
                        console.log(`Row ${rowIndex}: col11 (Column L) value = "${rowData[header.id]}"`);
                    }
                    if (index === 13 && dashboardType === "delegation") {
                        console.log(`Row ${rowIndex}: col13 (Remarks/Column N) value = "${rowData[header.id]}"`);
                    }
                });

                pendingAccounts.push(rowData);
            });

            console.log("📊 FILTERING SUMMARY:");
            console.log(`Total rows: ${rows.length}`);
            console.log(`Processed rows: ${processedCount}`);
            console.log(`Skipped (Checklist - not negative): ${checklistFilteredCount}`);
            console.log(`Skipped (Delegation - has value): ${delegationFilteredCount}`);
            console.log(`Final accounts: ${pendingAccounts.length}`);

            setMembersList(Array.from(membersSet).sort());
            setTaskDescriptionList(Array.from(taskDescriptionSet).sort());

            // ✅ NEW: Store unique departments from table
            setUniqueDepartmentsFromTable(Array.from(departmentsSet).sort());

            setAccountData(pendingAccounts);
            setLoading(false);

            console.log("✅ Fetch completed successfully");

        } catch (error) {
            console.error(`❌ Error fetching ${selectedDepartment} sheet data:`, error);
            setError("Failed to load account data: " + error.message);
            setLoading(false);
        }
    }, [selectedDepartment, dashboardType]);

    // fetchMasterSheetColumnA function को update करें:
    const fetchMasterSheetColumnA = async () => {
        try {
            setIsFetchingMaster(true);

            // ✅ CHANGE: "delegation" mode में table से departments use करें
            if (dashboardType === "delegation") {
                // Wait for table data to be fetched first
                if (uniqueDepartmentsFromTable.length === 0) {
                    // If not loaded yet, return - useEffect will call again after data loads
                    setIsFetchingMaster(false);
                    return;
                }

                // Use departments from table
                const options = ["Select Department", ...uniqueDepartmentsFromTable];
                setMasterSheetOptions(options);

                if (!selectedMasterOption) {
                    setSelectedMasterOption(options[0]);
                }

                setIsFetchingMaster(false);
                return;
            }

            // Original logic for "checklist" mode
            const sheetName = "MASTER";
            const columnIndex = 0; // Column A

            const response = await fetch(`https://docs.google.com/spreadsheets/d/1QJzboxloPluqZg15GWL3Y13ymUw_iCydxmpY7Njqtb8/gviz/tq?tqx=out:json&sheet=${sheetName}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${sheetName} sheet data: ${response.status}`);
            }

            const text = await response.text();
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            const jsonString = text.substring(jsonStart, jsonEnd + 1);
            const data = JSON.parse(jsonString);

            const columnValues = data.table.rows
                .slice(1)
                .map(row => {
                    if (row && row.c && row.c[columnIndex]) {
                        return row.c[columnIndex].v || null;
                    }
                    return null;
                })
                .filter(value => value !== null && value !== '');

            const userPages = (sessionStorage.getItem('page') || '').toLowerCase().trim();
            const allowedPages = userPages
                .split(',')
                .map(page => page.trim())
                .filter(page => page !== '');

            let filteredDepartments = [...columnValues];
            if (allowedPages.length > 0 && !allowedPages.includes('all')) {
                filteredDepartments = filteredDepartments.filter(dept => {
                    const deptLower = dept.toLowerCase().trim();
                    return allowedPages.some(page => deptLower === page);
                });
            }

            const uniqueDepartments = [...new Set(filteredDepartments)].sort();
            const options = ["Select Department", ...uniqueDepartments];
            setMasterSheetOptions(options);

            if (!selectedMasterOption) {
                setSelectedMasterOption(options[0]);
            }

        } catch (error) {
            console.error(`Error fetching department data:`, error);
            setMasterSheetOptions(["Error loading department data"]);
        } finally {
            setIsFetchingMaster(false);
        }
    };

    // ✅ NEW: useEffect to update dropdown when table data changes
    useEffect(() => {
        if (dashboardType === "delegation" && uniqueDepartmentsFromTable.length > 0) {
            fetchMasterSheetColumnA();
        }
    }, [uniqueDepartmentsFromTable, dashboardType]);




    useEffect(() => {
        fetchSheetData()
    }, [fetchSheetData])

    // Checkbox handlers with better state management
    const handleSelectItem = useCallback((id, isChecked) => {
        console.log(`Checkbox action: ${id} -> ${isChecked}`)

        setSelectedItems((prev) => {
            const newSelected = new Set(prev)

            if (isChecked) {
                newSelected.add(id)
            } else {
                newSelected.delete(id)
                // Clean up related data when unchecking
                setAdditionalData((prevData) => {
                    const newAdditionalData = { ...prevData }
                    delete newAdditionalData[id]
                    return newAdditionalData
                })
                setRemarksData((prevRemarks) => {
                    const newRemarksData = { ...prevRemarks }
                    delete newRemarksData[id]
                    return newRemarksData
                })
            }

            // console.log(`Updated selection: ${Array.from(newSelected)}`)
            return newSelected
        })
    }, [])




    const handleCheckboxClick = useCallback(
        (e, id) => {
            e.stopPropagation();
            const isChecked = e.target.checked;
            console.log(`Checkbox clicked: ${id}, checked: ${isChecked}`);

            // Existing logic
            handleSelectItem(id, isChecked);

            if (isChecked) {
                // Add to selected rows for date
                setSelectedRowsForDate(prev => {
                    const newSet = new Set(prev);
                    newSet.add(id);
                    return newSet;
                });

                // Get date from selected row for autofill (optional)
                const account = accountData.find(item => item._id === id);
                if (account && account["col6"]) {
                    const rowDate = account["col6"];
                    const [day, month, year] = rowDate.split('/');
                    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    setStartDate(formattedDate);
                    setEndDate(formattedDate);
                }
            } else {
                // Remove from selected rows for date
                setSelectedRowsForDate(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }

            // Delete button state will be automatically updated by useEffect
        },
        [handleSelectItem, accountData]
    );


    const handleSelectAllItems = useCallback(
        (e) => {
            e.stopPropagation();
            const checked = e.target.checked;
            console.log(`Select all clicked: ${checked}`);

            if (checked) {
                const allIds = filteredAccountData.map((item) => item._id);
                setSelectedItems(new Set(allIds));
                setSelectedRowsForDate(new Set(allIds));
                console.log(`Selected all items: ${allIds}`);
            } else {
                setSelectedItems(new Set());
                setSelectedRowsForDate(new Set());
                setAdditionalData({});
                setRemarksData({});
                console.log("Cleared all selections");
            }

            // Delete button state will be automatically updated by useEffect
        },
        [filteredAccountData]
    );

    const updateDeleteButtonState = useCallback(() => {
        // Enable delete button if:
        // 1. Checkboxes are selected (individual mode)
        // 2. OR dates are selected (dateRange mode)
        const shouldEnable =
            selectedRowsForDate.size > 0 ||
            (startDate || endDate);

        setShowDeleteButton(shouldEnable);

        // Set delete mode based on what is selected
        if (selectedRowsForDate.size > 0) {
            setDeleteMode("individual");
        } else if (startDate || endDate) {
            setDeleteMode("dateRange");
        } else {
            setDeleteMode("");
        }
    }, [selectedRowsForDate, startDate, endDate]);

    const handleStartDateChange = (e) => {
        const value = e.target.value;
        setStartDate(value);
    };

    const handleEndDateChange = (e) => {
        const value = e.target.value;
        setEndDate(value);
    };

    useEffect(() => {
        updateDeleteButtonState();
    }, [selectedRowsForDate, startDate, endDate, updateDeleteButtonState]);

    const handleDeleteSelectedRows = useCallback(async () => {
        try {
            // For date range mode, require both dates
            if (deleteMode === "dateRange" && (!startDate || !endDate)) {
                alert("Please select both start and end dates for date range deletion");
                return;
            }

            if (deleteMode === "individual" && selectedRowsForDate.size === 0) {
                alert("Please select at least one row to delete");
                return;
            }

            if (!deleteMode) {
                alert("Please select rows or date range to delete");
                return;
            }

            let rowsToDelete = [];
            let deleteCount = 0;
            let confirmMessage = "";
            let deleteData = {};

            if (deleteMode === "individual") {
                // Get actual row indices from accountData
                rowsToDelete = Array.from(selectedRowsForDate)
                    .map(id => {
                        const account = accountData.find(item => item._id === id);
                        return account ? account._rowIndex : null;
                    })
                    .filter(rowIndex => rowIndex !== null);

                deleteCount = rowsToDelete.length;
                deleteData = { rowIndices: rowsToDelete };
                confirmMessage = `Are you sure you want to delete ${deleteCount} selected row(s)?`;

            } else if (deleteMode === "dateRange") {
                // Date range deletion
                deleteCount = "all rows in range";
                deleteData = { startDate, endDate };
                confirmMessage = `Are you sure you want to delete all rows between ${startDate.split('-').reverse().join('/')} and ${endDate.split('-').reverse().join('/')}?`;
            }

            // Confirm deletion
            if (!window.confirm(confirmMessage)) {
                return;
            }

            setDeleteLoading(true);

            // Prepare data for Google Apps Script
            const formData = new FormData();
            formData.append("action", "deleteRows");
            formData.append("sheetName", dashboardType === "delegation" ? "DELEGATION" : selectedDepartment);
            formData.append("deleteMode", deleteMode);
            formData.append("deleteData", JSON.stringify(deleteData));

            console.log("Sending delete request:", {
                sheetName: dashboardType === "delegation" ? "DELEGATION" : selectedDepartment,
                deleteMode,
                deleteData
            });

            // Send delete request to Google Apps Script
            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: "POST",
                body: formData,
            });

            const resultText = await response.text();
            let result;

            try {
                // Clean the response if needed
                let cleanedText = resultText;
                if (cleanedText.startsWith("/*O_o*/") && cleanedText.includes("google.visualization.Query.setResponse")) {
                    cleanedText = cleanedText.substring(
                        cleanedText.indexOf("(") + 1,
                        cleanedText.lastIndexOf(")")
                    );
                }
                result = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error("Error parsing delete response:", parseError);
                throw new Error("Failed to parse server response");
            }

            if (result.success) {
                // Remove from UI immediately (optimistic update)
                if (deleteMode === "individual") {
                    // Remove specific rows
                    setAccountData(prev =>
                        prev.filter(item => !selectedRowsForDate.has(item._id))
                    );
                } else if (deleteMode === "dateRange") {
                    // Remove rows within date range
                    const parseDate = (dateStr) => {
                        const [day, month, year] = dateStr.split('/');
                        return new Date(year, month - 1, day);
                    };

                    const startDateObj = new Date(startDate);
                    const endDateObj = new Date(endDate);

                    setAccountData(prev =>
                        prev.filter(item => {
                            const taskDate = item["col6"];
                            if (!taskDate) return true;

                            try {
                                const taskDateObj = parseDate(taskDate);
                                return !(taskDateObj >= startDateObj && taskDateObj <= endDateObj);
                            } catch (e) {
                                return true;
                            }
                        })
                    );
                }

                // Clear selections
                setSelectedItems(new Set());
                setSelectedRowsForDate(new Set());

                // Reset dates if in dateRange mode
                if (deleteMode === "dateRange") {
                    setStartDate("");
                    setEndDate("");
                }

                // Show success message
                alert(`Successfully deleted ${result.deletedRows || deleteCount} row(s)!`);

                // Refresh data from server
                fetchSheetData();

            } else {
                throw new Error(result.error || result.message || "Failed to delete rows");
            }

        } catch (error) {
            console.error("Error deleting rows:", error);
            alert(`Error deleting rows: ${error.message}. Please try again.`);

            // Refresh data in case of error to sync with server
            fetchSheetData();

        } finally {
            setDeleteLoading(false);
            setShowDeleteButton(false);
            setDeleteMode("");
        }
    }, [selectedRowsForDate, startDate, endDate, deleteMode, accountData, selectedDepartment, dashboardType, fetchSheetData]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4">
                    {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">


                        <div className="flex flex-col gap-3 w-full">

                           
                            <div className="flex flex-col sm:flex-row gap-3 w-full">

                                <div className="relative w-full sm:flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>


                                <select
                                    value={dashboardType}
                                    onChange={(e) => {
                                        setDashboardType(e.target.value);
                                        if (e.target.value === "delegation") {
                                            setSelectedDepartment("DELEGATION");
                                        } else {
                                            setSelectedDepartment("Select Department");
                                        }
                                    }}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-[140px]"
                                >
                                    <option value="checklist">Checklist</option> <option value="delegation">Delegation</option>
                                </select>

                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[180px]"
                                >
                                    {masterSheetOptions.map((dept, index) => (
                                        <option key={index} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedName}
                                    onChange={(e) => setSelectedName(e.target.value)}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[150px]"
                                >
                                    <option value="All Names">All Names</option>
                                    {membersList.map((name, index) => (
                                        <option key={index} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedTaskDescription}
                                    onChange={(e) => setSelectedTaskDescription(e.target.value)}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[200px]"
                                >
                                    <option value="All Tasks">All Tasks</option>
                                    {taskDescriptionList.map((task, index) => (
                                        <option key={index} value={task}>
                                            {task.length > 30 ? `${task.substring(0, 30)}...` : task}
                                        </option>
                                    ))}
                                </select>

                            </div>


                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">

                                <div className="flex items-center gap-2 w-full sm:w-[220px]">
                                    <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-[220px]">
                                    <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex-1 rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>


                                {showDeleteButton && (
                                    <div className="flex items-center gap-3 ml-auto">


                                        <div className="text-sm text-blue-700 font-medium">
                                            {deleteMode === "individual" && selectedRowsForDate.size > 0
                                                ? `${selectedRowsForDate.size} row(s) selected`
                                                : deleteMode === "dateRange" && (startDate || endDate)
                                                    ? `Date range: ${startDate ? startDate.split('-').reverse().join('/') : '...'} to ${endDate ? endDate.split('-').reverse().join('/') : '...'}`
                                                    : "Ready to delete"
                                            }
                                        </div>

                                        <button
                                            onClick={handleDeleteSelectedRows}
                                            disabled={deleteLoading}
                                            className={`
                h-9 px-5 text-sm font-semibold rounded-lg
                flex items-center gap-2 transition-all
                shadow-sm min-w-[120px] justify-center
                ${deleteLoading
                                                    ? "bg-red-400 cursor-not-allowed"
                                                    : "bg-red-500 hover:bg-red-600 text-white hover:shadow-md"
                                                }
            `}
                                        >
                                            {deleteLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4" />
                                                    Delete {
                                                        deleteMode === "individual" && selectedRowsForDate.size > 0
                                                            ? `(${selectedRowsForDate.size})`
                                                            : deleteMode === "dateRange"
                                                                ? "(Range)"
                                                                : ""
                                                    }
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {editingTaskIds.size > 0 && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                setSaveLoading(true);
                                                const updates = [];

                                                for (const taskId of editingTaskIds) {
                                                    const task = accountData.find(item => item._id === taskId);
                                                    if (task && editedTaskDescriptions[taskId]) {
                                                        updates.push(handleSaveEdit(taskId, editedTaskDescriptions[taskId]));
                                                    }
                                                }

                                                await Promise.all(updates);

                                                setEditingTaskIds(new Set());
                                                setEditedTaskDescriptions({});

                                                alert(`${updates.length} task(s) updated successfully!`);
                                            } catch (error) {
                                                console.error("Error updating tasks:", error);
                                                alert("Some tasks failed to update. Please try again.");
                                            } finally {
                                                setSaveLoading(false);
                                            }
                                        }}
                                        disabled={saveLoading}
                                        className={`
                    h-9 px-5 text-sm font-semibold rounded-lg
                    flex items-center gap-2 transition-all
                    shadow-sm min-w-[120px] justify-center
                    ${saveLoading
                                                ? "bg-green-400 cursor-not-allowed"
                                                : "bg-green-500 hover:bg-green-600 text-white hover:shadow-md"
                                            }
                `}
                                    >
                                        {saveLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                Update All ({editingTaskIds.size})
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                        </div>

                    </div> */}


                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-3 w-full">

                            {/* ================= ROW 1: Search input – full width ================= */}
                            <div className="w-full sm:hidden">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* ================= ROW 2: Dashboard | Department | Name | Task (Mobile only) ================= */}
                            <div className="flex flex-col gap-3 w-full sm:hidden">
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Dashboard */}
                                    <select
                                        value={dashboardType}
                                        onChange={(e) => {
                                            setDashboardType(e.target.value);
                                            if (e.target.value === "delegation") {
                                                setSelectedDepartment("DELEGATION");
                                            } else {
                                                setSelectedDepartment("Select Department");
                                            }
                                        }}
                                        className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                        <option value="checklist">Checklist</option>
                                        <option value="delegation">Delegation</option>
                                    </select>

                                    {/* Department */}
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                        {masterSheetOptions.map((dept, index) => (
                                            <option key={index} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Name */}
                                    <select
                                        value={selectedName}
                                        onChange={(e) => setSelectedName(e.target.value)}
                                        className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[150px]"
                                    >
                                        <option value="All Names">All Names</option>
                                        {filteredMembersList.map((name, index) => (
                                            <option key={index} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Task Description */}
                                    <select
                                        value={selectedTaskDescription}
                                        onChange={(e) => setSelectedTaskDescription(e.target.value)}
                                        className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[200px]"
                                    >
                                        <option value="All Tasks">All Tasks</option>
                                        {filteredTaskDescriptionList.map((task, index) => (
                                            <option key={index} value={task}>
                                                {task.length > 30 ? `${task.substring(0, 30)}...` : task}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* ================= ROW 3: Start Date | End Date (Mobile only) - IN ONE ROW ================= */}
                            <div className="flex flex-col gap-3 w-full sm:hidden">
                                <div className="flex items-center gap-3 w-full">
                                    {/* Start Date */}
                                    <div className="flex items-center gap-2 w-1/2">
                                        <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="flex-1 rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div className="flex items-center gap-2 w-1/2">
                                        <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="flex-1 rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ================= ROW 4: Delete | Update buttons (Mobile only) ================= */}
                            <div className="flex flex-col gap-3 w-full sm:hidden">
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    {showDeleteButton && (
                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                            <div className="text-sm text-blue-700 font-medium w-full text-center">
                                                {deleteMode === "individual" && selectedRowsForDate.size > 0
                                                    ? `${selectedRowsForDate.size} row(s) selected`
                                                    : deleteMode === "dateRange" && (startDate || endDate)
                                                        ? `Date range: ${startDate ? startDate.split('-').reverse().join('/') : '...'} to ${endDate ? endDate.split('-').reverse().join('/') : '...'}`
                                                        : "Ready to delete"}
                                            </div>

                                            <button
                                                onClick={handleDeleteSelectedRows}
                                                disabled={deleteLoading}
                                                className={`
                w-full h-9 px-5 text-sm font-semibold rounded-lg
                flex items-center justify-center gap-2 transition-all
                shadow-sm
                ${deleteLoading
                                                        ? "bg-red-400 cursor-not-allowed"
                                                        : "bg-red-500 hover:bg-red-600 text-white hover:shadow-md"
                                                    }
              `}
                                            >
                                                {deleteLoading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="h-4 w-4" />
                                                        Delete {
                                                            deleteMode === "individual" && selectedRowsForDate.size > 0
                                                                ? `(${selectedRowsForDate.size})`
                                                                : deleteMode === "dateRange"
                                                                    ? "(Range)"
                                                                    : ""
                                                        }
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {editingTaskIds.size > 0 && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setSaveLoading(true);
                                                    const updates = [];

                                                    for (const taskId of editingTaskIds) {
                                                        const task = accountData.find(item => item._id === taskId);
                                                        if (task && editedTaskDescriptions[taskId]) {
                                                            updates.push(handleSaveEdit(taskId, editedTaskDescriptions[taskId]));
                                                        }
                                                    }

                                                    await Promise.all(updates);
                                                    setEditingTaskIds(new Set());
                                                    setEditedTaskDescriptions({});
                                                    alert(`${updates.length} task(s) updated successfully!`);
                                                } catch (error) {
                                                    console.error("Error updating tasks:", error);
                                                    alert("Some tasks failed to update. Please try again.");
                                                } finally {
                                                    setSaveLoading(false);
                                                }
                                            }}
                                            disabled={saveLoading}
                                            className={`
              w-full h-9 px-5 text-sm font-semibold rounded-lg
              flex items-center justify-center gap-2 transition-all
              shadow-sm
              ${saveLoading
                                                    ? "bg-green-400 cursor-not-allowed"
                                                    : "bg-green-500 hover:bg-green-600 text-white hover:shadow-md"
                                                }
            `}
                                        >
                                            {saveLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Update All ({editingTaskIds.size})
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ================= DESKTOP LAYOUT (Exactly as before - NO CHANGES) ================= */}
                            <div className="hidden sm:flex flex-col sm:flex-row gap-3 w-full">
                                {/* Search → takes remaining width */}
                                <div className="relative w-full sm:flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <select
                                    value={dashboardType}
                                    onChange={(e) => {
                                        setDashboardType(e.target.value);
                                        if (e.target.value === "delegation") {
                                            setSelectedDepartment("DELEGATION");
                                        } else {
                                            setSelectedDepartment("Select Department");
                                        }
                                    }}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-[140px]"
                                >
                                    <option value="checklist">Checklist</option>
                                    <option value="delegation">Delegation</option>
                                </select>

                                {/* Department */}
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[180px]"
                                >
                                    {masterSheetOptions.map((dept, index) => (
                                        <option key={index} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>

                                {/* Name */}
                                <select
                                    value={selectedName}
                                    onChange={(e) => setSelectedName(e.target.value)}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[150px]"
                                >
                                    <option value="All Names">All Names</option>
                                    {filteredMembersList.map((name, index) => (
                                        <option key={index} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>

                                {/* Task Description */}
                                <select
                                    value={selectedTaskDescription}
                                    onChange={(e) => setSelectedTaskDescription(e.target.value)}
                                    className="rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-[200px]"
                                >
                                    <option value="All Tasks">All Tasks</option>
                                    {filteredTaskDescriptionList.map((task, index) => (
                                        <option key={index} value={task}>
                                            {task.length > 30 ? `${task.substring(0, 30)}...` : task}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ================= DESKTOP: Row 2 (Start Date, End Date, Buttons) ================= */}
                            <div className="hidden sm:flex flex-col sm:flex-row gap-3 sm:items-center">
                                {/* Start Date */}
                                <div className="flex items-center gap-2 w-full sm:w-[220px]">
                                    <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                {/* End Date */}
                                <div className="flex items-center gap-2 w-full sm:w-[220px]">
                                    <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex-1 rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>

                                {showDeleteButton && (
                                    <div className="flex items-center gap-3 ml-auto">
                                        <div className="text-sm text-blue-700 font-medium">
                                            {deleteMode === "individual" && selectedRowsForDate.size > 0
                                                ? `${selectedRowsForDate.size} row(s) selected`
                                                : deleteMode === "dateRange" && (startDate || endDate)
                                                    ? `Date range: ${startDate ? startDate.split('-').reverse().join('/') : '...'} to ${endDate ? endDate.split('-').reverse().join('/') : '...'}`
                                                    : "Ready to delete"
                                            }
                                        </div>

                                        <button
                                            onClick={handleDeleteSelectedRows}
                                            disabled={deleteLoading}
                                            className={`
              h-9 px-5 text-sm font-semibold rounded-lg
              flex items-center gap-2 transition-all
              shadow-sm min-w-[120px] justify-center
              ${deleteLoading
                                                    ? "bg-red-400 cursor-not-allowed"
                                                    : "bg-red-500 hover:bg-red-600 text-white hover:shadow-md"
                                                }
            `}
                                        >
                                            {deleteLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4" />
                                                    Delete {
                                                        deleteMode === "individual" && selectedRowsForDate.size > 0
                                                            ? `(${selectedRowsForDate.size})`
                                                            : deleteMode === "dateRange"
                                                                ? "(Range)"
                                                                : ""
                                                    }
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {editingTaskIds.size > 0 && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                setSaveLoading(true);
                                                const updates = [];

                                                for (const taskId of editingTaskIds) {
                                                    const task = accountData.find(item => item._id === taskId);
                                                    if (task && editedTaskDescriptions[taskId]) {
                                                        updates.push(handleSaveEdit(taskId, editedTaskDescriptions[taskId]));
                                                    }
                                                }

                                                await Promise.all(updates);
                                                setEditingTaskIds(new Set());
                                                setEditedTaskDescriptions({});
                                                alert(`${updates.length} task(s) updated successfully!`);
                                            } catch (error) {
                                                console.error("Error updating tasks:", error);
                                                alert("Some tasks failed to update. Please try again.");
                                            } finally {
                                                setSaveLoading(false);
                                            }
                                        }}
                                        disabled={saveLoading}
                                        className={`
            h-9 px-5 text-sm font-semibold rounded-lg
            flex items-center gap-2 transition-all
            shadow-sm min-w-[120px] justify-center
            ${saveLoading
                                                ? "bg-green-400 cursor-not-allowed"
                                                : "bg-green-500 hover:bg-green-600 text-white hover:shadow-md"
                                            }
          `}
                                    >
                                        {saveLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                Update All ({editingTaskIds.size})
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>



                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                                {successMessage}
                            </div>
                            <button onClick={() => setSuccessMessage("")} className="text-green-500 hover:text-green-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                </div>

                <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                        <h2 className="text-purple-700 font-medium">
                            {`Pending ${CONFIG.SHEET_NAME} Tasks`}
                        </h2>
                        <p className="text-purple-600 text-sm">
                            {CONFIG.PAGE_CONFIG.description}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                            <p className="text-purple-600">Loading task data...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
                            {error}{" "}
                            <button className="underline ml-2" onClick={() => window.location.reload()}>
                                Try again
                            </button>
                        </div>
                    ) : (
                        /* Regular Tasks Table */
                        <div className="overflow-x-auto">


                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                    checked={
                                                        filteredAccountData.length > 0 &&
                                                        selectedItems.size === filteredAccountData.length
                                                    }
                                                    onChange={handleSelectAllItems}
                                                />
                                                <span>Delete</span>
                                            </div>
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={
                                                        filteredAccountData.length > 0 &&
                                                        filteredAccountData.every(account => editingTaskIds.has(account._id))
                                                    }
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        if (checked) {
                                                            // Enable edit mode for ALL rows
                                                            const allIds = new Set(filteredAccountData.map(item => item._id));
                                                            setEditingTaskIds(allIds);

                                                            // Store all descriptions
                                                            const descriptions = {};
                                                            filteredAccountData.forEach(account => {
                                                                descriptions[account._id] = account["col5"] || "";
                                                            });
                                                            setEditedTaskDescriptions(descriptions);

                                                            // Disable all main checkboxes
                                                            setSelectedItems(new Set());
                                                        } else {
                                                            // Disable edit mode for ALL rows
                                                            setEditingTaskIds(new Set());
                                                            setEditedTaskDescriptions({});
                                                        }
                                                    }}
                                                />
                                                <span>Edit</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Task ID
                                        </th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department Name
                                        </th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {dashboardType === "delegation" ? "Department" : "Department Name"}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Given By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Task Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50">
                                            Task Start Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Freq
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Enable Reminders
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Require Attachment
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAccountData.length > 0 ? (
                                        filteredAccountData.map((account) => {
                                            const isSelected = selectedItems.has(account._id);
                                            const isEditing = editingTaskId === account._id;
                                            return (
                                                <tr key={account._id} className={`${isSelected ? "bg-purple-50" : ""} hover:bg-gray-50`}>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                            checked={isSelected}
                                                            onChange={(e) => handleCheckboxClick(e, account._id)}
                                                            disabled={showLeaveInput[account._id]}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap bg-orange-50">
                                                        {/* Edit Checkbox */}
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                checked={editingTaskIds.has(account._id)}
                                                                onChange={(e) => {
                                                                    const shouldEdit = e.target.checked;
                                                                    if (shouldEdit) {
                                                                        // Enable edit mode for this row
                                                                        setEditingTaskIds(prev => {
                                                                            const newSet = new Set(prev);
                                                                            newSet.add(account._id);
                                                                            return newSet;
                                                                        });

                                                                        // Store current description
                                                                        setEditedTaskDescriptions(prev => ({
                                                                            ...prev,
                                                                            [account._id]: account["col5"] || ""
                                                                        }));

                                                                        // Disable main checkbox when edit mode is enabled
                                                                        setSelectedItems((prev) => {
                                                                            const newSelected = new Set(prev);
                                                                            newSelected.delete(account._id);
                                                                            return newSelected;
                                                                        });
                                                                    } else {
                                                                        // Disable edit mode for this row
                                                                        setEditingTaskIds(prev => {
                                                                            const newSet = new Set(prev);
                                                                            newSet.delete(account._id);
                                                                            return newSet;
                                                                        });

                                                                        // Remove description from state
                                                                        setEditedTaskDescriptions(prev => {
                                                                            const newObj = { ...prev };
                                                                            delete newObj[account._id];
                                                                            return newObj;
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-sm text-gray-700">Edit</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{account["col1"] || "—"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{account["col2"] || "—"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{account["col3"] || "—"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{account["col4"] || "—"}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingTaskIds.has(account._id) ? (
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    value={editedTaskDescriptions[account._id] || ""}
                                                                    onChange={(e) => {
                                                                        setEditedTaskDescriptions(prev => ({
                                                                            ...prev,
                                                                            [account._id]: e.target.value
                                                                        }));
                                                                    }}
                                                                    className="w-full min-w-[350px] px-3 py-2 border border-purple-300 rounded-md 
             focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                    rows="3"
                                                                    autoFocus
                                                                />
                                                                <div className="text-xs text-gray-500">
                                                                    Unchecking the checkbox will turn off edit mode
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-900 max-w-xs truncate" title={account["col5"]}>
                                                                {account["col5"] || "—"}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap bg-yellow-50">
                                                        <div className="text-sm text-gray-900">{account["col6"] || "—"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{account["col7"] || "—"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{account["col8"] || "—"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{account["col9"] || "—"}</div>
                                                    </td>

                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={14} className="px-6 py-4 text-center text-gray-500">
                                                {searchTerm
                                                    ? "No tasks matching your search"
                                                    : "No pending tasks found for today, tomorrow, or past due dates"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

export default AccountDataPage

