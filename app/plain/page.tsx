'use client'
import { useEffect } from 'react'
export default function Plain() {
  useEffect(() => { window.location.href = '/assistant' }, [])
  return null
}
