'use client'

import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Column {
  key: string
  title: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

interface TableProps {
  data: any[]
  columns: Column[]
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  loading?: boolean
  emptyMessage?: string
}

export default function AdminTable({
  data,
  columns,
  sortKey,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = "Nenhum item encontrado"
}: TableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#001941] border-t-transparent rounded-full"
          />
          <span className="ml-3 text-gray-500">Carregando...</span>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2 lg:px-6 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-700 uppercase tracking-wider
                            ${column.width || ''} ${column.sortable ? 'cursor-pointer hover:text-gray-900' : ''}`}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && sortKey === column.key && (
                      <div className="ml-1 lg:ml-2">
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="w-3 h-3 lg:w-4 lg:h-4 text-[#001941]" />
                        ) : (
                          <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-[#001941]" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, index) => (
              <motion.tr
                key={row.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 lg:px-6 lg:py-4 whitespace-normal lg:whitespace-nowrap text-xs lg:text-sm text-gray-600">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

