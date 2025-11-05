'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import QuickOrderModal from './QuickOrderModal'

export default function QuickOrder() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenModal = () => {
    setIsOpen(true);
    // استفاده از Bootstrap Modal
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 left-6 w-14 h-14 bg-primary-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-700 transition-colors z-50"
      >
        <span className="text-xl">+</span>
      </button>

      <QuickOrderModal />
    </>
  )
}