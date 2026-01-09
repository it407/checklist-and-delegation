"use client"

import { useState, useEffect } from "react"
import { BarChart3, CheckCircle2, Clock, ListTodo, Users, AlertTriangle, Filter, X, Search } from 'lucide-react'
import AdminLayout from "../../components/layout/AdminLayout.jsx"

import LeaveTable from "../admin/LeaveTable.jsx"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

export default function AdminDashboard() {
  const [dashboardType, setDashboardType] = useState("checklist")
  const [taskView, setTaskView] = useState("recent")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterStaff, setFilterStaff] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // State for Master Sheet dropdown
  // const [masterSheetOptions, setMasterSheetOptions] = useState([])
  // State for Master Sheet dropdown
const [masterSheetOptions, setMasterSheetOptions] = useState({
  checklist: [],
  delegation: []
})
  const [selectedMasterOption, setSelectedMasterOption] = useState("")
  const [isFetchingMaster, setIsFetchingMaster] = useState(false)


  // Existing states के बाद ये जोड़ें
const [popupOpen, setPopupOpen] = useState(false);
const [popupData, setPopupData] = useState([]);
const [popupType, setPopupType] = useState("");
const [popupFilters, setPopupFilters] = useState({
  search: "",
  department: "all",
  givenBy: "all",
  name: "all",
});

  // State for department data
  const [departmentData, setDepartmentData] = useState({
    allTasks: [],
    staffMembers: [],
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    activeStaff: 0,
    completionRate: 0,
    barChartData: [],
    pieChartData: [],
    // Add new counters for delegation mode
    completedRatingOne: 0,
    completedRatingTwo: 0,
    completedRatingThreePlus: 0
  })

  // Store the current date for overdue calculation
  const [currentDate, setCurrentDate] = useState(new Date())

  // New state for date range filtering
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    filtered: false
  });

  // State to store filtered statistics
  const [filteredDateStats, setFilteredDateStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });

  // Helper function to format date from ISO format to DD/MM/YYYY
  const formatLocalDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return formatDateToDDMMYYYY(date);
  };



  // formatLocalDate function के बाद ये function जोड़ें
const handleCardClick = (type) => {
  setPopupType(type);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filteredTasks = [];

  if (type === 'total') {
    filteredTasks = [...departmentData.allTasks];
  } else if (type === 'completed') {
    filteredTasks = departmentData.allTasks.filter(task => 
      task.status === 'completed'
    );
  } else if (type === 'pending') {
    if (dashboardType === 'delegation') {
      filteredTasks = departmentData.allTasks.filter(task => {
        if (task.status === 'completed') return false;
        return true;
      });
    } else {
      filteredTasks = departmentData.allTasks.filter(task => 
        task.status !== 'completed'
      );
    }
  } else if (type === 'overdue') {
    filteredTasks = departmentData.allTasks.filter(task => {
      if (task.status === 'completed') return false;
      const taskDate = parseDateFromDDMMYYYY(task.taskStartDate);
      if (!taskDate) return false;
      return taskDate < today;
    });
  } else if (type === 'notDone') {
    filteredTasks = departmentData.allTasks.filter(task => {
      const statusColumnValue = task.notDoneStatus;
      return statusColumnValue === 'Not Done' || statusColumnValue === 'not done';
    });
  }

  setPopupData(filteredTasks);
  
  setPopupFilters({
    search: "",
    department: "all",
    givenBy: "all",
    name: "all",
  });
  
  setPopupOpen(true);
};

const handlePopupFilterChange = (filterType, value) => {
  setPopupFilters(prev => ({
    ...prev,
    [filterType]: value
  }));
};

const getFilteredPopupData = () => {
  return popupData.filter(task => {
    const searchMatch = !popupFilters.search || 
      (task.title && task.title.toLowerCase().includes(popupFilters.search.toLowerCase())) ||
      (task.id && task.id.toString().includes(popupFilters.search));
    
    const deptMatch = popupFilters.department === "all" || task.department === popupFilters.department;
    const nameMatch = popupFilters.name === "all" || task.assignedTo === popupFilters.name;
    
    return searchMatch && deptMatch && nameMatch;
  });
};



  // Function to filter tasks by date range
  const filterTasksByDateRange = () => {
    // Validate dates
    if (!dateRange.startDate || !dateRange.endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const startDate = new Date(dateRange.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      alert("Start date must be before end date");
      return;
    }

    // Filter tasks within the date range
    const filteredTasks = departmentData.allTasks.filter(task => {
      const taskStartDate = parseDateFromDDMMYYYY(task.taskStartDate);
      if (!taskStartDate) return false;

      return taskStartDate >= startDate && taskStartDate <= endDate;
    });

    // Count statistics
    let totalTasks = filteredTasks.length;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredTasks.forEach(task => {
      if (task.status === 'completed') {
        completedTasks++;
      } else {
        // Task is not completed
        pendingTasks++; // All incomplete tasks count as pending

        if (task.status === 'overdue') {
          overdueTasks++; // Only past dates (excluding today) count as overdue
        }
      }
    });

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // Update filtered stats
    setFilteredDateStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate
    });

    // Set filtered flag to true
    setDateRange(prev => ({ ...prev, filtered: true }));
  };

  // Format date as DD/MM/YYYY
  const formatDateToDDMMYYYY = (date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Parse DD/MM/YYYY to Date object
  const parseDateFromDDMMYYYY = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null
    const parts = dateStr.split('/')
    if (parts.length !== 3) return null
    return new Date(parts[2], parts[1] - 1, parts[0])
  }

  // Function to check if a date is in the past
  const isDateInPast = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr)
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Function to check if a date is today
  const isDateToday = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr)
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  }

  // Function to check if a date is tomorrow
  const isDateTomorrow = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr)
    if (!date) return false
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return date.getTime() === tomorrow.getTime()
  }

  // Function to check if a date is in the future (after today)
  const isDateInFuture = (dateStr) => {
    const date = parseDateFromDDMMYYYY(dateStr)
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }

  // Safe access to cell value
  const getCellValue = (row, index) => {
    if (!row || !row.c || index >= row.c.length) return null
    const cell = row.c[index]
    return cell && 'v' in cell ? cell.v : null
  }

  // Parse Google Sheets Date format into a proper date string
  const parseGoogleSheetsDate = (dateStr) => {
    if (!dateStr) return ''

    // Debug log for date parsing
    console.log(`Parsing date: "${dateStr}" (type: ${typeof dateStr})`);

    if (typeof dateStr === 'string' && dateStr.startsWith('Date(')) {
      // Handle Google Sheets Date(year,month,day) format
      const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateStr)
      if (match) {
        const year = parseInt(match[1], 10)
        const month = parseInt(match[2], 10) // 0-indexed in Google's format
        const day = parseInt(match[3], 10)

        // Format as DD/MM/YYYY
        const formatted = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
        console.log(`Converted Google Sheets date to: ${formatted}`);
        return formatted;
      }
    }

    // If it's already in DD/MM/YYYY format, return as is
    if (typeof dateStr === 'string' && dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      // Normalize to DD/MM/YYYY format
      const parts = dateStr.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      const normalized = `${day}/${month}/${year}`;
      console.log(`Normalized date to: ${normalized}`);
      return normalized;
    }

    // Handle Date objects
    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
      const formatted = formatDateToDDMMYYYY(dateStr);
      console.log(`Converted Date object to: ${formatted}`);
      return formatted;
    }

    // If we get here, try to parse as a date and format
    try {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        const formatted = formatDateToDDMMYYYY(date);
        console.log(`Parsed generic date to: ${formatted}`);
        return formatted;
      }
    } catch (e) {
      console.error("Error parsing date:", e)
    }

    // Return original if parsing fails
    console.log(`Failed to parse date, returning original: ${dateStr}`);
    return dateStr
  }

  



  // Function to fetch column A from master sheet AND delegation department column
const fetchMasterSheetColumnA = async () => {
  try {
    setIsFetchingMaster(true)
    
    // Fetch MASTER sheet data (for checklist mode)
    const masterResponse = await fetch(`https://docs.google.com/spreadsheets/d/1QJzboxloPluqZg15GWL3Y13ymUw_iCydxmpY7Njqtb8/gviz/tq?tqx=out:json&sheet=MASTER`)
    
    // ALSO fetch DELEGATION sheet data for department column (for delegation mode)
    const delegationResponse = await fetch(`https://docs.google.com/spreadsheets/d/1QJzboxloPluqZg15GWL3Y13ymUw_iCydxmpY7Njqtb8/gviz/tq?tqx=out:json&sheet=DELEGATION`)

    if (!masterResponse.ok || !delegationResponse.ok) {
      throw new Error(`Failed to fetch sheet data: ${masterResponse.status}/${delegationResponse.status}`)
    }

    // Process MASTER sheet data (for checklist mode)
    const masterText = await masterResponse.text()
    const masterJsonStart = masterText.indexOf('{')
    const masterJsonEnd = masterText.lastIndexOf('}')
    const masterJsonString = masterText.substring(masterJsonStart, masterJsonEnd + 1)
    const masterData = JSON.parse(masterJsonString)

    // Process DELEGATION sheet data (for delegation mode)
    const delegationText = await delegationResponse.text()
    const delegationJsonStart = delegationText.indexOf('{')
    const delegationJsonEnd = delegationText.lastIndexOf('}')
    const delegationJsonString = delegationText.substring(delegationJsonStart, delegationJsonEnd + 1)
    const delegationData = JSON.parse(delegationJsonString)

    // Extract column A values from MASTER sheet (for checklist mode)
    const masterColumnAValues = masterData.table.rows
      .slice(1) // Skip the first row (header)
      .map(row => {
        if (row && row.c && row.c[0]) {
          return row.c[0].v || null
        }
        return null
      })
      .filter(value => value !== null && value !== '')

    // Extract unique department values from Column C (index 2) from DELEGATION sheet
    const delegationDepartments = new Set()
    delegationData.table.rows.slice(1).forEach(row => {
      if (row && row.c && row.c[2]) {
        const deptValue = row.c[2].v
        if (deptValue && deptValue !== '' && deptValue !== null) {
          delegationDepartments.add(String(deptValue).trim())
        }
      }
    })

    // Convert Set to array and sort
    const delegationDepartmentArray = Array.from(delegationDepartments).sort()

    // Get user's page access from sessionStorage
    const userPages = (sessionStorage.getItem('page') || '').toLowerCase().trim();
    const allowedPages = userPages
      .split(',')
      .map(page => page.trim())
      .filter(page => page !== '');

    // Filter departments based on user's page access
    let filteredMasterDepartments = [...masterColumnAValues];
    let filteredDelegationDepartments = [...delegationDepartmentArray];

    // If user has specific page access (not 'all'), filter departments
    if (allowedPages.length > 0 && !allowedPages.includes('all')) {
      filteredMasterDepartments = filteredMasterDepartments.filter(dept => {
        const deptLower = dept.toLowerCase().trim();
        return allowedPages.some(page => deptLower === page);
      });
      
      filteredDelegationDepartments = filteredDelegationDepartments.filter(dept => {
        const deptLower = dept.toLowerCase().trim();
        return allowedPages.some(page => deptLower === page);
      });
    }

    // Add default option
    const checklistOptions = ["Select Department", ...filteredMasterDepartments]
    const delegationOptions = ["All Departments", ...filteredDelegationDepartments]

    // Store both sets of options in state
    setMasterSheetOptions({
      checklist: checklistOptions,
      delegation: delegationOptions
    })

    // Set default selected option based on current dashboard type
    if (!selectedMasterOption) {
      if (dashboardType === "delegation") {
        setSelectedMasterOption(delegationOptions[0]) // "All Departments"
      } else {
        setSelectedMasterOption(checklistOptions[0]) // "Select Department"
      }
    }

    console.log("Departments loaded", {
      checklistDepartments: filteredMasterDepartments,
      delegationDepartments: filteredDelegationDepartments,
      userPages: allowedPages
    });

    // Count active staff from MASTER sheet column C
    let activeStaffCount = 0
    masterData.table.rows.slice(1).forEach(row => {
      const cellValue = getCellValue(row, 2) // Column C (index 2)
      if (cellValue !== null && cellValue !== '') {
        activeStaffCount++
      }
    })

    setDepartmentData(prev => ({
      ...prev,
      activeStaff: activeStaffCount
    }))

  } catch (error) {
    console.error("Error fetching master sheet data:", error)
    // Add fallback options in case of error
    setMasterSheetOptions({
      checklist: ["Error loading master data"],
      delegation: ["Error loading delegation data"]
    })
  } finally {
    setIsFetchingMaster(false)
  }
}

 


  // Modified fetch function to support both checklist and delegation with department filter
// Modified fetch function to support both checklist and delegation with department filter
const fetchDepartmentData = async (department) => {
  if (!department || (department === "Select Department" && dashboardType === "checklist") || 
      (department === "All Departments" && dashboardType === "delegation")) {
    // If "Select Department" or "All Departments" is selected, show all data
    department = dashboardType === "delegation" ? "DELEGATION" : department;
  }

  // For delegation mode, always use "DELEGATION" sheet
  // For checklist mode, use the selected department sheet
  const sheetName = dashboardType === "delegation" ? "DELEGATION" : department;

  try {
    setIsFetchingMaster(true);

    // Debug: Log which sheet we're fetching
    console.log(`Fetching data for dashboard type: ${dashboardType}, sheet: ${sheetName}, selected department: ${selectedMasterOption}`);

    const response = await fetch(`https://docs.google.com/spreadsheets/d/1QJzboxloPluqZg15GWL3Y13ymUw_iCydxmpY7Njqtb8/gviz/tq?tqx=out:json&sheet=${sheetName}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${sheetName} sheet data: ${response.status}`);
    }

    const text = await response.text();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonString);

    // Get current user details
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('role');

    // Initialize counters
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;

    // Add new counters for delegation mode
    let completedRatingOne = 0;
    let completedRatingTwo = 0;
    let completedRatingThreePlus = 0;

    // Monthly data for bar chart
    // const monthlyData = {
    //   Jan: { completed: 0, pending: 0 },
    //   Feb: { completed: 0, pending: 0 },
    //   Mar: { completed: 0, pending: 0 },
    //   Apr: { completed: 0, pending: 0 },
    //   May: { completed: 0, pending: 0 },
    //   Jun: { completed: 0, pending: 0 },
    //   Jul: { completed: 0, pending: 0 },
    //   Aug: { completed: 0, pending: 0 },
    //   Sep: { completed: 0, pending: 0 },
    //   Oct: { completed: 0, pending: 0 },
    //   Nov: { completed: 0, pending: 0 },
    //   Dec: { completed: 0, pending: 0 }
    // };
    const monthYearData = {};

    // Status data for pie chart
    const statusData = {
      Completed: 0,
      Pending: 0,
      Overdue: 0
    };

    // Staff tracking map
    const staffTrackingMap = new Map();

    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date for comparison
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Process row data
    const processedRows = data.table.rows.map((row, rowIndex) => {
      // Skip header row
      if (rowIndex === 0) return null;

      let rowValues = [];
      if (row.c) {
        rowValues = row.c.map((cell) => (cell && cell.v !== undefined ? cell.v : ''));
      } else if (Array.isArray(row)) {
        rowValues = row;
      } else {
        console.log("Unknown row format:", row);
        return null;
      }

      // For delegation mode: Column C (index 2) is Department
      const taskDepartment = rowValues[2] || ""; // Column C - Department

      // Apply department filter for delegation mode
      if (dashboardType === "delegation" && 
          selectedMasterOption !== "All Departments" && 
          taskDepartment !== selectedMasterOption) {
        return null; // Skip if department doesn't match selected filter
      }

      // Continue with existing logic for leave reason check...
      if (dashboardType === "checklist") {
        // Checklist mode: Column R (index 17) - Leave Reason
        const columnRValue = rowValues[17] || ""; // Column R - Leave Reason
        if (columnRValue && columnRValue.toString().trim() !== "") {
          return null;
        }
      } else if (dashboardType === "delegation") {
        // Delegation mode: Column U (index 20) - Leave Reason
        const columnUValue = rowValues[20] || ""; // Column U - Leave Reason in delegation
        if (columnUValue && columnUValue.toString().trim() !== "") {
          return null;
        }
      }

      // For non-admin users, filter by username in Column E (index 4) - "Name"
      const assignedTo = rowValues[4] || 'Unassigned';
      const isUserMatch = userRole === 'admin' ||
        assignedTo.toLowerCase() === username.toLowerCase();

      // If not a match and not admin, skip this row
      if (!isUserMatch) {
        return null;
      }

      // Check column B for valid task row - "Task ID"
      const taskId = rowValues[1];

      // More lenient validation - allow any non-empty value as task ID
      if (taskId === null || taskId === undefined || taskId === '' ||
        (typeof taskId === 'string' && taskId.trim() === '')) {
        return null;
      }

      // Convert task ID to string for consistency
      const taskIdStr = String(taskId).trim();

      // Get task start date from Column G (index 6) - "Task Start Date"
      let taskStartDateValue = rowValues[6];
      const taskStartDate = taskStartDateValue ? parseGoogleSheetsDate(String(taskStartDateValue)) : '';

      // Parse task start date for comparison
      const taskStartDateObj = parseDateFromDDMMYYYY(taskStartDate);

      // For delegation mode: Include ALL tasks with valid dates (no tomorrow restriction)
      // For checklist mode: Process tasks that have a valid start date and are due up to tomorrow
      if (dashboardType === "delegation") {
        // In delegation mode, include all tasks with valid dates
        if (!taskStartDateObj) {
          return null;
        }
      } else {
        // In checklist mode, keep the original logic (up to tomorrow)
        if (!taskStartDateObj || taskStartDateObj > tomorrow) {
          return null;
        }
      }

      // Get completion data based on dashboard type
      let completionDateValue, completionDate;
      let adminCompletionDateValue, adminCompletionDate;
      let adminReminder;

      if (dashboardType === "delegation") {
        // For delegation: Column L (index 11) - "Actual"
        completionDateValue = rowValues[11]; // Column L
        completionDate = completionDateValue ? parseGoogleSheetsDate(String(completionDateValue)) : '';
        adminReminder = null;
        adminCompletionDate = '';
      } else {
        // For checklist: Apply new logic
        completionDateValue = rowValues[10]; // Column K
        adminCompletionDateValue = rowValues[16]; // Column Q
        adminReminder = rowValues[15]; // Column P

        completionDate = completionDateValue ? parseGoogleSheetsDate(String(completionDateValue)) : '';
        adminCompletionDate = adminCompletionDateValue ? parseGoogleSheetsDate(String(adminCompletionDateValue)) : '';
      }

      // Track staff details
      if (!staffTrackingMap.has(assignedTo)) {
        staffTrackingMap.set(assignedTo, {
          name: assignedTo,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          progress: 0
        });
      }

      // Get additional task details
      const taskDescription = rowValues[5] || 'Untitled Task';
      const frequency = rowValues[7] || 'one-time';

      // Determine task status
      let status = 'pending';
      let isCompleted = false;

      if (dashboardType === "checklist") {
        // CHECKLIST MODE: Apply Admin Reminder logic
        if (adminReminder && adminReminder.toString().toLowerCase() === 'yes') {
          // If Admin Reminder is "Yes", BOTH Column K AND Column Q must be not null
          isCompleted = (completionDate && completionDate !== '') && (adminCompletionDate && adminCompletionDate !== '');
        } else {
          // If Admin Reminder is "No" or empty, check ONLY Column K
          isCompleted = (completionDate && completionDate !== '');
        }
      } else {
        // DELEGATION MODE: Simple logic - just check completion date
        isCompleted = (completionDate && completionDate !== '');
      }

      if (isCompleted) {
        status = 'completed';
      } else if (isDateInPast(taskStartDate) && !isDateToday(taskStartDate)) {
        status = 'overdue';
      } else {
        status = 'pending';
      }

      // Create the task object
      const taskObj = {
        id: taskIdStr,
        title: taskDescription,
        assignedTo,
        department: taskDepartment,
        taskStartDate,
        dueDate: taskStartDate, // Keep for compatibility
        status,
        frequency
      };

      // Update staff member totals
      const staffData = staffTrackingMap.get(assignedTo);
      staffData.totalTasks++;

      // Count for dashboard cards
      // For delegation mode: Count all tasks regardless of date
      // For checklist mode: Only count tasks up to today for stats
      const shouldCountInStats = dashboardType === "delegation" ? true : taskStartDateObj <= today;

      if (shouldCountInStats) {
        totalTasks++;

        if (status === 'completed') {
          completedTasks++;
          staffData.completedTasks++;
          statusData.Completed++;

          // For delegation mode, count by rating
          if (dashboardType === "delegation") {
            // Check Column R (index 17) for rating in delegation mode
            const ratingValue = rowValues[17]; // Column R - "Pending Color Code"
            if (ratingValue === 1) {
              completedRatingOne++;
            } else if (ratingValue === 2) {
              completedRatingTwo++;
            } else if (ratingValue > 2) {
              completedRatingThreePlus++;
            }
          }

          // Update monthly data for completed tasks
          // const completedMonth = parseDateFromDDMMYYYY(completionDate);
          // if (completedMonth) {
          //   const monthName = completedMonth.toLocaleString('default', { month: 'short' });
          //   if (monthlyData[monthName]) {
          //     monthlyData[monthName].completed++;
          //   }
          // }


const completedDate = parseDateFromDDMMYYYY(completionDate);
if (completedDate) {
  const monthYearKey = completedDate.toLocaleString('default', { month: 'short' }) + ' ' + completedDate.getFullYear();
  
  // Initialize if not exists
  if (!monthYearData[monthYearKey]) {
    monthYearData[monthYearKey] = { 
      completed: 0, 
      pending: 0,
      month: completedDate.getMonth(),
      year: completedDate.getFullYear()
    };
  }
  monthYearData[monthYearKey].completed++;
}
        } else {
          // Task is not completed (Column K/L is null)
          staffData.pendingTasks++;

          if (isDateInPast(taskStartDate) && !isDateToday(taskStartDate)) {
            // Past dates (excluding today) = overdue
            overdueTasks++;
            statusData.Overdue++;
          }

          // All incomplete tasks (including overdue + today) = pending
          pendingTasks++;
          statusData.Pending++;

          // Update monthly data for pending tasks
          // const monthName = today.toLocaleString('default', { month: 'short' });
          // if (monthlyData[monthName]) {
          //   monthlyData[monthName].pending++;
          // }

          if (taskStartDateObj) {
  const monthYearKey = taskStartDateObj.toLocaleString('default', { month: 'short' }) + ' ' + taskStartDateObj.getFullYear();
  
  // Initialize if not exists
  if (!monthYearData[monthYearKey]) {
    monthYearData[monthYearKey] = { 
      completed: 0, 
      pending: 0,
      month: taskStartDateObj.getMonth(),
      year: taskStartDateObj.getFullYear()
    };
  }
  monthYearData[monthYearKey].pending++;
}
        }
      }

      return taskObj;
    }).filter(task => task !== null);

    // Debug: Log processing summary
    console.log(`Processing summary for ${sheetName}:`);
    console.log(`  Total rows in sheet: ${data.table.rows.length}`);
    console.log(`  Rows after filtering: ${processedRows.length}`);
    console.log(`  Total tasks counted: ${totalTasks}`);
    console.log(`  Completed tasks: ${completedTasks}`);
    console.log(`  Pending tasks: ${pendingTasks}`);
    console.log(`  Overdue tasks: ${overdueTasks}`);

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // Convert monthly data to chart format
    // const barChartData = Object.entries(monthlyData).map(([name, data]) => ({
    //   name,
    //   completed: data.completed,
    //   pending: data.pending
    // }));

    const sortedMonthYearKeys = Object.keys(monthYearData).sort((a, b) => {
  const dateA = new Date(`${a} 01`);
  const dateB = new Date(`${b} 01`);
  return dateA - dateB;
});

const barChartData = sortedMonthYearKeys.map(key => ({
  name: key,
  completed: monthYearData[key].completed,
  pending: monthYearData[key].pending,
  month: monthYearData[key].month,
  year: monthYearData[key].year
}));

    // Convert status data to pie chart format
    const pieChartData = [
      { name: "Completed", value: statusData.Completed, color: "#22c55e" },
      { name: "Pending", value: statusData.Pending, color: "#facc15" },
      { name: "Overdue", value: statusData.Overdue, color: "#ef4444" }
    ];

    // Process staff tracking map
    const staffMembers = Array.from(staffTrackingMap.values()).map(staff => {
      const progress = staff.totalTasks > 0
        ? Math.round((staff.completedTasks / staff.totalTasks) * 100)
        : 0;

      return {
        id: staff.name.replace(/\s+/g, '-').toLowerCase(),
        name: staff.name,
        email: `${staff.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        totalTasks: staff.totalTasks,
        completedTasks: staff.completedTasks,
        pendingTasks: staff.pendingTasks,
        progress
      };
    });

    // Update department data state
    setDepartmentData({
      allTasks: processedRows,
      staffMembers,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      activeStaff: departmentData.activeStaff,
      completionRate,
      barChartData,
      pieChartData,
      completedRatingOne,
      completedRatingTwo,
      completedRatingThreePlus
    });

  } catch (error) {
    console.error(`Error fetching ${sheetName} sheet data:`, error);
  } finally {
    setIsFetchingMaster(false);
  }
};



  useEffect(() => {
  if (dashboardType === "delegation") {
    // For delegation mode, fetch delegation data
    fetchDepartmentData("DELEGATION");
  } else if (selectedMasterOption && selectedMasterOption !== "Select Department") {
    // For checklist mode, fetch data for selected department
    fetchDepartmentData(selectedMasterOption);
  } else if (dashboardType === "checklist" && selectedMasterOption === "Select Department") {
    // Reset data when "Select Department" is selected in checklist mode
    setDepartmentData({
      allTasks: [],
      staffMembers: [],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      activeStaff: 0,
      completionRate: 0,
      barChartData: [],
      pieChartData: [],
      completedRatingOne: 0,
      completedRatingTwo: 0,
      completedRatingThreePlus: 0
    });
  }
}, [selectedMasterOption, dashboardType]);

  // When dashboard loads, set current date
  useEffect(() => {
    setCurrentDate(new Date());
    fetchMasterSheetColumnA();
  }, []);

  // Filter tasks based on the filter criteria
  const filteredTasks = departmentData.allTasks.filter((task) => {
    // Filter by status
    if (filterStatus !== "all" && task.status !== filterStatus) return false;

    // Filter by staff
    if (filterStaff !== "all" && task.assignedTo !== filterStaff) return false;

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      if (typeof task.title === 'string' && task.title.toLowerCase().includes(query)) {
        return true;
      }

      if ((typeof task.id === 'string' && task.id.toLowerCase().includes(query)) ||
        (typeof task.id === 'number' && task.id.toString().includes(query))) {
        return true;
      }

      if (typeof task.assignedTo === 'string' && task.assignedTo.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    }

    return true;
  });

  // Get tasks by view with updated logic based on Task Start Date and dashboard type
  const getTasksByView = (view) => {
    const viewFilteredTasks = filteredTasks.filter((task) => {
      // Skip completed tasks in all views
      if (task.status === "completed") return false;

      const taskStartDate = parseDateFromDDMMYYYY(task.taskStartDate);
      if (!taskStartDate) return false;

      switch (view) {
        case "recent":
          // Show tasks due today (pending only)
          return isDateToday(task.taskStartDate);
        case "upcoming":
          // UPDATED LOGIC FOR DELEGATION MODE
          if (dashboardType === "delegation") {
            // For delegation: Show ALL pending tasks with future dates (excluding today)
            return isDateInFuture(task.taskStartDate);
          } else {
            // For checklist: Show tasks due tomorrow only (original logic)
            return isDateTomorrow(task.taskStartDate);
          }
        case "overdue":
          // Show tasks with start dates in the past (excluding today)
          return isDateInPast(task.taskStartDate) && !isDateToday(task.taskStartDate);
        default:
          return true;
      }
    });

    return viewFilteredTasks;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600 text-white"
      case "pending":
        return "bg-amber-500 hover:bg-amber-600 text-white"
      case "overdue":
        return "bg-red-500 hover:bg-red-600 text-white"
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case "one-time":
        return "bg-gray-500 hover:bg-gray-600 text-white"
      case "daily":
        return "bg-blue-500 hover:bg-blue-600 text-white"
      case "weekly":
        return "bg-purple-500 hover:bg-purple-600 text-white"
      case "fortnightly":
        return "bg-indigo-500 hover:bg-indigo-600 text-white"
      case "monthly":
        return "bg-orange-500 hover:bg-orange-600 text-white"
      case "quarterly":
        return "bg-amber-500 hover:bg-amber-600 text-white"
      case "yearly":
        return "bg-emerald-500 hover:bg-emerald-600 text-white"
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  // Tasks Overview Chart Component
  const TasksOverviewChart = () => {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={departmentData.barChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {/* <XAxis dataKey="name" fontSize={12} stroke="#888888" tickLine={false} axisLine={false} /> */}
          <XAxis 
  dataKey="name" 
  fontSize={12} 
  stroke="#888888" 
  tickLine={false} 
  axisLine={false}
  angle={-45}  // ADD ये line
  textAnchor="end"  // ADD ये line
  height={60}  // ADD ये line
/>
          <YAxis fontSize={12} stroke="#888888" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Tasks Completion Chart Component
  const TasksCompletionChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={departmentData.pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
            {departmentData.pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }


  // Staff Tasks Table Component
// Staff Tasks Table Component
const StaffTasksTable = () => {
  // Filter staff members based on selected department in delegation mode
  const filteredStaffMembers = departmentData.staffMembers
    .filter(staff => {
      if (dashboardType === "delegation" && selectedMasterOption !== "All Departments") {
        // In delegation mode, filter staff by tasks in selected department
        const staffTasks = departmentData.allTasks.filter(task => 
          task.assignedTo === staff.name && 
          task.department === selectedMasterOption
        );
        return staffTasks.length > 0;
      }
      return true;
    })
    .map(staff => {
      // Get today's date for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter tasks for this staff member
      let staffTasks = departmentData.allTasks.filter(task =>
        task.assignedTo === staff.name
      );

      // Apply department filter for delegation mode
      if (dashboardType === "delegation" && selectedMasterOption !== "All Departments") {
        staffTasks = staffTasks.filter(task => task.department === selectedMasterOption);
      }

      // Get unique departments for this staff member
      const staffDepartments = [...new Set(staffTasks.map(task => task.department).filter(dept => dept))];

      const tasksUpToToday = staffTasks.filter(task => {
        const taskStartDate = parseDateFromDDMMYYYY(task.taskStartDate);
        if (!taskStartDate) return false;
        return taskStartDate <= today;
      });

      const completedTasksUpToToday = tasksUpToToday.filter(task =>
        task.status === 'completed'
      ).length;

      const totalTasksUpToToday = tasksUpToToday.length;

      const progress = totalTasksUpToToday > 0
        ? Math.round((completedTasksUpToToday / totalTasksUpToToday) * 100)
        : 0;

      return {
        ...staff,
        totalTasks: totalTasksUpToToday,
        completedTasks: completedTasksUpToToday,
        pendingTasks: totalTasksUpToToday - completedTasksUpToToday,
        progress,
        departments: staffDepartments.length > 0 ? staffDepartments.join(", ") : "N/A"
      };
    });

  return (
    <div className="rounded-md border border-gray-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Tasks
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pending
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStaffMembers.map((staff) => (
            <tr key={staff.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                  <div className="text-xs text-gray-500">{staff.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {dashboardType === "delegation" && selectedMasterOption !== "All Departments" 
                  ? selectedMasterOption 
                  : staff.departments || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.totalTasks}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.completedTasks}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.pendingTasks}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-[100px] bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${staff.progress}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{staff.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {staff.progress >= 80 ? (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Excellent
                  </span>
                ) : staff.progress >= 60 ? (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Good
                  </span>
                ) : (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Needs Improvement
                  </span>
                )}
              </td>
            </tr>
          ))}
          {filteredStaffMembers.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                No staff members found for selected department.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight text-purple-500">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* Dashboard Type Selection */}
           

            

<select
  value={dashboardType}
  onChange={(e) => {
    const newType = e.target.value;
    setDashboardType(newType);
    
    // Reset selected department when switching modes
    if (newType === "delegation") {
      setSelectedMasterOption("All Departments");
      // Fetch delegation data immediately
      fetchDepartmentData("DELEGATION");
    } else {
      setSelectedMasterOption("Select Department");
      // Reset data for checklist mode
      setDepartmentData({
        allTasks: [],
        staffMembers: [],
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        activeStaff: 0,
        completionRate: 0,
        barChartData: [],
        pieChartData: [],
        completedRatingOne: 0,
        completedRatingTwo: 0,
        completedRatingThreePlus: 0
      });
    }
  }}
  className="w-[140px] rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
>
  <option value="checklist">Checklist</option>
  <option value="delegation">Delegation</option>
</select>

            

            {/* Department dropdown - different logic for delegation mode */}
{/* Department dropdown - different logic for delegation mode */}
<select
  value={selectedMasterOption}
  onChange={(e) => {
    setSelectedMasterOption(e.target.value);
    // Trigger data fetch immediately when department changes
    if (dashboardType === "delegation") {
      fetchDepartmentData("DELEGATION");
    } else if (e.target.value !== "Select Department") {
      fetchDepartmentData(e.target.value);
    } else {
      // Reset data when "Select Department" is selected
      setDepartmentData({
        allTasks: [],
        staffMembers: [],
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        activeStaff: 0,
        completionRate: 0,
        barChartData: [],
        pieChartData: [],
        completedRatingOne: 0,
        completedRatingTwo: 0,
        completedRatingThreePlus: 0
      });
    }
  }}
  className="w-[180px] rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
  disabled={isFetchingMaster}
>
  {isFetchingMaster ? (
    <option>Loading...</option>
  ) : (
    dashboardType === "delegation" 
      ? masterSheetOptions.delegation.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))
      : masterSheetOptions.checklist.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))
  )}
</select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div 
          className="rounded-lg border border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all bg-white cursor-pointer"
          onClick={() => handleCardClick('total')}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-tr-lg p-4">
              <h3 className="text-sm font-medium text-blue-700">Total Tasks</h3>
              <ListTodo className="h-4 w-4 text-blue-500" />
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-700">{departmentData.totalTasks}</div>
              <p className="text-xs text-blue-600">
                {dashboardType === "delegation"
                  ? "Total tasks in delegation"
                  : selectedMasterOption !== "Select Department"
                    ? `Total tasks in ${selectedMasterOption} (up to today)`
                    : "Select a department"
                }
              </p>
            </div>
          </div>

          <div 
          className="rounded-lg border border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all bg-white cursor-pointer"
          onClick={() => handleCardClick('completed')}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 rounded-tr-lg p-4">
              <h3 className="text-sm font-medium text-green-700">
                {dashboardType === "delegation" ? "Completed" : "Completed Tasks"}
              </h3>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-700">
                {dashboardType === "delegation" ? departmentData.completedRatingOne : departmentData.completedTasks}
              </div>
              <p className="text-xs text-green-600">
                {dashboardType === "delegation" ? "Task completed once" : "Total completed till date"}
              </p>
            </div>
          </div>

          <div 
          className="rounded-lg border border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-all bg-white cursor-pointer"
          onClick={() => handleCardClick('pending')}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-amber-100 rounded-tr-lg p-4">
              <h3 className="text-sm font-medium text-amber-700">
                {dashboardType === "delegation" ? "Completed" : "Pending Tasks"}
              </h3>
              {dashboardType === "delegation" ? (
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-amber-700">
                {dashboardType === "delegation" ? departmentData.completedRatingTwo : departmentData.pendingTasks}
              </div>
              <p className="text-xs text-amber-600">
                {dashboardType === "delegation" ? "Task completed twice" : "Including today + overdue"}
              </p>
            </div>
          </div>

          <div 
          className="rounded-lg border border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-all bg-white cursor-pointer"
          onClick={() => handleCardClick('overdue')}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-50 to-red-100 rounded-tr-lg p-4">
              <h3 className="text-sm font-medium text-red-700">
                {dashboardType === "delegation" ? "Completed" : "Overdue Tasks"}
              </h3>
              {dashboardType === "delegation" ? (
                <CheckCircle2 className="h-4 w-4 text-red-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-red-700">
                {dashboardType === "delegation" ? departmentData.completedRatingThreePlus : departmentData.overdueTasks}
              </div>
              <p className="text-xs text-red-600">
                {dashboardType === "delegation" ? "Task completed more than twice" : "Past due (excluding today)"}
              </p>
            </div>
          </div>
        </div>

        {/* Task Navigation Tabs */}
        <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-3">
            <button
              className={`py-3 text-center font-medium transition-colors ${taskView === "recent" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => setTaskView("recent")}
            >
              Recent Tasks
            </button>
            <button
              className={`py-3 text-center font-medium transition-colors ${taskView === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => setTaskView("upcoming")}
            >
              {dashboardType === "delegation" ? "All Pending Tasks" : "Upcoming Tasks"}
            </button>
            <button
              className={`py-3 text-center font-medium transition-colors ${taskView === "overdue" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => setTaskView("overdue")}
            >
              Overdue Tasks
            </button>
          </div>

          <div className="p-4">
            <div className="flex flex-col gap-4 md:flex-row mb-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="search" className="flex items-center text-purple-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Search Tasks
                </label>
                <input
                  id="search"
                  placeholder="Search by task title or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2 md:w-[180px]">
                <label htmlFor="staff-filter" className="flex items-center text-purple-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter by Staff
                </label>
                <select
                  id="staff-filter"
                  value={filterStaff}
                  onChange={(e) => setFilterStaff(e.target.value)}
                  className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Staff</option>
                  {departmentData.staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {getTasksByView(taskView).length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p>No tasks found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto" style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTasksByView(taskView).map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedTo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.taskStartDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(task.frequency)}`}
                          >
                            {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-tr-lg p-4">
              <h3 className="text-sm font-medium text-purple-700">Active Staff</h3>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-700">{departmentData.activeStaff}</div>
              <p className="text-xs text-purple-600">Total staff in Master Sheet Col C</p>
            </div>
          </div>

          <div className="rounded-lg border border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-all lg:col-span-3 bg-white">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-tr-lg p-4">
              <h3 className="text-sm font-medium text-indigo-700">Task Completion Rate</h3>
              <BarChart3 className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-indigo-700">{departmentData.completionRate}%</div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">Completed: {departmentData.completedTasks}</span>
                  <span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">Total: {departmentData.totalTasks}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full"
                  style={{ width: `${departmentData.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="bg-purple-100 rounded-md p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-2 text-center rounded-md transition-colors ${activeTab === "overview" ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-200"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("mis")}
              className={`flex-1 py-2 text-center rounded-md transition-colors ${activeTab === "mis" ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-200"
                }`}
            >
              MIS Report
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex-1 py-2 text-center rounded-md transition-colors ${activeTab === "staff" ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-200"
                }`}
            >
              Staff Performance
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4 rounded-lg border border-purple-200 shadow-md bg-white">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                    <h3 className="text-purple-700 font-medium">Tasks Overview</h3>
                    <p className="text-purple-600 text-sm">Task completion rate over time</p>
                  </div>
                  <div className="p-4 pl-2">
                    <TasksOverviewChart />
                  </div>
                </div>
                <div className="lg:col-span-3 rounded-lg border border-purple-200 shadow-md bg-white">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                    <h3 className="text-purple-700 font-medium">Task Status</h3>
                    <p className="text-purple-600 text-sm">Distribution of tasks by status</p>
                  </div>
                  <div className="p-4">
                    <TasksCompletionChart />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-purple-200 shadow-md bg-white">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                  <h3 className="text-purple-700 font-medium">Staff Task Summary</h3>
                  <p className="text-purple-600 text-sm">Overview of tasks assigned to each staff member</p>
                </div>
                <div className="p-4">
                  <StaffTasksTable />
                </div>
              </div>

              {/* Leave Data Table - NEW SECTION */}
              <div className="rounded-lg border border-purple-200 shadow-md bg-white mt-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                  <h3 className="text-purple-700 font-medium">Leave Records</h3>
                  <p className="text-purple-600 text-sm">
                    Leave data for {selectedMasterOption !== "Select Department" ? selectedMasterOption : "selected department"}
                  </p>
                </div>
                <div className="p-4">
                  <LeaveTable selectedDepartment={selectedMasterOption} />
                </div>
              </div>
            </div>
          )}

          {/* Modified MIS Report section with date range filter */}
          {activeTab === "mis" && (
            <div className="rounded-lg border border-purple-200 shadow-md bg-white">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                <h3 className="text-purple-700 font-medium">MIS Report</h3>
                <p className="text-purple-600 text-sm">Detailed task analytics and performance metrics</p>
              </div>
              <div className="p-4">
                <div className="space-y-8">
                  {/* Date range selection */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="space-y-2 lg:col-span-1">
                      <label htmlFor="start-date" className="flex items-center text-purple-700 text-sm font-medium">
                        Start Date
                      </label>
                      <input
                        id="start-date"
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <label htmlFor="end-date" className="flex items-center text-purple-700 text-sm font-medium">
                        End Date
                      </label>
                      <input
                        id="end-date"
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2 flex items-end">
                      <button
                        onClick={filterTasksByDateRange}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>

                  {/* Overall stats */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-purple-600">Total Tasks Assigned</div>
                      <div className="text-3xl font-bold text-purple-700">
                        {dateRange.filtered ? filteredDateStats.totalTasks : departmentData.totalTasks}
                      </div>
                      {dateRange.filtered && (
                        <p className="text-xs text-purple-600">
                          For period: {formatLocalDate(dateRange.startDate)} - {formatLocalDate(dateRange.endDate)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-purple-600">Tasks Completed</div>
                      <div className="text-3xl font-bold text-purple-700">
                        {dateRange.filtered ? filteredDateStats.completedTasks : departmentData.completedTasks}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-purple-600">Tasks Pending/Overdue</div>
                      <div className="text-3xl font-bold text-purple-700">
                        {dateRange.filtered ?
                          `${filteredDateStats.pendingTasks} / ${filteredDateStats.overdueTasks}` :
                          `${departmentData.pendingTasks} / ${departmentData.overdueTasks}`}
                      </div>
                      <div className="text-xs text-purple-600">Pending (all incomplete) / Overdue (past dates only)</div>
                    </div>
                  </div>

                  {/* Additional breakdown for date period */}
                  {dateRange.filtered && (
                    <div className="rounded-lg border border-purple-100 p-4 bg-gray-50">
                      <h4 className="text-lg font-medium text-purple-700 mb-4">Detailed Date Range Breakdown</h4>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-white p-3 rounded-lg border border-amber-200">
                          <div className="text-sm font-medium text-amber-700">Pending Tasks</div>
                          <div className="text-2xl font-bold text-amber-600">{filteredDateStats.pendingTasks}</div>
                          <div className="text-xs text-amber-600 mt-1">All incomplete tasks (including overdue + today)</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <div className="text-sm font-medium text-red-700">Overdue Tasks</div>
                          <div className="text-2xl font-bold text-red-600">{filteredDateStats.overdueTasks}</div>
                          <div className="text-xs text-red-600 mt-1">Past due dates only (excluding today)</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <div className="text-sm font-medium text-green-700">Completion Rate</div>
                          <div className="text-2xl font-bold text-green-600">{filteredDateStats.completionRate}%</div>
                          <div className="text-xs text-green-600 mt-1">
                            {filteredDateStats.completedTasks} of {filteredDateStats.totalTasks} tasks completed
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-purple-700">Department Performance</h3>
                    <div className="grid gap-4 md:grid-cols-1">
                      <div className="rounded-lg border border-purple-200 bg-white p-4">
                        <h4 className="text-sm font-medium text-purple-700 mb-2">Completion Rate</h4>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-purple-700">
                            {dateRange.filtered ? filteredDateStats.completionRate : departmentData.completionRate}%
                          </div>
                          <div className="flex-1">
                            <div className="w-full h-6 bg-gray-200 rounded-full">
                              <div
                                className="h-full rounded-full flex items-center justify-end px-3 text-xs font-medium text-white"
                                style={{
                                  width: `${dateRange.filtered ? filteredDateStats.completionRate : departmentData.completionRate}%`,
                                  background: `linear-gradient(to right, #10b981 ${(dateRange.filtered ? filteredDateStats.completionRate : departmentData.completionRate) * 0.8}%, #f59e0b ${(dateRange.filtered ? filteredDateStats.completionRate : departmentData.completionRate) * 0.8}%)`
                                }}
                              >
                                {dateRange.filtered ? filteredDateStats.completionRate : departmentData.completionRate}%
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                          {dashboardType === "delegation" ?
                            `${dateRange.filtered ? filteredDateStats.completedTasks : departmentData.completedTasks} of ${dateRange.filtered ? filteredDateStats.totalTasks : departmentData.totalTasks} tasks completed in delegation mode` :
                            selectedMasterOption !== "Select Department" ?
                              `${dateRange.filtered ? filteredDateStats.completedTasks : departmentData.completedTasks} of ${dateRange.filtered ? filteredDateStats.totalTasks : departmentData.totalTasks} tasks completed in ${selectedMasterOption}` :
                              "Select a department to see completion rate"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="rounded-lg border border-purple-200 shadow-md bg-white">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
                <h3 className="text-purple-700 font-medium">Staff Performance</h3>
                <p className="text-purple-600 text-sm">Task completion rates by staff member (tasks up to today only)</p>
              </div>
              <div className="p-4">
                <div className="space-y-8">
                  {departmentData.staffMembers.length > 0 ? (
                    <>
                      {(() => {
                        // Get today's date for comparison
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Filter staff members with tasks up to today only
                        const staffWithTasksUpToToday = departmentData.staffMembers.map(staff => {
                          // Filter tasks for this staff member that have start dates up to today
                          const staffTasks = departmentData.allTasks.filter(task =>
                            task.assignedTo === staff.name
                          );

                          const tasksUpToToday = staffTasks.filter(task => {
                            const taskStartDate = parseDateFromDDMMYYYY(task.taskStartDate);
                            if (!taskStartDate) return false;
                            return taskStartDate <= today;
                          });

                          const completedTasksUpToToday = tasksUpToToday.filter(task =>
                            task.status === 'completed'
                          ).length;

                          const totalTasksUpToToday = tasksUpToToday.length;

                          const progress = totalTasksUpToToday > 0
                            ? Math.round((completedTasksUpToToday / totalTasksUpToToday) * 100)
                            : 0;

                          return {
                            ...staff,
                            totalTasks: totalTasksUpToToday,
                            completedTasks: completedTasksUpToToday,
                            pendingTasks: totalTasksUpToToday - completedTasksUpToToday,
                            progress
                          };
                        }).filter(staff => staff.totalTasks > 0); // Only staff with tasks up to today

                        // Sort staff members by performance (high to low)
                        const sortedStaffMembers = [...staffWithTasksUpToToday]
                          .sort((a, b) => b.progress - a.progress);

                        return (
                          <>
                            {/* High performers section (70% or above) */}
                            <div className="rounded-md border border-green-200">
                              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                                <h3 className="text-lg font-medium text-green-700">Top Performers</h3>
                                <p className="text-sm text-green-600">Staff with high task completion rates (tasks up to today only)</p>
                              </div>
                              <div className="p-4">
                                <div className="space-y-4">
                                  {sortedStaffMembers
                                    .filter(staff => staff.progress >= 70)
                                    .map((staff) => (
                                      <div
                                        key={staff.id}
                                        className="flex items-center justify-between p-3 border border-green-100 rounded-md bg-green-50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">{staff.name.charAt(0)}</span>
                                          </div>
                                          <div>
                                            <p className="font-medium text-green-700">{staff.name}</p>
                                            <p className="text-xs text-green-600">{staff.completedTasks} of {staff.totalTasks} tasks completed (up to today)</p>
                                          </div>
                                        </div>
                                        <div className="text-lg font-bold text-green-600">{staff.progress}%</div>
                                      </div>
                                    ))
                                  }
                                  {sortedStaffMembers.filter(staff => staff.progress >= 70).length === 0 && (
                                    <div className="text-center p-4 text-gray-500">
                                      <p>No staff members with high completion rates found.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mid performers section (40-69%) */}
                            <div className="rounded-md border border-yellow-200">
                              <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
                                <h3 className="text-lg font-medium text-yellow-700">Average Performers</h3>
                                <p className="text-sm text-yellow-600">Staff with moderate task completion rates (tasks up to today only)</p>
                              </div>
                              <div className="p-4">
                                <div className="space-y-4">
                                  {sortedStaffMembers
                                    .filter(staff => staff.progress >= 40 && staff.progress < 70)
                                    .map((staff) => (
                                      <div
                                        key={staff.id}
                                        className="flex items-center justify-between p-3 border border-yellow-100 rounded-md bg-yellow-50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">{staff.name.charAt(0)}</span>
                                          </div>
                                          <div>
                                            <p className="font-medium text-yellow-700">{staff.name}</p>
                                            <p className="text-xs text-yellow-600">{staff.completedTasks} of {staff.totalTasks} tasks completed (up to today)</p>
                                          </div>
                                        </div>
                                        <div className="text-lg font-bold text-yellow-600">{staff.progress}%</div>
                                      </div>
                                    ))
                                  }
                                  {sortedStaffMembers.filter(staff => staff.progress >= 40 && staff.progress < 70).length === 0 && (
                                    <div className="text-center p-4 text-gray-500">
                                      <p>No staff members with moderate completion rates found.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Low performers section (below 40%) */}
                            <div className="rounded-md border border-red-200">
                              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                                <h3 className="text-lg font-medium text-red-700">Needs Improvement</h3>
                                <p className="text-sm text-red-600">Staff with lower task completion rates (tasks up to today only)</p>
                              </div>
                              <div className="p-4">
                                <div className="space-y-4">
                                  {sortedStaffMembers
                                    .filter(staff => staff.progress < 40)
                                    .map((staff) => (
                                      <div
                                        key={staff.id}
                                        className="flex items-center justify-between p-3 border border-red-100 rounded-md bg-red-50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">{staff.name.charAt(0)}</span>
                                          </div>
                                          <div>
                                            <p className="font-medium text-red-700">{staff.name}</p>
                                            <p className="text-xs text-red-600">{staff.completedTasks} of {staff.totalTasks} tasks completed (up to today)</p>
                                          </div>
                                        </div>
                                        <div className="text-lg font-bold text-red-600">{staff.progress}%</div>
                                      </div>
                                    ))
                                  }
                                  {sortedStaffMembers.filter(staff => staff.progress < 40).length === 0 && (
                                    <div className="text-center p-4 text-gray-500">
                                      <p>No staff members with low completion rates found.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* No assigned tasks section (up to today) */}
                            {(() => {
                              const staffWithNoTasksUpToToday = departmentData.staffMembers.filter(staff => {
                                const staffTasks = departmentData.allTasks.filter(task =>
                                  task.assignedTo === staff.name
                                );

                                const tasksUpToToday = staffTasks.filter(task => {
                                  const taskStartDate = parseDateFromDDMMYYYY(task.taskStartDate);
                                  if (!taskStartDate) return false;
                                  return taskStartDate <= today;
                                });

                                return tasksUpToToday.length === 0;
                              });

                              return staffWithNoTasksUpToToday.length > 0 ? (
                                <div className="rounded-md border border-gray-200">
                                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-700">No Tasks Assigned (Up to Today)</h3>
                                    <p className="text-sm text-gray-600">Staff with no tasks assigned for current period (up to today)</p>
                                  </div>
                                  <div className="p-4">
                                    <div className="space-y-4">
                                      {staffWithNoTasksUpToToday.map((staff) => (
                                        <div
                                          key={staff.id}
                                          className="flex items-center justify-between p-3 border border-gray-100 rounded-md bg-gray-50"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
                                              <span className="text-sm font-medium text-white">{staff.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-700">{staff.name}</p>
                                              <p className="text-xs text-gray-600">No tasks assigned up to today</p>
                                            </div>
                                          </div>
                                          <div className="text-lg font-bold text-gray-600">N/A</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      <p>
                        {dashboardType === "delegation"
                          ? "No delegation data available."
                          : "No staff data available. Please select a department from the dropdown."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


        {popupOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl h-5/6 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold text-purple-700">
          {popupType.charAt(0).toUpperCase() + popupType.slice(1)} Tasks Details
        </h2>
        <button
          onClick={() => setPopupOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={popupFilters.search}
              onChange={(e) => handlePopupFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={popupFilters.department}
            onChange={(e) => handlePopupFilterChange('department', e.target.value)}
            className="border border-purple-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Departments</option>
            {Array.from(new Set(popupData.map(task => task.department).filter(Boolean))).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={popupFilters.name}
            onChange={(e) => handlePopupFilterChange('name', e.target.value)}
            className="border border-purple-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Names</option>
            {Array.from(new Set(popupData.map(task => task.assignedTo).filter(Boolean))).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <button
            onClick={() => setPopupFilters({
              search: "",
              department: "all",
              givenBy: "all",
              name: "all",
            })}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
          >
            <X size={16} />
            Clear Filters
          </button>

          <h1 className="text-blue-800 font-medium">
            Total Tasks: {getFilteredPopupData().length}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Desktop View */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredPopupData().map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{task.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.assignedTo}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.taskStartDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4 p-4">
          {getFilteredPopupData().map(task => (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium text-gray-500">Task ID</span>
                  <p className="text-sm font-semibold text-gray-900">{task.id}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.frequency === 'daily' ? 'bg-blue-100 text-blue-700' :
                  task.frequency === 'weekly' ? 'bg-purple-100 text-purple-700' :
                  task.frequency === 'monthly' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.frequency}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500">Description</span>
                <p className="text-sm text-gray-900 mt-1">{task.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-gray-500">Department</span>
                  <p className="text-sm text-gray-900">{task.department}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Assigned To</span>
                  <p className="text-sm text-gray-900">{task.assignedTo}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500">End Date</span>
                <p className="text-sm text-gray-900">{task.taskStartDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </AdminLayout>
  )
}