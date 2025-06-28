import React from 'react'

const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-secondary-200 ${className}`}>
        {children}
      </table>
    </div>
  )
}

const TableHeader = ({ children }) => {
  return (
    <thead className="bg-secondary-50">
      {children}
    </thead>
  )
}

const TableBody = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-secondary-200">
      {children}
    </tbody>
  )
}

const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr className={`hover:bg-secondary-50 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  )
}

const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-secondary-900 ${className}`}>
      {children}
    </td>
  )
}

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell

export default Table
