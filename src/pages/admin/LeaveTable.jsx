"use client"

import { useState, useEffect } from "react"

const LeaveTable = ({ selectedDepartment }) => {
  const [leaveData, setLeaveData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhk-Y25IZbYn9V3hfhf3c7WvJ0v9GIDuWDBpo-YCN3gumep3h5USTFw_86cHIZ2aUs/exec"

  // Helper function to get cell value
  const getCellValue = (row, index) => {
    if (!row || !row.c || index >= row.c.length) return null
    const cell = row.c[index]
    return cell && 'v' in cell ? cell.v : null
  }

  // Fetch all leave data without filtering
  const fetchLeaveData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔍 Fetching ALL Leave sheet data`)

      const response = await fetch(
        `${APPS_SCRIPT_URL}?action=fetch&sheet=Leave`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leave data: ${response.status}`)
      }

      const text = await response.text()
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)

      console.log("Leave sheet data fetched:", data.table.rows.length, "rows")

      // Process ALL rows (skip header row only)
      const processedLeaveData = data.table.rows
        .slice(1) // Skip header row
        .map((row, rowIndex) => {
          // Create an object with ALL columns from the sheet
          const rowData = {}

          // Get all columns dynamically
          for (let i = 0; i < (row.c?.length || 0); i++) {
            const columnName = `Column_${String.fromCharCode(65 + i)}` // A, B, C...
            rowData[columnName] = getCellValue(row, i) || ''
          }

          // Also add specific named fields for important columns
          return {
            // Column A to Z automatically
            ...rowData,

            // Specific fields for easy access
            timestamp: getCellValue(row, 0) || '',       // Column A
            taskId: getCellValue(row, 1) || '',          // Column B
            firm: getCellValue(row, 2) || '',            // Column C
            givenBy: getCellValue(row, 3) || '',         // Column D
            name: getCellValue(row, 4) || '',            // Column E
            taskDescription: getCellValue(row, 5) || '', // Column F
            taskStartDate: getCellValue(row, 6) || '',   // Column G
            frequency: getCellValue(row, 7) || '',       // Column H
            enableReminders: getCellValue(row, 8) || '', // Column I
            requireAttachment: getCellValue(row, 9) || '',// Column J
            actualDate: getCellValue(row, 10) || '',     // Column K
            columnL: getCellValue(row, 11) || '',        // Column L
            status: getCellValue(row, 12) || '',         // Column M
            remarks: getCellValue(row, 13) || '',        // Column N
            uploadedImage: getCellValue(row, 14) || '',  // Column O
            adminReminder: getCellValue(row, 15) || '',  // Column P
            adminStatus: getCellValue(row, 16) || '',    // Column Q
            leave: getCellValue(row, 17) || ''           // Column R - Leave

            // If there are more columns, they're in rowData object
          }
        })
        .filter(row => row.taskId) // Only include rows with a taskId

      console.log(`✅ Processed ${processedLeaveData.length} leave records`)
      setLeaveData(processedLeaveData)
    } catch (error) {
      console.error("Error fetching leave data:", error)
      setError("Failed to load leave data")
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on selected department
  const filteredData = selectedDepartment && selectedDepartment !== "Select Department"
    ? leaveData.filter(row => {
      const rowDept = row.firm?.toString().toLowerCase().trim()
      const selectedDept = selectedDepartment.toString().toLowerCase().trim()
      return rowDept === selectedDept
    })
    : []

  // Fetch data on component mount
  useEffect(() => {
    fetchLeaveData()
  }, [])

  const formatDateToDDMMYYYY = (dateValue) => {
  if (!dateValue) return ''
  
  try {
    // If it's already a string in some date format
    const date = new Date(dateValue)
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateValue
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    return dateValue
  }
}

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-purple-600">Loading leave data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (!selectedDepartment || selectedDepartment === "Select Department") {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Please select a department to view leave data</p>
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No leave data found for {selectedDepartment}</p>
        <p className="text-sm mt-2">
          Total records in sheet: {leaveData.length}<br />
          Department in dropdown: {selectedDepartment}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 p-2 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">
          Showing {filteredData.length} leave records for <strong>{selectedDepartment}</strong>
        </p>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Given By</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Start Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-orange-50">Leave Reason</th>
           
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.taskId}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{row.firm}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{row.givenBy}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{row.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={row.taskDescription}>
                {row.taskDescription}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
  {formatDateToDDMMYYYY(row.taskStartDate)}
</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{row.frequency}</td>
              <td className="px-4 py-3 text-sm text-gray-700 bg-orange-50 max-w-xs" title={row.leave}>
                {row.leave || '-'}
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeaveTable