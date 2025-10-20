'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'

export default function QuickOrder() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-primary-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-700 transition-colors z-50"
      >
        <span className="text-xl">+</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="ثبت سریع سفارش">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              انتخاب فروشگاه
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>فروشگاه نگین</option>
              <option>بقالی امید</option>
              <option>مینی مارکت بهروز</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              محصولات
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>شیر پرچرب</span>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="w-8 h-8 rounded-full border border-gray-300">-</button>
                  <span>1</span>
                  <button className="w-8 h-8 rounded-full border border-gray-300">+</button>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
            ثبت سفارش
          </button>
        </div>
      </Modal>
    </>
  )
}