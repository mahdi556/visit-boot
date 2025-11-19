// 📂 src/components/orders/SalesRepSelector.js
import { useState, useEffect } from 'react'

export default function SalesRepSelector({ 
  selectedRep, 
  onRepChange, 
  disabled = false 
}) {
  const [salesReps, setSalesReps] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSalesReps()
  }, [])

  const fetchSalesReps = async () => {
    try {
      const response = await fetch('/api/sales-reps')
      if (response.ok) {
        const data = await response.json()
        // فقط ویزیتورهای فعال
        const activeReps = data.filter(rep => rep.isActive)
        setSalesReps(activeReps)
      }
    } catch (error) {
      console.error('Error fetching sales reps:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <select className="form-select" disabled>
        <option>در حال بارگذاری ویزیتورها...</option>
      </select>
    )
  }

  return (
    <select 
      className="form-select"
      value={selectedRep || ''}
      onChange={(e) => onRepChange(e.target.value ? parseInt(e.target.value) : null)}
      disabled={disabled}
    >
      <option value="">انتخاب ویزیتور (اختیاری)</option>
      {salesReps.map(rep => (
        <option key={rep.id} value={rep.id}>
          {rep.name} - {rep.code}
        </option>
      ))}
    </select>
  )
}