

"use client"

import { useState, useEffect, useCallback, useMemo ,useRef} from "react"
import { CheckCircle2, Upload, X, Search, History, ArrowLeft } from "lucide-react"
import AdminLayout from "../components/layout/AdminLayout"

// Configuration object - Move all configurations here
const CONFIG = {
  // Google Apps Script URL
  APPS_SCRIPT_URL:
    "https://script.google.com/a/macros/zofffoods.com/s/AKfycbwhk-Y25IZbYn9V3hfhf3c7WvJ0v9GIDuWDBpo-YCN3gumep3h5USTFw_86cHIZ2aUs/exec",

  // Google Drive folder ID for file uploads
  DRIVE_FOLDER_ID: "1tsHjLO0EC1TQ2Ry542eP46Ty_9m__0x0",

  // Sheet names
  SOURCE_SHEET_NAME: "DELEGATION",
  TARGET_SHEET_NAME: "DELEGATION DONE",

  // Page configuration
  PAGE_CONFIG: {
    title: "DELEGATION Tasks",
    historyTitle: "DELEGATION Task History",
    description: "Showing all pending tasks",
    historyDescription: "Read-only view of completed tasks with submission history",
  },
}

// Debounce hook for search optimization
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function DelegationDataPage() {
  const [accountData, setAccountData] = useState([])
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [additionalData, setAdditionalData] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [remarksData, setRemarksData] = useState({})
  const [historyData, setHistoryData] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [statusData, setStatusData] = useState({})
  const [nextTargetDate, setNextTargetDate] = useState({})
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [userRole, setUserRole] = useState("")
  const [username, setUsername] = useState("")

  const [editMode, setEditMode] = useState({});
  const [departments, setDepartments] = useState([]);
  const [givenByOptions, setGivenByOptions] = useState([]);
  const [namesOptions, setNamesOptions] = useState([]);

  const pasteRefs = useRef({});
const fileRefs = useRef({});


const handleRemoveImage = (id) => {
  setAccounts((prev) =>
    prev.map((acc) =>
      acc._id === id ? { ...acc, image: null } : acc
    )
  );
};




  const [leaveInputs, setLeaveInputs] = useState({})
    const [showLeaveInput, setShowLeaveInput] = useState({})
    const [leaveSubmitting, setLeaveSubmitting] = useState({})
  
  
    const handleLeaveButtonClick = (id) => {
      setShowLeaveInput((prev) => ({ ...prev, [id]: true }))
      // Disable checkbox when leave button is clicked
      setSelectedItems((prev) => {
        const newSelected = new Set(prev)
        newSelected.delete(id)
        return newSelected
      })
    }
  
    const handleLeaveInputChange = (id, value) => {
      setLeaveInputs((prev) => ({ ...prev, [id]: value }))
    }
  
    const handleLeaveCancel = (id) => {
      setShowLeaveInput((prev) => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      setLeaveInputs((prev) => {
        const newInputs = { ...prev }
        delete newInputs[id]
        return newInputs
      })
    }
  
    const handleLeaveSubmit = async (id) => {
      const leaveReason = leaveInputs[id]
      if (!leaveReason || leaveReason.trim() === "") {
        alert("Please enter a leave reason")
        return
      }
  
      setLeaveSubmitting((prev) => ({ ...prev, [id]: true }))
  
      try {
        const today = new Date()
        const todayFormatted = formatDateToDDMMYYYY(today)
        const item = accountData.find((account) => account._id === id)
  
        const formData = new FormData()
        formData.append("sheetName", CONFIG.SOURCE_SHEET_NAME)
        formData.append("action", "updateLeavedelegation")
        formData.append("rowData", JSON.stringify([{
          taskId: item["col1"],
          rowIndex: item._rowIndex,
          leaveReason: leaveReason,
          // actualDate: todayFormatted,
        }]))
  
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: "POST",
          body: formData,
        })
  
        const result = await response.json()
        console.log("result", result)
  
        if (result.success) {
          // Remove from pending tasks
          setAccountData((prev) => prev.filter((account) => account._id !== id))
  
          // Clear leave input state
          setShowLeaveInput((prev) => {
            const newState = { ...prev }
            delete newState[id]
            return newState
          })
          setLeaveInputs((prev) => {
            const newInputs = { ...prev }
            delete newInputs[id]
            return newInputs
          })
  
          setSuccessMessage("Leave submitted successfully!")
          setTimeout(() => setSuccessMessage(""), 3000)
        } else {
          alert("Failed to submit leave: " + result.error)
        }
      } catch (error) {
        console.error("Error submitting leave:", error)
        alert("Error submitting leave")
      } finally {
        setLeaveSubmitting((prev) => {
          const newState = { ...prev }
          delete newState[id]
          return newState
        })
      }
    }






  // Auto-save functionality
  const [autoSaveTimeouts, setAutoSaveTimeouts] = useState({});

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const formatDateToDDMMYYYY = useCallback((date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }, [])

  const isEmpty = useCallback((value) => {
    return value === null || value === undefined || (typeof value === "string" && value.trim() === "")
  }, [])

  useEffect(() => {
    const role = sessionStorage.getItem("role")
    const user = sessionStorage.getItem("username")
    setUserRole(role || "")
    setUsername(user || "")
  }, [])

  const parseGoogleSheetsDate = useCallback(
    (dateStr) => {
      if (!dateStr) return ""

      // If it's already in DD/MM/YYYY format, return as is
      if (typeof dateStr === "string" && dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        // Ensure proper padding for DD/MM/YYYY format
        const parts = dateStr.split("/")
        if (parts.length === 3) {
          const day = parts[0].padStart(2, "0")
          const month = parts[1].padStart(2, "0")
          const year = parts[2]
          return `${day}/${month}/${year}`
        }
        return dateStr
      }

      // Handle Google Sheets Date() format
      if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
        const match = /Date$$(\d+),(\d+),(\d+)$$/.exec(dateStr)
        if (match) {
          const year = Number.parseInt(match[1], 10)
          const month = Number.parseInt(match[2], 10)
          const day = Number.parseInt(match[3], 10)
          return `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${year}`
        }
      }

      // Handle other date formats
      try {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return formatDateToDDMMYYYY(date)
        }
      } catch (error) {
        console.error("Error parsing date:", error)
      }

      // If all else fails, return the original string
      return dateStr
    },
    [formatDateToDDMMYYYY],
  )

  const formatDateForDisplay = useCallback(
    (dateStr) => {
      if (!dateStr) return "—"

      // If it's already in proper DD/MM/YYYY format, return as is
      if (typeof dateStr === "string" && dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateStr
      }

      // Try to parse and reformat
      return parseGoogleSheetsDate(dateStr) || "—"
    },
    [parseGoogleSheetsDate],
  )

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=Whatsapp&action=fetch`);
        if (!response.ok) throw new Error('Failed to fetch dropdown data');

        const data = await response.json();
        if (data.table && data.table.rows) {
          const uniqueDepartments = new Set();
          const uniqueGivenBy = new Set();
          const uniqueNames = new Set();

          data.table.rows.forEach((row, index) => {
            if (index === 0) return; // Skip header row

            // Department (Column F)
            if (row.c[5]?.v) uniqueDepartments.add(row.c[5].v);
            // Given By (Column B)
            if (row.c[1]?.v) uniqueGivenBy.add(row.c[1].v);
            // Names (Column C)
            if (row.c[2]?.v) uniqueNames.add(row.c[2].v);
          });

          setDepartments(Array.from(uniqueDepartments).sort());
          setGivenByOptions(Array.from(uniqueGivenBy).sort());
          setNamesOptions(Array.from(uniqueNames).sort());
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const parseDateFromDDMMYYYY = useCallback((dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null
    const parts = dateStr.split("/")
    if (parts.length !== 3) return null
    return new Date(parts[2], parts[1] - 1, parts[0])
  }, [])

  const sortDateWise = useCallback(
    (a, b) => {
      const dateStrA = a["col6"] || ""
      const dateStrB = b["col6"] || ""
      const dateA = parseDateFromDDMMYYYY(dateStrA)
      const dateB = parseDateFromDDMMYYYY(dateStrB)
      if (!dateA) return 1
      if (!dateB) return -1
      return dateA.getTime() - dateB.getTime()
    },
    [parseDateFromDDMMYYYY],
  )

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setStartDate("")
    setEndDate("")
  }, [])

  // Get color based on data from column R
  const getRowColor = useCallback((colorCode) => {
    if (!colorCode) return "bg-white"

    const code = colorCode.toString().toLowerCase()
    switch (code) {
      case "red":
        return "bg-red-50 border-l-4 border-red-400"
      case "yellow":
        return "bg-yellow-50 border-l-4 border-yellow-400"
      case "green":
        return "bg-green-50 border-l-4 border-green-400"
      case "blue":
        return "bg-blue-50 border-l-4 border-blue-400"
      default:
        return "bg-white"
    }
  }, [])

  // Optimized filtered data with debounced search
  const filteredAccountData = useMemo(() => {
    const filtered = debouncedSearchTerm
      ? accountData.filter((account) =>
        Object.values(account).some(
          (value) => value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        ),
      )
      : accountData

    return filtered.sort(sortDateWise)
  }, [accountData, debouncedSearchTerm, sortDateWise])

  // Updated history filtering with user filter based on column H
  const filteredHistoryData = useMemo(() => {
    return historyData
      .filter((item) => {
        // User filter: For non-admin users, check column H (col7) matches username
        const userMatch =
          userRole === "admin" || (item["col7"] && item["col7"].toLowerCase() === username.toLowerCase())

        if (!userMatch) return false

        const matchesSearch = debouncedSearchTerm
          ? Object.values(item).some(
            (value) => value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
          )
          : true

        let matchesDateRange = true
        if (startDate || endDate) {
          const itemDate = parseDateFromDDMMYYYY(item["col0"])
          if (!itemDate) return false

          if (startDate) {
            const startDateObj = new Date(startDate)
            startDateObj.setHours(0, 0, 0, 0)
            if (itemDate < startDateObj) matchesDateRange = false
          }

          if (endDate) {
            const endDateObj = new Date(endDate)
            endDateObj.setHours(23, 59, 59, 999)
            if (itemDate > endDateObj) matchesDateRange = false
          }
        }

        return matchesSearch && matchesDateRange
      })
      .sort((a, b) => {
        const dateStrA = a["col0"] || ""
        const dateStrB = b["col0"] || ""
        const dateA = parseDateFromDDMMYYYY(dateStrA)
        const dateB = parseDateFromDDMMYYYY(dateStrB)
        if (!dateA) return 1
        if (!dateB) return -1
        return dateB.getTime() - dateA.getTime()
      })
  }, [historyData, debouncedSearchTerm, startDate, endDate, parseDateFromDDMMYYYY, userRole, username])



  // Optimized data fetching with parallel requests
  const fetchSheetData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's accessible departments
      const accessibleDepartments = getUserAccessibleDepartments()

      // Parallel fetch both sheets for better performance
      const [mainResponse, historyResponse] = await Promise.all([
        fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=${CONFIG.SOURCE_SHEET_NAME}&action=fetch`),
        fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=${CONFIG.TARGET_SHEET_NAME}&action=fetch`).catch(() => null),
      ])

      if (!mainResponse.ok) {
        throw new Error(`Failed to fetch data: ${mainResponse.status}`)
      }

      // Process main data
      const mainText = await mainResponse.text()
      let data
      try {
        data = JSON.parse(mainText)
      } catch (parseError) {
        const jsonStart = mainText.indexOf("{")
        const jsonEnd = mainText.lastIndexOf("}")
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = mainText.substring(jsonStart, jsonEnd + 1)
          data = JSON.parse(jsonString)
        } else {
          throw new Error("Invalid JSON response from server")
        }
      }

      // Process history data if available
      let processedHistoryData = []
      if (historyResponse && historyResponse.ok) {
        try {
          const historyText = await historyResponse.text()
          let historyData
          try {
            historyData = JSON.parse(historyText)
          } catch (parseError) {
            const jsonStart = historyText.indexOf("{")
            const jsonEnd = historyText.lastIndexOf("}")
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonString = historyText.substring(jsonStart, jsonEnd + 1)
              historyData = JSON.parse(jsonString)
            }
          }

          if (historyData && historyData.table && historyData.table.rows) {
            processedHistoryData = historyData.table.rows
              .map((row, rowIndex) => {
                if (rowIndex === 0) return null

                const rowData = {
                  _id: Math.random().toString(36).substring(2, 15),
                  _rowIndex: rowIndex + 2,
                }

                const rowValues = row.c ? row.c.map((cell) => (cell && cell.v !== undefined ? cell.v : "")) : []

                // Map all columns including column H (col7) for user filtering and column I (col8) for Task
                rowData["col0"] = rowValues[0] ? parseGoogleSheetsDate(String(rowValues[0])) : ""
                rowData["col1"] = rowValues[1] || ""
                rowData["col2"] = rowValues[2] || ""
                rowData["col3"] = rowValues[3] || ""
                rowData["col4"] = rowValues[4] || ""
                rowData["col5"] = rowValues[5] || ""
                rowData["col6"] = rowValues[6] || ""
                rowData["col7"] = rowValues[7] || "" // Column H - User name
                rowData["col8"] = rowValues[8] || "" // Column I - Task
                rowData["col9"] = rowValues[9] || "" // Column J - Given By

                return rowData
              })
              .filter((row) => row !== null)
          }
        } catch (historyError) {
          console.error("Error processing history data:", historyError)
        }
      }

      setHistoryData(processedHistoryData)

      // Process main delegation data - REMOVED DATE FILTERING
      const currentUsername = sessionStorage.getItem("username")
      const currentUserRole = sessionStorage.getItem("role")

      const pendingAccounts = []

      let rows = []
      if (data.table && data.table.rows) {
        rows = data.table.rows
      } else if (Array.isArray(data)) {
        rows = data
      } else if (data.values) {
        rows = data.values.map((row) => ({ c: row.map((val) => ({ v: val })) }))
      }

      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return // Skip header row

        let rowValues = []
        if (row.c) {
          rowValues = row.c.map((cell) => (cell && cell.v !== undefined ? cell.v : ""))
        } else if (Array.isArray(row)) {
          rowValues = row
        } else {
          return
        }

        const assignedTo = rowValues[4] || "Unassigned"
        const isUserMatch = currentUserRole === "admin" || assignedTo.toLowerCase() === currentUsername.toLowerCase()
        if (!isUserMatch && currentUserRole !== "admin") return

        // Check conditions: Column K not null and Column L null
        const columnKValue = rowValues[11]
        const columnLValue = rowValues[12]

        const hasColumnK = !isEmpty(columnKValue)
        const isColumnLEmpty = isEmpty(columnLValue)

        if (!hasColumnK || !isColumnLEmpty) {
          return
        }

        const columnUValue = rowValues[20] // Column U is index 20 (0-based)
  if (!isEmpty(columnUValue)) {
    return // Skip this row if Column U has value
  }

        // NEW: Department filtering ONLY for admin users
        if (currentUserRole === "admin" && accessibleDepartments) {
          const departmentName = rowValues[2] || "" // Column C - Department Name
          const departmentMatch = accessibleDepartments.some(page =>
            departmentName.toLowerCase().includes(page) ||
            page.includes(departmentName.toLowerCase())
          )
          if (!departmentMatch) return
        }

        // REMOVED DATE FILTERING - Show all data regardless of date

        const googleSheetsRowIndex = rowIndex + 1
        const taskId = rowValues[1] || ""
        const stableId = taskId
          ? `task_${taskId}_${googleSheetsRowIndex}`
          : `row_${googleSheetsRowIndex}_${Math.random().toString(36).substring(2, 15)}`

        const rowData = {
          _id: stableId,
          _rowIndex: googleSheetsRowIndex,
          _taskId: taskId,
        }

        // Map all columns
        for (let i = 0; i < 18; i++) {
          if (i === 0 || i === 6 || i === 10) {
            rowData[`col${i}`] = rowValues[i] ? parseGoogleSheetsDate(String(rowValues[i])) : ""
          } else {
            rowData[`col${i}`] = rowValues[i] || ""
          }
        }

        pendingAccounts.push(rowData)
      })

      setAccountData(pendingAccounts)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching sheet data:", error)
      setError("Failed to load account data: " + error.message)
      setLoading(false)
    }
  }, [formatDateToDDMMYYYY, parseGoogleSheetsDate, parseDateFromDDMMYYYY, isEmpty])


  const getUserAccessibleDepartments = () => {
    const userRole = sessionStorage.getItem('role') || 'user'
    const userPage = (sessionStorage.getItem('page') || '').toLowerCase().trim()

    // Only apply department filtering for admin users
    if (userRole === "admin") {
      if (userPage === 'all') {
        return null // Show all data for admin with 'all' access
      }

      // If admin has specific page access, return the allowed departments
      if (userPage) {
        const allowedPages = userPage.split(',').map(p => p.trim().toLowerCase())
        return allowedPages
      }
    }

    // For regular users, return null (no department filtering - use old assignment logic)
    return null
  }


  useEffect(() => {
    fetchSheetData()
  }, [fetchSheetData])

  const handleSelectItem = useCallback((id, isChecked) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev);

      if (isChecked) {
        newSelected.add(id);
        setStatusData((prevStatus) => ({ ...prevStatus, [id]: "Done" }));
        setEditMode((prev) => ({ ...prev, [id]: true })); // ✅ Direct edit mode on
      } else {
        newSelected.delete(id);
        setEditMode((prev) => {
          const newEditMode = { ...prev };
          delete newEditMode[id];
          return newEditMode;
        });
        setAdditionalData((prevData) => {
          const newAdditionalData = { ...prevData };
          delete newAdditionalData[id];
          return newAdditionalData;
        });
        setRemarksData((prevRemarks) => {
          const newRemarksData = { ...prevRemarks };
          delete newRemarksData[id];
          return newRemarksData;
        });
        setStatusData((prevStatus) => {
          const newStatusData = { ...prevStatus };
          delete newStatusData[id];
          return newStatusData;
        });
        setNextTargetDate((prevDate) => {
          const newDateData = { ...prevDate };
          delete newDateData[id];
          return newDateData;
        });
      }

      return newSelected;
    });
  }, []);

  // Auto-save function for field updates
  const handleFieldUpdate = useCallback(async (id, field, value) => {
    // Update local state immediately
    setAccountData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );

    // Clear existing timeout for this field
    const timeoutKey = `${id}_${field}`;
    if (autoSaveTimeouts[timeoutKey]) {
      clearTimeout(autoSaveTimeouts[timeoutKey]);
    }

    // Set a new timeout to save after 2 seconds
    const timeoutId = setTimeout(async () => {
      try {
        // Find the current item data
        const currentItem = accountData.find(item => item._id === id);
        if (!currentItem) return;

        // Prepare only the columns we want to update (C-G)
        const columnsToUpdate = {
          col2: currentItem.col2 || "",  // Column C
          col3: currentItem.col3 || "",  // Column D
          col4: currentItem.col4 || "",  // Column E
          col5: currentItem.col5 || "",  // Column F
          col6: currentItem.col6 || ""   // Column G
        };

        // Update only the changed field
        if (['col2', 'col3', 'col4', 'col5', 'col6'].includes(field)) {
          columnsToUpdate[field] = value;
        }

        // Prepare the payload with only the columns we're updating
        const payload = {
          action: 'update',
          sheetName: CONFIG.SOURCE_SHEET_NAME,
          rowIndex: currentItem._rowIndex,
          columnIndices: JSON.stringify([3, 4, 5, 6, 7]), // Columns C-G (1-based)
          rowData: JSON.stringify([

            columnsToUpdate.col2, // Column C
            columnsToUpdate.col3, // Column D
            columnsToUpdate.col4, // Column E
            columnsToUpdate.col5, // Column F
            columnsToUpdate.col6  // Column G
          ])
        };

        // Convert to URL-encoded form data
        const formBody = Object.keys(payload)
          .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
          .join('&');

        // Make the API call
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: "POST",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: formBody
        });

        const result = await response.json();

        if (result.success) {
          console.log(`Updated ${field} successfully`);
          setSuccessMessage(`Changes saved successfully`);
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          console.error("Failed to update Google Sheet:", result.error);
          setError(`Failed to save changes: ${result.error}`);
          setTimeout(() => setError(null), 3000);
        }
      } catch (err) {
        console.error("Error updating Google Sheet:", err);
        setError("Network error while saving changes");
        setTimeout(() => setError(null), 3000);
      } finally {
        // Clean up the timeout reference
        setAutoSaveTimeouts(prev => {
          const newTimeouts = { ...prev };
          delete newTimeouts[timeoutKey];
          return newTimeouts;
        });
      }
    }, 5000); // 2 second delay

    // Store timeout reference
    setAutoSaveTimeouts(prev => ({
      ...prev,
      [timeoutKey]: timeoutId
    }));
  }, [accountData, autoSaveTimeouts]);
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      Object.values(autoSaveTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [autoSaveTimeouts]);

  const handleCheckboxClick = useCallback(
    (e, id) => {
      e.stopPropagation()
      const isChecked = e.target.checked
      handleSelectItem(id, isChecked)
    },
    [handleSelectItem],
  )

  const handleSelectAllItems = useCallback(
    (e) => {
      e.stopPropagation()
      const checked = e.target.checked

      if (checked) {
        const allIds = filteredAccountData.map((item) => item._id)
        setSelectedItems(new Set(allIds))

        const newStatusData = {}
        allIds.forEach((id) => {
          newStatusData[id] = "Done"
        })
        setStatusData((prev) => ({ ...prev, ...newStatusData }))
      } else {
        setSelectedItems(new Set())
        setAdditionalData({})
        setRemarksData({})
        setStatusData({})
        setNextTargetDate({})
      }
    },
    [filteredAccountData],
  )

  // const toggleEditMode = useCallback((id) => {
  //   setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  // }, []);


  const toggleEditMode = useCallback((id) => {
    if (userRole !== "admin") return; // Only admin can edit
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  }, [userRole]);

  // const handleImageUpload = useCallback(async (id, e) => {
  //   const file = e.target.files[0]
  //   if (!file) return

  //   setAccountData((prev) => prev.map((item) => (item._id === id ? { ...item, image: file } : item)))
  // }, [])


  const handleImageUpload = useCallback((id, e) => {
  const file = e.target?.files?.[0];
  
  setAccountData((prev) =>
    prev.map((item) =>
      item._id === id ? { ...item, image: file || null } : item
    )
  );
}, []);

  const handleStatusChange = useCallback((id, value) => {
    setStatusData((prev) => ({ ...prev, [id]: value }))
    if (value === "Done") {
      setNextTargetDate((prev) => {
        const newDates = { ...prev }
        delete newDates[id]
        return newDates
      })
    }
  }, [])

  const handleNextTargetDateChange = useCallback((id, value) => {
    setNextTargetDate((prev) => ({ ...prev, [id]: value }))
  }, [])

  const fileToBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }, [])

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev)
    resetFilters()
  }, [resetFilters])

  const handleSubmit = async () => {
    const selectedItemsArray = Array.from(selectedItems)

    if (selectedItemsArray.length === 0) {
      alert("Please select at least one item to submit")
      return
    }

    const missingStatus = selectedItemsArray.filter((id) => !statusData[id])
    if (missingStatus.length > 0) {
      alert(`Please select a status for all selected items. ${missingStatus.length} item(s) are missing status.`)
      return
    }

    const missingNextDate = selectedItemsArray.filter((id) => statusData[id] === "Extend date" && !nextTargetDate[id])
    if (missingNextDate.length > 0) {
      alert(
        `Please select a next target date for all items with "Extend date" status. ${missingNextDate.length} item(s) are missing target date.`,
      )
      return
    }

    const missingRequiredImages = selectedItemsArray.filter((id) => {
      const item = accountData.find((account) => account._id === id)
      const requiresAttachment = item["col9"] && item["col9"].toUpperCase() === "YES"
      return requiresAttachment && !item.image
    })

    if (missingRequiredImages.length > 0) {
      alert(
        `Please upload images for all required attachments. ${missingRequiredImages.length} item(s) are missing required images.`,
      )
      return
    }

    setIsSubmitting(true)

    try {
      const today = new Date()
      const todayFormatted = formatDateToDDMMYYYY(today)

      // Process submissions in batches for better performance
      const batchSize = 5
      for (let i = 0; i < selectedItemsArray.length; i += batchSize) {
        const batch = selectedItemsArray.slice(i, i + batchSize)

        await Promise.all(
          batch.map(async (id) => {
            const item = accountData.find((account) => account._id === id)
            let imageUrl = ""

            if (item.image instanceof File) {
              try {
                const base64Data = await fileToBase64(item.image)

                const uploadFormData = new FormData()
                uploadFormData.append("action", "uploadFile")
                uploadFormData.append("base64Data", base64Data)
                uploadFormData.append(
                  "fileName",
                  `task_${item["col1"]}_${Date.now()}.${item.image.name.split(".").pop()}`,
                )
                uploadFormData.append("mimeType", item.image.type)
                uploadFormData.append("folderId", CONFIG.DRIVE_FOLDER_ID)

                const uploadResponse = await fetch(CONFIG.APPS_SCRIPT_URL, {
                  method: "POST",
                  body: uploadFormData,
                })

                const uploadResult = await uploadResponse.json()
                if (uploadResult.success) {
                  imageUrl = uploadResult.fileUrl
                }
              } catch (uploadError) {
                console.error("Error uploading image:", uploadError)
              }
            }

            // Updated to include username in column H and task description in column I when submitting to history
            const newRowData = [
              todayFormatted,
              item["col1"] || "",
              statusData[id] || "",
              nextTargetDate[id] || "",
              remarksData[id] || "",
              imageUrl,
              "", // Column G
              username, // Column H - Store the logged-in username
              item["col5"] || "", // Column I - Task description from col5
              item["col3"] || "", // Column J - Given By from original task
            ]

            const insertFormData = new FormData()
            insertFormData.append("sheetName", CONFIG.TARGET_SHEET_NAME)
            insertFormData.append("action", "insert")
            insertFormData.append("rowData", JSON.stringify(newRowData))

            return fetch(CONFIG.APPS_SCRIPT_URL, {
              method: "POST",
              body: insertFormData,
            })
          }),
        )
      }

      setAccountData((prev) => prev.filter((item) => !selectedItems.has(item._id)))

      setSuccessMessage(
        `Successfully processed ${selectedItemsArray.length} task records! Data submitted to ${CONFIG.TARGET_SHEET_NAME} sheet.`,
      )
      setSelectedItems(new Set())
      setAdditionalData({})
      setRemarksData({})
      setStatusData({})
      setNextTargetDate({})

      setTimeout(() => {
        fetchSheetData()
      }, 2000)
    } catch (error) {
      console.error("Submission error:", error)
      alert("Failed to submit task records: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedItemsCount = selectedItems.size

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="lg:flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-purple-700 text-center lg:text-left">
              {showHistory ? CONFIG.PAGE_CONFIG.historyTitle : CONFIG.PAGE_CONFIG.title}
            </h1>
            <p className="text-sm text-purple-600 text-center lg:text-left mt-1">
              {showHistory ? CONFIG.PAGE_CONFIG.historyDescription : CONFIG.PAGE_CONFIG.description}
            </p>
          </div>

          {/* Search and Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={showHistory ? "Search by Task ID..." : "Search tasks..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full h-full"
              />
            </div>

            {/* Buttons Group */}
            <div className="flex gap-2">
              {/* History/Toggle Button */}
              <button
                onClick={toggleHistory}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap min-w-[120px]"
              >
                {showHistory ? (
                  <>
                    <ArrowLeft size={18} />
                    <span>Back to Tasks</span>
                  </>
                ) : (
                  <>
                    <History size={18} />
                    <span>View History</span>
                  </>
                )}
              </button>

              {/* Submit Button - Only show when not in history view */}
              {!showHistory && (
                <button
                  onClick={handleSubmit}
                  disabled={selectedItemsCount === 0 || isSubmitting}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap min-w-[140px]"
                >
                  <Upload size={18} />
                  <span>{isSubmitting ? "Processing..." : `Submit (${selectedItemsCount})`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
              <span className="text-sm sm:text-base">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage("")} className="text-green-500 hover:text-green-700 ml-2">
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}
        <div className="rounded-lg border border-purple-200 shadow-md bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
            <h2 className="text-purple-700 font-medium">
              {showHistory
                ? `Completed ${CONFIG.SOURCE_SHEET_NAME} Tasks`
                : `Pending ${CONFIG.SOURCE_SHEET_NAME} Tasks`}
            </h2>
            <p className="text-purple-600 text-sm">
              {showHistory
                ? `${CONFIG.PAGE_CONFIG.historyDescription} for ${userRole === "admin" ? "all" : "your"} tasks`
                : CONFIG.PAGE_CONFIG.description}
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
          ) : showHistory ? (
            <>
              {/* Simplified History Filters - Only Date Range */}
              <div className="p-4 border-b border-purple-100 bg-gray-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="mb-2 flex items-center">
                      <span className="text-sm font-medium text-purple-700">Filter by Date Range:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <label htmlFor="start-date" className="text-sm text-gray-700 mr-1">
                          From
                        </label>
                        <input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="text-sm border border-gray-200 rounded-md p-1"
                        />
                      </div>
                      <div className="flex items-center">
                        <label htmlFor="end-date" className="text-sm text-gray-700 mr-1">
                          To
                        </label>
                        <input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="text-sm border border-gray-200 rounded-md p-1"
                        />
                      </div>
                    </div>
                  </div>

                  {(startDate || endDate || searchTerm) && (
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Target Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded Image
                      </th>
                      {userRole === "admin" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Given By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHistoryData.length > 0 ? (
                      filteredHistoryData.map((history) => (
                        <tr key={history._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{history["col0"] || "—"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{history["col1"] || "—"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs" title={history["col8"]}>
                              {history["col8"] || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${history["col2"] === "Done"
                                ? "bg-green-100 text-green-800"
                                : history["col2"] === "Extend date"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {history["col2"] || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDateForDisplay(history["col3"]) || "—"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs" title={history["col4"]}>
                              {history["col4"] || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {history["col5"] ? (
                              <a
                                href={history["col5"]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline flex items-center"
                              >
                                <img
                                  src={history["col5"] || "/api/placeholder/32/32"}
                                  alt="Attachment"
                                  className="h-8 w-8 object-cover rounded-md mr-2"
                                />
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400">No attachment</span>
                            )}
                          </td>
                          {userRole === "admin" && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{history["col7"] || "—"}</div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{history["col9"] || "—"}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={userRole === "admin" ? 9 : 8} className="px-6 py-4 text-center text-gray-500">
                          {searchTerm || startDate || endDate
                            ? "No historical records matching your filters"
                            : "No completed records found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Regular Tasks Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={filteredAccountData.length > 0 && selectedItems.size === filteredAccountData.length}
                        onChange={handleSelectAllItems}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department Name
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
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${!accountData["col17"] ? "bg-yellow-50" : ""}`}
                    >
                      Task Start Date
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${!accountData["col17"] ? "bg-green-50" : ""}`}
                    >
                      Planned Date
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${!accountData["col17"] ? "bg-blue-50" : ""}`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${!accountData["col17"] ? "bg-indigo-50" : ""}`}
                    >
                      Next Target Date
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${!accountData["col17"] ? "bg-purple-50" : ""}`}
                    >
                      Remarks
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${!accountData["col17"] ? "bg-orange-50" : ""}`}
                    >
                      Upload Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccountData.length > 0 ? (
                    filteredAccountData.map((account) => {
                      const isSelected = selectedItems.has(account._id)
                      const rowColorClass = getRowColor(account["col17"])
                      return (
                        <tr
                          key={account._id}
                          className={`${isSelected ? "bg-purple-50" : ""} hover:bg-gray-50 ${rowColorClass}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              checked={isSelected}
                              onChange={(e) => handleCheckboxClick(e, account._id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{account["col1"] || "—"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isSelected && editMode[account._id] && userRole === "admin" ? (
                              <select
                                value={account["col2"] || ""}
                                onChange={(e) => handleFieldUpdate(account._id, "col2", e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 w-30"
                              >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div
                                className={`text-sm text-gray-900 ${isSelected && userRole === "admin" ? "cursor-pointer hover:underline" : ""}`}
                                onClick={() => isSelected && userRole === "admin" && toggleEditMode(account._id)}
                              >
                                {account["col2"] || "—"}
                                {isSelected && userRole === "admin" && (
                                  <span className="ml-2 text-xs text-purple-600">(Click to edit)</span>
                                )}
                              </div>
                            )}
                          </td>


                          <td className="px-6 py-4 whitespace-nowrap">
                            {isSelected && editMode[account._id] && userRole === "admin" ? (
                              <select
                                value={account["col3"] || ""}
                                onChange={(e) => handleFieldUpdate(account._id, "col3", e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 w-52"
                              >
                                <option value="">Select Given By</option>
                                {givenByOptions.map((givenBy) => (
                                  <option key={givenBy} value={givenBy}>
                                    {givenBy}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div
                                className={`text-sm text-gray-900 ${isSelected && userRole === "admin" ? "cursor-pointer hover:underline" : ""}`}
                                onClick={() => isSelected && userRole === "admin" && toggleEditMode(account._id)}
                              >
                                {account["col3"] || "—"}
                                {isSelected && userRole === "admin" && (
                                  <span className="ml-2 text-xs text-purple-600">(Click to edit)</span>
                                )}
                              </div>
                            )}
                          </td>


                          <td className="px-6 py-4 whitespace-nowrap">
                            {isSelected && editMode[account._id] && userRole === "admin" ? (
                              <select
                                value={account["col4"] || ""}
                                onChange={(e) => handleFieldUpdate(account._id, "col4", e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 w-50"
                              >
                                <option value="">Select Name</option>
                                {namesOptions.map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div
                                className={`text-sm text-gray-900 ${isSelected && userRole === "admin" ? "cursor-pointer hover:underline" : ""}`}
                                onClick={() => isSelected && userRole === "admin" && toggleEditMode(account._id)}
                              >
                                {account["col4"] || "—"}
                                {isSelected && userRole === "admin" && (
                                  <span className="ml-2 text-xs text-purple-600">(Click to edit)</span>
                                )}
                              </div>
                            )}
                          </td>


                          <td className="px-6 py-4">
                            {isSelected && editMode[account._id] && userRole === "admin" ? (
                              <input
                                type="text"
                                value={account["col5"] || ""}
                                onChange={(e) => handleFieldUpdate(account._id, "col5", e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 w-50"
                                placeholder="Enter task description"
                              />
                            ) : (
                              <div
                                className={`text-sm text-gray-900 max-w-xs truncate ${isSelected && userRole === "admin" ? "cursor-pointer hover:underline" : ""}`}
                                title={account["col5"]}
                                onClick={() => isSelected && userRole === "admin" && toggleEditMode(account._id)}
                              >
                                {account["col5"] || "—"}
                                {isSelected && userRole === "admin" && (
                                  <span className="ml-2 text-xs text-purple-600">(Click to edit)</span>
                                )}
                              </div>
                            )}
                          </td>


                          <td className={`px-6 py-4 whitespace-nowrap ${!account["col17"] ? "bg-yellow-50" : ""}`}>
                            {isSelected && editMode[account._id] && userRole === "admin" ? (
                              <input
                                type="date"
                                value={(() => {
                                  const dateStr = account["col6"];
                                  if (dateStr && dateStr.includes("/")) {
                                    const [day, month, year] = dateStr.split("/");
                                    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                                  }
                                  return dateStr || "";
                                })()}
                                onChange={(e) => {
                                  const inputDate = e.target.value;
                                  if (inputDate) {
                                    const [year, month, day] = inputDate.split("-");
                                    const formattedDate = `${day}/${month}/${year}`;
                                    handleFieldUpdate(account._id, "col6", formattedDate);
                                  } else {
                                    handleFieldUpdate(account._id, "col6", "");
                                  }
                                }}
                                className="border border-gray-300 rounded-md px-2 py-1 w-full"
                              />
                            ) : (
                              <div
                                className={`text-sm text-gray-900 ${isSelected && userRole === "admin" ? "cursor-pointer hover:underline" : ""}`}
                                onClick={() => isSelected && userRole === "admin" && toggleEditMode(account._id)}
                              >
                                {formatDateForDisplay(account["col6"])}
                                {isSelected && userRole === "admin" && (
                                  <span className="ml-2 text-xs text-purple-600">(Click to edit)</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${!account["col17"] ? "bg-green-50" : ""}`}>
                            <div className="text-sm text-gray-900">{formatDateForDisplay(account["col10"])}</div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${!account["col17"] ? "bg-blue-50" : ""}`}>
                            <select
                              disabled={!isSelected}
                              value={statusData[account._id] || ""}
                              onChange={(e) => handleStatusChange(account._id, e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 w-25 disabled:bg-gray-100 disabled:cursor-not-allowed"

                            >
                              <option value="">Select</option>
                              <option value="Done">Done</option>
                              <option value="Extend date">Extend date</option>
                            </select>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${!account["col17"] ? "bg-indigo-50" : ""}`}>
                            <input
                              type="date"
                              disabled={!isSelected || statusData[account._id] !== "Extend date"}
                              value={
                                nextTargetDate[account._id]
                                  ? (() => {
                                    const dateStr = nextTargetDate[account._id]
                                    if (dateStr && dateStr.includes("/")) {
                                      const [day, month, year] = dateStr.split("/")
                                      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
                                    }
                                    return dateStr
                                  })()
                                  : ""
                              }
                              onChange={(e) => {
                                const inputDate = e.target.value
                                if (inputDate) {
                                  const [year, month, day] = inputDate.split("-")
                                  const formattedDate = `${day}/${month}/${year}`
                                  handleNextTargetDateChange(account._id, formattedDate)
                                } else {
                                  handleNextTargetDateChange(account._id, "")
                                }
                              }}
                              className="border border-gray-300 rounded-md px-2 py-1 w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${!account["col17"] ? "bg-purple-50" : ""}`}>
                            <input
                              type="text"
                              placeholder="Enter remarks"
                              disabled={!isSelected}
                              value={remarksData[account._id] || ""}
                              onChange={(e) => setRemarksData((prev) => ({ ...prev, [account._id]: e.target.value }))}
                              className="border rounded-md px-2 py-1 w-40 border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"

                            />
                          </td>
                          {/* <td className={`px-6 py-4 whitespace-nowrap ${!account["col17"] ? "bg-orange-50" : ""}`}>
                            {account.image ? (
                              <div className="flex items-center">
                                <img
                                  src={
                                    typeof account.image === "string"
                                      ? account.image
                                      : URL.createObjectURL(account.image)
                                  }
                                  alt="Receipt"
                                  className="h-10 w-10 object-cover rounded-md mr-2"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500">
                                    {account.image instanceof File ? account.image.name : "Uploaded Receipt"}
                                  </span>
                                  {account.image instanceof File ? (
                                    <span className="text-xs text-green-600">Ready to upload</span>
                                  ) : (
                                    <button
                                      className="text-xs text-purple-600 hover:text-purple-800"
                                      onClick={() => window.open(account.image, "_blank")}
                                    >
                                      View Full Image
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <label
                                className={`flex items-center cursor-pointer ${account["col9"]?.toUpperCase() === "YES"
                                  ? "text-red-600 font-medium"
                                  : "text-purple-600"
                                  } hover:text-purple-800`}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                <span className="text-xs">
                                  {account["col9"]?.toUpperCase() === "YES" ? "Required Upload" : "Upload Image"}
                                  {account["col9"]?.toUpperCase() === "YES" && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(account._id, e)}
                                  disabled={!isSelected}
                                />
                              </label>
                            )}
                          </td> */}

                      <td className={`px-6 py-4 whitespace-nowrap ${!account["col17"] ? "bg-orange-50" : ""}`}>
  <div
    ref={(el) => (pasteRefs.current[account._id] = el)}
    tabIndex={0}
    onClick={() => pasteRefs.current[account._id]?.focus()}
    onDoubleClick={() => fileRefs.current[account._id]?.click()}
    onPaste={(e) => {
      e.preventDefault();
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes("image")) {
          const file = items[i].getAsFile();
          if (file) {
            // Create a proper event object for handleImageUpload
            handleImageUpload(account._id, {
              target: {
                files: [file]
              }
            });
          }
        }
      }
    }}
    className="border-2 border-dashed border-purple-400 px-6 py-2 w-56 h-16
               flex items-center justify-center rounded-md cursor-pointer
               hover:border-purple-600 focus:border-purple-600 focus:ring-2 focus:ring-purple-300"
  >
    {account.image ? (
      /* ✅ IMAGE + CUT ICON */
      <div className="relative flex items-center gap-2">
        {/* ❌ CUT ICON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Remove image using existing handleImageUpload with null file
            handleImageUpload(account._id, {
              target: {
                files: null
              }
            });
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white
                     rounded-full h-5 w-5 flex items-center justify-center
                     text-xs hover:bg-red-600 z-10"
          title="Remove image"
          type="button"
        >
          ✕
        </button>

        {/* IMAGE */}
        <img
          src={
            typeof account.image === "string"
              ? account.image
              : URL.createObjectURL(account.image)
          }
          className="h-12 w-12 rounded object-cover"
          alt="Uploaded"
        />

        <div className="flex flex-col">
          <span className="text-xs text-gray-600">
            {account.image instanceof File ? account.image.name : "Uploaded Image"}
          </span>
          <span className="text-[10px] text-purple-600">
            Click or paste again to replace
          </span>
        </div>
      </div>
    ) : (
      /* ✅ UPLOAD / PASTE UI */
      <div className="flex flex-col items-center">
        <Upload className="h-4 w-4 text-purple-600 mb-1" />
        <span className="text-xs text-purple-700 font-medium">
          {account["col9"]?.toUpperCase() === "YES" ? (
            <>
              Required Upload<span className="text-red-500 ml-1">*</span>
            </>
          ) : (
            "Click or Paste Screenshot"
          )}
        </span>
        <span className="text-[8px] text-red-600 text-center font-bold mt-1">
          Single click → paste screenshot (Ctrl+V)<br />
          Double click → upload file
        </span>
      </div>
    )}

    {/* hidden file input */}
    <input
      ref={(el) => (fileRefs.current[account._id] = el)}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => handleImageUpload(account._id, e)}
    />
  </div>
</td>

                             <td className="px-6 py-4 whitespace-nowrap bg-orange-50">
                            {showLeaveInput[account._id] ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter leave reason"
                                  value={leaveInputs[account._id] || ""}
                                  onChange={(e) => handleLeaveInputChange(account._id, e.target.value)}
                                  className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
                                  disabled={leaveSubmitting[account._id]}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleLeaveSubmit(account._id)}
                                    disabled={leaveSubmitting[account._id]}
                                    className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    {leaveSubmitting[account._id] ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1"></div>
                                        Submitting...
                                      </>
                                    ) : (
                                      "Submit Leave"
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleLeaveCancel(account._id)}
                                    disabled={leaveSubmitting[account._id]}
                                    className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleLeaveButtonClick(account._id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                              >
                                Leave
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? "No tasks matching your search" : "No pending tasks found"}
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

export default DelegationDataPage